import { Switch, Match, For, Show, createSignal } from "solid-js";

import { useStore } from "~/components/context/store";
import { useAccountz } from "~/components/dashboard/queries";
import GetStarted from "~/components/dashboard/GetStarted";
import { LoadingIcon } from "~/components/icons";
import Button from "~/components/Button";
import Badge from "~/components/Badge";
import DataCard from "~/components/DataCard";

export default function Accounts() {
  const [store, actions] = useStore();
  const accountz = useAccountz();
  const [selectedAccount, setSelectedAccount] = createSignal<
    string | undefined
  >();

  // Fetch detail for selected account
  const accountDetail = useAccountz(() =>
    selectedAccount() ? { acc: selectedAccount()! } : { acc: "" },
  );

  // Only show detail when there's a selected account with data
  const hasDetail = () =>
    selectedAccount() !== undefined &&
    accountDetail.data?.account_detail !== undefined &&
    accountDetail.data?.account_detail?.account_name === selectedAccount();

  return (
    <div>
      <Switch>
        <Match when={!store.active && accountz.isPending}>
          <GetStarted />
        </Match>

        <Match when={store.active && accountz.isLoading}>
          <div class="flex items-center justify-center h-40 px-4 py-6 sm:px-6 lg:px-8 text-gray-900 dark:text-white">
            <LoadingIcon class="h-5 w-5" />
          </div>
        </Match>

        <Match when={accountz.isSuccess}>
          <div class="px-4 py-6 sm:px-6 lg:px-8">
            <div class="flex items-center gap-x-3 mb-6">
              <h2 class="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                Accounts
              </h2>
              <Badge type="pill" color="blue">
                {accountz.data?.info.numAccounts ?? 0}
              </Badge>
            </div>

            <Show when={accountz.data?.system_account}>
              <div class="mb-4">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  System Account:{" "}
                </span>
                <span class="text-sm font-mono text-gray-900 dark:text-white">
                  {accountz.data?.system_account}
                </span>
              </div>
            </Show>

            <Show
              when={(accountz.data?.accounts?.length ?? 0) > 0}
              fallback={
                <p class="text-gray-500 dark:text-gray-400">
                  No accounts to display.
                </p>
              }
            >
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <For each={accountz.data?.accounts}>
                  {(account) => (
                    <div
                      class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-sky-500 dark:hover:border-sky-400 transition-colors"
                      onClick={() =>
                        setSelectedAccount(
                          selectedAccount() === account ? undefined : account,
                        )
                      }
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-mono text-gray-900 dark:text-white truncate">
                          {account}
                        </span>
                        <Show when={account === accountz.data?.system_account}>
                          <Badge type="pill" color="green">
                            System
                          </Badge>
                        </Show>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>

            {/* Account Detail */}
            <Show when={hasDetail() && accountDetail.data?.account_detail}>
              <div class="mt-8 space-y-6">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                  Account Detail: {selectedAccount()}
                </h3>

                <DataCard
                  title="Account Info"
                  data={{
                    Name: accountDetail.data?.account_detail?.account_name,
                    "System Account": accountDetail.data?.account_detail
                      ?.is_system
                      ? "Yes"
                      : "No",
                    "JetStream Enabled": accountDetail.data?.account_detail
                      ?.jetstream_enabled
                      ? "Yes"
                      : "No",
                    Expired: accountDetail.data?.account_detail?.expired
                      ? "Yes"
                      : "No",
                    "Client Connections": String(
                      accountDetail.data?.account_detail?.client_connections ??
                        0,
                    ),
                    "Leaf Connections": String(
                      accountDetail.data?.account_detail
                        ?.leafnode_connections ?? 0,
                    ),
                    Subscriptions: String(
                      accountDetail.data?.account_detail?.subscriptions ?? 0,
                    ),
                  }}
                />

                <Show when={accountDetail.data?.account_detail?.sublist_stats}>
                  <DataCard
                    title="Sublist Stats"
                    data={{
                      Subscriptions: String(
                        accountDetail.data?.account_detail?.sublist_stats
                          ?.num_subscriptions ?? 0,
                      ),
                      "Cache Size": String(
                        accountDetail.data?.account_detail?.sublist_stats
                          ?.num_cache ?? 0,
                      ),
                      Inserts: String(
                        accountDetail.data?.account_detail?.sublist_stats
                          ?.num_inserts ?? 0,
                      ),
                      Removes: String(
                        accountDetail.data?.account_detail?.sublist_stats
                          ?.num_removes ?? 0,
                      ),
                      Matches: String(
                        accountDetail.data?.account_detail?.sublist_stats
                          ?.num_matches ?? 0,
                      ),
                      "Cache Hit Rate": `${((accountDetail.data?.account_detail?.sublist_stats?.cache_hit_rate ?? 0) * 100).toFixed(2)}%`,
                      "Max Fanout": String(
                        accountDetail.data?.account_detail?.sublist_stats
                          ?.max_fanout ?? 0,
                      ),
                      "Avg Fanout": (
                        accountDetail.data?.account_detail?.sublist_stats
                          ?.avg_fanout ?? 0
                      ).toFixed(2),
                    }}
                  />
                </Show>
              </div>
            </Show>
          </div>
        </Match>

        <Match when={accountz.isError}>
          <div class="px-4 py-6 sm:px-6 lg:px-8 text-gray-900 dark:text-white space-y-4">
            <p>There was an error while fetching the accounts information.</p>
            <Button color="secondary" onClick={() => actions.setActive(true)}>
              Retry
            </Button>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
