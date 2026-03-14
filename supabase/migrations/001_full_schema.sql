-- ============================================================
-- SYH Portal Pro - Full Schema Migration
-- Execute este SQL no Supabase SQL Editor (Dashboard)
-- ============================================================

-- 1. TABELA CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  cod_cliente text PRIMARY KEY,
  nom_cliente text,
  rif_cliente text,
  email text,
  telefono text,
  direccion text,
  sector text,
  tipo_cliente text,
  acepta_credito text DEFAULT 'N',
  dias_credito integer DEFAULT 0,
  cod_vendedor text,
  tipo_precio integer DEFAULT 1,
  sexo integer DEFAULT 0,
  fecha_nacimiento date,
  saldo_actual numeric DEFAULT 0,
  limite_credito numeric DEFAULT 0,
  status text DEFAULT 'activo',
  sincronizado_em timestamptz
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clientes' AND policyname = 'Allow authenticated read on clientes') THEN
    CREATE POLICY "Allow authenticated read on clientes" ON clientes FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clientes' AND policyname = 'Allow authenticated insert on clientes') THEN
    CREATE POLICY "Allow authenticated insert on clientes" ON clientes FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clientes' AND policyname = 'Allow authenticated update on clientes') THEN
    CREATE POLICY "Allow authenticated update on clientes" ON clientes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Add new columns if table already existed
DO $$ BEGIN
  ALTER TABLE clientes ADD COLUMN IF NOT EXISTS direccion text;
  ALTER TABLE clientes ADD COLUMN IF NOT EXISTS sector text;
  ALTER TABLE clientes ADD COLUMN IF NOT EXISTS tipo_cliente text;
  ALTER TABLE clientes ADD COLUMN IF NOT EXISTS acepta_credito text DEFAULT 'N';
  ALTER TABLE clientes ADD COLUMN IF NOT EXISTS dias_credito integer DEFAULT 0;
  ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cod_vendedor text;
  ALTER TABLE clientes ADD COLUMN IF NOT EXISTS tipo_precio integer DEFAULT 1;
  ALTER TABLE clientes ADD COLUMN IF NOT EXISTS sexo integer DEFAULT 0;
  ALTER TABLE clientes ADD COLUMN IF NOT EXISTS fecha_nacimiento date;
END $$;

-- 2. TABELA ESTOQUE (ARTÍCULOS)
CREATE TABLE IF NOT EXISTS estoque (
  cod_articulo text PRIMARY KEY,
  nom_articulo text,
  grupo text,
  subgrupo text,
  nom_grupo text,
  existencia numeric DEFAULT 0,
  existencia_minima numeric DEFAULT 0,
  costo numeric DEFAULT 0,
  precio1 numeric,
  precio2 numeric,
  precio3 numeric,
  precio4 numeric,
  precio5 numeric,
  precio6 numeric,
  precio7 numeric,
  precio8 numeric,
  preciofin1 numeric,
  preciofin2 numeric,
  preciofin3 numeric,
  preciofin4 numeric,
  preciofin5 numeric,
  preciofin6 numeric,
  preciofin7 numeric,
  preciofin8 numeric,
  impuesto_pct numeric DEFAULT 0,
  usa_existencia integer DEFAULT 2,
  inactivo integer DEFAULT 0,
  status text DEFAULT 'activo',
  sincronizado_em timestamptz
);

ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'estoque' AND policyname = 'Allow authenticated read on estoque') THEN
    CREATE POLICY "Allow authenticated read on estoque" ON estoque FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'estoque' AND policyname = 'Allow authenticated insert on estoque') THEN
    CREATE POLICY "Allow authenticated insert on estoque" ON estoque FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'estoque' AND policyname = 'Allow authenticated update on estoque') THEN
    CREATE POLICY "Allow authenticated update on estoque" ON estoque FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS subgrupo text;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS costo numeric DEFAULT 0;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS precio3 numeric;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS precio4 numeric;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS precio5 numeric;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS precio6 numeric;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS precio7 numeric;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS precio8 numeric;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin1 numeric;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin2 numeric;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin3 numeric;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin4 numeric;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin5 numeric;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin6 numeric;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin7 numeric;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin8 numeric;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS impuesto_pct numeric DEFAULT 0;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS usa_existencia integer DEFAULT 2;
  ALTER TABLE estoque ADD COLUMN IF NOT EXISTS inactivo integer DEFAULT 0;
END $$;

-- 3. TABELA VENDAS (DOCUMENTOS)
CREATE TABLE IF NOT EXISTS vendas (
  num_doc text PRIMARY KEY,
  fecha_doc timestamptz,
  nom_cliente text,
  cod_cliente text,
  rif_cliente text,
  total_doc numeric,
  total_bruto numeric,
  total_impuesto numeric,
  total_descuento numeric DEFAULT 0,
  tasa_cambio numeric,
  fecha_vence date,
  cod_vendedor text,
  tipo_doc text,
  status_doc text,
  sincronizado_em timestamptz
);

ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendas' AND policyname = 'Allow authenticated read on vendas') THEN
    CREATE POLICY "Allow authenticated read on vendas" ON vendas FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendas' AND policyname = 'Allow authenticated insert on vendas') THEN
    CREATE POLICY "Allow authenticated insert on vendas" ON vendas FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendas' AND policyname = 'Allow authenticated update on vendas') THEN
    CREATE POLICY "Allow authenticated update on vendas" ON vendas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  ALTER TABLE vendas ADD COLUMN IF NOT EXISTS total_bruto numeric;
  ALTER TABLE vendas ADD COLUMN IF NOT EXISTS total_impuesto numeric;
  ALTER TABLE vendas ADD COLUMN IF NOT EXISTS total_descuento numeric DEFAULT 0;
  ALTER TABLE vendas ADD COLUMN IF NOT EXISTS tasa_cambio numeric;
  ALTER TABLE vendas ADD COLUMN IF NOT EXISTS fecha_vence date;
  ALTER TABLE vendas ADD COLUMN IF NOT EXISTS cod_vendedor text;
  ALTER TABLE vendas ADD COLUMN IF NOT EXISTS rif_cliente text;
END $$;

-- 4. TABELA CXC (CONTAS A RECEBER)
CREATE TABLE IF NOT EXISTS cxc (
  num_doc text PRIMARY KEY,
  fecha_doc timestamptz,
  fecha_vence date,
  nom_cliente text,
  cod_cliente text,
  rif text,
  tipo_doc text,
  monto_doc numeric,
  monto_pagado numeric DEFAULT 0,
  saldo numeric,
  dias_vencido integer DEFAULT 0,
  tasa_cambio numeric,
  total_impuesto numeric,
  sincronizado_em timestamptz
);

ALTER TABLE cxc ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cxc' AND policyname = 'Allow authenticated read on cxc') THEN
    CREATE POLICY "Allow authenticated read on cxc" ON cxc FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cxc' AND policyname = 'Allow authenticated insert on cxc') THEN
    CREATE POLICY "Allow authenticated insert on cxc" ON cxc FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cxc' AND policyname = 'Allow authenticated update on cxc') THEN
    CREATE POLICY "Allow authenticated update on cxc" ON cxc FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  ALTER TABLE cxc ADD COLUMN IF NOT EXISTS tipo_doc text;
  ALTER TABLE cxc ADD COLUMN IF NOT EXISTS rif text;
  ALTER TABLE cxc ADD COLUMN IF NOT EXISTS tasa_cambio numeric;
  ALTER TABLE cxc ADD COLUMN IF NOT EXISTS total_impuesto numeric;
END $$;

-- 5. TABELA CXP (CONTAS A PAGAR)
CREATE TABLE IF NOT EXISTS cxp (
  num_doc text PRIMARY KEY,
  fecha_doc timestamptz,
  fecha_vence date,
  nom_proveedor text,
  cod_proveedor text,
  rif text,
  tipo_doc text,
  monto_doc numeric,
  monto_pagado numeric DEFAULT 0,
  saldo numeric,
  dias_vencido integer DEFAULT 0,
  tasa_cambio numeric,
  total_impuesto numeric,
  sincronizado_em timestamptz
);

ALTER TABLE cxp ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cxp' AND policyname = 'Allow authenticated read on cxp') THEN
    CREATE POLICY "Allow authenticated read on cxp" ON cxp FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cxp' AND policyname = 'Allow authenticated insert on cxp') THEN
    CREATE POLICY "Allow authenticated insert on cxp" ON cxp FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cxp' AND policyname = 'Allow authenticated update on cxp') THEN
    CREATE POLICY "Allow authenticated update on cxp" ON cxp FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  ALTER TABLE cxp ADD COLUMN IF NOT EXISTS tipo_doc text;
  ALTER TABLE cxp ADD COLUMN IF NOT EXISTS rif text;
  ALTER TABLE cxp ADD COLUMN IF NOT EXISTS tasa_cambio numeric;
  ALTER TABLE cxp ADD COLUMN IF NOT EXISTS total_impuesto numeric;
END $$;

-- 6. TABELA PROVEEDORES (SUPLIDORES)
CREATE TABLE IF NOT EXISTS proveedores (
  codigo text PRIMARY KEY,
  nombre text,
  nrorif text,
  direccion text,
  email text,
  telefono text,
  sector text,
  tipo text DEFAULT '01',
  dias integer DEFAULT 0,
  status integer DEFAULT 1,
  fecha date,
  cod_pais text DEFAULT '58',
  sincronizado_em timestamptz
);

ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proveedores' AND policyname = 'Allow authenticated read on proveedores') THEN
    CREATE POLICY "Allow authenticated read on proveedores" ON proveedores FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proveedores' AND policyname = 'Allow authenticated insert on proveedores') THEN
    CREATE POLICY "Allow authenticated insert on proveedores" ON proveedores FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proveedores' AND policyname = 'Allow authenticated update on proveedores') THEN
    CREATE POLICY "Allow authenticated update on proveedores" ON proveedores FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 7. TABELA SYNC_LOG
CREATE TABLE IF NOT EXISTS sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela text NOT NULL,
  total_registros integer DEFAULT 0,
  ultima_sync timestamptz,
  status text DEFAULT 'pendente'
);

ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sync_log' AND policyname = 'Allow authenticated read on sync_log') THEN
    CREATE POLICY "Allow authenticated read on sync_log" ON sync_log FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sync_log' AND policyname = 'Allow authenticated all on sync_log') THEN
    CREATE POLICY "Allow authenticated all on sync_log" ON sync_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
