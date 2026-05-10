import { Router, Route } from "@solidjs/router";

import Providers from "~/components/dashboard/Providers";
import Notifications from "~/components/Notifications";
import Root from "~/components/dashboard/Root";
import Overview from "~/components/dashboard/pages/Overview";
import Info from "~/components/dashboard/pages/Info";
import Connections from "~/components/dashboard/pages/Connections";
import JetStream from "~/components/dashboard/pages/JetStream";
import Routes from "~/components/dashboard/pages/Routes";
import Gateways from "~/components/dashboard/pages/Gateways";
import LeafNodes from "~/components/dashboard/pages/LeafNodes";
import Accounts from "~/components/dashboard/pages/Accounts";
import AccountStats from "~/components/dashboard/pages/AccountStats";
import Subscriptions from "~/components/dashboard/pages/Subscriptions";

interface AppProps {
  /**
   * Router url prop.
   *
   * The URL must be passed to the router for SSG.
   */
  url: string;
}

export default function App(props: AppProps) {
  return (
    <Providers>
      <Notifications />

      <Router root={Root} url={props.url} explicitLinks={true}>
        <Route path="/" component={Overview} />
        <Route path="/info" component={Info} />
        <Route path="/connections" component={Connections} />
        <Route path="/jetstream" component={JetStream} />
        <Route path="/routes" component={Routes} />
        <Route path="/gateways" component={Gateways} />
        <Route path="/leafnodes" component={LeafNodes} />
        <Route path="/accounts" component={Accounts} />
        <Route path="/accountstats" component={AccountStats} />
        <Route path="/subscriptions" component={Subscriptions} />
      </Router>
    </Providers>
  );
}
