import { createSignal, createMemo, Show, For } from "solid-js";

import type { ConsumerInfo } from "~/types";
import { formatConsumerInfo } from "~/lib/format";
import { durationFromNs } from "~/lib/utils";
import Select, { type Option } from "~/components/Select";
import InfoList from "~/components/dashboard/InfoList";
import DataList from "~/components/dashboard/DataList";
import Indicator from "~/components/Indicator";

interface Props {
  consumers: ConsumerInfo[];
}

export default function ConsumerDetails(props: Props) {
  const [selected, setSelected] = createSignal(0);

  const consumer = createMemo(() => {
    const cons = props.consumers[selected()];
    return cons && formatConsumerInfo(cons);
  });

  return (
    <div class="space-y-6">
      <Show when={props.consumers.length > 1}>
        <div>
          <Select
            options={
              props.consumers.map((c, i) => ({
                label: c.name,
                value: i,
              })) satisfies Option<number>[]
            }
            value={selected()}
            onChange={setSelected}
          />
        </div>
      </Show>

      <Show when={consumer()}>
        {(c) => (
          <>
            <InfoList
              info={{
                Name: c().name,
                "Stream Name": c().stream_name,
                Created: c().info.created,
              }}
            />

            <DataList
              title="State"
              data={{
                Pending: c().info.state.pending.str,
                Waiting: c().info.state.waiting.str,
                "Ack. Pending": c().info.state.ackPending.str,
                Redelivered: c().info.state.redelivered.str,
              }}
            />

            <Show when={c().cluster}>
              <DataList
                title="Cluster"
                data={{
                  Name: c().cluster?.name,
                  Leader: c().cluster?.leader,
                  Replicas: c().cluster?.replicas?.length,
                }}
              />

              <Show
                when={
                  c().cluster?.replicas && c().cluster!.replicas!.length > 0
                }
              >
                <ReplicaTable replicas={c().cluster!.replicas!} />
              </Show>
            </Show>

            <Show when={c().config}>
              <DataList
                title="Config"
                data={{
                  Name: c().config?.name,
                  "Durable Name": c().config?.durable_name,
                  Replicas: c().config?.num_replicas,
                  "Filter Subject": c().config?.filter_subject,
                  "Filter Subjects": c().config?.filter_subjects?.join(", "),
                  "Deliver Group": c().config?.deliver_group,
                  "Deliver Subject": c().config?.deliver_subject,
                  "Deliver Policy": c().info.config.deliverPolicy,
                  "Replay Policy": c().info.config.replayPolicy,
                  "Ack. Policy": c().info.config.ackPolicy,
                  "Max Deliver": c().info.config.maxDeliver,
                  "Max Waiting": c().info.config.maxWaiting?.str,
                  "Ack. Wait": c().info.config.ackWait,
                  "Max Ack. Pending": c().info.config.maxAckPending,
                  Backoff: c().info.config.backoff?.join(", "),
                }}
              />
            </Show>

            <DataList
              title="Delivered"
              data={{
                "Consumer Sequence": c().delivered.consumer_seq,
                "Stream Sequence": c().delivered.stream_seq,
                "Last Active": c().info.delivered.lastActive,
              }}
            />

            <DataList
              title="Ack. Floor"
              data={{
                "Consumer Sequence": c().ack_floor.consumer_seq,
                "Stream Sequence": c().ack_floor.stream_seq,
                "Last Active": c().info.ackFloor.lastActive,
              }}
            />
          </>
        )}
      </Show>
    </div>
  );
}

function ReplicaTable(props: {
  replicas: NonNullable<ConsumerInfo["cluster"]>["replicas"];
}) {
  return (
    <div>
      <h3 class="pb-2 mb-3 font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10">
        Replica Details
      </h3>
      <div class="overflow-x-auto">
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
            <For each={props.replicas ?? []}>
              {(replica) => (
                <tr>
                  <td class="px-3 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {replica.name}
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap">
                    <Indicator
                      color={replica.current ? "green" : "red"}
                      title={replica.current ? "Current" : "Not Current"}
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
    </div>
  );
}
