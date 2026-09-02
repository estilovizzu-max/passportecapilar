CREATE TABLE IF NOT EXISTS public.professional_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','connected','declined','removed')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  removed_at timestamptz,
  note text,
  UNIQUE (client_id, professional_id)
);

GRANT SELECT, INSERT, UPDATE ON public.professional_connections TO authenticated;
GRANT ALL ON public.professional_connections TO service_role;
ALTER TABLE public.professional_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professional manages own connections" ON public.professional_connections
  FOR ALL TO authenticated
  USING (
    professional_id = auth.uid()
    OR client_id IN (SELECT c.id FROM public.clients c WHERE c.professional_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    professional_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE INDEX IF NOT EXISTS idx_professional_connections_client ON public.professional_connections (client_id);
CREATE INDEX IF NOT EXISTS idx_professional_connections_professional ON public.professional_connections (professional_id, status);