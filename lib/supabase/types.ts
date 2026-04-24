export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type EmptyRelationships = never[];

export interface Database {
  public: {
    Tables: {
      gyms: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          address: string;
          phone: string;
          logo_url: string;
          whatsapp_api_key: string;
          whatsapp_credits: number;
          whatsapp_reminder_mode: "manual" | "auto";
          whatsapp_phone_number: string;
          receipt_prefix: string;
          invoice_prefix: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name?: string;
          address?: string;
          phone?: string;
          logo_url?: string;
          whatsapp_api_key?: string;
          whatsapp_credits?: number;
          whatsapp_reminder_mode?: "manual" | "auto";
          whatsapp_phone_number?: string;
          receipt_prefix?: string;
          invoice_prefix?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gyms"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
      members: {
        Row: {
          id: string;
          gym_id: string;
          full_name: string;
          phone: string;
          email: string;
          joining_date: string;
          photo_url: string;
          notes: string;
          is_frozen: boolean;
          frozen_since: string | null;
          frozen_days_accumulated: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          full_name: string;
          phone?: string;
          email?: string;
          joining_date?: string;
          photo_url?: string;
          notes?: string;
          is_frozen?: boolean;
          frozen_since?: string | null;
          frozen_days_accumulated?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["members"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
      plans: {
        Row: {
          id: string;
          gym_id: string;
          name: string;
          duration_days: number;
          price: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          name: string;
          duration_days: number;
          price: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plans"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
      subscriptions: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          plan_id: string | null;
          start_date: string;
          end_date: string;
          frozen_days_used: number;
          reminder_5_sent_at: string | null;
          reminder_3_sent_at: string | null;
          reminder_1_sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          member_id: string;
          plan_id?: string | null;
          start_date: string;
          end_date: string;
          frozen_days_used?: number;
          reminder_5_sent_at?: string | null;
          reminder_3_sent_at?: string | null;
          reminder_1_sent_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
      invoices: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          subscription_id: string | null;
          invoice_number: string;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          member_id: string;
          subscription_id?: string | null;
          invoice_number: string;
          amount: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
      payments: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          invoice_id: string | null;
          receipt_number: string;
          amount: number;
          payment_method: "cash" | "upi" | "card" | "bank_transfer";
          notes: string;
          paid_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          member_id: string;
          invoice_id?: string | null;
          receipt_number: string;
          amount: number;
          payment_method?: "cash" | "upi" | "card" | "bank_transfer";
          notes?: string;
          paid_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
      attendance: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          checked_in_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          member_id: string;
          checked_in_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["attendance"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
      reminders: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          subscription_id: string | null;
          stage: 5 | 3 | 1;
          sent_at: string;
          method: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          member_id: string;
          subscription_id?: string | null;
          stage: 5 | 3 | 1;
          sent_at?: string;
          method?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reminders"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
    };
    Views: {
      v_member_status: {
        Row: {
          id: string;
          gym_id: string;
          full_name: string;
          phone: string;
          email: string;
          joining_date: string;
          is_frozen: boolean;
          photo_url: string | null;
          notes: string;
          subscription_id: string | null;
          start_date: string | null;
          end_date: string | null;
          plan_id: string | null;
          reminder_5_sent_at: string | null;
          reminder_3_sent_at: string | null;
          reminder_1_sent_at: string | null;
          plan_name: string | null;
          duration_days: number | null;
          plan_price: number | null;
          total_invoiced: number;
          total_paid: number;
          balance_due: number;
          credit_balance: number;
          days_until_expiry: number | null;
          status: string;
        };
        Relationships: EmptyRelationships;
      };
    };
    Functions: {
      add_subscription_with_invoice: {
        Args: {
          p_gym_id: string;
          p_member_id: string;
          p_plan_id: string;
          p_start_date: string;
          p_end_date: string;
          p_plan_price: number;
        };
        Returns: {
          subscription_id: string;
          invoice_id: string;
          invoice_number: string;
        };
      };
      create_membership_sale: {
        Args: {
          p_gym_id: string;
          p_full_name: string;
          p_phone: string;
          p_email: string;
          p_photo_url: string;
          p_notes: string;
          p_device_id: string;
          p_plan_id: string;
          p_start_date: string;
          p_end_date: string;
          p_plan_fee: number;
          p_amount_paid: number;
          p_payment_method: "cash" | "upi" | "card" | "bank_transfer";
        };
        Returns: {
          success: boolean;
          error?: string;
          member_id: string;
          subscription_id: string;
          invoice_id: string;
          payment_id: string | null;
          invoice_number: string;
          receipt_number: string | null;
        };
      };
      get_dashboard_stats: {
        Args: {
          p_gym_id: string;
        };
        Returns: {
          total: number;
          active: number;
          expiring: number;
          dues: number;
          new_this_month: number;
        };
      };
      record_payment_with_receipt: {
        Args: {
          p_gym_id: string;
          p_member_id: string;
          p_invoice_id: string | null;
          p_amount: number;
          p_payment_method: "cash" | "upi" | "card" | "bank_transfer";
          p_notes?: string;
        };
        Returns: {
          payment_id: string;
          receipt_number: string;
        };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Gym = Database["public"]["Tables"]["gyms"]["Row"];
export type Member = Database["public"]["Tables"]["members"]["Row"];
export type Plan = Database["public"]["Tables"]["plans"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Attendance = Database["public"]["Tables"]["attendance"]["Row"];
export type Reminder = Database["public"]["Tables"]["reminders"]["Row"];
export type MemberStatus = Database["public"]["Views"]["v_member_status"]["Row"];
export type DashboardStats = Database["public"]["Functions"]["get_dashboard_stats"]["Returns"];
export type MembershipSaleResult = Database["public"]["Functions"]["create_membership_sale"]["Returns"];
export type SubscriptionSaleResult = Database["public"]["Functions"]["add_subscription_with_invoice"]["Returns"];
export type PaymentReceiptResult = Database["public"]["Functions"]["record_payment_with_receipt"]["Returns"];
