import type { Options } from "~/components/Dropdown";

/** Streams page size options. */
export const pageSizeOptions: Options<number> = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 30, label: "30" },
  { value: 40, label: "40" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
  { value: 250, label: "250" },
  { value: 500, label: "500" },
];

/** Stream sort field options. */
export type StreamSortField =
  | "name"
  | "created"
  | "consumers"
  | "messages"
  | "bytes"
  | "subjects";

export const streamSortOptions: Options<StreamSortField> = [
  { value: "name", label: "Name" },
  { value: "created", label: "Created" },
  { value: "consumers", label: "Consumers" },
  { value: "messages", label: "Messages" },
  { value: "bytes", label: "Data Size" },
  { value: "subjects", label: "Subjects" },
];
