CREATE TABLE public.intelligence_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surface text NOT NULL DEFAULT 'intelligence-brief',
  section_key text NOT NULL,
  item_id text NOT NULL,
  item_label text NOT NULL,
  item_value text NOT NULL,
  item_natureza text NOT NULL,
  action text NOT NULL CHECK (action IN ('confirm','edit','dismiss')),
  note text,
  data_version jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.intelligence_reviews TO authenticated;
GRANT ALL ON public.intelligence_reviews TO service_role;
ALTER TABLE public.intelligence_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own reviews readable" ON public.intelligence_reviews
  FOR SELECT TO authenticated
  USING (professional_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Own reviews insert" ON public.intelligence_reviews
  FOR INSERT TO authenticated
  WITH CHECK (professional_id = auth.uid());

CREATE INDEX idx_intelligence_reviews_client ON public.intelligence_reviews (client_id, created_at DESC);

CREATE TABLE public.intelligence_declarations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'preference' CHECK (kind IN ('preference','objective')),
  label text NOT NULL,
  content text NOT NULL,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.intelligence_declarations TO authenticated;
GRANT ALL ON public.intelligence_declarations TO service_role;
ALTER TABLE public.intelligence_declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own declarations readable" ON public.intelligence_declarations
  FOR SELECT TO authenticated
  USING (professional_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Own declarations insert" ON public.intelligence_declarations
  FOR INSERT TO authenticated
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Own declarations update" ON public.intelligence_declarations
  FOR UPDATE TO authenticated
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());

CREATE POLICY "Own declarations delete" ON public.intelligence_declarations
  FOR DELETE TO authenticated
  USING (professional_id = auth.uid());

CREATE TRIGGER update_intelligence_declarations_updated_at
  BEFORE UPDATE ON public.intelligence_declarations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_intelligence_declarations_client ON public.intelligence_declarations (client_id, created_at DESC);