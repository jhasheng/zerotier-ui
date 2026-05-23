import {
  createBrowserRouter,
  Navigate,
  redirect,
  type LoaderFunctionArgs,
} from "react-router-dom";
import App from "@/App";
import { useAuthStore } from "@/store/authStore";
import ConnectPage from "@/pages/ConnectPage";
import DashboardPage from "@/pages/DashboardPage";
import NetworksListPage from "@/pages/NetworksListPage";
import NetworkDetailPage from "@/pages/NetworkDetailPage";
import PeersPage from "@/pages/PeersPage";
import OverviewTab from "@/pages/tabs/OverviewTab";
import MembersTab from "@/pages/tabs/MembersTab";
import ClientConfigTab from "@/pages/tabs/ClientConfigTab";
import TrafficPolicyTab from "@/pages/tabs/TrafficPolicyTab";
import DangerTab from "@/pages/tabs/DangerTab";
import NotFoundPage from "@/pages/NotFoundPage";

function requireAuth() {
  const ok = useAuthStore.getState().isConfigured();
  if (!ok) return redirect("/connect");
  return null;
}

// Legacy paths from earlier iterations of the IA. Preserve external links / bookmarks.
const LEGACY_REDIRECTS: Record<string, string> = {
  settings: "overview",
  "ips-routes": "client-config",
  dns: "client-config",
  rules: "traffic-policy",
  "caps-tags": "traffic-policy",
};

function legacyRedirect(slug: string) {
  return ({ params }: LoaderFunctionArgs) =>
    redirect(`/networks/${params.nwid}/${LEGACY_REDIRECTS[slug]}`);
}

export const router = createBrowserRouter([
  { path: "/connect", element: <ConnectPage /> },
  {
    path: "/",
    element: <App />,
    loader: requireAuth,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "networks", element: <NetworksListPage /> },
      { path: "peers", element: <PeersPage /> },
      {
        path: "networks/:nwid",
        element: <NetworkDetailPage />,
        children: [
          { index: true, element: <Navigate to="overview" replace /> },
          { path: "overview", element: <OverviewTab /> },
          { path: "members", element: <MembersTab /> },
          { path: "members/:memberId", element: <MembersTab /> },
          { path: "client-config", element: <ClientConfigTab /> },
          { path: "traffic-policy", element: <TrafficPolicyTab /> },
          { path: "danger", element: <DangerTab /> },
          // Legacy path redirects
          { path: "settings", loader: legacyRedirect("settings") },
          { path: "ips-routes", loader: legacyRedirect("ips-routes") },
          { path: "dns", loader: legacyRedirect("dns") },
          { path: "rules", loader: legacyRedirect("rules") },
          { path: "caps-tags", loader: legacyRedirect("caps-tags") },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
