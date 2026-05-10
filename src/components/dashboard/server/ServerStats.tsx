import { mergeProps, Show, type Accessor } from "solid-js";

import type { VarzQuery } from "~/components/dashboard/queries";
import { Stats, StatCell } from "~/components/dashboard/Stats";

interface TrendData {
  cpu: Accessor<number[]>;
  memory: Accessor<number[]>;
  connections: Accessor<number[]>;
  inMsgsRate: Accessor<number[]>;
  outMsgsRate: Accessor<number[]>;
  inBytesRate: Accessor<number[]>;
  outBytesRate: Accessor<number[]>;
  subscriptions: Accessor<number[]>;
  slowConsumers: Accessor<number[]>;
}

interface Props {
  varz: VarzQuery;
  trends?: TrendData;
  details?: boolean;
}

export default function ServerStats(props: Props) {
  props = mergeProps({ details: false } satisfies Partial<Props>, props);

  return (
    <Stats>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px">
        <StatCell
          title="CPU Load"
          stat={props.varz.data?.cpu}
          unit="%"
          sparkline={props.trends?.cpu}
        />
        <StatCell
          title="Memory Usage"
          stat={props.varz.data?.info.memory.value}
          unit={props.varz.data?.info.memory.unit}
          sparkline={props.trends?.memory}
        />
        <StatCell
          title="Connections"
          stat={props.varz.data?.info.conns.value}
          unit={props.varz.data?.info.conns.unit}
          sparkline={props.trends?.connections}
        />
        <StatCell
          title="Total Connections"
          stat={props.varz.data?.info.totalConns.value}
          unit={props.varz.data?.info.totalConns.unit}
        />
        <StatCell
          title="Subscriptions"
          stat={props.varz.data?.info.subs.value}
          unit={props.varz.data?.info.subs.unit}
          sparkline={props.trends?.subscriptions}
        />
        <StatCell
          title="Slow Consumers"
          stat={props.varz.data?.info.slowCons.value}
          unit={props.varz.data?.info.slowCons.unit}
          sparkline={props.trends?.slowConsumers}
        />
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-px mt-px">
        <StatCell
          title="Total Messages Received"
          stat={props.varz.data?.info.inMsgs.value}
          unit={props.varz.data?.info.inMsgs.unit}
        />
        <StatCell
          title="Total Messages Sent"
          stat={props.varz.data?.info.outMsgs.value}
          unit={props.varz.data?.info.outMsgs.unit}
        />
        <StatCell
          title="Total Data Received"
          stat={props.varz.data?.info.inBytes.value}
          unit={props.varz.data?.info.inBytes.unit}
        />
        <StatCell
          title="Total Data Sent"
          stat={props.varz.data?.info.outBytes.value}
          unit={props.varz.data?.info.outBytes.unit}
        />
        <StatCell
          title="Messages Received Rate"
          stat={props.varz.data?.info.inMsgsRate.value}
          unit={`${props.varz.data?.info.inMsgsRate.unit}/s`}
          sparkline={props.trends?.inMsgsRate}
        />
        <StatCell
          title="Messages Sent Rate"
          stat={props.varz.data?.info.outMsgsRate.value}
          unit={`${props.varz.data?.info.outMsgsRate.unit}/s`}
          sparkline={props.trends?.outMsgsRate}
        />
        <StatCell
          title="Data Received Rate"
          stat={props.varz.data?.info.inBytesRate.value}
          unit={`${props.varz.data?.info.inBytesRate.unit}/s`}
          sparkline={props.trends?.inBytesRate}
        />
        <StatCell
          title="Data Sent Rate"
          stat={props.varz.data?.info.outBytesRate.value}
          unit={`${props.varz.data?.info.outBytesRate.unit}/s`}
          sparkline={props.trends?.outBytesRate}
        />
      </div>

      <Show when={props.details}>
        <ServerDetails varz={props.varz} />
      </Show>
    </Stats>
  );
}

function ServerDetails(props: { varz: VarzQuery }) {
  return (
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-px mt-px">
      <StatCell title="Leaf Nodes" stat={props.varz.data?.leafnodes} />
      <StatCell title="Routes" stat={props.varz.data?.routes} />
      <StatCell title="Remotes" stat={props.varz.data?.remotes} />
      <StatCell
        title="Max Connections"
        stat={props.varz.data?.info.maxConns.value}
        unit={props.varz.data?.info.maxConns.unit}
      />
      <StatCell
        title="Max Payload"
        stat={props.varz.data?.info.maxPayload.value}
        unit={props.varz.data?.info.maxPayload.unit}
      />
      <StatCell
        title="Max Pending"
        stat={props.varz.data?.info.maxPending.value}
        unit={props.varz.data?.info.maxPending.unit}
      />
      <StatCell
        title="Max Control Line"
        stat={props.varz.data?.info.maxControlLine.value}
        unit={props.varz.data?.info.maxControlLine.unit}
      />
      <StatCell
        title="Ping Interval"
        stat={props.varz.data?.info.pingInterval.value}
        unit={props.varz.data?.info.pingInterval.unit}
      />
      <StatCell title="Max Pings Out" stat={props.varz.data?.ping_max} />
      <StatCell
        title="Write Deadline"
        stat={props.varz.data?.info.writeDeadline.value}
        unit={props.varz.data?.info.writeDeadline.unit}
      />
      <StatCell
        title="Auth. Timeout"
        stat={props.varz.data?.auth_timeout}
        unit="s"
      />
      <StatCell
        title="TLS Timeout"
        stat={props.varz.data?.tls_timeout}
        unit="s"
      />
    </div>
  );
}
