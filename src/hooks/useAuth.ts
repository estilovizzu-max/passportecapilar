import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/integrations/supabase/client";

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

export function useRoles() {
  const { user, isLoading } = useAuth();

  const query = useQuery({
    queryKey: ["roles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((r) => r.role);
    },
  });

  return {
    roles: query.data ?? [],
    isAdmin: (query.data ?? []).includes("admin"),
    isLoading: isLoading || query.isLoading,
  };
}
