export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
      cartoes_credito: {
        Row: {
          apelido: string
          ativo: boolean
          created_at: string
          dia_vencimento: number | null
          id: string
          limite: number | null
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
          id: string
          instituicao_financeira: string | null
          nome: string
          parcelas_pagas: number
          taxa_juros: number | null
          tipo_financiamento: string | null
          total_parcelas: number
          updated_at: string
          user_id: string
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
          id?: string
          instituicao_financeira?: string | null
          nome: string
          parcelas_pagas?: number
          taxa_juros?: number | null
          tipo_financiamento?: string | null
          total_parcelas: number
          updated_at?: string
          user_id: string
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
          id?: string
          instituicao_financeira?: string | null
          nome?: string
          parcelas_pagas?: number
          taxa_juros?: number | null
          tipo_financiamento?: string | null
          total_parcelas?: number
          updated_at?: string
          user_id?: string
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
          tipo: string
          user_id: string
          valor: number
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          tipo: string
          user_id: string
          valor: number
        }
        Update: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          tipo?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      historico_de_interacoes: {
        Row: {
          acao: string
          agente: string
          dados: Json | null
          id: string
          instancia: string
          mensagem: string
          message_id: string | null
          nome: string
          origem: string | null
          registrado_em: string | null
          telefone: string
        }
        Insert: {
          acao: string
          agente: string
          dados?: Json | null
          id?: string
          instancia: string
          mensagem: string
          message_id?: string | null
          nome: string
          origem?: string | null
          registrado_em?: string | null
          telefone: string
        }
        Update: {
          acao?: string
          agente?: string
          dados?: Json | null
          id?: string
          instancia?: string
          mensagem?: string
          message_id?: string | null
          nome?: string
          origem?: string | null
          registrado_em?: string | null
          telefone?: string
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
          onboarding_completed: boolean
          preferencia_notificacao: string | null
          telefone: string | null
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
          onboarding_completed?: boolean
          preferencia_notificacao?: string | null
          telefone?: string | null
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
          onboarding_completed?: boolean
          preferencia_notificacao?: string | null
          telefone?: string | null
          telefone_conjuge?: string | null
        }
        Relationships: []
      }
      registros_financeiros: {
        Row: {
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
          user_id: string | null
          valor: number
        }
        Insert: {
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
          user_id?: string | null
          valor: number
        }
        Update: {
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
          user_id?: string | null
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
