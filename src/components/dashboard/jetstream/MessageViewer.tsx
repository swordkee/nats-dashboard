import { createSignal, createMemo, For, Show } from 'solid-js';
import { createQuery } from '@tanstack/solid-query';

import type { StreamMessage } from '~/types';
import { fetchStreamMessage } from '~/lib/info';
import { useStore } from '~/components/context/store';
import { useSettings } from '~/components/context/settings';
import Button from '~/components/Button';
import Badge from '~/components/Badge';
import { formatDate } from '~/lib/utils';
import { decodeBase64 } from '~/lib/utils';

interface Props {
  streamName: string;
}

interface MessageItem {
  seq: number;
  subject: string;
  data: string;
  decodedData: string;
  headers?: Record<string, string>;
  time: string;
}

/** Decode base64 data and parse headers if present. */
function parseMessage(msg: StreamMessage): MessageItem | null {
  if ('err_code' in msg) {
    return null;
  }

  const decodedData = decodeBase64(msg.data);
  
  let headers: Record<string, string> | undefined;
  if (msg.hdrs) {
    const decodedHdrs = decodeBase64(msg.hdrs);
    headers = parseHeaders(decodedHdrs);
  }

  const result: MessageItem = {
    seq: msg.seq.stream,
    subject: msg.subject,
    data: msg.data,
    decodedData,
    time: msg.time,
  };
  
  if (headers) {
    result.headers = headers;
  }
  
  return result;
}

/** Parse NATS message headers from raw string. */
function parseHeaders(raw: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const lines = raw.split('\r\n');
  
  for (const line of lines) {
    if (!line || line === '\r') continue;
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      headers[key] = value;
    }
  }
  
  return headers;
}

export default function MessageViewer(props: Props) {
  const [store] = useStore();
  const [settings] = useSettings();
  
  const [page, setPage] = createSignal(1);
  const [subjectFilter, setSubjectFilter] = createSignal('');
  const [selectedMessage, setSelectedMessage] = createSignal<MessageItem | null>(null);
  const pageSize = 20;

  // Fetch messages for the stream
  const messagesQuery = createQuery(() => ({
    queryKey: [store.server.url, 'messages', props.streamName, page(), subjectFilter()],
    queryFn: async ({ signal }) => {
      const options: any = {
        limit: pageSize,
      };
      
      if (subjectFilter()) {
        options.subject = subjectFilter();
      }
      
      // For now, we'll fetch messages starting from sequence 1
      // In a real implementation, you'd want to track the last sequence seen
      if (page() > 1) {
        options.seq = (page() - 1) * pageSize + 1;
      }
      
      const response = await fetchStreamMessage({
        url: store.server.url,
        streamName: props.streamName,
        seq: options,
        jsonp: settings.jsonp,
        signal,
      });
      
      return response;
    },
    select: (response) => {
      if ('err_code' in response) {
        return [];
      }
      
      // If it's a single message, wrap it in an array
      const messages = Array.isArray(response) ? response : [response];
      return messages
        .map((msg): MessageItem | null => parseMessage(msg))
        .filter((m): m is MessageItem => m !== null);
    },
    enabled: store.active && props.streamName !== '',
    staleTime: 30_000,
  }));

  const messages = createMemo(() => messagesQuery.data ?? []);
  const isLoading = () => messagesQuery.isFetching;

  return (
    <div class="space-y-4">
      {/* Controls */}
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject Filter
          </label>
          <input
            type="text"
            value={subjectFilter()}
            onInput={(e) => {
              setSubjectFilter(e.currentTarget.value);
              setPage(1);
            }}
            placeholder="Filter by subject..."
            class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div class="flex items-end">
          <Button
            color="primary"
            size="md"
            onClick={() => messagesQuery.refetch()}
            isLoading={isLoading()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Messages List */}
      <Show
        when={messages().length > 0}
        fallback={
          <div class="text-center py-12 text-gray-500 dark:text-gray-400">
            {isLoading() ? 'Loading messages...' : 'No messages found'}
          </div>
        }
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Seq
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subject
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data Preview
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <For each={messages()}>
                {(msg) => (
                  <tr
                    class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedMessage(msg)}
                  >
                    <td class="px-4 py-3 whitespace-nowrap">
                      <Badge type="pill" color="blue">
                        {msg.seq}
                      </Badge>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                      {msg.subject}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(msg.time)}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono max-w-xs truncate">
                      {msg.decodedData.substring(0, 100)}
                      {msg.decodedData.length > 100 ? '...' : ''}
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div class="flex justify-between items-center">
          <Button
            color="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page() === 1}
          >
            Previous
          </Button>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Page {page()}
          </span>
          <Button
            color="secondary"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={messages().length < pageSize}
          >
            Next
          </Button>
        </div>
      </Show>

      {/* Message Detail Modal */}
      <Show when={selectedMessage()}>
        {(msg) => (
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto">
              <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Message Details
                  </h3>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sequence
                    </label>
                    <div class="text-sm text-gray-900 dark:text-white">
                      {msg().seq}
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject
                    </label>
                    <div class="text-sm font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                      {msg().subject}
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time
                    </label>
                    <div class="text-sm text-gray-900 dark:text-white">
                      {formatDate(msg().time)}
                    </div>
                  </div>

                  <Show when={msg().headers}>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Headers
                      </label>
                      <div class="bg-gray-50 dark:bg-gray-800 rounded p-3">
                        <pre class="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto">
                          {JSON.stringify(msg().headers, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </Show>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data (Decoded)
                    </label>
                    <div class="bg-gray-50 dark:bg-gray-800 rounded p-3">
                      <pre class="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                        {msg().decodedData}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data (Base64)
                    </label>
                    <div class="bg-gray-50 dark:bg-gray-800 rounded p-3">
                      <pre class="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                        {msg().data}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
