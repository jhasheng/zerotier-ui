import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNetwork, useUpdateNetwork } from "@/hooks/useNetworks";
import {
  Card,
  CardBody,
  CardHeader,
} from "@/components/primitives/Card";
import { RulesEditor } from "@/components/rules/RulesEditor";
import { TagListEditor } from "@/components/forms/TagListEditor";
import { CapabilityEditor } from "@/components/forms/CapabilityEditor";
import { SaveBar } from "@/components/forms/SaveBar";
import { useApiError } from "@/hooks/useApiError";
import { toast } from "@/store/uiStore";
import type { Capability, Network, Rule, Tag } from "@/api/types";

interface Draft {
  rules: Rule[];
  tags: Tag[];
  capabilities: Capability[];
}

function networkToDraft(n: Network): Draft {
  return {
    rules: n.rules ?? [],
    tags: n.tags ?? [],
    capabilities: n.capabilities ?? [],
  };
}

export default function TrafficPolicyTab() {
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
        patch: {
          rules: draft.rules,
          tags: draft.tags,
          capabilities: draft.capabilities,
        },
      });
      toast("success", "Traffic policy saved");
    } catch (err) {
      onError(err, "Save failed");
    }
  };

  const onRevert = () => {
    if (q.data) setDraft(networkToDraft(q.data));
  };

  const rulesSource = q.data?.rulesSource;

  return (
    <div className="space-y-6">
      {rulesSource ? (
        <Card>
          <CardHeader
            title="rulesSource (read-only)"
            description="Original ZT rule-compiler text, if the rules were authored via the official compiler. The structured editor below produces JSON directly and does not update this field."
          />
          <CardBody className="p-0">
            <pre className="font-mono text-xs bg-muted/30 px-4 py-3 overflow-x-auto whitespace-pre">
              {rulesSource}
            </pre>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title="Flow rules"
          description="Evaluated top-to-bottom. Tags and capabilities below feed MATCH_TAG_* matches and capability grants."
        />
        <CardBody>
          <RulesEditor
            value={draft.rules}
            onChange={(rules) => setDraft({ ...draft, rules })}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Tag definitions"
          description="Numeric tags carried per-member, referenced by MATCH_TAG_* rules above."
        />
        <CardBody>
          <TagListEditor
            value={draft.tags}
            onChange={(tags) => setDraft({ ...draft, tags })}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Capabilities"
          description="Bundles of flow rules that can be granted per-member to override the base policy."
        />
        <CardBody>
          <CapabilityEditor
            value={draft.capabilities}
            onChange={(capabilities) => setDraft({ ...draft, capabilities })}
          />
        </CardBody>
      </Card>

      <Card>
        <SaveBar onSave={onSave} onRevert={onRevert} saving={mut.isPending} />
      </Card>
    </div>
  );
}
