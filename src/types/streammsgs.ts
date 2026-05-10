/** Stream messages query options. */
export interface StreamMessagesOptions {
  /** Start sequence. */
  seq?: number;
  /** Last N messages. */
  last_by_subj?: string;
  /** Next messages count. */
  next_by_subj?: string;
  /** Number of messages to return (Default is 100, Max is 10000). */
  limit?: number;
  /** Subject to filter messages. */
  subject?: string;
}

/** Stream message response. */
export interface StreamMessage {
  /** Message sequence number. */
  seq: {
    /** Stream sequence. */
    stream: number;
    /** Consumer sequence. */
    consumer?: number;
  };
  /** Subject. */
  subject: string;
  /** Data (base64 encoded). */
  data: string;
  /** Headers (base64 encoded). */
  hdrs?: string;
  /** Time stamp. */
  time: string;
  /** Sequence of the original message in case of direct get. */
  num?: {
    /** Stream sequence number. */
    stream: number;
    /** Last sequence of the subject. */
    last: number;
  };
}

/** API error response. */
export interface ApiError {
  code: number;
  err_code?: number;
  description?: string;
}

/** Stream messages API response (can be a single message, an array, or an error). */
export type StreamMessagesResponse = StreamMessage | StreamMessage[] | ApiError;
