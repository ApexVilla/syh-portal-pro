export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          cod_empresa: string | null
          full_name: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          cod_empresa?: string | null
          full_name?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          cod_empresa?: string | null
          full_name?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedSchema: "auth"
          }
        ]
      }
      clientes: {
        Row: {
          cod_cliente: string
          nom_cliente: string | null
          rif_cliente: string | null
          email: string | null
          telefono: string | null
          direccion: string | null
          sector: string | null
          tipo_cliente: string | null
          acepta_credito: string | null
          dias_credito: number | null
          cod_vendedor: string | null
          tipo_precio: string | null
          sexo: string | null
          fecha_nacimiento: string | null
          saldo_actual: number | null
          limite_credito: number | null
          status: string | null
          cod_empresa: string | null
          sincronizado_em: string | null
        }
        Insert: {
          cod_cliente: string
          [key: string]: Json | undefined
        }
        Update: {
          [key: string]: Json | undefined
        }
        Relationships: []
      }
      estoque: {
        Row: {
          cod_articulo: string
          nom_articulo: string | null
          grupo: string | null
          subgrupo: string | null
          nom_grupo: string | null
          existencia: number | null
          existencia_minima: number | null
          costo: number | null
          precio1: number | null
          precio2: number | null
          precio3: number | null
          precio4: number | null
          precio5: number | null
          precio6: number | null
          precio7: number | null
          precio8: number | null
          preciofin1: number | null
          preciofin2: number | null
          preciofin3: number | null
          preciofin4: number | null
          preciofin5: number | null
          preciofin6: number | null
          preciofin7: number | null
          preciofin8: number | null
          impuesto_pct: number | null
          usa_existencia: boolean | null
          inactivo: boolean | null
          status: string | null
          cod_empresa: string | null
          sincronizado_em: string | null
        }
        Insert: {
          cod_articulo: string
          [key: string]: Json | undefined
        }
        Update: {
          [key: string]: Json | undefined
        }
        Relationships: []
      }
      ventas: {
        Row: {
          num_doc: string
          fecha_doc: string | null
          nom_cliente: string | null
          cod_cliente: string | null
          rif_cliente: string | null
          total_doc: number | null
          total_bruto: number | null
          total_impuesto: number | null
          total_descuento: number | null
          tasa_cambio: number | null
          fecha_vence: string | null
          cod_vendedor: string | null
          tipo_doc: string | null
          status_doc: string | null
          cod_empresa: string | null
          sincronizado_em: string | null
        }
        Insert: {
          num_doc: string
          [key: string]: Json | undefined
        }
        Update: {
          [key: string]: Json | undefined
        }
        Relationships: []
      }
      cxc: {
        Row: {
          num_doc: string
          fecha_doc: string | null
          fecha_vence: string | null
          nom_cliente: string | null
          cod_cliente: string | null
          rif: string | null
          tipo_doc: string | null
          monto_doc: number | null
          monto_pagado: number | null
          saldo: number | null
          dias_vencido: number | null
          tasa_cambio: number | null
          total_impuesto: number | null
          cod_empresa: string | null
          sincronizado_em: string | null
        }
        Insert: {
          num_doc: string
          [key: string]: Json | undefined
        }
        Update: {
          [key: string]: Json | undefined
        }
        Relationships: []
      }
      cxp: {
        Row: {
          num_doc: string
          fecha_doc: string | null
          fecha_vence: string | null
          nom_proveedor: string | null
          cod_proveedor: string | null
          rif: string | null
          tipo_doc: string | null
          monto_doc: number | null
          monto_pagado: number | null
          saldo: number | null
          dias_vencido: number | null
          tasa_cambio: number | null
          total_impuesto: number | null
          cod_empresa: string | null
          sincronizado_em: string | null
        }
        Insert: {
          num_doc: string
          [key: string]: Json | undefined
        }
        Update: {
          [key: string]: Json | undefined
        }
        Relationships: []
      }
      proveedores: {
        Row: {
          cod_proveedor: string
          nom_proveedor: string | null
          rif_proveedor: string | null
          direccion: string | null
          email: string | null
          telefono: string | null
          sector: string | null
          tipo: string | null
          dias: number | null
          status: string | null
          cod_pais: string | null
          cod_empresa: string | null
          sincronizado_em: string | null
        }
        Insert: {
          cod_proveedor: string
          [key: string]: Json | undefined
        }
        Update: {
          [key: string]: Json | undefined
        }
        Relationships: []
      }
      sync_log: {
        Row: {
          id: string
          tabela: string
          total_registros: number | null
          ultima_sync: string | null
          status: string | null
          cod_empresa: string | null
        }
        Insert: {
          id?: string
          tabela: string
          [key: string]: Json | undefined
        }
        Update: {
          [key: string]: Json | undefined
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  N extends T extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[T["schema"]]["Tables"] & DatabaseWithoutInternals[T["schema"]]["Views"])
    : never = never,
> = T extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[T["schema"]]["Tables"] & DatabaseWithoutInternals[T["schema"]]["Views"])[N] extends { Row: infer R } ? R : never
  : T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never
    : never

export const Constants = { public: { Enums: {} } } as const
