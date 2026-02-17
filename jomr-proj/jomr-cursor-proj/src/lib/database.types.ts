// TypeScript types for Supabase database schema
// These types match the schema defined in supabase-schema.sql
// Include Views, Enums, Functions, CompositeTypes for Supabase client type inference

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: string;
          name: string;
          key: string;
          created_at: string;
          last_used: string | null;
          status: 'active' | 'inactive';
          user_id: string | null;
          created_at_ts: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          key: string;
          created_at?: string;
          last_used?: string | null;
          status?: 'active' | 'inactive';
          user_id?: string | null;
          created_at_ts?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          key?: string;
          created_at?: string;
          last_used?: string | null;
          status?: 'active' | 'inactive';
          user_id?: string | null;
          created_at_ts?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
