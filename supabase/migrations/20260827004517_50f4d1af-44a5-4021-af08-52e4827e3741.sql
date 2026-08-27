-- CLIENTS: extend
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS professional_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS cycle_days integer NOT NULL DEFAULT 42,
  ADD COLUMN IF NOT EXISTS current_procedure text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS last_service_date date,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS clients_professional_idx ON public.clients(professional_id);

DROP POLICY IF EXISTS "Team can view clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can add clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can edit clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can remove clients" ON public.clients;

CREATE POLICY "Own or unassigned clients readable"
ON public.clients FOR SELECT TO authenticated
USING (professional_id = auth.uid() OR professional_id IS NULL OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Create own clients"
ON public.clients FOR INSERT TO authenticated
WITH CHECK (professional_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Update own clients"
ON public.clients FOR UPDATE TO authenticated
USING (professional_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
WITH CHECK (professional_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Delete own clients"
ON public.clients FOR DELETE TO authenticated
USING (professional_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- SERVICES
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_date date NOT NULL DEFAULT current_date,
  procedure text NOT NULL,
  notes text,
  before_url text,
  after_url text,
  next_procedure text,
  cycle_days integer NOT NULL DEFAULT 42,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own services readable"
ON public.services FOR SELECT TO authenticated
USING (professional_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Own services insert"
ON public.services FOR INSERT TO authenticated
WITH CHECK (professional_id = auth.uid());
CREATE POLICY "Own services update"
ON public.services FOR UPDATE TO authenticated
USING (professional_id = auth.uid()) WITH CHECK (professional_id = auth.uid());
CREATE POLICY "Own services delete"
ON public.services FOR DELETE TO authenticated
USING (professional_id = auth.uid());

CREATE INDEX IF NOT EXISTS services_client_idx ON public.services(client_id, service_date DESC);

-- REACTIVATIONS
CREATE TABLE IF NOT EXISTS public.reactivations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'whatsapp',
  message text,
  outcome text NOT NULL DEFAULT 'contacted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reactivations TO authenticated;
GRANT ALL ON public.reactivations TO service_role;
ALTER TABLE public.reactivations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own reactivations readable"
ON public.reactivations FOR SELECT TO authenticated
USING (professional_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Own reactivations insert"
ON public.reactivations FOR INSERT TO authenticated
WITH CHECK (professional_id = auth.uid());
CREATE POLICY "Own reactivations update"
ON public.reactivations FOR UPDATE TO authenticated
USING (professional_id = auth.uid()) WITH CHECK (professional_id = auth.uid());
CREATE POLICY "Own reactivations delete"
ON public.reactivations FOR DELETE TO authenticated
USING (professional_id = auth.uid());

CREATE INDEX IF NOT EXISTS reactivations_client_idx ON public.reactivations(client_id, created_at DESC);

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reactivations_updated_at BEFORE UPDATE ON public.reactivations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();