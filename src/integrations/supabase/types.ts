export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          cod_cliente: string
          email: string | null
          limite_credito: number | null
          nom_cliente: string | null
          rif_cliente: string | null
          saldo_actual: number | null
          sincronizado_em: string | null
          status: string | null
          telefono: string | null
        }
        Insert: {
          cod_cliente: string
          email?: string | null
          limite_credito?: number | null
          nom_cliente?: string | null
          rif_cliente?: string | null
          saldo_actual?: number | null
          sincronizado_em?: string | null
          status?: string | null
          telefono?: string | null
        }
        Update: {
          cod_cliente?: string
          email?: string | null
          limite_credito?: number | null
          nom_cliente?: string | null
          rif_cliente?: string | null
          saldo_actual?: number | null
          sincronizado_em?: string | null
          status?: string | null
          telefono?: string | null
        }
        Relationships: []
      }
      cxc: {
        Row: {
          cod_cliente: string | null
          dias_vencido: number | null
          fecha_doc: string | null
          fecha_vence: string | null
          monto_doc: number | null
          monto_pagado: number | null
          nom_cliente: string | null
          num_doc: string
          saldo: number | null
          sincronizado_em: string | null
        }
        Insert: {
          cod_cliente?: string | null
          dias_vencido?: number | null
          fecha_doc?: string | null
          fecha_vence?: string | null
          monto_doc?: number | null
          monto_pagado?: number | null
          nom_cliente?: string | null
          num_doc: string
          saldo?: number | null
          sincronizado_em?: string | null
        }
        Update: {
          cod_cliente?: string | null
          dias_vencido?: number | null
          fecha_doc?: string | null
          fecha_vence?: string | null
          monto_doc?: number | null
          monto_pagado?: number | null
          nom_cliente?: string | null
          num_doc?: string
          saldo?: number | null
          sincronizado_em?: string | null
        }
        Relationships: []
      }
      cxp: {
        Row: {
          cod_proveedor: string | null
          dias_vencido: number | null
          fecha_doc: string | null
          fecha_vence: string | null
          monto_doc: number | null
          monto_pagado: number | null
          nom_proveedor: string | null
          num_doc: string
          saldo: number | null
          sincronizado_em: string | null
        }
        Insert: {
          cod_proveedor?: string | null
          dias_vencido?: number | null
          fecha_doc?: string | null
          fecha_vence?: string | null
          monto_doc?: number | null
          monto_pagado?: number | null
          nom_proveedor?: string | null
          num_doc: string
          saldo?: number | null
          sincronizado_em?: string | null
        }
        Update: {
          cod_proveedor?: string | null
          dias_vencido?: number | null
          fecha_doc?: string | null
          fecha_vence?: string | null
          monto_doc?: number | null
          monto_pagado?: number | null
          nom_proveedor?: string | null
          num_doc?: string
          saldo?: number | null
          sincronizado_em?: string | null
        }
        Relationships: []
      }
      estoque: {
        Row: {
          cod_articulo: string
          existencia: number | null
          existencia_minima: number | null
          grupo: string | null
          nom_articulo: string | null
          nom_grupo: string | null
          precio1: number | null
          precio2: number | null
          sincronizado_em: string | null
          status: string | null
        }
        Insert: {
          cod_articulo: string
          existencia?: number | null
          existencia_minima?: number | null
          grupo?: string | null
          nom_articulo?: string | null
          nom_grupo?: string | null
          precio1?: number | null
          precio2?: number | null
          sincronizado_em?: string | null
          status?: string | null
        }
        Update: {
          cod_articulo?: string
          existencia?: number | null
          existencia_minima?: number | null
          grupo?: string | null
          nom_articulo?: string | null
          nom_grupo?: string | null
          precio1?: number | null
          precio2?: number | null
          sincronizado_em?: string | null
          status?: string | null
        }
        Relationships: []
      }
      sync_log: {
        Row: {
          id: string
          status: string | null
          tabela: string
          total_registros: number | null
          ultima_sync: string | null
        }
        Insert: {
          id?: string
          status?: string | null
          tabela: string
          total_registros?: number | null
          ultima_sync?: string | null
        }
        Update: {
          id?: string
          status?: string | null
          tabela?: string
          total_registros?: number | null
          ultima_sync?: string | null
        }
        Relationships: []
      }
      vendas: {
        Row: {
          cod_cliente: string | null
          fecha_doc: string | null
          nom_cliente: string | null
          num_doc: string
          sincronizado_em: string | null
          status_doc: string | null
          tipo_doc: string | null
          total_doc: number | null
        }
        Insert: {
          cod_cliente?: string | null
          fecha_doc?: string | null
          nom_cliente?: string | null
          num_doc: string
          sincronizado_em?: string | null
          status_doc?: string | null
          tipo_doc?: string | null
          total_doc?: number | null
        }
        Update: {
          cod_cliente?: string | null
          fecha_doc?: string | null
          nom_cliente?: string | null
          num_doc?: string
          sincronizado_em?: string | null
          status_doc?: string | null
          tipo_doc?: string | null
          total_doc?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
