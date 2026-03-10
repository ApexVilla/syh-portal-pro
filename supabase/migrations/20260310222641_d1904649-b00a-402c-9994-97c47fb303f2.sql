
-- Create clientes table
CREATE TABLE public.clientes (
  cod_cliente TEXT PRIMARY KEY,
  nom_cliente TEXT,
  rif_cliente TEXT,
  telefono TEXT,
  email TEXT,
  saldo_actual NUMERIC DEFAULT 0,
  limite_credito NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'activo',
  sincronizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vendas table
CREATE TABLE public.vendas (
  num_doc TEXT PRIMARY KEY,
  fecha_doc TIMESTAMP WITH TIME ZONE DEFAULT now(),
  cod_cliente TEXT,
  nom_cliente TEXT,
  total_doc NUMERIC DEFAULT 0,
  tipo_doc TEXT,
  status_doc TEXT,
  sincronizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create estoque table
CREATE TABLE public.estoque (
  cod_articulo TEXT PRIMARY KEY,
  nom_articulo TEXT,
  grupo TEXT,
  nom_grupo TEXT,
  existencia NUMERIC DEFAULT 0,
  existencia_minima NUMERIC DEFAULT 0,
  precio1 NUMERIC DEFAULT 0,
  precio2 NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'activo',
  sincronizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cxc table (contas a receber)
CREATE TABLE public.cxc (
  num_doc TEXT PRIMARY KEY,
  fecha_doc TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_vence TIMESTAMP WITH TIME ZONE,
  cod_cliente TEXT,
  nom_cliente TEXT,
  monto_doc NUMERIC DEFAULT 0,
  monto_pagado NUMERIC DEFAULT 0,
  saldo NUMERIC DEFAULT 0,
  dias_vencido INTEGER DEFAULT 0,
  sincronizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cxp table (contas a pagar)
CREATE TABLE public.cxp (
  num_doc TEXT PRIMARY KEY,
  fecha_doc TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_vence TIMESTAMP WITH TIME ZONE,
  cod_proveedor TEXT,
  nom_proveedor TEXT,
  monto_doc NUMERIC DEFAULT 0,
  monto_pagado NUMERIC DEFAULT 0,
  saldo NUMERIC DEFAULT 0,
  dias_vencido INTEGER DEFAULT 0,
  sincronizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sync_log table
CREATE TABLE public.sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela TEXT NOT NULL,
  ultima_sync TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_registros INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ok'
);

-- Enable RLS on all tables
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cxc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cxp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

-- RLS policies: authenticated users can read all data
CREATE POLICY "Authenticated users can read clientes" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read vendas" ON public.vendas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read estoque" ON public.estoque FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read cxc" ON public.cxc FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read cxp" ON public.cxp FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read sync_log" ON public.sync_log FOR SELECT TO authenticated USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.clientes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.estoque;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cxc;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cxp;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sync_log;
