export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      app_settings: {
        Row: {
          booth_columns: number;
          booth_zones: string[];
          id: boolean;
          investment_percent: number;
        };
        Insert: {
          booth_columns?: number;
          booth_zones?: string[];
          id?: boolean;
          investment_percent?: number;
        };
        Update: {
          booth_columns?: number;
          booth_zones?: string[];
          id?: boolean;
          investment_percent?: number;
        };
        Relationships: [];
      };
      booth_markers: {
        Row: {
          kind: string;
          number: number;
          zone: string;
        };
        Insert: {
          kind: string;
          number: number;
          zone: string;
        };
        Update: {
          kind?: string;
          number?: number;
          zone?: string;
        };
        Relationships: [];
      };
      booths: {
        Row: {
          blocked: boolean;
          id: string;
          number: number;
          team_id: string | null;
          zone: string;
        };
        Insert: {
          blocked?: boolean;
          id?: string;
          number: number;
          team_id?: string | null;
          zone: string;
        };
        Update: {
          blocked?: boolean;
          id?: string;
          number?: number;
          team_id?: string | null;
          zone?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booths_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "team_investment_totals";
            referencedColumns: ["team_id"];
          },
          {
            foreignKeyName: "booths_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      investors: {
        Row: {
          id: string;
          name: string;
          password_hash: string | null;
          student_id: string;
          total_budget: number;
        };
        Insert: {
          id?: string;
          name: string;
          password_hash?: string | null;
          student_id: string;
          total_budget?: number;
        };
        Update: {
          id?: string;
          name?: string;
          password_hash?: string | null;
          student_id?: string;
          total_budget?: number;
        };
        Relationships: [];
      };
      judge_evaluations: {
        Row: {
          criteria_scores: Json;
          judge_id: string;
          memo: string;
          submitted: boolean;
          team_id: string;
          updated_at: string;
        };
        Insert: {
          criteria_scores?: Json;
          judge_id: string;
          memo?: string;
          submitted?: boolean;
          team_id: string;
          updated_at?: string;
        };
        Update: {
          criteria_scores?: Json;
          judge_id?: string;
          memo?: string;
          submitted?: boolean;
          team_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "judge_evaluations_judge_id_fkey";
            columns: ["judge_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "judge_evaluations_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "team_investment_totals";
            referencedColumns: ["team_id"];
          },
          {
            foreignKeyName: "judge_evaluations_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      participants: {
        Row: {
          avatar_url: string | null;
          name: string;
          password_hash: string | null;
          student_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          name: string;
          password_hash?: string | null;
          student_id: string;
        };
        Update: {
          avatar_url?: string | null;
          name?: string;
          password_hash?: string | null;
          student_id?: string;
        };
        Relationships: [];
      };
      schedule_items: {
        Row: {
          description: string | null;
          id: string;
          starts_at: string;
          title: string;
        };
        Insert: {
          description?: string | null;
          id?: string;
          starts_at: string;
          title: string;
        };
        Update: {
          description?: string | null;
          id?: string;
          starts_at?: string;
          title?: string;
        };
        Relationships: [];
      };
      staff: {
        Row: {
          id: string;
          name: string;
          password_hash: string | null;
          role: string;
        };
        Insert: {
          id: string;
          name: string;
          password_hash?: string | null;
          role: string;
        };
        Update: {
          id?: string;
          name?: string;
          password_hash?: string | null;
          role?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          student_id: string;
          team_id: string;
        };
        Insert: {
          student_id: string;
          team_id: string;
        };
        Update: {
          student_id?: string;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_members_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: true;
            referencedRelation: "participants";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "team_investment_totals";
            referencedColumns: ["team_id"];
          },
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      teams: {
        Row: {
          created_at: string;
          description: string;
          github_url: string | null;
          id: string;
          image_url: string | null;
          name: string;
          screenshot_urls: string[];
          tags: string[];
        };
        Insert: {
          created_at?: string;
          description: string;
          github_url?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          screenshot_urls?: string[];
          tags?: string[];
        };
        Update: {
          created_at?: string;
          description?: string;
          github_url?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          screenshot_urls?: string[];
          tags?: string[];
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          investor_id: string;
          team_id: string;
          type: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          investor_id: string;
          team_id: string;
          type: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          investor_id?: string;
          team_id?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_investor_id_fkey";
            columns: ["investor_id"];
            isOneToOne: false;
            referencedRelation: "investor_budgets";
            referencedColumns: ["investor_id"];
          },
          {
            foreignKeyName: "transactions_investor_id_fkey";
            columns: ["investor_id"];
            isOneToOne: false;
            referencedRelation: "investors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "team_investment_totals";
            referencedColumns: ["team_id"];
          },
          {
            foreignKeyName: "transactions_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      investor_budgets: {
        Row: {
          investor_id: string | null;
          remaining_budget: number | null;
        };
        Relationships: [];
      };
      investor_team_holdings: {
        Row: {
          holding: number | null;
          investor_id: string | null;
          team_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_investor_id_fkey";
            columns: ["investor_id"];
            isOneToOne: false;
            referencedRelation: "investor_budgets";
            referencedColumns: ["investor_id"];
          },
          {
            foreignKeyName: "transactions_investor_id_fkey";
            columns: ["investor_id"];
            isOneToOne: false;
            referencedRelation: "investors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "team_investment_totals";
            referencedColumns: ["team_id"];
          },
          {
            foreignKeyName: "transactions_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      team_investment_totals: {
        Row: {
          amount: number | null;
          team_id: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      place_trade: {
        Args: {
          p_amount: number;
          p_investor_id: string;
          p_team_id: string;
          p_type: string;
        };
        Returns: {
          amount: number;
          created_at: string;
          id: string;
          investor_id: string;
          team_id: string;
          type: string;
        };
        SetofOptions: {
          from: "*";
          to: "transactions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
