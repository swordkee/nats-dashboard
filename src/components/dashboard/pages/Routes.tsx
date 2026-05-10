import { Switch, Match, For, Show, createSignal } from "solid-js";

import { useStore } from "~/components/context/store";
import { useRoutez } from "~/components/dashboard/queries";
import GetStarted from "~/components/dashboard/GetStarted";
import { LoadingIcon } from "~/components/icons";
import Button from "~/components/Button";
import Badge from "~/components/Badge";
import SlideOver from "~/components/SlideOver";
import DataCard from "~/components/DataCard";

import type { FormattedRouteInfo } from "~/lib/format";

export default function Routes() {
  const [store, actions] = useStore();
  const routez = useRoutez();
  const [selectedRoute, setSelectedRoute] = createSignal<
    FormattedRouteInfo | undefined
  >();

  return (
    <div>
      <Switch>
        <Match when={!store.active && routez.isPending}>
          <GetStarted />
        </Match>

        <Match when={store.active && routez.isLoading}>
          <div class="flex items-center justify-center h-40 px-4 py-6 sm:px-6 lg:px-8 text-gray-900 dark:text-white">
            <LoadingIcon class="h-5 w-5" />
          </div>
        </Match>

        <Match when={routez.isSuccess}>
          <div class="px-4 py-6 sm:px-6 lg:px-8">
            <div class="flex items-center gap-x-3 mb-6">
              <h2 class="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                Routes
              </h2>
              <Badge
                type="pill"
                color={routez.data?.num_routes ? "green" : "gray"}
              >
                {routez.data?.num_routes ?? 0}
              </Badge>
            </div>

            <Show
              when={(routez.data?.routes?.length ?? 0) > 0}
              fallback={
                <p class="text-gray-500 dark:text-gray-400">
                  No routes to display.
                </p>
              }
            >
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Remote ID
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        IP
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Uptime
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
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <For each={routez.data?.routes}>
                      {(route) => (
                        <tr
                          class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => setSelectedRoute(route)}
                        >
                          <td class="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                            {route.remote_id.substring(0, 8)}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {route.remote_name}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-mono">
                            {route.ip}:{route.port}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {route.info.uptime}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {route.info.rtt}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {route.info.inMsgs.str}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {route.info.outMsgs.str}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {route.info.inBytes.str}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                            {route.info.outBytes.str}
                          </td>
                          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {route.subscriptions}
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

        <Match when={routez.isError}>
          <div class="px-4 py-6 sm:px-6 lg:px-8 text-gray-900 dark:text-white space-y-4">
            <p>There was an error while fetching the routes information.</p>
            <Button color="secondary" onClick={() => actions.setActive(true)}>
              Retry
            </Button>
          </div>
        </Match>
      </Switch>

      {/* Route Detail SlideOver */}
      <Show when={selectedRoute()}>
        {(route) => (
          <SlideOver
            title="Route Details"
            onClose={() => setSelectedRoute(undefined)}
            size="lg"
          >
            <div class="px-4 sm:px-6 space-y-6">
              <DataCard
                title="Route Info"
                data={{
                  "Remote ID": route().remote_id,
                  "Remote Name": route().remote_name,
                  IP: `${route().ip}:${route().port}`,
                  Uptime: route().info.uptime,
                  RTT: route().info.rtt,
                  Idle: route().info.idle,
                  Start: route().info.start,
                  "Last Activity": route().info.lastActivity,
                  Solicited: route().did_solicit ? "Yes" : "No",
                  Configured: route().is_configured ? "Yes" : "No",
                }}
              />

              <DataCard
                title="Traffic"
                data={{
                  "Messages In": route().info.inMsgs.str,
                  "Messages Out": route().info.outMsgs.str,
                  "Bytes In": route().info.inBytes.str,
                  "Bytes Out": route().info.outBytes.str,
                  "Pending Size": route().info.pendingSize.str,
                  Subscriptions: String(route().subscriptions),
                }}
              />

              <Show
                when={
                  route().info.subscriptionsList &&
                  route().info.subscriptionsList!.length > 0
                }
              >
                <DataCard
                  title="Subscriptions"
                  data={Object.fromEntries(
                    route().info.subscriptionsList!.map((sub, i) => [
                      String(i + 1),
                      sub,
                    ]),
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
