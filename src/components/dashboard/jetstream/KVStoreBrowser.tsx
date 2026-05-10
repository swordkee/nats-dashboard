import { createSignal, createMemo, For, Show } from "solid-js";
import { createQuery } from "@tanstack/solid-query";

import type { StreamMessage, StreamMessagesResponse } from "~/types";
import { fetchStreamMessage } from "~/lib/info";
import { useStore } from "~/components/context/store";
import { useSettings } from "~/components/context/settings";
import Button from "~/components/Button";
import Badge from "~/components/Badge";
import Modal from "~/components/Modal";
import { decodeBase64 } from "~/lib/utils";

interface Props {
  streamName: string;
}

interface KVEntry {
  key: string;
  value: string;
  revision: number;
  created: string;
  delta: number;
}

/** Check if a response is an API error response. */
function isErrorResponse(response: StreamMessagesResponse): response is {
  type?: string;
  error: { code: number; err_code?: number; description?: string };
} {
  return (
    typeof response === "object" && response !== null && "error" in response
  );
}

/** Extract messages array from the API response. */
function extractMessages(response: StreamMessagesResponse): StreamMessage[] {
  if (isErrorResponse(response)) {
    return [];
  }

  if ("messages" in response && Array.isArray(response.messages)) {
    return response.messages;
  }

  if ("message" in response && response.message) {
    return [response.message];
  }

  return [];
}

/** Extract KV key from subject (format: $KV.<bucket>.<key>). */
function extractKey(subject: string): string {
  const parts = subject.split(".");
  // KV subjects are formatted as $KV.<bucket>.<key>
  // The key is everything after the third part
  return parts.slice(3).join(".");
}

/** Parse a KV message into an entry. */
function parseKVEntry(msg: StreamMessage): KVEntry | null {
  const key = extractKey(msg.subject);
  const decodedData = decodeBase64(msg.data);

  // Skip deleted entries (data is empty or "\x00")
  if (!decodedData || decodedData === "\x00") {
    return null;
  }

  return {
    key,
    value: decodedData,
    revision: msg.seq.stream,
    created: msg.time,
    delta: msg.num?.last ?? 0,
  };
}

export default function KVStoreBrowser(props: Props) {
  const [store] = useStore();
  const [settings] = useSettings();

  const [keyFilter, setKeyFilter] = createSignal("");
  const [selectedEntry, setSelectedEntry] = createSignal<KVEntry | null>(null);

  // Fetch KV entries - separate the server-side query key from the client-side filter
  const kvQuery = createQuery(() => ({
    queryKey: [store.server.url, "kv", props.streamName],
    queryFn: async ({ signal }) => {
      const response = await fetchStreamMessage({
        url: store.server.url,
        streamName: props.streamName,
        seq: {
          last_by_subj: `$KV.${props.streamName.replace("KV_", "")}.>`,
          limit: 1000,
        },
        jsonp: settings.jsonp,
        signal,
      });

      return response;
    },
    select: (response) => {
      const msgs = extractMessages(response);
      return msgs
        .map((msg): KVEntry | null => parseKVEntry(msg))
        .filter((entry): entry is KVEntry => entry !== null);
    },
    enabled: store.active && props.streamName !== "",
    staleTime: 30_000,
  }));

  const entries = createMemo(() => {
    const allEntries = kvQuery.data ?? [];

    // Client-side filtering
    const filter = keyFilter();
    if (!filter) return allEntries;

    return allEntries.filter((entry) =>
      entry.key.toLowerCase().includes(filter.toLowerCase()),
    );
  });

  const isLoading = () => kvQuery.isFetching;

  return (
    <div class="space-y-4">
      {/* Controls */}
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Key Filter
          </label>
          <input
            type="text"
            value={keyFilter()}
            onInput={(e) => setKeyFilter(e.currentTarget.value)}
            placeholder="Filter by key..."
            class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div class="flex items-end">
          <Button
            color="primary"
            size="md"
            onClick={() => kvQuery.refetch()}
            isLoading={isLoading()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KV Entries List */}
      <Show
        when={entries().length > 0}
        fallback={
          <div class="text-center py-12 text-gray-500 dark:text-gray-400">
            {isLoading() ? "Loading KV entries..." : "No KV entries found"}
          </div>
        }
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Key
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Revision
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Value Preview
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <For each={entries()}>
                {(entry) => (
                  <tr
                    class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                      {entry.key}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <Badge type="pill" color="blue">
                        {entry.revision}
                      </Badge>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono max-w-xs truncate">
                      {entry.value.substring(0, 100)}
                      {entry.value.length > 100 ? "..." : ""}
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>

      {/* KV Entry Detail Modal */}
      <Show when={selectedEntry()}>
        {(entry) => (
          <Modal onClose={() => setSelectedEntry(null)} size="3xl">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              KV Entry Details
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Key
                </label>
                <div class="text-sm font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                  {entry().key}
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Revision
                </label>
                <div class="text-sm text-gray-900 dark:text-white">
                  {entry().revision}
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Value
                </label>
                <div class="bg-gray-50 dark:bg-gray-800 rounded p-3">
                  <pre class="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                    {entry().value}
                  </pre>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </Show>
    </div>
  );
}
