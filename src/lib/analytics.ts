import { supabase } from "@/integrations/supabase/client";

export async function trackEvent(event: string, properties: Record<string, unknown> = {}) {
  try {
    const { data } = await supabase.auth.getSession();
    await supabase.from("analytics_events").insert({
      event,
      properties: properties as never,
      user_id: data.session?.user.id ?? null,
    });
  } catch {
    /* métricas nunca devem quebrar a experiência */
  }
}
