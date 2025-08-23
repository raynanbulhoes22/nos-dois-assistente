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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      agent_memory: {
        Row: {
          id: number
          message: Json
          session_id: string
          user_id: string | null
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
          user_id?: string | null
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          new_values: Json | null
          old_values: Json | null
          operation: string
          record_id: string | null
          table_name: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          record_id?: string | null
          table_name: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cartoes_credito: {
        Row: {
          apelido: string
          ativo: boolean
          created_at: string
          dia_vencimento: number | null
          id: string
          limite: number | null
          limite_disponivel: string | null
          ultimos_digitos: string
          user_id: string
        }
        Insert: {
          apelido: string
          ativo?: boolean
          created_at?: string
          dia_vencimento?: number | null
          id?: string
          limite?: number | null
          limite_disponivel?: string | null
          ultimos_digitos: string
          user_id: string
        }
        Update: {
          apelido?: string
          ativo?: boolean
          created_at?: string
          dia_vencimento?: number | null
          id?: string
          limite?: number | null
          limite_disponivel?: string | null
          ultimos_digitos?: string
          user_id?: string
        }
        Relationships: []
      }
      contas_parceladas: {
        Row: {
          ano_veiculo: number | null
          ativa: boolean
          cartao_id: string | null
          categoria: string | null
          created_at: string
          dados_especificos: Json | null
          data_primeira_parcela: string
          debito_automatico: boolean | null
          descricao: string | null
          finalidade: string | null
          id: string
          instituicao_financeira: string | null
          loja: string | null
          margem_consignavel: number | null
          nome: string
          parcelas_pagas: number
          status_manual: string | null
          status_manual_ano: number | null
          status_manual_mes: number | null
          taxa_efetiva_anual: number | null
          taxa_juros: number | null
          taxa_nominal_anual: number | null
          tipo_financiamento: string | null
          total_parcelas: number
          updated_at: string
          user_id: string
          valor_bem: number | null
          valor_emprestado: number | null
          valor_entrada: number | null
          valor_financiado: number | null
          valor_parcela: number
        }
        Insert: {
          ano_veiculo?: number | null
          ativa?: boolean
          cartao_id?: string | null
          categoria?: string | null
          created_at?: string
          dados_especificos?: Json | null
          data_primeira_parcela: string
          debito_automatico?: boolean | null
          descricao?: string | null
          finalidade?: string | null
          id?: string
          instituicao_financeira?: string | null
          loja?: string | null
          margem_consignavel?: number | null
          nome: string
          parcelas_pagas?: number
          status_manual?: string | null
          status_manual_ano?: number | null
          status_manual_mes?: number | null
          taxa_efetiva_anual?: number | null
          taxa_juros?: number | null
          taxa_nominal_anual?: number | null
          tipo_financiamento?: string | null
          total_parcelas: number
          updated_at?: string
          user_id: string
          valor_bem?: number | null
          valor_emprestado?: number | null
          valor_entrada?: number | null
          valor_financiado?: number | null
          valor_parcela: number
        }
        Update: {
          ano_veiculo?: number | null
          ativa?: boolean
          cartao_id?: string | null
          categoria?: string | null
          created_at?: string
          dados_especificos?: Json | null
          data_primeira_parcela?: string
          debito_automatico?: boolean | null
          descricao?: string | null
          finalidade?: string | null
          id?: string
          instituicao_financeira?: string | null
          loja?: string | null
          margem_consignavel?: number | null
          nome?: string
          parcelas_pagas?: number
          status_manual?: string | null
          status_manual_ano?: number | null
          status_manual_mes?: number | null
          taxa_efetiva_anual?: number | null
          taxa_juros?: number | null
          taxa_nominal_anual?: number | null
          tipo_financiamento?: string | null
          total_parcelas?: number
          updated_at?: string
          user_id?: string
          valor_bem?: number | null
          valor_emprestado?: number | null
          valor_entrada?: number | null
          valor_financiado?: number | null
          valor_parcela?: number
        }
        Relationships: []
      }
      fontes_renda: {
        Row: {
          ativa: boolean
          created_at: string
          descricao: string | null
          id: string
          status_manual: string | null
          status_manual_ano: number | null
          status_manual_mes: number | null
          tipo: string
          user_id: string
          valor: number
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          status_manual?: string | null
          status_manual_ano?: number | null
          status_manual_mes?: number | null
          tipo: string
          user_id: string
          valor: number
        }
        Update: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          status_manual?: string | null
          status_manual_ano?: number | null
          status_manual_mes?: number | null
          tipo?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      gastos_fixos: {
        Row: {
          ativo: boolean
          categoria: string | null
          created_at: string
          data_inicio: string
          id: string
          nome: string
          observacoes: string | null
          status_manual: string | null
          status_manual_ano: number | null
          status_manual_mes: number | null
          updated_at: string
          user_id: string
          valor_mensal: number
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          data_inicio?: string
          id?: string
          nome: string
          observacoes?: string | null
          status_manual?: string | null
          status_manual_ano?: number | null
          status_manual_mes?: number | null
          updated_at?: string
          user_id: string
          valor_mensal: number
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          data_inicio?: string
          id?: string
          nome?: string
          observacoes?: string | null
          status_manual?: string | null
          status_manual_ano?: number | null
          status_manual_mes?: number | null
          updated_at?: string
          user_id?: string
          valor_mensal?: number
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
          user_id: string | null
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
          user_id?: string | null
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orcamentos_categorias: {
        Row: {
          categoria_nome: string
          created_at: string
          id: string
          orcamento_id: string
          updated_at: string
          valor_orcado: number
        }
        Insert: {
          categoria_nome: string
          created_at?: string
          id?: string
          orcamento_id: string
          updated_at?: string
          valor_orcado?: number
        }
        Update: {
          categoria_nome?: string
          created_at?: string
          id?: string
          orcamento_id?: string
          updated_at?: string
          valor_orcado?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_categorias_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos_mensais"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos_mensais: {
        Row: {
          ano: number
          created_at: string
          id: string
          mes: number
          meta_economia: number | null
          saldo_editado_manualmente: boolean | null
          saldo_inicial: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ano: number
          created_at?: string
          id?: string
          mes: number
          meta_economia?: number | null
          saldo_editado_manualmente?: boolean | null
          saldo_inicial?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: number
          created_at?: string
          id?: string
          mes?: number
          meta_economia?: number | null
          saldo_editado_manualmente?: boolean | null
          saldo_inicial?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          id: string
          meta_economia_mensal: number | null
          nome: string | null
          nome_conjuge: string | null
          numero_wpp: string | null
          objetivo_principal: string | null
          onboarding: boolean | null
          onboarding_completed: boolean
          preferencia_notificacao: string | null
          telefone_conjuge: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          id: string
          meta_economia_mensal?: number | null
          nome?: string | null
          nome_conjuge?: string | null
          numero_wpp?: string | null
          objetivo_principal?: string | null
          onboarding?: boolean | null
          onboarding_completed?: boolean
          preferencia_notificacao?: string | null
          telefone_conjuge?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          id?: string
          meta_economia_mensal?: number | null
          nome?: string | null
          nome_conjuge?: string | null
          numero_wpp?: string | null
          objetivo_principal?: string | null
          onboarding?: boolean | null
          onboarding_completed?: boolean
          preferencia_notificacao?: string | null
          telefone_conjuge?: string | null
        }
        Relationships: []
      }
      registros_financeiros: {
        Row: {
          apelido: string | null
          cartao_final: string | null
          categoria: string | null
          criado_em: string | null
          data: string
          estabelecimento: string | null
          forma_pagamento: string | null
          id: string
          id_transacao: string | null
          instituicao: string | null
          nome: string | null
          numero_wpp: string | null
          observacao: string | null
          origem: string | null
          recorrente: boolean | null
          tipo: string | null
          tipo_movimento: string | null
          title: string | null
          titulo: string | null
          ultimos_digitos: string | null
          user_id: string
          valor: number
        }
        Insert: {
          apelido?: string | null
          cartao_final?: string | null
          categoria?: string | null
          criado_em?: string | null
          data: string
          estabelecimento?: string | null
          forma_pagamento?: string | null
          id?: string
          id_transacao?: string | null
          instituicao?: string | null
          nome?: string | null
          numero_wpp?: string | null
          observacao?: string | null
          origem?: string | null
          recorrente?: boolean | null
          tipo?: string | null
          tipo_movimento?: string | null
          title?: string | null
          titulo?: string | null
          ultimos_digitos?: string | null
          user_id: string
          valor: number
        }
        Update: {
          apelido?: string | null
          cartao_final?: string | null
          categoria?: string | null
          criado_em?: string | null
          data?: string
          estabelecimento?: string | null
          forma_pagamento?: string | null
          id?: string
          id_transacao?: string | null
          instituicao?: string | null
          nome?: string | null
          numero_wpp?: string | null
          observacao?: string | null
          origem?: string | null
          recorrente?: boolean | null
          tipo?: string | null
          tipo_movimento?: string | null
          title?: string | null
          titulo?: string | null
          ultimos_digitos?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      encrypt_cpf: {
        Args: { cpf_input: string }
        Returns: string
      }
      encrypt_sensitive_data: {
        Args: { data_input: string }
        Returns: string
      }
      get_registros_financeiros_resumo: {
        Args: Record<PropertyKey, never>
        Returns: {
          cartao_mascarado: string
          categoria: string
          data: string
          id: string
          mes_referencia: string
          tipo: string
          tipo_movimento: string
          user_id: string
          valor: number
        }[]
      }
      normalize_phone_number: {
        Args: { phone_input: string }
        Returns: string
      }
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
