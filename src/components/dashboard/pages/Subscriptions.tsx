import { Switch, Match, For, Show, createSignal } from 'solid-js';

import { useStore } from '~/components/context/store';
import { useSubsz } from '~/components/dashboard/queries';
import GetStarted from '~/components/dashboard/GetStarted';
import { LoadingIcon } from '~/components/icons';
import Button from '~/components/Button';
import Badge from '~/components/Badge';
import { Stats, StatCell } from '~/components/dashboard/Stats';
import SlideOver from '~/components/SlideOver';
import DataCard from '~/components/DataCard';

import type { SubDetail } from '~/types';

export default function Subscriptions() {
  const [store, actions] = useStore();
  const subsz = useSubsz(() => ({ subs: true, limit: 1024 }));
  const [selectedSub, setSelectedSub] = createSignal<SubDetail | undefined>();

  return (
    <div>
      <Switch>
        <Match when={!store.active && subsz.isPending}>
          <GetStarted />
        </Match>

        <Match when={store.active && subsz.isLoading}>
          <div class="flex items-center justify-center h-40 px-4 py-6 sm:px-6 lg:px-8 text-gray-900 dark:text-white">
            <LoadingIcon class="h-5 w-5" />
          </div>
        </Match>

        <Match when={subsz.isSuccess}>
          {/* Subscription Stats */}
          <Stats>
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px">
              <StatCell title="Subscriptions" stat={subsz.data?.info.numSubscriptions.value} unit={subsz.data?.info.numSubscriptions.unit} />
              <StatCell title="Cache Size" stat={subsz.data?.info.numCache.value} unit={subsz.data?.info.numCache.unit} />
              <StatCell title="Inserts" stat={subsz.data?.info.numInserts.value} unit={subsz.data?.info.numInserts.unit} />
              <StatCell title="Removes" stat={subsz.data?.info.numRemoves.value} unit={subsz.data?.info.numRemoves.unit} />
              <StatCell title="Matches" stat={subsz.data?.info.numMatches.value} unit={subsz.data?.info.numMatches.unit} />
              <StatCell title="Cache Hit Rate" stat={subsz.data?.info.cacheHitRate} />
              <StatCell title="Max Fanout" stat={subsz.data?.info.maxFanout.value} unit={subsz.data?.info.maxFanout.unit} />
              <StatCell title="Avg Fanout" stat={subsz.data?.info.avgFanout} />
            </div>
          </Stats>

          <div class="px-4 py-6 sm:px-6 lg:px-8">
            <div class="flex items-center gap-x-3 mb-6">
              <h2 class="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                Subscriptions
              </h2>
              <Badge type="pill" color="blue">
                {subsz.data?.total ?? 0}
              </Badge>
            </div>

            <Show
              when={(subsz.data?.subscriptions_list?.length ?? 0) > 0}
              fallback={
                <p class="text-gray-500 dark:text-gray-400">No subscriptions to display.</p>
              }
            >
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Subject
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Queue Group
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        SID
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Messages
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        CID
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <For each={subsz.data?.subscriptions_list}>
                      {(sub) => (
                        <tr
                          class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => setSelectedSub(sub)}
                        >
                          <td class="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                            {sub.subject}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {sub.qgroup || '-'}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-mono">
                            {sub.sid}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {sub.msgs}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {sub.cid}
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

        <Match when={subsz.isError}>
          <div class="px-4 py-6 sm:px-6 lg:px-8 text-gray-900 dark:text-white space-y-4">
            <p>There was an error while fetching the subscriptions information.</p>
            <Button color="secondary" onClick={() => actions.setActive(true)}>
              Retry
            </Button>
          </div>
        </Match>
      </Switch>

      {/* Subscription Detail SlideOver */}
      <Show when={selectedSub()}>
        {(sub) => (
          <SlideOver
            title="Subscription Details"
            onClose={() => setSelectedSub(undefined)}
            size="md"
          >
            <div class="px-4 sm:px-6">
              <DataCard
                title="Subscription Info"
                data={{
                  'Subject': sub().subject,
                  'Queue Group': sub().qgroup || 'None',
                  'SID': sub().sid,
                  'Messages': String(sub().msgs),
                  'Max': sub().max !== undefined ? String(sub().max) : 'Unlimited',
                  'Connection ID': String(sub().cid),
                  'Account': sub().account || 'N/A',
                }}
              />
            </div>
          </SlideOver>
        )}
      </Show>
    </div>
  );
}
