import { Show, type ParentProps, type Accessor } from "solid-js";

import Sparkline from "~/components/dashboard/Sparkline";

export function Stats(props: ParentProps) {
  return (
    <div
      class="bg-gray-200 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700/50 tabular-nums"
      {...props}
    />
  );
}

interface StatCellProps {
  title: string;
  stat: string | number | undefined;
  unit?: string | undefined;
  /** Optional sparkline trend data. */
  sparkline?: Accessor<number[]> | undefined;
}

export function StatCell(props: StatCellProps) {
  return (
    <div class="bg-gray-50 dark:bg-gray-900">
      <div class="h-full px-4 py-6 sm:px-6 lg:px-8 dark:bg-gray-700/10">
        <p class="text-xs xl:text-sm font-medium leading-6 text-gray-500 dark:text-gray-400 whitespace-nowrap truncate">
          {props.title}
        </p>
        <p class="mt-2 flex items-baseline gap-x-2">
          <span class="sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {props.stat ?? ""}
          </span>
          <Show when={props.unit}>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {props.unit}
            </span>
          </Show>
        </p>
        <Show when={props.sparkline && props.sparkline!().length >= 2}>
          <div class="mt-2">
            <Sparkline values={props.sparkline!} width={100} height={24} />
          </div>
        </Show>
      </div>
    </div>
  );
}
