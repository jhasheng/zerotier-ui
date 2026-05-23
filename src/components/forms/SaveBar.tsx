import { Save } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { CardFooter } from "@/components/primitives/Card";

export interface SaveBarProps {
  onSave: () => void;
  onRevert?: () => void;
  saving?: boolean;
  saveLabel?: string;
  revertLabel?: string;
  saveDisabled?: boolean;
}

// Standard Revert/Save pair used in tab footers.
export function SaveBar({
  onSave,
  onRevert,
  saving,
  saveLabel = "Save changes",
  revertLabel = "Revert",
  saveDisabled,
}: SaveBarProps) {
  return (
    <CardFooter>
      {onRevert ? (
        <Button variant="ghost" onClick={onRevert} disabled={saving}>
          {revertLabel}
        </Button>
      ) : null}
      <Button onClick={onSave} loading={saving} disabled={saveDisabled}>
        <Save className="h-4 w-4" />
        {saveLabel}
      </Button>
    </CardFooter>
  );
}
