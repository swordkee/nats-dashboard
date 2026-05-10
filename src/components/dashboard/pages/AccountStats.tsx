import { Switch, Match, For, Show } from 'solid-js';

import { useStore } from '~/components/context/store';
import { useAccstatz } from '~/components/dashboard/queries';
import GetStarted from '~/components/dashboard/GetStarted';
import { LoadingIcon } from '~/components/icons';
import Button from '~/components/Button';
import Badge from '~/components/Badge';
import { formatBytes, abbreviateNum } from '~/lib/utils';

export default function AccountStats() {
  const [store, actions] = useStore();
  const accstatz = useAccstatz();

  return (
    <div>
      <Switch>
        <Match when={!store.active && accstatz.isPending}>
          <GetStarted />
        </Match>

        <Match when={store.active && accstatz.isLoading}>
          <div class="flex items-center justify-center h-40 px-4 py-6 sm:px-6 lg:px-8 text-gray-900 dark:text-white">
            <LoadingIcon class="h-5 w-5" />
          </div>
        </Match>

        <Match when={accstatz.isSuccess}>
          <div class="px-4 py-6 sm:px-6 lg:px-8">
            <div class="flex items-center gap-x-3 mb-6">
              <h2 class="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                Account Statistics
              </h2>
              <Badge type="pill" color="blue">
                {accstatz.data?.info.numAccounts ?? 0}
              </Badge>
            </div>

            <Show
              when={(accstatz.data?.account_statz?.length ?? 0) > 0}
              fallback={
                <p class="text-gray-500 dark:text-gray-400">No account statistics to display.</p>
              }
            >
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Account
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Conns
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Leaf Nodes
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Conns
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Subs
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sent Msgs
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sent Bytes
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Recv Msgs
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Recv Bytes
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Slow Consumers
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <For each={accstatz.data?.account_statz}>
                      {(stat) => (
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td class="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                            {stat.acc}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {stat.conns}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {stat.leafnodes}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {stat.total_conns}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {abbreviateNum(stat.num_subscriptions).str}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {abbreviateNum(stat.sent.msgs).str}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {formatBytes(stat.sent.bytes).str}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {abbreviateNum(stat.received.msgs).str}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {formatBytes(stat.received.bytes).str}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm">
                            <Badge type="pill" color={stat.slow_consumers > 0 ? 'red' : 'gray'}>
                              {stat.slow_consumers}
                            </Badge>
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

        <Match when={accstatz.isError}>
          <div class="px-4 py-6 sm:px-6 lg:px-8 text-gray-900 dark:text-white space-y-4">
            <p>There was an error while fetching the account statistics.</p>
            <Button color="secondary" onClick={() => actions.setActive(true)}>
              Retry
            </Button>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
