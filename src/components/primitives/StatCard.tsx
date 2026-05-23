import type { ReactNode } from "react";
import { Card, CardBody } from "./Card";
import { Spinner } from "./Spinner";

export interface StatCardProps {
  icon: ReactNode;
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  loading?: boolean;
}

export function StatCard({ icon, label, value, hint, loading }: StatCardProps) {
  return (
    <Card>
      <CardBody className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-subtle">
          <span className="text-accent">{icon}</span>
          {label}
        </div>
        <div className="text-sm font-medium min-h-[28px] flex items-center">
          {loading ? <Spinner /> : value}
        </div>
        {hint ? <div className="text-xs text-subtle">{hint}</div> : null}
      </CardBody>
    </Card>
  );
}
