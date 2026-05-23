import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useNetwork, useUpdateNetwork } from "@/hooks/useNetworks";
import {
  Card,
  CardBody,
  CardHeader,
} from "@/components/primitives/Card";
import { Input } from "@/components/primitives/Input";
import { Button } from "@/components/primitives/Button";
import { SaveBar } from "@/components/forms/SaveBar";
import { IpRangeEditor } from "@/components/forms/IpRangeEditor";
import { RoutesEditor } from "@/components/forms/RoutesEditor";
import { DnsEditor } from "@/components/forms/DnsEditor";
import {
  V4AssignToggle,
  V6AssignToggle,
} from "@/components/forms/AssignModeToggle";
import { useApiError } from "@/hooks/useApiError";
import { toast } from "@/store/uiStore";
import { parseCidrV4 } from "@/lib/ip";
import {
  dnsForSave,
  normalizeDns,
  type Dns,
  type IpAssignmentPool,
  type Network,
  type Route,
} from "@/api/types";

interface Draft {
  v4AssignMode: NonNullable<Network["v4AssignMode"]>;
  v6AssignMode: NonNullable<Network["v6AssignMode"]>;
  pools: IpAssignmentPool[];
  routes: Route[];
  dns: Dns;
}

function networkToDraft(n: Network): Draft {
  return {
    v4AssignMode: n.v4AssignMode ?? { zt: false },
    v6AssignMode:
      n.v6AssignMode ?? { zt: false, "6plane": false, rfc4193: false },
    pools: n.ipAssignmentPools ?? [],
    routes: n.routes ?? [],
    dns: normalizeDns(n.dns),
  };
}

export default function ClientConfigTab() {
  const { nwid } = useParams();
  const q = useNetwork(nwid);
  const mut = useUpdateNetwork();
  const onError = useApiError();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [cidr, setCidr] = useState("");

  useEffect(() => {
    if (q.data) setDraft(networkToDraft(q.data));
  }, [q.data]);

  if (!draft) return null;

  const applyEasy = () => {
    const parsed = parseCidrV4(cidr);
    if (!parsed) {
      toast("warn", "Invalid CIDR", "Expected e.g. 10.147.20.0/24");
      return;
    }
    setDraft({
      ...draft,
      pools: [
        { ipRangeStart: parsed.firstHost, ipRangeEnd: parsed.lastHost },
      ],
      routes: [{ target: cidr, via: null }],
    });
  };

  const onSave = async () => {
    try {
      await mut.mutateAsync({
        nwid: nwid!,
        patch: {
          v4AssignMode: draft.v4AssignMode,
          v6AssignMode: draft.v6AssignMode,
          ipAssignmentPools: draft.pools,
          routes: draft.routes,
          dns: dnsForSave(draft.dns),
        },
      });
      toast("success", "Client config saved");
    } catch (err) {
      onError(err, "Save failed");
    }
  };

  const onRevert = () => {
    if (q.data) setDraft(networkToDraft(q.data));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Easy setup"
          description="Provide a CIDR; we fill the pool and a managed route in one shot."
        />
        <CardBody className="flex flex-wrap gap-2 items-start">
          <Input
            monospace
            placeholder="10.147.20.0/24"
            value={cidr}
            onChange={(e) => setCidr(e.target.value.trim())}
            className="max-w-xs"
            aria-label="CIDR"
          />
          <Button variant="outline" onClick={applyEasy} disabled={!cidr}>
            <Sparkles className="h-4 w-4" />
            Fill from CIDR
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="IPv4 assignment"
          description="Mode plus the address ranges the controller hands out."
        />
        <CardBody className="space-y-4">
          <V4AssignToggle
            value={draft.v4AssignMode}
            onChange={(v) => setDraft({ ...draft, v4AssignMode: v })}
          />
          <div>
            <div className="text-xs font-medium text-fg/80 mb-2">
              Assignment pools
            </div>
            <IpRangeEditor
              value={draft.pools}
              onChange={(pools) => setDraft({ ...draft, pools })}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="IPv6 assignment" />
        <CardBody>
          <V6AssignToggle
            value={draft.v6AssignMode}
            onChange={(v) => setDraft({ ...draft, v6AssignMode: v })}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Managed routes"
          description="Pushed to clients. `via` is optional — leave blank for ZeroTier-local routes."
        />
        <CardBody>
          <RoutesEditor
            value={draft.routes}
            onChange={(routes) => setDraft({ ...draft, routes })}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Managed DNS"
          description="Pushed to client OSes that support ZeroTier managed DNS."
        />
        <CardBody>
          <DnsEditor
            value={draft.dns}
            onChange={(dns) => setDraft({ ...draft, dns })}
          />
        </CardBody>
      </Card>

      <Card>
        <SaveBar onSave={onSave} onRevert={onRevert} saving={mut.isPending} />
      </Card>
    </div>
  );
}
