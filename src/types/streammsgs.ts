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

/** Response wrapper for multiple messages. */
export interface StreamMessagesListResponse {
  /** Type of the response. */
  type?: string;
  /** List of messages. */
  messages?: StreamMessage[];
}

/** Response wrapper for a single message. */
export interface StreamMessageGetResponse {
  /** Type of the response. */
  type?: string;
  /** The message. */
  message?: StreamMessage;
}

/** Response wrapper for an error. */
export interface StreamMessageErrorResponse {
  /** Type of the response. */
  type?: string;
  /** Error details. */
  error?: ApiError;
}

/** Stream messages API response (can be a list, a single message, or an error). */
export type StreamMessagesResponse =
  | StreamMessagesListResponse
  | StreamMessageGetResponse
  | StreamMessageErrorResponse;
