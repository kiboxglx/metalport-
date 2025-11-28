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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contracts: {
        Row: {
          contract_number: number
          created_at: string
          customer_address: string | null
          customer_document: string | null
          customer_id: string
          customer_name: string
          customer_phone: string | null
          end_date: string
          equipment_value: number | null
          generated_at: string
          id: string
          items_json: Json
          notes: string | null
          pdf_url: string | null
          rental_id: string
          start_date: string
          total_value: number
        }
        Insert: {
          contract_number?: number
          created_at?: string
          customer_address?: string | null
          customer_document?: string | null
          customer_id: string
          customer_name: string
          customer_phone?: string | null
          end_date: string
          equipment_value?: number | null
          generated_at?: string
          id?: string
          items_json?: Json
          notes?: string | null
          pdf_url?: string | null
          rental_id: string
          start_date: string
          total_value: number
        }
        Update: {
          contract_number?: number
          created_at?: string
          customer_address?: string | null
          customer_document?: string | null
          customer_id?: string
          customer_name?: string
          customer_phone?: string | null
          end_date?: string
          equipment_value?: number | null
          generated_at?: string
          id?: string
          items_json?: Json
          notes?: string | null
          pdf_url?: string | null
          rental_id?: string
          start_date?: string
          total_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          method: string
          notes: string | null
          paid_date: string | null
          rental_id: string
          status: string
        }
        Insert: {
          amount?: number
          created_at?: string
          due_date: string
          id?: string
          method?: string
          notes?: string | null
          paid_date?: string | null
          rental_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          method?: string
          notes?: string | null
          paid_date?: string | null
          rental_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          daily_rental_price: number
          description: string | null
          id: string
          name: string
          total_stock: number
          unit_price: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          daily_rental_price?: number
          description?: string | null
          id?: string
          name: string
          total_stock?: number
          unit_price?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          daily_rental_price?: number
          description?: string | null
          id?: string
          name?: string
          total_stock?: number
          unit_price?: number
        }
        Relationships: []
      }
      rental_checklist: {
        Row: {
          collected: boolean
          collected_at: string | null
          collected_by: string | null
          created_at: string
          id: string
          notes: string | null
          product_id: string
          quantity_collected: number
          quantity_expected: number
          rental_id: string
        }
        Insert: {
          collected?: boolean
          collected_at?: string | null
          collected_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          quantity_collected?: number
          quantity_expected?: number
          rental_id: string
        }
        Update: {
          collected?: boolean
          collected_at?: string | null
          collected_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity_collected?: number
          quantity_expected?: number
          rental_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_checklist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_checklist_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_items: {
        Row: {
          created_at: string
          id: string
          quantity: number
          rental_id: string
          tent_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number
          rental_id: string
          tent_id: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          rental_id?: string
          tent_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "rental_items_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_items_tent_id_fkey"
            columns: ["tent_id"]
            isOneToOne: false
            referencedRelation: "tents"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_product_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          rental_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          rental_id: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          rental_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "rental_product_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_product_items_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          created_at: string
          customer_id: string
          daily_rate: number | null
          delivery_fee: number | null
          discount: number | null
          end_date: string
          id: string
          notes: string | null
          payment_method: string | null
          start_date: string
          status: string
          total_value: number
        }
        Insert: {
          created_at?: string
          customer_id: string
          daily_rate?: number | null
          delivery_fee?: number | null
          discount?: number | null
          end_date: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          start_date: string
          status?: string
          total_value?: number
        }
        Update: {
          created_at?: string
          customer_id?: string
          daily_rate?: number | null
          delivery_fee?: number | null
          discount?: number | null
          end_date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          start_date?: string
          status?: string
          total_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "rentals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      tents: {
        Row: {
          created_at: string
          daily_price: number
          id: string
          name: string
          size: string | null
          total_stock: number
        }
        Insert: {
          created_at?: string
          daily_price?: number
          id?: string
          name: string
          size?: string | null
          total_stock?: number
        }
        Update: {
          created_at?: string
          daily_price?: number
          id?: string
          name?: string
          size?: string | null
          total_stock?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "comercial" | "operacional"
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
      app_role: ["admin", "comercial", "operacional"],
    },
  },
} as const
