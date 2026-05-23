export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      booking_qualifications: {
        Row: {
          client_name: string | null;
          created_at: string;
          email: string | null;
          id: string;
          life_stage: string;
          notes: string | null;
          phone: string | null;
          seeking: string;
          session_interest: string;
          status: string | null;
        };
        Insert: {
          client_name?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          life_stage: string;
          notes?: string | null;
          phone?: string | null;
          seeking: string;
          session_interest: string;
          status?: string | null;
        };
        Update: {
          client_name?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          life_stage?: string;
          notes?: string | null;
          phone?: string | null;
          seeking?: string;
          session_interest?: string;
          status?: string | null;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          notes: string | null;
          phone: string | null;
          status: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          notes?: string | null;
          phone?: string | null;
          status?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          status?: string | null;
        };
        Relationships: [];
      };
      dashboard_notes: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          note: string;
          related_submission_id: string | null;
          related_type: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          note: string;
          related_submission_id?: string | null;
          related_type: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          note?: string;
          related_submission_id?: string | null;
          related_type?: string;
        };
        Relationships: [];
      };
      intake_submissions: {
        Row: {
          age: string;
          anew_dawn_vision: string;
          becoming: string;
          believe_you_are: string;
          created_at: string;
          email: string;
          five_year_vision: string;
          holding_back_habits: string;
          id: string;
          life_stage: string;
          lifestyle_sentence: string;
          limiting_beliefs: string;
          most_confident_area: string;
          negative_thoughts: string;
          notes: string | null;
          phone: string;
          purpose_clarity: string;
          purpose_unclear_reason: string | null;
          result_type: string | null;
          setback_response: string;
          status: string | null;
          struggle_area: string;
          stuck_areas: string;
          thriving_environments: string;
          top_challenges: string;
          willing_to_release: string;
        };
        Insert: {
          age: string;
          anew_dawn_vision: string;
          becoming: string;
          believe_you_are: string;
          created_at?: string;
          email: string;
          five_year_vision: string;
          holding_back_habits: string;
          id?: string;
          life_stage: string;
          lifestyle_sentence: string;
          limiting_beliefs: string;
          most_confident_area: string;
          negative_thoughts: string;
          notes?: string | null;
          phone: string;
          purpose_clarity: string;
          purpose_unclear_reason?: string | null;
          result_type?: string | null;
          setback_response: string;
          status?: string | null;
          struggle_area: string;
          stuck_areas: string;
          thriving_environments: string;
          top_challenges: string;
          willing_to_release: string;
        };
        Update: {
          age?: string;
          anew_dawn_vision?: string;
          becoming?: string;
          believe_you_are?: string;
          created_at?: string;
          email?: string;
          five_year_vision?: string;
          holding_back_habits?: string;
          id?: string;
          life_stage?: string;
          lifestyle_sentence?: string;
          limiting_beliefs?: string;
          most_confident_area?: string;
          negative_thoughts?: string;
          notes?: string | null;
          phone?: string;
          purpose_clarity?: string;
          purpose_unclear_reason?: string | null;
          result_type?: string | null;
          setback_response?: string;
          status?: string | null;
          struggle_area?: string;
          stuck_areas?: string;
          thriving_environments?: string;
          top_challenges?: string;
          willing_to_release?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          username: string | null;
        };
        Insert: {
          created_at?: string;
          id: string;
          role?: Database["public"]["Enums"]["app_role"];
          username?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          username?: string | null;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          updated_at: string;
          value: string;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value?: string;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_any_role: {
        Args: { _roles: Database["public"]["Enums"]["app_role"][] };
        Returns: boolean;
      };
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "developer";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
  public: {
    Enums: {
      app_role: ["admin", "developer"],
    },
  },
} as const;
