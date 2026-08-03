export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BilooUserRole =
  | "customer"
  | "driver"
  | "vendor_owner"
  | "vendor_staff"
  | "support"
  | "finance"
  | "admin";

export type BilooServiceType =
  | "food"
  | "taxi"
  | "market"
  | "construction"
  | "parts";

export type BilooOrderStatus =
  | "payment_pending"
  | "confirmed"
  | "vendor_accepted"
  | "preparing"
  | "ready_for_pickup"
  | "driver_assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled_by_customer"
  | "cancelled_by_vendor"
  | "cancelled_by_driver"
  | "failed"
  | "refunded";

type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type ProfileRow = {
  id: string;
  role: BilooUserRole;
  display_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  city: string;
  status: string;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AddressRow = {
  id: string;
  customer_id: string;
  label: string;
  formatted_address: string;
  latitude: number | null;
  longitude: number | null;
  delivery_note: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderRow = {
  id: string;
  public_id: string;
  customer_id: string;
  vendor_id: string | null;
  branch_id: string | null;
  service_type: BilooServiceType;
  status: BilooOrderStatus;
  title: string;
  delivery_address_id: string | null;
  subtotal_minor: number;
  delivery_fee_minor: number;
  service_fee_minor: number;
  discount_minor: number;
  total_minor: number;
  currency: string;
  payment_method: string;
  eta_minutes: number | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

export type NotificationRow = {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  channel: string;
  payload: Json;
  delivery_status: string;
  created_at: string;
  read_at: string | null;
};

export interface Database {
  public: {
    Tables: {
      biloo_profiles: Table<ProfileRow>;
      biloo_addresses: Table<AddressRow>;
      biloo_orders: Table<OrderRow>;
      biloo_notifications: Table<NotificationRow>;
      biloo_role_applications: Table<{
        id: string;
        user_id: string;
        requested_role: "driver" | "vendor_owner";
        status: "pending" | "approved" | "rejected";
        application_data: Json;
        notes: string | null;
        created_at: string;
        reviewed_at: string | null;
        reviewed_by: string | null;
      }>;
      biloo_products: Table<{
        id: string;
        external_id: string;
        vendor_id: string;
        branch_id: string | null;
        service_type: BilooServiceType;
        name: string;
        description: string | null;
        unit_price_minor: number;
        currency: string;
        stock_quantity: number | null;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      place_biloo_order: {
        Args: {
          p_items: Json;
          p_payment_method: string;
          p_delivery_address_id?: string | null;
        };
        Returns: string;
      };
      request_biloo_ride: {
        Args: {
          p_pickup: string;
          p_dropoff: string;
          p_ride_class: string;
        };
        Returns: string;
      };
      review_biloo_role_application: {
        Args: {
          p_application_id: string;
          p_status: "approved" | "rejected";
          p_notes?: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: {
      biloo_user_role: BilooUserRole;
      biloo_service_type: BilooServiceType;
      biloo_order_status: BilooOrderStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
