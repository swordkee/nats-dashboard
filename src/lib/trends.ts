import { createSignal } from 'solid-js';

/** Default number of data points to keep for sparkline charts. */
const DEFAULT_MAX_POINTS = 60;

/**
 * Creates a reactive signal that maintains a rolling buffer of numeric values.
 *
 * Call `push(value)` each time you receive a new data point (e.g. in a TanStack Query transform).
 * The signal automatically discards old values when the buffer exceeds `maxPoints`.
 */
export function createTrendHistory(maxPoints = DEFAULT_MAX_POINTS) {
  const [history, setHistory] = createSignal<number[]>([]);

  const push = (value: number | undefined) => {
    if (value === undefined) return;
    setHistory((prev) => {
      const next = [...prev, value];
      if (next.length > maxPoints) {
        return next.slice(next.length - maxPoints);
      }
      return next;
    });
  };

  return [history, push] as const;
}

/** Helper to push multiple trend values from a formatted varz data object. */
export interface TrendPushers {
  pushCpu: (v: number | undefined) => void;
  pushMemory: (v: number | undefined) => void;
  pushConnections: (v: number | undefined) => void;
  pushInMsgsRate: (v: number | undefined) => void;
  pushOutMsgsRate: (v: number | undefined) => void;
  pushInBytesRate: (v: number | undefined) => void;
  pushOutBytesRate: (v: number | undefined) => void;
  pushSubscriptions: (v: number | undefined) => void;
  pushSlowConsumers: (v: number | undefined) => void;
}

/** Create a set of trend history signals for all Overview page metrics. */
export function createOverviewTrends(): {
  trends: {
    cpu: () => number[];
    memory: () => number[];
    connections: () => number[];
    inMsgsRate: () => number[];
    outMsgsRate: () => number[];
    inBytesRate: () => number[];
    outBytesRate: () => number[];
    subscriptions: () => number[];
    slowConsumers: () => number[];
  };
  push: TrendPushers;
} {
  const [cpu, pushCpu] = createTrendHistory();
  const [memory, pushMemory] = createTrendHistory();
  const [connections, pushConnections] = createTrendHistory();
  const [inMsgsRate, pushInMsgsRate] = createTrendHistory();
  const [outMsgsRate, pushOutMsgsRate] = createTrendHistory();
  const [inBytesRate, pushInBytesRate] = createTrendHistory();
  const [outBytesRate, pushOutBytesRate] = createTrendHistory();
  const [subscriptions, pushSubscriptions] = createTrendHistory();
  const [slowConsumers, pushSlowConsumers] = createTrendHistory();

  return {
    trends: {
      cpu,
      memory,
      connections,
      inMsgsRate,
      outMsgsRate,
      inBytesRate,
      outBytesRate,
      subscriptions,
      slowConsumers,
    },
    push: {
      pushCpu,
      pushMemory,
      pushConnections,
      pushInMsgsRate,
      pushOutMsgsRate,
      pushInBytesRate,
      pushOutBytesRate,
      pushSubscriptions,
      pushSlowConsumers,
    },
  };
}
