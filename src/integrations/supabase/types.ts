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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      deliveries: {
        Row: {
          cliente: string
          conferido_em: string | null
          conferido_por: string | null
          created_at: string
          data_prevista: string
          id: string
          impresso_em: string | null
          impresso_por: string | null
          motivo_nao_entrega: string | null
          motoboy_id: string | null
          numero_formulas: number
          numero_pedido: string
          numero_romaneio: string
          observacoes: string | null
          periodo: Database["public"]["Enums"]["delivery_period"]
          quantidade_revenda: number | null
          status: Database["public"]["Enums"]["delivery_status"]
          tem_revenda: boolean
          tipo_entrega: Database["public"]["Enums"]["delivery_type"]
          unidade_destino_id: string | null
          unidade_origem_id: string | null
          updated_at: string
          vendedor_id: string
        }
        Insert: {
          cliente: string
          conferido_em?: string | null
          conferido_por?: string | null
          created_at?: string
          data_prevista: string
          id?: string
          impresso_em?: string | null
          impresso_por?: string | null
          motivo_nao_entrega?: string | null
          motoboy_id?: string | null
          numero_formulas?: number
          numero_pedido: string
          numero_romaneio: string
          observacoes?: string | null
          periodo: Database["public"]["Enums"]["delivery_period"]
          quantidade_revenda?: number | null
          status?: Database["public"]["Enums"]["delivery_status"]
          tem_revenda?: boolean
          tipo_entrega?: Database["public"]["Enums"]["delivery_type"]
          unidade_destino_id?: string | null
          unidade_origem_id?: string | null
          updated_at?: string
          vendedor_id: string
        }
        Update: {
          cliente?: string
          conferido_em?: string | null
          conferido_por?: string | null
          created_at?: string
          data_prevista?: string
          id?: string
          impresso_em?: string | null
          impresso_por?: string | null
          motivo_nao_entrega?: string | null
          motoboy_id?: string | null
          numero_formulas?: number
          numero_pedido?: string
          numero_romaneio?: string
          observacoes?: string | null
          periodo?: Database["public"]["Enums"]["delivery_period"]
          quantidade_revenda?: number | null
          status?: Database["public"]["Enums"]["delivery_status"]
          tem_revenda?: boolean
          tipo_entrega?: Database["public"]["Enums"]["delivery_type"]
          unidade_destino_id?: string | null
          unidade_origem_id?: string | null
          updated_at?: string
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_motoboy_id_fkey"
            columns: ["motoboy_id"]
            isOneToOne: false
            referencedRelation: "motoboys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_motoboy_id_fkey"
            columns: ["motoboy_id"]
            isOneToOne: false
            referencedRelation: "motoboys_publico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_unidade_destino_id_fkey"
            columns: ["unidade_destino_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_unidade_origem_id_fkey"
            columns: ["unidade_origem_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_history: {
        Row: {
          acao: string
          created_at: string
          delivery_id: string
          id: string
          observacao: string | null
          status_anterior: Database["public"]["Enums"]["delivery_status"] | null
          status_novo: Database["public"]["Enums"]["delivery_status"] | null
          usuario_id: string | null
          usuario_nome: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          delivery_id: string
          id?: string
          observacao?: string | null
          status_anterior?:
            | Database["public"]["Enums"]["delivery_status"]
            | null
          status_novo?: Database["public"]["Enums"]["delivery_status"] | null
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          delivery_id?: string
          id?: string
          observacao?: string | null
          status_anterior?:
            | Database["public"]["Enums"]["delivery_status"]
            | null
          status_novo?: Database["public"]["Enums"]["delivery_status"] | null
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_history_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      motoboys: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string
          id: string
          nome?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      unidades: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      motoboys_publico: {
        Row: {
          ativo: boolean | null
          id: string | null
          nome: string | null
        }
        Insert: {
          ativo?: boolean | null
          id?: string | null
          nome?: string | null
        }
        Update: {
          ativo?: boolean | null
          id?: string | null
          nome?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "vendedor" | "logistica"
      delivery_period: "manha" | "tarde_noite"
      delivery_status:
        | "aguardando_logistica"
        | "impressao_romaneios"
        | "pronto_saida"
        | "em_rota"
        | "aguardando_conferencia"
        | "concluido"
        | "nao_entregue"
        | "cancelado"
      delivery_type: "domicilio" | "transferencia"
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
    Enums: {
      app_role: ["vendedor", "logistica"],
      delivery_period: ["manha", "tarde_noite"],
      delivery_status: [
        "aguardando_logistica",
        "impressao_romaneios",
        "pronto_saida",
        "em_rota",
        "aguardando_conferencia",
        "concluido",
        "nao_entregue",
        "cancelado",
      ],
      delivery_type: ["domicilio", "transferencia"],
    },
  },
} as const
