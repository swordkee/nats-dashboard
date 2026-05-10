import { createMemo, createSignal, For, Show } from "solid-js";

import { useSettings } from "~/components/context/settings";
import type { StreamDetail } from "~/types";
import { formatStream, type FormattedStreamDetail } from "~/lib/format";
import { paginate } from "~/lib/pagination";
import Dropdown from "~/components/Dropdown";
import Badge, { greenIfPositive } from "~/components/Badge";
import {
  StackedListContainer,
  Header,
  HeaderTitle,
  HeaderControls,
  HeaderButton,
  HeaderSeparator,
  StackedList,
  ListItem,
  ListPagination,
  PrevButton,
  NextButton,
  PaginationRange,
} from "~/components/dashboard/StackedList";
import {
  ChevronDownIcon,
  ChevronUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "~/components/icons";
import SlideOver from "~/components/SlideOver";

import StreamItem from "./StreamItem";
import StreamDetails from "./StreamDetails";
import {
  pageSizeOptions,
  streamSortOptions,
  type StreamSortField,
} from "./options";

/** Sort streams by the given field. */
function getSortComparator(field: StreamSortField) {
  return (a: FormattedStreamDetail, b: FormattedStreamDetail): number => {
    switch (field) {
      case "name":
        return a.name.localeCompare(b.name);
      case "created":
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      case "consumers":
        return (b.state?.consumer_count ?? 0) - (a.state?.consumer_count ?? 0);
      case "messages":
        return (b.state?.messages ?? 0) - (a.state?.messages ?? 0);
      case "bytes":
        return (b.state?.bytes ?? 0) - (a.state?.bytes ?? 0);
      case "subjects":
        return (b.state?.num_subjects ?? 0) - (a.state?.num_subjects ?? 0);
      default:
        return 0;
    }
  };
}

interface Props {
  streams: StreamDetail[];
}

export default function StreamsList(props: Props) {
  const [settings, actions] = useSettings();

  const [sortField, setSortField] = createSignal<StreamSortField>("created");

  const streams = createMemo(() =>
    (props.streams ?? [])
      .map(formatStream)
      .sort(getSortComparator(sortField())),
  );

  const [currentPage, setCurrentPage] = createSignal(1);

  // Reset page when sort changes
  const setSort = (field: StreamSortField) => {
    setSortField(field);
    setCurrentPage(1);
  };

  const totalPages = createMemo(() =>
    Math.ceil(streams().length / settings.jsz.pageSize),
  );

  const next = () => setCurrentPage((p) => Math.min(p + 1, totalPages()));
  const prev = () => setCurrentPage((p) => Math.max(p - 1, 1));

  const isFirstPage = () => currentPage() === 1;
  const isLastPage = () => currentPage() === totalPages();

  const pageStreams = createMemo(() =>
    paginate(streams(), settings.jsz.pageSize, currentPage()),
  );

  const [selectedName, setSelectedName] = createSignal<string>();
  const selectedStream = createMemo(() =>
    pageStreams().find((s) => s.name === selectedName()),
  );

  const numStreams = () => {
    const total = streams().length;
    const current = pageStreams().length;

    if (total > 0 && total !== current) {
      return `${current} of ${total}`;
    }

    return total;
  };

  return (
    <>
      <StackedListContainer>
        <Header>
          <HeaderTitle>
            Streams
            <Badge
              type="pill"
              color={greenIfPositive(streams().length)}
              class="ml-3"
            >
              {numStreams()}
            </Badge>
          </HeaderTitle>

          <HeaderControls>
            <div class="hidden sm:flex items-center gap-2">
              <Show when={totalPages() > 1}>
                <span class="text-xs leading-6 text-gray-900 dark:text-white">
                  Page {currentPage()} of {totalPages()}
                </span>
              </Show>
              <button
                type="button"
                class="flex flex-none items-center justify-center p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white disabled:text-gray-400 dark:disabled:text-gray-600 disabled:pointer-events-none"
                onClick={prev}
                disabled={isFirstPage()}
              >
                <ChevronLeftIcon class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="flex flex-none items-center justify-center p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white disabled:text-gray-400 dark:disabled:text-gray-600 disabled:pointer-events-none"
                onClick={next}
                disabled={isLastPage()}
              >
                <ChevronRightIcon class="h-4 w-4" />
              </button>
            </div>

            <Dropdown
              class="hidden xl:block"
              width="20"
              options={pageSizeOptions}
              active={settings.jsz.pageSize}
              onChange={actions.setJszStreamsPageSize}
            >
              <HeaderButton class="flex items-center gap-x-1">
                Display
                <ChevronDownIcon class="h-4 w-4 text-gray-500" />
              </HeaderButton>
            </Dropdown>

            <HeaderSeparator class="hidden xl:block" />

            <Dropdown
              class="hidden xl:block"
              width="40"
              options={streamSortOptions}
              active={sortField()}
              onChange={setSort}
            >
              <HeaderButton class="flex items-center gap-x-1">
                Sort by
                <ChevronUpDownIcon class="h-5 w-5 text-gray-500" />
              </HeaderButton>
            </Dropdown>
          </HeaderControls>
        </Header>

        <StackedList>
          <For
            each={pageStreams()}
            fallback={<ListItem>No streams to display.</ListItem>}
          >
            {(stream) => (
              <StreamItem stream={stream} onClick={setSelectedName} />
            )}
          </For>
        </StackedList>

        <Show when={totalPages() > 1}>
          <ListPagination>
            <PrevButton onClick={prev} disabled={isFirstPage()} />
            <PaginationRange
              totalPages={totalPages()}
              currentPage={currentPage()}
              onChange={setCurrentPage}
            />
            <NextButton onClick={next} disabled={isLastPage()} />
          </ListPagination>
        </Show>
      </StackedListContainer>

      {/* Slide over for stream details. */}
      <Show when={selectedStream()}>
        {(stream) => (
          <SlideOver
            title="Stream Info"
            onClose={() => setSelectedName(undefined)}
            size="xl"
          >
            <StreamDetails stream={stream()} />
          </SlideOver>
        )}
      </Show>
    </>
  );
}
