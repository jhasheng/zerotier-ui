import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2, AlertTriangle } from "lucide-react";
import { useNetwork, useDeleteNetwork } from "@/hooks/useNetworks";
import {
  Card,
  CardBody,
  CardHeader,
} from "@/components/primitives/Card";
import { Button } from "@/components/primitives/Button";
import { ConfirmDialog } from "@/components/primitives/ConfirmDialog";
import { Input } from "@/components/primitives/Input";
import { toast } from "@/store/uiStore";
import { useApiError } from "@/hooks/useApiError";

export default function DangerTab() {
  const { nwid } = useParams();
  const navigate = useNavigate();
  const q = useNetwork(nwid);
  const mut = useDeleteNetwork();
  const onError = useApiError();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");

  const onDelete = async () => {
    try {
      await mut.mutateAsync(nwid!);
      toast("success", "Network deleted");
      navigate("/networks", { replace: true });
    } catch (err) {
      onError(err, "Delete failed");
    }
  };

  return (
    <div className="max-w-2xl">
      <Card className="border-danger/40">
        <CardHeader
          title={
            <span className="text-danger inline-flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Delete network
            </span>
          }
          description="This is irreversible. Members will be disconnected and the NWID cannot be reused."
        />
        <CardBody className="space-y-3">
          <div className="text-sm text-fg/80">
            Type the network name{" "}
            <code className="font-mono bg-muted px-1 rounded">
              {q.data?.name || q.data?.id || ""}
            </code>{" "}
            to enable the delete button.
          </div>
          <Input
            placeholder="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            monospace
          />
          <div className="flex justify-end">
            <Button
              variant="danger"
              disabled={
                !confirm ||
                (confirm !== (q.data?.name ?? "") &&
                  confirm !== (q.data?.id ?? ""))
              }
              onClick={() => setOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete network
            </Button>
          </div>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this network?"
        description={`Network ${q.data?.id} will be removed from the controller. Members will lose access immediately.`}
        confirmLabel="Delete"
        danger
        loading={mut.isPending}
        onConfirm={onDelete}
      />
    </div>
  );
}
