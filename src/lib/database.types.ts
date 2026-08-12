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
      restaurant_config: {
        Row: {
          id: string;
          name: string;
          phone: string;
          address: string;
          logo: string | null;
          slogan: string | null;
          whatsapp_number: string | null;
          tax_rate: number | null;
          currency: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string;
          phone?: string;
          address?: string;
          logo?: string | null;
          slogan?: string | null;
          whatsapp_number?: string | null;
          tax_rate?: number | null;
          currency?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          address?: string;
          logo?: string | null;
          slogan?: string | null;
          whatsapp_number?: string | null;
          tax_rate?: number | null;
          currency?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          sort_order: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number | null;
          created_at?: string | null;
        };
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number | null;
          category: string;
          image: string | null;
          is_available: boolean | null;
          is_featured: boolean | null;
          variants: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price?: number | null;
          category: string;
          image?: string | null;
          is_available?: boolean | null;
          is_featured?: boolean | null;
          variants?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number | null;
          category?: string;
          image?: string | null;
          is_available?: boolean | null;
          is_featured?: boolean | null;
          variants?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      tables: {
        Row: {
          id: string;
          number: number;
          capacity: number | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          number: number;
          capacity?: number | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          number?: number;
          capacity?: number | null;
          status?: string | null;
          created_at?: string | null;
        };
      };
      orders: {
        Row: {
          id: string;
          status: string | null;
          type: string;
          table_id: string | null;
          table_number: number | null;
          customer_name: string | null;
          customer_phone: string | null;
          customer_address: string | null;
          customer_notes: string | null;
          total: number;
          tax: number | null;
          payment_method: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          status?: string | null;
          type: string;
          table_id?: string | null;
          table_number?: number | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_address?: string | null;
          customer_notes?: string | null;
          total: number;
          tax?: number | null;
          payment_method?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          status?: string | null;
          type?: string;
          table_id?: string | null;
          table_number?: number | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_address?: string | null;
          customer_notes?: string | null;
          total?: number;
          tax?: number | null;
          payment_method?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string | null;
          name: string;
          description: string | null;
          variant: string | null;
          price: number;
          quantity: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id?: string | null;
          name: string;
          description?: string | null;
          variant?: string | null;
          price: number;
          quantity?: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          menu_item_id?: string | null;
          name?: string;
          description?: string | null;
          variant?: string | null;
          price?: number;
          quantity?: number;
          created_at?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
