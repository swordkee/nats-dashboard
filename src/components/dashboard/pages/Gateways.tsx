import { Switch, Match, For, Show } from "solid-js";

import { useStore } from "~/components/context/store";
import { useGatewayz } from "~/components/dashboard/queries";
import GetStarted from "~/components/dashboard/GetStarted";
import { LoadingIcon } from "~/components/icons";
import Button from "~/components/Button";
import Badge from "~/components/Badge";
import DataCard from "~/components/DataCard";
import { formatBytes } from "~/lib/utils";

export default function Gateways() {
  const [store, actions] = useStore();
  const gatewayz = useGatewayz();

  return (
    <div>
      <Switch>
        <Match when={!store.active && gatewayz.isPending}>
          <GetStarted />
        </Match>

        <Match when={store.active && gatewayz.isLoading}>
          <div class="flex items-center justify-center h-40 px-4 py-6 sm:px-6 lg:px-8 text-gray-900 dark:text-white">
            <LoadingIcon class="h-5 w-5" />
          </div>
        </Match>

        <Match when={gatewayz.isSuccess}>
          <div class="px-4 py-6 sm:px-6 lg:px-8">
            <div class="flex items-center gap-x-3 mb-6">
              <h2 class="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                Gateways
              </h2>
              <Badge type="pill" color="blue">
                {gatewayz.data?.name ?? "N/A"}
              </Badge>
            </div>

            <Show when={!gatewayz.data?.name}>
              <p class="text-gray-500 dark:text-gray-400">
                Gateways are not configured on this server.
              </p>
            </Show>

            <Show when={gatewayz.data?.name}>
              <div class="space-y-8">
                {/* Gateway Server Info */}
                <DataCard
                  title="Gateway Configuration"
                  data={{
                    "Gateway Name": gatewayz.data?.name,
                    Host: gatewayz.data?.host,
                    Port: String(gatewayz.data?.port ?? ""),
                  }}
                />

                {/* Outbound Gateways */}
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    Outbound Gateways
                    <Badge type="pill" color="green" class="ml-2">
                      {gatewayz.data?.info.numOutboundGateways ?? 0}
                    </Badge>
                  </h3>
                  <Show
                    when={(gatewayz.data?.info.numOutboundGateways ?? 0) > 0}
                    fallback={
                      <p class="text-gray-500 dark:text-gray-400 text-sm">
                        No outbound gateways connected.
                      </p>
                    }
                  >
                    <div class="space-y-3">
                      <For
                        each={Object.entries(
                          gatewayz.data?.outbound_gateways ?? {},
                        )}
                      >
                        {([name, gw]) => (
                          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <div class="flex items-center justify-between">
                              <div>
                                <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
                                  {name}
                                </h4>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {gw.connection
                                    ? `${formatBytes(gw.connection.in_bytes).str} in / ${formatBytes(gw.connection.out_bytes).str} out`
                                    : "Not connected"}
                                </p>
                              </div>
                              <div class="flex items-center gap-2">
                                <Show when={gw.configured}>
                                  <Badge type="pill" color="green">
                                    Configured
                                  </Badge>
                                </Show>
                                <Show when={!gw.configured}>
                                  <Badge type="pill" color="gray">
                                    Discovered
                                  </Badge>
                                </Show>
                              </div>
                            </div>

                            <Show when={gw.accounts && gw.accounts.length > 0}>
                              <div class="mt-3 pt-3 border-t border-gray-100 dark:border-white/10">
                                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                  Accounts
                                </p>
                                <div class="flex flex-wrap gap-2">
                                  <For each={gw.accounts}>
                                    {(acc) => (
                                      <Badge type="pill" color="blue">
                                        {acc.name} ({acc.interest_mode})
                                      </Badge>
                                    )}
                                  </For>
                                </div>
                              </div>
                            </Show>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>

                {/* Inbound Gateways */}
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    Inbound Gateways
                    <Badge type="pill" color="blue" class="ml-2">
                      {gatewayz.data?.info.numInboundGateways ?? 0}
                    </Badge>
                  </h3>
                  <Show
                    when={(gatewayz.data?.info.numInboundGateways ?? 0) > 0}
                    fallback={
                      <p class="text-gray-500 dark:text-gray-400 text-sm">
                        No inbound gateways connected.
                      </p>
                    }
                  >
                    <div class="space-y-3">
                      <For
                        each={Object.entries(
                          gatewayz.data?.inbound_gateways ?? {},
                        )}
                      >
                        {([name, gws]) => (
                          <For each={gws}>
                            {(gw) => (
                              <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div class="flex items-center justify-between">
                                  <div>
                                    <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
                                      {name}
                                    </h4>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {gw.connection
                                        ? `${formatBytes(gw.connection.in_bytes).str} in / ${formatBytes(gw.connection.out_bytes).str} out`
                                        : "Not connected"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </For>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </div>
            </Show>
          </div>
        </Match>

        <Match when={gatewayz.isError}>
          <div class="px-4 py-6 sm:px-6 lg:px-8 text-gray-900 dark:text-white space-y-4">
            <p>There was an error while fetching the gateways information.</p>
            <Button color="secondary" onClick={() => actions.setActive(true)}>
              Retry
            </Button>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
