import { Switch, Match, createEffect } from "solid-js";

import { useStore } from "~/components/context/store";
import { useVarz, useHealthz } from "~/components/dashboard/queries";
import GetStarted from "~/components/dashboard/GetStarted";
import { LoadingIcon } from "~/components/icons";
import Button from "~/components/Button";

import ServerInfo from "~/components/dashboard/server/ServerInfo";
import ServerStats from "~/components/dashboard/server/ServerStats";
import Connections from "~/components/dashboard/pages/Connections";
import { createOverviewTrends } from "~/lib/trends";

export default function Overview() {
  const [store, actions] = useStore();
  const varz = useVarz();
  const healthz = useHealthz();

  const { trends, push } = createOverviewTrends();

  // Push trend data on each successful varz update
  createEffect(() => {
    if (varz.data) {
      push.pushCpu(varz.data.cpu);
      push.pushMemory(varz.data.mem);
      push.pushConnections(varz.data.connections);
      push.pushInMsgsRate(varz.data.info.inMsgsRate.num);
      push.pushOutMsgsRate(varz.data.info.outMsgsRate.num);
      push.pushInBytesRate(varz.data.info.inBytesRate.bytes);
      push.pushOutBytesRate(varz.data.info.outBytesRate.bytes);
      push.pushSubscriptions(varz.data.subscriptions);
      push.pushSlowConsumers(varz.data.slow_consumers);
    }
  });

  return (
    <div>
      <Switch>
        <Match when={!store.active && varz.isPending}>
          <GetStarted />
        </Match>

        <Match when={store.active && varz.isLoading}>
          <div class="flex items-center justify-center h-40 px-4 py-6 sm:px-6 lg:px-8 text-gray-900 dark:text-white">
            <LoadingIcon class="h-5 w-5" />
          </div>
        </Match>

        <Match when={varz.isSuccess}>
          <ServerInfo varz={varz} healthz={healthz} />
          <ServerStats varz={varz} trends={trends} />
        </Match>

        <Match when={varz.isError}>
          <div class="h-40 px-4 py-6 sm:px-6 lg:px-8 text-gray-900 dark:text-white space-y-4">
            <p>There was an error while fetching the server information.</p>
            <Button color="secondary" onClick={() => actions.setActive(true)}>
              Retry
            </Button>
          </div>
        </Match>
      </Switch>

      <Connections />
    </div>
  );
}
