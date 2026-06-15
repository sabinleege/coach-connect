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
      activity_data: {
        Row: {
          calories: number
          date: string
          day: string
          id: string
          user_id: string
        }
        Insert: {
          calories?: number
          date: string
          day: string
          id?: string
          user_id: string
        }
        Update: {
          calories?: number
          date?: string
          day?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_athlete_relations: {
        Row: {
          athlete_id: string
          coach_id: string
          covered_by_coach: boolean
          created_at: string
          id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          athlete_id: string
          coach_id: string
          covered_by_coach?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          covered_by_coach?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          coach_id: string
          created_at: string
          email: string | null
          expires_at: string
          id: string
          invite_code: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          coach_id: string
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invite_code?: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          coach_id?: string
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invite_code?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_notes: {
        Row: {
          athlete_id: string
          coach_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          visible_to_athlete: boolean
        }
        Insert: {
          athlete_id: string
          coach_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          visible_to_athlete?: boolean
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          visible_to_athlete?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "coach_notes_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_notes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          athlete_id: string
          coach_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          athlete_id: string
          coach_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      injuries: {
        Row: {
          athlete_id: string
          body_part: string
          created_at: string
          date_reported: string
          expected_return: string | null
          id: string
          injury_type: string
          notes: string | null
          recovery_timeline: Json | null
          severity: number
          status: string
          updated_at: string
        }
        Insert: {
          athlete_id: string
          body_part: string
          created_at?: string
          date_reported?: string
          expected_return?: string | null
          id?: string
          injury_type: string
          notes?: string | null
          recovery_timeline?: Json | null
          severity: number
          status?: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          body_part?: string
          created_at?: string
          date_reported?: string
          expected_return?: string | null
          id?: string
          injury_type?: string
          notes?: string | null
          recovery_timeline?: Json | null
          severity?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "injuries_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          meals: Json | null
          total_calories: number | null
          total_protein: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          meals?: Json | null
          total_calories?: number | null
          total_protein?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          meals?: Json | null
          total_calories?: number | null
          total_protein?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          adherence_percentage: number | null
          age: number | null
          avatar_url: string | null
          body_fat: number | null
          consistency_score: number | null
          created_at: string
          daily_calories_target: number | null
          email: string | null
          fitness_score: number | null
          full_name: string | null
          gender: string | null
          goal_description: string | null
          goals: string[] | null
          heart_rate: number | null
          height: number | null
          id: string
          injuries: Json | null
          last_active_at: string | null
          onboarding_completed: boolean
          primary_goal: string | null
          recovery_score: number | null
          target_weight: number | null
          updated_at: string
          water_glasses: number | null
          water_target: number | null
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          adherence_percentage?: number | null
          age?: number | null
          avatar_url?: string | null
          body_fat?: number | null
          consistency_score?: number | null
          created_at?: string
          daily_calories_target?: number | null
          email?: string | null
          fitness_score?: number | null
          full_name?: string | null
          gender?: string | null
          goal_description?: string | null
          goals?: string[] | null
          heart_rate?: number | null
          height?: number | null
          id: string
          injuries?: Json | null
          last_active_at?: string | null
          onboarding_completed?: boolean
          primary_goal?: string | null
          recovery_score?: number | null
          target_weight?: number | null
          updated_at?: string
          water_glasses?: number | null
          water_target?: number | null
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          adherence_percentage?: number | null
          age?: number | null
          avatar_url?: string | null
          body_fat?: number | null
          consistency_score?: number | null
          created_at?: string
          daily_calories_target?: number | null
          email?: string | null
          fitness_score?: number | null
          full_name?: string | null
          gender?: string | null
          goal_description?: string | null
          goals?: string[] | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          injuries?: Json | null
          last_active_at?: string | null
          onboarding_completed?: boolean
          primary_goal?: string | null
          recovery_score?: number | null
          target_weight?: number | null
          updated_at?: string
          water_glasses?: number | null
          water_target?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          athlete_ids: string[]
          coach_id: string
          created_at: string
          duration_minutes: number
          id: string
          location: string | null
          notes: string | null
          scheduled_at: string
          session_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          athlete_ids?: string[]
          coach_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          location?: string | null
          notes?: string | null
          scheduled_at: string
          session_type?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          athlete_ids?: string[]
          coach_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          location?: string | null
          notes?: string | null
          scheduled_at?: string
          session_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          covers_athletes: boolean
          created_at: string
          current_period_end: string | null
          id: string
          plan_type: string
          seat_limit: number | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          covers_athletes?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_type?: string
          seat_limit?: number | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          covers_athletes?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan_type?: string
          seat_limit?: number | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      weight_history: {
        Row: {
          id: string
          recorded_at: string
          user_id: string
          week_label: string
          weight: number
        }
        Insert: {
          id?: string
          recorded_at?: string
          user_id: string
          week_label: string
          weight: number
        }
        Update: {
          id?: string
          recorded_at?: string
          user_id?: string
          week_label?: string
          weight?: number
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          completion_rate: number
          created_at: string
          date: string
          id: string
          notes: string | null
          plan_id: string | null
          user_id: string
        }
        Insert: {
          completion_rate?: number
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          plan_id?: string | null
          user_id: string
        }
        Update: {
          completion_rate?: number
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          plan_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_coach_invite: { Args: { _code: string }; Returns: string }
      coaches_athlete: {
        Args: { _athlete_id: string; _coach_id: string }
        Returns: boolean
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
      app_role: "coach" | "athlete" | "admin"
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
      app_role: ["coach", "athlete", "admin"],
    },
  },
} as const
