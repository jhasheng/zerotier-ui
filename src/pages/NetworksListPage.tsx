import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useNetworkIds,
  useNetworksDetails,
  useNetworksUnstable,
} from "@/hooks/useNetworks";
import { useNwidGenerator } from "@/hooks/useNwidGenerator";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import { SearchInput } from "@/components/primitives/SearchInput";
import { Dialog } from "@/components/primitives/Dialog";
import { Field } from "@/components/primitives/Card";
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/primitives/Table";
import { Badge } from "@/components/primitives/Badge";
import { EmptyState } from "@/components/primitives/EmptyState";
import { Spinner } from "@/components/primitives/Spinner";
import { useApiError } from "@/hooks/useApiError";
import { randomPrivateCidr } from "@/lib/ip";
import { cidrV4 } from "@/lib/validation";

const createSchema = z.object({
  name: z.string().min(1, "Required").max(127),
  cidr: cidrV4,
});
type CreateForm = z.infer<typeof createSchema>;

export default function NetworksListPage() {
  const navigate = useNavigate();
  const ids = useNetworkIds();
  const networks = useNetworksDetails(ids.data);
  const unstable = useNetworksUnstable();
  const memberMeta = useMemo(() => {
    const map = new Map<
      string,
      { authorized?: number; total?: number }
    >();
    for (const n of unstable.data?.data ?? []) {
      if (n.meta) {
        map.set(n.id, {
          authorized: n.meta.authorizedMemberCount,
          total: n.meta.totalMemberCount,
        });
      }
    }
    return map;
  }, [unstable.data]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const onError = useApiError();
  const generator = useNwidGenerator();

  const { register, handleSubmit, reset, formState } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", cidr: randomPrivateCidr() },
  });

  const onCreate = handleSubmit(async (values) => {
    try {
      const created = await generator.create(values);
      reset({ name: "", cidr: randomPrivateCidr() });
      setOpen(false);
      navigate(`/networks/${created.id}/settings`);
    } catch (err) {
      onError(err, "Failed to create network");
    }
  });

  const filtered = useMemo(() => {
    const list = networks.data ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (n) =>
        n.id.toLowerCase().includes(term) ||
        (n.name ?? "").toLowerCase().includes(term),
    );
  }, [networks.data, q]);

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Networks</h1>
          <p className="text-sm text-subtle mt-0.5">
            All networks managed by this controller.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New network
        </Button>
      </header>

      <SearchInput
        containerClassName="max-w-sm"
        placeholder="Search by name or NWID…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {ids.isLoading ? (
        <div className="py-10">
          <Spinner />
        </div>
      ) : (ids.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="No networks"
          description="Create your first network to start onboarding members."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              New network
            </Button>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>NWID</TH>
              <TH>Visibility</TH>
              <TH className="text-right">Members</TH>
              <TH className="text-right">v4 pools</TH>
              <TH className="text-right">Routes</TH>
              <TH className="text-right">Rules</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((n) => (
              <TR
                key={n.id}
                onClick={() => navigate(`/networks/${n.id}/settings`)}
              >
                <TD>
                  <div className="font-medium">
                    {n.name || (
                      <span className="text-subtle italic">(unnamed)</span>
                    )}
                  </div>
                </TD>
                <TD mono>
                  <Link
                    to={`/networks/${n.id}/settings`}
                    className="hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {n.id}
                  </Link>
                </TD>
                <TD>
                  {n.private === false ? (
                    <Badge tone="warn">Public</Badge>
                  ) : (
                    <Badge tone="muted">Private</Badge>
                  )}
                </TD>
                <TD num>
                  {(() => {
                    const m = memberMeta.get(n.id);
                    if (!m || m.total == null) return <span className="text-subtle">—</span>;
                    return (
                      <span className="font-mono text-xs">
                        {m.authorized ?? 0}/{m.total}
                      </span>
                    );
                  })()}
                </TD>
                <TD num>{n.ipAssignmentPools?.length ?? 0}</TD>
                <TD num>{n.routes?.length ?? 0}</TD>
                <TD num>{n.rules?.length ?? 0}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset({ name: "", cidr: randomPrivateCidr() });
        }}
        title="Create network"
        description="Choose a name and a managed IPv4 CIDR. You can change pools and routes later."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onCreate} loading={generator.isCreating}>
              Create
            </Button>
          </>
        }
      >
        <form onSubmit={onCreate} className="space-y-4">
          <Field
            label="Network name"
            error={formState.errors.name?.message}
            htmlFor="name"
          >
            <Input
              id="name"
              autoFocus
              placeholder="my-network"
              invalid={Boolean(formState.errors.name)}
              {...register("name")}
            />
          </Field>
          <Field
            label="Managed IPv4 CIDR"
            error={formState.errors.cidr?.message}
            hint="A pool covering the entire usable host range is added automatically."
            htmlFor="cidr"
          >
            <Input
              id="cidr"
              monospace
              placeholder="10.147.20.0/24"
              invalid={Boolean(formState.errors.cidr)}
              {...register("cidr")}
            />
          </Field>
        </form>
      </Dialog>
    </div>
  );
}
