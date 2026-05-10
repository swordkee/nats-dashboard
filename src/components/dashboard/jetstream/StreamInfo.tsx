import { Show, For } from "solid-js";

import type { FormattedStreamDetail } from "~/lib/format";
import { durationFromNs } from "~/lib/utils";
import InfoList from "~/components/dashboard/InfoList";
import DataList from "~/components/dashboard/DataList";
import Indicator from "~/components/Indicator";

interface Props {
  stream: FormattedStreamDetail;
}

export default function StreamInfo(props: Props) {
  return (
    <div class="space-y-6">
      <InfoList
        info={{
          Name: props.stream.name,
          Type: props.stream.info.label,
          Created: props.stream.info.created,
        }}
      />

      <DataList
        title="State"
        data={{
          Consumers: props.stream.info.state.consumerCount,
          [props.stream.info.isKVStore ? "Keys (Subjects)" : "Subjects"]:
            props.stream.info.state.numSubjects.str,
          [props.stream.info.isKVStore ? "Revisions (Messages)" : "Messages"]:
            props.stream.info.state.messages.str,
          "Data Size": props.stream.info.state.data.str,
          "Num. Deleted": props.stream.info.state.numDeleted.str,
          "First Sequence":
            props.stream.info.state.messages.num > 0
              ? props.stream.info.state.firstSeq
              : undefined,
          "Last Sequence":
            props.stream.info.state.messages.num > 0
              ? props.stream.info.state.lastSeq
              : undefined,
          "First Timestamp":
            props.stream.info.state.messages.num > 0
              ? props.stream.info.state.firstTS
              : undefined,
          "Last Timestamp":
            props.stream.info.state.messages.num > 0
              ? props.stream.info.state.lastTS
              : undefined,
        }}
      />

      <Show when={props.stream.cluster}>
        <DataList
          title="Cluster"
          data={{
            Name: props.stream.cluster?.name,
            Leader: props.stream.cluster?.leader,
            Replicas: props.stream.cluster?.replicas?.length,
          }}
        />

        <Show
          when={
            props.stream.cluster?.replicas &&
            props.stream.cluster!.replicas!.length > 0
          }
        >
          <ReplicaTable replicas={props.stream.cluster!.replicas!} />
        </Show>
      </Show>
    </div>
  );
}

function ReplicaTable(props: {
  replicas: NonNullable<FormattedStreamDetail["cluster"]>["replicas"];
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
