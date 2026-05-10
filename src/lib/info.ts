import type { Endpoint, EndpointOptions, EndpointResponse, StreamMessagesOptions, StreamMessagesResponse } from '~/types';
import { jsonp } from '~/lib/jsonp';

interface FetchInfoOptions<T extends Endpoint> {
  /** NATS monitoring server URL. */
  url: string;
  /** Endpoint to fetch. */
  endpoint: T;
  /** Endpoint arguments. */
  args?: EndpointOptions[T] | undefined;
  /** Use JSONP requests to fetch the data. */
  jsonp?: boolean;
  /** Abort signal. */
  signal?: AbortSignal;
}

/** Fetch monitoring information for a NATS server by type. */
export function fetchInfo<T extends Endpoint>({
  url: baseURL,
  endpoint,
  args,
  jsonp = false,
  signal,
}: FetchInfoOptions<T>): Promise<EndpointResponse[T]> {
  // Default to the http scheme.
  if (!baseURL.includes('://')) {
    baseURL = `http://${baseURL}`;
  }

  // Throws TypeError for invalid URLs.
  const url = new URL(endpoint, baseURL);

  if (args) {
    const params = new URLSearchParams(args);
    url.search = params.toString();
  }

  return fetchData<EndpointResponse[T]>(url.href, {
    jsonp,
    signal,
  });
}

interface FetchStreamMessageOptions {
  /** NATS monitoring server URL. */
  url: string;
  /** Stream name. */
  streamName: string;
  /** Message sequence number or options. */
  seq?: number | StreamMessagesOptions;
  /** Use JSONP requests to fetch the data. */
  jsonp?: boolean;
  /** Abort signal. */
  signal?: AbortSignal;
}

/** Fetch a message from a stream by sequence number. */
export function fetchStreamMessage({
  url: baseURL,
  seq,
  jsonp = false,
  signal,
}: FetchStreamMessageOptions): Promise<StreamMessagesResponse> {
  // Default to the http scheme.
  if (!baseURL.includes('://')) {
    baseURL = `http://${baseURL}`;
  }

  // Throws TypeError for invalid URLs.
  let url: URL;
  
  if (typeof seq === 'number') {
    // Fetch by sequence number
    url = new URL(`stream/messages/${seq}`, baseURL);
  } else if (seq) {
    // Fetch with options
    url = new URL('stream/messages', baseURL);
    const params = new URLSearchParams(seq as Record<string, string>);
    url.search = params.toString();
  } else {
    throw new Error('Either seq or options must be provided');
  }

  return fetchData<StreamMessagesResponse>(url.href, {
    jsonp,
    signal,
  });
}

interface FetchDataOptions {
  jsonp?: boolean;
  signal?: AbortSignal | undefined | null;
}

/** Fetch the server data using either JSONP requests or the Fetch API. */
async function fetchData<T>(
  url: string,
  { jsonp: useJSONP = false, signal = null }: FetchDataOptions
): Promise<T> {
  // Required for NATS servers prior to v2.9.22.
  if (useJSONP) {
    return jsonp(url, { signal });
  }

  const response = await fetch(url, { signal });
  return response.json();
}
