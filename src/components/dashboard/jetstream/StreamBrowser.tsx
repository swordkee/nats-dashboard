import { createSignal, createMemo, For, Show } from "solid-js";

import type { FormattedStreamDetail } from "~/lib/format";
import Modal from "~/components/Modal";
import { Tabs, Tab, TabPanel } from "~/components/Tabs";
import Badge from "~/components/Badge";

import KVStoreBrowser from "./KVStoreBrowser";
import MessageViewer from "./MessageViewer";

interface Props {
  streams: FormattedStreamDetail[];
}

/** Filter streams to only KV store streams. */
function filterKVStreams(
  streams: FormattedStreamDetail[],
): FormattedStreamDetail[] {
  return streams.filter((s) => s.info.isKVStore);
}

/** Filter streams to only non-KV store streams. */
function filterRegularStreams(
  streams: FormattedStreamDetail[],
): FormattedStreamDetail[] {
  return streams.filter((s) => !s.info.isKVStore);
}

export default function StreamBrowser(props: Props) {
  const [tab, setTab] = createSignal<"kv" | "messages">("kv");
  const [selectedStream, setSelectedStream] =
    createSignal<FormattedStreamDetail | null>(null);

  const kvStreams = createMemo(() => filterKVStreams(props.streams));
  const regularStreams = createMemo(() => filterRegularStreams(props.streams));

  const updateTab = (t: "kv" | "messages") => (e: Event) => {
    e.preventDefault();
    setTab(t);
  };

  return (
    <div class="space-y-4">
      <Tabs>
        <Tab active={tab() === "kv"} onClick={updateTab("kv")}>
          KV Stores
          <Show when={kvStreams().length > 0}>
            <Badge type="pill" color="blue" class="ml-2">
              {kvStreams().length}
            </Badge>
          </Show>
        </Tab>
        <Tab active={tab() === "messages"} onClick={updateTab("messages")}>
          Messages
          <Show when={regularStreams().length > 0}>
            <Badge type="pill" color="blue" class="ml-2">
              {regularStreams().length}
            </Badge>
          </Show>
        </Tab>
      </Tabs>

      <TabPanel>
        <Show when={tab() === "kv"}>
          <div class="space-y-4">
            <Show
              when={kvStreams().length > 0}
              fallback={
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                  No KV stores found
                </div>
              }
            >
              <div class="grid gap-4">
                <For each={kvStreams()}>
                  {(stream) => (
                    <div
                      class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-sky-500 dark:hover:border-sky-400 transition-colors"
                      onClick={() => setSelectedStream(stream)}
                    >
                      <div class="flex items-center justify-between">
                        <div>
                          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                            {stream.name}
                          </h3>
                          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {stream.info.state.messages.str} revisions ·{" "}
                            {stream.info.state.data.str} data
                          </p>
                        </div>
                        <Badge type="pill" color="blue">
                          KV Store
                        </Badge>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </Show>

        <Show when={tab() === "messages"}>
          <div class="space-y-4">
            <Show
              when={regularStreams().length > 0}
              fallback={
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                  No message streams found
                </div>
              }
            >
              <div class="grid gap-4">
                <For each={regularStreams()}>
                  {(stream) => (
                    <div
                      class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-sky-500 dark:hover:border-sky-400 transition-colors"
                      onClick={() => setSelectedStream(stream)}
                    >
                      <div class="flex items-center justify-between">
                        <div>
                          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                            {stream.name}
                          </h3>
                          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {stream.info.state.messages.str} messages ·{" "}
                            {stream.info.state.data.str} data
                          </p>
                        </div>
                        <Badge type="pill" color="blue">
                          {stream.info.label}
                        </Badge>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </Show>
      </TabPanel>

      {/* Stream Browser Modal */}
      <Show when={selectedStream()}>
        {(stream) => (
          <Modal
            onClose={() => setSelectedStream(null)}
            size="6xl"
            padding={false}
          >
            <div class="p-6">
              <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {stream().name}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {stream().info.label}
                </p>
              </div>

              <Show
                when={stream().info.isKVStore}
                fallback={<MessageViewer streamName={stream().name} />}
              >
                <KVStoreBrowser streamName={stream().name} />
              </Show>
            </div>
          </Modal>
        )}
      </Show>
    </div>
  );
}
