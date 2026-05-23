import { useNavigate } from "react-router-dom";
import { AuthError, CorsError, TimeoutError, describeError } from "@/api/errors";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/uiStore";

export function useApiError() {
  const navigate = useNavigate();
  return (err: unknown, fallbackTitle = "Request failed") => {
    if (err instanceof AuthError) {
      useAuthStore.getState().clear();
      toast("error", "Authentication failed", "Token rejected by controller.");
      navigate("/connect", { replace: true });
      return;
    }
    if (err instanceof CorsError) {
      toast(
        "error",
        "Browser blocked the request",
        "Controller did not return CORS headers. See connection setup.",
      );
      return;
    }
    if (err instanceof TimeoutError) {
      toast("error", "Request timed out", "Controller did not respond in time.");
      return;
    }
    toast("error", fallbackTitle, describeError(err));
  };
}
