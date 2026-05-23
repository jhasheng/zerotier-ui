import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNetwork, useUpdateNetwork } from "@/hooks/useNetworks";
import {
  Card,
  CardBody,
  CardHeader,
  Field,
} from "@/components/primitives/Card";
import { Input } from "@/components/primitives/Input";
import { NumberInput } from "@/components/primitives/NumberInput";
import { ToggleField } from "@/components/primitives/ToggleField";
import { KV } from "@/components/primitives/KV";
import { SaveBar } from "@/components/forms/SaveBar";
import { useApiError } from "@/hooks/useApiError";
import { toast } from "@/store/uiStore";
import type { Network } from "@/api/types";

interface Draft {
  name: string;
  private: boolean;
  enableBroadcast: boolean;
  multicastLimit: number;
  mtu: number;
}

function networkToDraft(n: Network): Draft {
  return {
    name: n.name ?? "",
    private: n.private !== false,
    enableBroadcast: n.enableBroadcast ?? true,
    multicastLimit: n.multicastLimit ?? 32,
    mtu: n.mtu ?? 2800,
  };
}

export default function OverviewTab() {
  const { nwid } = useParams();
  const q = useNetwork(nwid);
  const mut = useUpdateNetwork();
  const onError = useApiError();
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (q.data) setDraft(networkToDraft(q.data));
  }, [q.data]);

  if (!draft) return null;

  const onSave = async () => {
    try {
      await mut.mutateAsync({
        nwid: nwid!,
        patch: { ...draft } as Partial<Network>,
      });
      toast("success", "Overview saved");
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
        <CardHeader title="Identity" />
        <CardBody>
          <Field label="Name" htmlFor="nname">
            <Input
              id="nname"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Access"
          description="Who can join this network."
        />
        <CardBody>
          <ToggleField
            variant="card"
            label="Private"
            description="Members require authorization to join. Public networks let anyone connect; only flip if you know what you're doing."
            checked={draft.private}
            onChange={(v) => setDraft({ ...draft, private: v })}
          />
        </CardBody>
      </Card>

      {q.data ? <SsoReadOnly net={q.data} /> : null}

      <Card>
        <CardHeader
          title="Link behavior"
          description="Layer-2 frame handling on the virtual switch."
        />
        <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="MTU"
            htmlFor="mtu"
            hint="Default 2800. Lower over UDP-restricted links."
          >
            <NumberInput
              id="mtu"
              value={draft.mtu}
              onChange={(v) => setDraft({ ...draft, mtu: v ?? 2800 })}
            />
          </Field>
          <Field
            label="Multicast limit"
            htmlFor="mlim"
            hint="Max receivers per multicast group."
          >
            <NumberInput
              id="mlim"
              value={draft.multicastLimit}
              onChange={(v) => setDraft({ ...draft, multicastLimit: v ?? 0 })}
            />
          </Field>
          <ToggleField
            variant="card"
            label="Enable broadcast"
            description="Forward Ethernet broadcast frames (ff:ff:ff:ff:ff:ff)."
            checked={draft.enableBroadcast}
            onChange={(v) => setDraft({ ...draft, enableBroadcast: v })}
            className="md:col-span-2"
          />
        </CardBody>
      </Card>

      <Card>
        <SaveBar onSave={onSave} onRevert={onRevert} saving={mut.isPending} />
      </Card>
    </div>
  );
}

function SsoReadOnly({ net }: { net: Network }) {
  const hasSso =
    net.ssoEnabled || net.clientId || net.authorizationEndpoint;
  const hasTokens =
    Array.isArray(net.authTokens) &&
    net.authTokens.filter((t) => t != null).length > 0;
  if (!hasSso && !hasTokens) return null;

  const tokenCount = Array.isArray(net.authTokens)
    ? net.authTokens.filter((t) => t != null).length
    : 0;
  return (
    <Card>
      <CardHeader
        title="SSO & auth tokens"
        description="Read-only view of fields managed elsewhere (Central / OIDC provider)."
      />
      <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <KV label="SSO enabled">{String(Boolean(net.ssoEnabled))}</KV>
        <KV label="Client ID" mono>
          {net.clientId || "—"}
        </KV>
        <KV label="Authorization endpoint" mono>
          {net.authorizationEndpoint || "—"}
        </KV>
        <KV label="Auth tokens">{String(tokenCount)}</KV>
      </CardBody>
    </Card>
  );
}
