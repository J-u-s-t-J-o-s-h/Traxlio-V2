export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      boxes: {
        Row: {
          id: string;
          user_id: string;
          room_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          room_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          room_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          user_id: string;
          box_id: string;
          name: string;
          description: string | null;
          quantity: number;
          images: string[];
          tags: string[];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          box_id: string;
          name: string;
          description?: string | null;
          quantity?: number;
          images?: string[];
          tags?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          box_id?: string;
          name?: string;
          description?: string | null;
          quantity?: number;
          images?: string[];
          tags?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      shares: {
        Row: {
          id: string;
          user_id: string;
          type: 'room' | 'box' | 'item';
          resource_id: string;
          is_public: boolean;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'room' | 'box' | 'item';
          resource_id: string;
          is_public?: boolean;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'room' | 'box' | 'item';
          resource_id?: string;
          is_public?: boolean;
          created_at?: string;
          expires_at?: string | null;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          action: 'create' | 'update' | 'delete' | 'move';
          type: 'room' | 'box' | 'item';
          resource_id: string;
          resource_name: string;
          parent_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: 'create' | 'update' | 'delete' | 'move';
          type: 'room' | 'box' | 'item';
          resource_id: string;
          resource_name: string;
          parent_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: 'create' | 'update' | 'delete' | 'move';
          type?: 'room' | 'box' | 'item';
          resource_id?: string;
          resource_name?: string;
          parent_name?: string | null;
          created_at?: string;
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
  };
}

// Helper types for easier usage
export type Room = Database['public']['Tables']['rooms']['Row'];
export type Box = Database['public']['Tables']['boxes']['Row'];
export type Item = Database['public']['Tables']['items']['Row'];
export type Share = Database['public']['Tables']['shares']['Row'];
export type Activity = Database['public']['Tables']['activities']['Row'];

export type RoomInsert = Database['public']['Tables']['rooms']['Insert'];
export type BoxInsert = Database['public']['Tables']['boxes']['Insert'];
export type ItemInsert = Database['public']['Tables']['items']['Insert'];
export type ShareInsert = Database['public']['Tables']['shares']['Insert'];
export type ActivityInsert = Database['public']['Tables']['activities']['Insert'];

export type RoomUpdate = Database['public']['Tables']['rooms']['Update'];
export type BoxUpdate = Database['public']['Tables']['boxes']['Update'];
export type ItemUpdate = Database['public']['Tables']['items']['Update'];

