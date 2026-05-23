import { Link } from "react-router-dom";
import { EmptyState } from "@/components/primitives/EmptyState";
import { Button } from "@/components/primitives/Button";

export default function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="That route doesn’t exist in this UI."
      action={
        <Link to="/">
          <Button>Back to dashboard</Button>
        </Link>
      }
    />
  );
}
