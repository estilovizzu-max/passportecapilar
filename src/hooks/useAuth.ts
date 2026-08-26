import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/", replace: true });
    }
  }, [isLoading, user, navigate]);

  return { isLoading, user };
}
