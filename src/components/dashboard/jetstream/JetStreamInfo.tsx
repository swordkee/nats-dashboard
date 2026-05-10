import { Show, For } from "solid-js";

import type { JszQuery } from "~/components/dashboard/queries";
import { useStore } from "~/components/context/store";
import { formatDate, durationFromNs } from "~/lib/utils";
import {
  InfoSection,
  DetailList,
  DetailItem,
} from "~/components/dashboard/InfoSection";
import Indicator from "~/components/Indicator";
import Badge from "~/components/Badge";
import { LoadingIcon } from "~/components/icons";

import JetStreamSettings from "./JetStreamSettings";

interface Props {
  jsz: JszQuery;
  isLoading: boolean;
}

export default function JetStreamInfo(props: Props) {
  const [store] = useStore();

  return (
    <InfoSection>
      <div>
        <div class="flex items-center gap-x-3">
          <Indicator
            color={store.active ? "green" : "gray"}
            title={store.active ? "Monitoring" : "Not Monitoring"}
          />

          <h1
            class="flex gap-x-3 text-base leading-7 font-semibold text-gray-900 dark:text-white break-all"
            title="Server ID"
          >
            {props.jsz.data?.server_id}
          </h1>
        </div>

        <DetailList>
          <DetailItem
            name="Server Time"
            value={formatDate(props.jsz.data?.now ?? "")}
          />
          <DetailItem
            name="Store Directory"
            value={props.jsz.data?.config?.store_dir}
          />
          <DetailItem
            name="Max Memory"
            value={props.jsz.data?.info.config.maxMemory.str}
          />
          <DetailItem
            name="Max Storage"
            value={props.jsz.data?.info.config.maxStorage.str}
          />
          <Show when={props.jsz.data.info.syncInterval}>
            <DetailItem
              name="Sync Interval"
              value={props.jsz.data.info.syncInterval}
            />
          </Show>
          <Show when={props.jsz.data.config?.sync_always !== undefined}>
            <DetailItem
              name="Sync Always"
              value={props.jsz.data.config?.sync_always ? "Yes" : "No"}
            />
          </Show>
          <DetailItem
            name="Compression Allowed"
            value={props.jsz.data?.config?.compress_ok ? "Yes" : "No"}
          />
        </DetailList>

        <Show when={props.jsz.data?.meta_cluster}>
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Meta Cluster
            </h3>
            <DetailList>
              <DetailItem
                name="Cluster Name"
                value={props.jsz.data?.meta_cluster?.name}
              />
              <DetailItem
                name="Leader"
                value={props.jsz.data?.meta_cluster?.leader}
              />
              <DetailItem
                name="Peer"
                value={props.jsz.data?.meta_cluster?.peer}
              />
              <DetailItem
                name="Cluster Size"
                value={String(props.jsz.data?.meta_cluster?.cluster_size ?? "")}
              />
            </DetailList>
            <Show
              when={
                props.jsz.data?.meta_cluster?.replicas &&
                props.jsz.data!.meta_cluster!.replicas!.length > 0
              }
            >
              <div class="mt-3 overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th class="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </th>
                      <th class="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Current
                      </th>
                      <th class="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Offline
                      </th>
                      <th class="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Active
                      </th>
                      <th class="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Lag
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    <For each={props.jsz.data?.meta_cluster?.replicas ?? []}>
                      {(replica) => (
                        <tr>
                          <td class="px-3 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {replica.name}
                          </td>
                          <td class="px-3 py-2 whitespace-nowrap">
                            <Indicator
                              color={replica.current ? "green" : "red"}
                              title={
                                replica.current ? "Current" : "Not Current"
                              }
                            />
                          </td>
                          <td class="px-3 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {replica.offline ? "Yes" : "No"}
                          </td>
                          <td class="px-3 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {durationFromNs(replica.active).str}
                          </td>
                          <td class="px-3 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {replica.lag ?? 0}
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </div>
        </Show>

        <JetStreamSettings class="mt-6" />
      </div>

      <Badge
        type="pill"
        class="order-first sm:order-none flex-none"
        color={props.jsz.data?.disabled ? "red" : "green"}
      >
        {props.jsz.data?.disabled ? "Disabled" : "Enabled"}
      </Badge>

      <Show when={props.isLoading}>
        <LoadingIcon class="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 lg:right-8 w-4 h-4" />
      </Show>
    </InfoSection>
  );
}
