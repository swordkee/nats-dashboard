import { createMemo } from "solid-js";
import { createQuery, useQueryClient } from "@tanstack/solid-query";

import type {
  ConnzOptions,
  JszOptions,
  RoutezOptions,
  GatewayzOptions,
  LeafzOptions,
  AccountzOptions,
  AccountStatzOptions,
  SubszOptions,
} from "~/types";
import { fetchInfo } from "~/lib/info";
import { getPrevQueryResponse, newestQueryData } from "~/lib/query-utils";
import {
  formatVarz,
  formatConnz,
  formatJsz,
  formatRoutez,
  formatGatewayz,
  formatLeafz,
  formatAccountz,
  formatAccountStatz,
  formatSubsz,
  type APIResponses,
  type FormattedVarz,
  type FormattedConnz,
  type FormattedJsz,
  type FormattedRoutez,
  type FormattedGatewayz,
  type FormattedLeafz,
  type FormattedAccountz,
  type FormattedAccountStatz,
  type FormattedSubsz,
} from "~/lib/format";
import { useStore } from "~/components/context/store";
import { useSettings } from "~/components/context/settings";

/** Start polling for general server information. */
export function useVarz() {
  const [store] = useStore();
  const [settings] = useSettings();
  const queryClient = useQueryClient();

  return createQuery<APIResponses<"varz">, Error, FormattedVarz>(() => ({
    queryKey: [store.server.url, "varz"],
    queryFn: async ({ queryKey, signal }) => {
      const current = await fetchInfo({
        url: store.server.url,
        endpoint: "varz",
        jsonp: settings.jsonp,
        signal,
      });

      const previous = getPrevQueryResponse<"varz">({
        client: queryClient,
        queryKey,
        exact: false,
      });

      return { current, previous };
    },
    select: formatVarz, // Fromat the data for display.
    enabled: store.active,
    refetchInterval: settings.interval,
    reconcile: false,
    meta: {
      errorTitle: "Server Information",
      errorMessage: "Cannot fetch the server information.",
    },
  }));
}

export type VarzQuery = ReturnType<typeof useVarz>;

/** Start polling for connections information. */
export function useConnz(options?: () => ConnzOptions) {
  const [store] = useStore();
  const [settings] = useSettings();
  const queryClient = useQueryClient();

  const optsMemo = createMemo(() => options?.());

  return createQuery<APIResponses<"connz">, Error, FormattedConnz>(() => ({
    queryKey: [store.server.url, "connz", optsMemo()],
    queryFn: async ({ signal }) => {
      const current = await fetchInfo({
        url: store.server.url,
        endpoint: "connz",
        args: optsMemo(),
        jsonp: settings.jsonp,
        signal,
      });

      const previous = getPrevQueryResponse<"connz">({
        client: queryClient,
        // Use a partial query key to retrieve any previous data, regardless of the options.
        queryKey: [store.server.url, "connz"],
        exact: false,
      });

      return { current, previous };
    },
    select: formatConnz, // Fromat the data for display.
    enabled: store.active,
    refetchInterval: settings.interval,
    reconcile: false,
    meta: {
      errorTitle: "Connections",
      errorMessage: "Cannot fetch the connections information.",
    },
    // Set the initial data from a previous query to keep the same state
    // when changing the fetch settings.
    initialData: () => {
      const data = queryClient.getQueriesData<APIResponses<"connz">>({
        queryKey: [store.server.url, "connz"],
        exact: false,
      });

      // Return the last query's data or undefined for no initial data.
      return newestQueryData(data) as APIResponses<"connz">;
    },
  }));
}

export type ConnzQuery = ReturnType<typeof useConnz>;

/** Start polling for JetSteam information. */
export function useJsz(options?: () => JszOptions) {
  const [store] = useStore();
  const [settings] = useSettings();
  const queryClient = useQueryClient();

  const optsMemo = createMemo(() => options?.());

  return createQuery<APIResponses<"jsz">, Error, FormattedJsz>(() => ({
    queryKey: [store.server.url, "jsz", optsMemo()],
    queryFn: async ({ signal }) => {
      const current = await fetchInfo({
        url: store.server.url,
        endpoint: "jsz",
        args: optsMemo(),
        jsonp: settings.jsonp,
        signal,
      });

      // We don't need the previous data (No calculations are made).
      return { current };
    },
    select: formatJsz, // Fromat the data for display.
    enabled: store.active,
    refetchInterval: settings.interval,
    reconcile: false,
    meta: {
      errorTitle: "JetStream",
      errorMessage: "Cannot fetch the JetStream server information.",
    },
    // Set the initial data from a previous query to keep the same state
    // when changing the fetch settings.
    initialData: () => {
      // Returns found queries as arrays of [queryKey, data].
      const data = queryClient.getQueriesData<APIResponses<"jsz">>({
        queryKey: [store.server.url, "jsz"],
        exact: false, // We want a partial queryKey match.
      });

      // Return the last query's data or undefined for no initial data.
      return newestQueryData(data) as APIResponses<"jsz">;
    },
  }));
}

export type JszQuery = ReturnType<typeof useJsz>;

/** Start polling for routes information. */
export function useRoutez(options?: () => RoutezOptions) {
  const [store] = useStore();
  const [settings] = useSettings();

  const optsMemo = createMemo(() => options?.());

  return createQuery<APIResponses<"routez">, Error, FormattedRoutez>(() => ({
    queryKey: [store.server.url, "routez", optsMemo()],
    queryFn: async ({ signal }) => {
      const current = await fetchInfo({
        url: store.server.url,
        endpoint: "routez",
        args: optsMemo(),
        jsonp: settings.jsonp,
        signal,
      });
      return { current };
    },
    select: formatRoutez,
    enabled: store.active,
    refetchInterval: settings.interval,
    reconcile: false,
    meta: {
      errorTitle: "Routes",
      errorMessage: "Cannot fetch the routes information.",
    },
  }));
}

export type RoutezQuery = ReturnType<typeof useRoutez>;

/** Start polling for gateways information. */
export function useGatewayz(options?: () => GatewayzOptions) {
  const [store] = useStore();
  const [settings] = useSettings();

  const optsMemo = createMemo(() => options?.());

  return createQuery<APIResponses<"gatewayz">, Error, FormattedGatewayz>(
    () => ({
      queryKey: [store.server.url, "gatewayz", optsMemo()],
      queryFn: async ({ signal }) => {
        const current = await fetchInfo({
          url: store.server.url,
          endpoint: "gatewayz",
          args: optsMemo(),
          jsonp: settings.jsonp,
          signal,
        });
        return { current };
      },
      select: formatGatewayz,
      enabled: store.active,
      refetchInterval: settings.interval,
      reconcile: false,
      meta: {
        errorTitle: "Gateways",
        errorMessage: "Cannot fetch the gateways information.",
      },
    }),
  );
}

export type GatewayzQuery = ReturnType<typeof useGatewayz>;

/** Start polling for leaf nodes information. */
export function useLeafz(options?: () => LeafzOptions) {
  const [store] = useStore();
  const [settings] = useSettings();

  const optsMemo = createMemo(() => options?.());

  return createQuery<APIResponses<"leafz">, Error, FormattedLeafz>(() => ({
    queryKey: [store.server.url, "leafz", optsMemo()],
    queryFn: async ({ signal }) => {
      const current = await fetchInfo({
        url: store.server.url,
        endpoint: "leafz",
        args: optsMemo(),
        jsonp: settings.jsonp,
        signal,
      });
      return { current };
    },
    select: formatLeafz,
    enabled: store.active,
    refetchInterval: settings.interval,
    reconcile: false,
    meta: {
      errorTitle: "Leaf Nodes",
      errorMessage: "Cannot fetch the leaf nodes information.",
    },
  }));
}

export type LeafzQuery = ReturnType<typeof useLeafz>;

/** Start polling for accounts information. */
export function useAccountz(options?: () => AccountzOptions) {
  const [store] = useStore();
  const [settings] = useSettings();

  const optsMemo = createMemo(() => options?.());

  return createQuery<APIResponses<"accountz">, Error, FormattedAccountz>(
    () => ({
      queryKey: [store.server.url, "accountz", optsMemo()],
      queryFn: async ({ signal }) => {
        const current = await fetchInfo({
          url: store.server.url,
          endpoint: "accountz",
          args: optsMemo(),
          jsonp: settings.jsonp,
          signal,
        });
        return { current };
      },
      select: formatAccountz,
      enabled: store.active,
      refetchInterval: settings.interval,
      reconcile: false,
      meta: {
        errorTitle: "Accounts",
        errorMessage: "Cannot fetch the accounts information.",
      },
    }),
  );
}

export type AccountzQuery = ReturnType<typeof useAccountz>;

/** Start polling for account statistics. */
export function useAccstatz(options?: () => AccountStatzOptions) {
  const [store] = useStore();
  const [settings] = useSettings();

  const optsMemo = createMemo(() => options?.());

  return createQuery<APIResponses<"accstatz">, Error, FormattedAccountStatz>(
    () => ({
      queryKey: [store.server.url, "accstatz", optsMemo()],
      queryFn: async ({ signal }) => {
        const current = await fetchInfo({
          url: store.server.url,
          endpoint: "accstatz",
          args: optsMemo(),
          jsonp: settings.jsonp,
          signal,
        });
        return { current };
      },
      select: formatAccountStatz,
      enabled: store.active,
      refetchInterval: settings.interval,
      reconcile: false,
      meta: {
        errorTitle: "Account Stats",
        errorMessage: "Cannot fetch the account statistics.",
      },
    }),
  );
}

export type AccstatzQuery = ReturnType<typeof useAccstatz>;

/** Start polling for subscriptions information. */
export function useSubsz(options?: () => SubszOptions) {
  const [store] = useStore();
  const [settings] = useSettings();

  const optsMemo = createMemo(() => options?.());

  return createQuery<APIResponses<"subsz">, Error, FormattedSubsz>(() => ({
    queryKey: [store.server.url, "subsz", optsMemo()],
    queryFn: async ({ signal }) => {
      const current = await fetchInfo({
        url: store.server.url,
        endpoint: "subsz",
        args: optsMemo(),
        jsonp: settings.jsonp,
        signal,
      });
      return { current };
    },
    select: formatSubsz,
    enabled: store.active,
    refetchInterval: settings.interval,
    reconcile: false,
    meta: {
      errorTitle: "Subscriptions",
      errorMessage: "Cannot fetch the subscriptions information.",
    },
  }));
}

export type SubszQuery = ReturnType<typeof useSubsz>;
