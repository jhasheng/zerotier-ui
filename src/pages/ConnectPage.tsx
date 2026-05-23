import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AlertTriangle, BookOpenText, Loader2, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getController, getStatus } from "@/api/status";
import { CorsError, AuthError } from "@/api/errors";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import { Field } from "@/components/primitives/Card";
import { toast } from "@/store/uiStore";
import { TooltipRoot } from "@/components/primitives/Tooltip";

interface FormValues {
  host: string;
  token: string;
}

type TestState =
  | { kind: "idle" }
  | { kind: "testing" }
  | {
      kind: "ok";
      info: { address?: string; databaseReady?: boolean; apiVersion?: number };
    }
  | { kind: "cors" }
  | { kind: "auth" }
  | { kind: "error"; message: string };

export default function ConnectPage() {
  const navigate = useNavigate();
  const auth = useAuthStore();
  const [state, setState] = useState<TestState>({ kind: "idle" });

  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: { host: auth.host || "http://localhost:9993", token: auth.token },
  });

  const host = watch("host");
  const token = watch("token");

  const onTest = handleSubmit(async ({ host, token }) => {
    if (!host || !token) {
      toast("warn", "Host and token are required");
      return;
    }
    setState({ kind: "testing" });
    auth.setCreds(host, token);
    try {
      const info = await getController();
      const status = await getStatus();
      auth.markConnected();
      setState({
        kind: "ok",
        info: {
          address: status.address,
          databaseReady: info.databaseReady,
          apiVersion: info.apiVersion,
        },
      });
    } catch (err) {
      if (err instanceof CorsError) setState({ kind: "cors" });
      else if (err instanceof AuthError) setState({ kind: "auth" });
      else
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : String(err),
        });
    }
  });

  const onSaveAndContinue = async () => {
    if (state.kind !== "ok") {
      await onTest();
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <TooltipRoot>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <header className="space-y-2 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-fg font-bold text-lg mx-auto">
              Z
            </div>
            <h1 className="text-xl font-semibold">Connect to ZeroTier Controller</h1>
            <p className="text-sm text-subtle">
              Provide the controller HTTP endpoint and the contents of{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                authtoken.secret
              </code>
              .
            </p>
          </header>

          <CorsHelp />

          <form
            onSubmit={onTest}
            className="rounded-xl border border-border bg-panel shadow-soft p-5 space-y-4"
          >
            <Field
              label="Controller host"
              htmlFor="host"
              hint="e.g. http://localhost:9993 — or /zt to use the bundled dev proxy"
            >
              <Input
                id="host"
                placeholder="http://localhost:9993"
                autoComplete="off"
                spellCheck={false}
                monospace
                {...register("host")}
              />
            </Field>
            <Field
              label="Auth token (X-ZT1-Auth)"
              htmlFor="token"
              hint="On Linux: /var/lib/zerotier-one/authtoken.secret · macOS: /Library/Application Support/ZeroTier/One/authtoken.secret · Windows: %ProgramData%\ZeroTier\One\authtoken.secret"
            >
              <Input
                id="token"
                type="password"
                autoComplete="off"
                spellCheck={false}
                monospace
                placeholder="paste token here"
                {...register("token")}
              />
            </Field>

            <TestResult state={state} />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  auth.clear();
                  setState({ kind: "idle" });
                }}
              >
                Clear
              </Button>
              <Button
                type="submit"
                variant="outline"
                loading={state.kind === "testing"}
                disabled={!host || !token}
              >
                Test connection
              </Button>
              <Button
                type="button"
                onClick={onSaveAndContinue}
                disabled={!host || !token || state.kind === "testing"}
              >
                {state.kind === "ok" ? "Continue" : "Save & connect"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </TooltipRoot>
  );
}

function CorsHelp() {
  return (
    <div className="rounded-lg border border-warn/30 bg-warn/10 px-4 py-3 text-sm flex items-start gap-3">
      <AlertTriangle className="h-4 w-4 text-warn mt-0.5 shrink-0" />
      <div className="space-y-1">
        <div className="font-medium text-fg">CORS reminder</div>
        <p className="text-fg/80 text-xs leading-relaxed">
          ZeroTier controller does <strong>not</strong> emit CORS headers. A
          plain browser connection to <code>http://localhost:9993</code> will be
          blocked by the browser even with a valid token. Options:
        </p>
        <ul className="list-disc list-inside text-xs text-fg/80 space-y-0.5">
          <li>
            Dev: set host to <code>/zt</code> and run <code>pnpm dev</code> — Vite
            proxies <code>/zt/*</code> to <code>localhost:9993</code>.
          </li>
          <li>
            Prod: serve this UI behind the same origin as the controller via
            Caddy / Nginx (see <code>README.md</code>).
          </li>
        </ul>
      </div>
    </div>
  );
}

function TestResult({ state }: { state: TestState }) {
  if (state.kind === "idle") return null;
  if (state.kind === "testing") {
    return (
      <div className="text-sm text-subtle inline-flex items-center gap-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Talking to controller…
      </div>
    );
  }
  if (state.kind === "ok") {
    return (
      <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 text-success mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-medium">Connected.</div>
          <div className="text-xs text-fg/80">
            Node{" "}
            <code className="font-mono">{state.info.address ?? "—"}</code> ·
            apiVersion {state.info.apiVersion ?? "?"} · databaseReady{" "}
            {String(state.info.databaseReady ?? "?")}
          </div>
        </div>
      </div>
    );
  }
  if (state.kind === "cors") {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm flex items-start gap-2">
        <BookOpenText className="h-4 w-4 text-danger mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-medium">Browser blocked the request (CORS).</div>
          <div className="text-xs text-fg/80">
            Switch host to <code>/zt</code> (dev proxy) or put the UI behind a
            same-origin reverse proxy. See README for snippets.
          </div>
        </div>
      </div>
    );
  }
  if (state.kind === "auth") {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm">
        <span className="font-medium text-danger">Token rejected.</span>{" "}
        <span className="text-fg/80 text-xs">
          The controller returned 401/403. Re-copy the contents of{" "}
          <code>authtoken.secret</code> (no trailing whitespace).
        </span>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm">
      <span className="font-medium text-danger">Failed.</span>{" "}
      <span className="text-fg/80 text-xs">{state.message}</span>
    </div>
  );
}
