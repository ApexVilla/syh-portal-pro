-- ============================================================
-- SYH Portal Pro - Multi-tenancy (cod_empresa) + RLS Isolation
-- Run in Supabase SQL Editor
-- ============================================================

-- 0. Crear tabla de perfiles para multitenancy
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  cod_empresa TEXT DEFAULT '001',
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
END $$;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 1. Agregar cod_empresa a todas las tablas (Idempotente)
DO $$ 
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('clientes', 'estoque', 'vendas', 'cxc', 'cxp', 'proveedores', 'sync_log')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS cod_empresa TEXT DEFAULT ''001''', t);
    END LOOP;
END $$;

-- 2. CLIENTES: agregar columnas faltantes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS tipo_cliente TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS acepta_credito TEXT DEFAULT 'N';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS dias_credito INTEGER DEFAULT 0;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cod_vendedor TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS tipo_precio TEXT DEFAULT '1';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS sexo TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;

-- 3. ESTOQUE: agregar columnas faltantes
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS subgrupo TEXT;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS costo NUMERIC DEFAULT 0;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS precio3 NUMERIC;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS precio4 NUMERIC;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS precio5 NUMERIC;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS precio6 NUMERIC;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS precio7 NUMERIC;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS precio8 NUMERIC;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin1 NUMERIC;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin2 NUMERIC;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin3 NUMERIC;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin4 NUMERIC;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin5 NUMERIC;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin6 NUMERIC;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin7 NUMERIC;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preciofin8 NUMERIC;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS impuesto_pct NUMERIC DEFAULT 0;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS usa_existencia BOOLEAN DEFAULT true;
ALTER TABLE estoque ADD COLUMN IF NOT EXISTS inactivo BOOLEAN DEFAULT false;

-- 4. VENDAS: agregar columnas faltantes
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS rif_cliente TEXT;
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS total_bruto NUMERIC;
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS total_impuesto NUMERIC;
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS total_descuento NUMERIC DEFAULT 0;
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS tasa_cambio NUMERIC;
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS fecha_vence DATE;
ALTER TABLE vendas ADD COLUMN IF NOT EXISTS cod_vendedor TEXT;

-- 5. CXC: agregar columnas faltantes
ALTER TABLE cxc ADD COLUMN IF NOT EXISTS rif TEXT;
ALTER TABLE cxc ADD COLUMN IF NOT EXISTS tipo_doc TEXT;
ALTER TABLE cxc ADD COLUMN IF NOT EXISTS tasa_cambio NUMERIC;
ALTER TABLE cxc ADD COLUMN IF NOT EXISTS total_impuesto NUMERIC;

-- 6. CXP: agregar columnas faltantes
ALTER TABLE cxp ADD COLUMN IF NOT EXISTS rif TEXT;
ALTER TABLE cxp ADD COLUMN IF NOT EXISTS tipo_doc TEXT;
ALTER TABLE cxp ADD COLUMN IF NOT EXISTS tasa_cambio NUMERIC;
ALTER TABLE cxp ADD COLUMN IF NOT EXISTS total_impuesto NUMERIC;

-- 7. PROVEEDORES: crear tabla nueva
CREATE TABLE IF NOT EXISTS public.proveedores (
  cod_proveedor TEXT PRIMARY KEY,
  nom_proveedor TEXT,
  rif_proveedor TEXT,
  direccion TEXT,
  email TEXT,
  telefono TEXT,
  sector TEXT,
  tipo TEXT DEFAULT '01',
  dias INTEGER DEFAULT 0,
  status TEXT DEFAULT 'A',
  cod_pais TEXT DEFAULT '58',
  cod_empresa TEXT DEFAULT '001',
  sincronizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. RE-CONFIGURAR RLS PARA AISLAMIENTO POR EMPRESA
-- Función auxiliar para obtener la empresa del usuario actual
CREATE OR REPLACE FUNCTION get_user_cod_empresa() 
RETURNS TEXT AS $$
  SELECT cod_empresa FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

DO $$ 
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('clientes', 'estoque', 'vendas', 'cxc', 'cxp', 'proveedores', 'sync_log')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        -- Limpiar políticas viejas
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can read %I" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can insert %I" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can update %I" ON public.%I', t, t);
        
        -- Crear políticas nuevas con aislamiento real
        EXECUTE format('CREATE POLICY "Authenticated users can read %I" ON public.%I FOR SELECT TO authenticated USING (cod_empresa = get_user_cod_empresa())', t, t);
        EXECUTE format('CREATE POLICY "Authenticated users can insert %I" ON public.%I FOR INSERT TO authenticated WITH CHECK (cod_empresa = get_user_cod_empresa())', t, t);
        EXECUTE format('CREATE POLICY "Authenticated users can update %I" ON public.%I FOR UPDATE TO authenticated USING (cod_empresa = get_user_cod_empresa()) WITH CHECK (cod_empresa = get_user_cod_empresa())', t, t);
    END LOOP;
END $$;

-- 9. Realtime
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'proveedores') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.proveedores;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;
