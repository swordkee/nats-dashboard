import { Switch, Match, For, Show, createSignal } from 'solid-js';

import { useStore } from '~/components/context/store';
import { useLeafz } from '~/components/dashboard/queries';
import GetStarted from '~/components/dashboard/GetStarted';
import { LoadingIcon } from '~/components/icons';
import Button from '~/components/Button';
import Badge from '~/components/Badge';
import SlideOver from '~/components/SlideOver';
import DataCard from '~/components/DataCard';

import type { FormattedLeafInfo } from '~/lib/format';

export default function LeafNodes() {
  const [store, actions] = useStore();
  const leafz = useLeafz();
  const [selectedLeaf, setSelectedLeaf] = createSignal<FormattedLeafInfo | undefined>();

  return (
    <div>
      <Switch>
        <Match when={!store.active && leafz.isPending}>
          <GetStarted />
        </Match>

        <Match when={store.active && leafz.isLoading}>
          <div class="flex items-center justify-center h-40 px-4 py-6 sm:px-6 lg:px-8 text-gray-900 dark:text-white">
            <LoadingIcon class="h-5 w-5" />
          </div>
        </Match>

        <Match when={leafz.isSuccess}>
          <div class="px-4 py-6 sm:px-6 lg:px-8">
            <div class="flex items-center gap-x-3 mb-6">
              <h2 class="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                Leaf Nodes
              </h2>
              <Badge type="pill" color={leafz.data?.leafnodes ? 'green' : 'gray'}>
                {leafz.data?.leafnodes ?? 0}
              </Badge>
            </div>

            <Show
              when={(leafz.data?.leafs?.length ?? 0) > 0}
              fallback={
                <p class="text-gray-500 dark:text-gray-400">No leaf nodes connected.</p>
              }
            >
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Account
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        IP
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        RTT
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        In Msgs
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Out Msgs
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        In Bytes
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Out Bytes
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Subs
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Spoke
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <For each={leafz.data?.leafs}>
                      {(leaf) => (
                        <tr
                          class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => setSelectedLeaf(leaf)}
                        >
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {leaf.name}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-mono">
                            {leaf.account}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-mono">
                            {leaf.ip}:{leaf.port}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {leaf.info.rtt}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {leaf.info.inMsgs.str}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {leaf.info.outMsgs.str}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {leaf.info.inBytes.str}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {leaf.info.outBytes.str}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {leaf.subscriptions}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {leaf.is_spoke ? 'Yes' : 'No'}
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </div>
        </Match>

        <Match when={leafz.isError}>
          <div class="px-4 py-6 sm:px-6 lg:px-8 text-gray-900 dark:text-white space-y-4">
            <p>There was an error while fetching the leaf nodes information.</p>
            <Button color="secondary" onClick={() => actions.setActive(true)}>
              Retry
            </Button>
          </div>
        </Match>
      </Switch>

      {/* Leaf Node Detail SlideOver */}
      <Show when={selectedLeaf()}>
        {(leaf) => (
          <SlideOver
            title="Leaf Node Details"
            onClose={() => setSelectedLeaf(undefined)}
            size="lg"
          >
            <div class="px-4 sm:px-6 space-y-6">
              <DataCard
                title="Connection Info"
                data={{
                  'Name': leaf().name,
                  'Account': leaf().account,
                  'IP': `${leaf().ip}:${leaf().port}`,
                  'RTT': leaf().info.rtt,
                  'Spoke': leaf().is_spoke ? 'Yes' : 'No',
                }}
              />

              <DataCard
                title="Traffic"
                data={{
                  'Messages In': leaf().info.inMsgs.str,
                  'Messages Out': leaf().info.outMsgs.str,
                  'Bytes In': leaf().info.inBytes.str,
                  'Bytes Out': leaf().info.outBytes.str,
                  'Subscriptions': String(leaf().subscriptions),
                }}
              />

              <Show when={leaf().info.subscriptionsList && leaf().info.subscriptionsList!.length > 0}>
                <DataCard
                  title="Subscriptions"
                  data={Object.fromEntries(
                    leaf().info.subscriptionsList!.map((sub, i) => [String(i + 1), sub])
                  )}
                />
              </Show>
            </div>
          </SlideOver>
        )}
      </Show>
    </div>
  );
}
