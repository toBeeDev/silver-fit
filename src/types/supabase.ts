export type InsuranceType = "care" | "dementia" | "medical" | "pension";
export type ContractType = "renewal" | "non_renewal";
export type DataSource = "fss_api" | "manual";
export type ChangeType = "add" | "update" | "deactivate";

export interface InsuranceProductRow {
  id: string;
  source: DataSource;
  product_code: string | null;
  company: string;
  product_name: string;
  insurance_type: InsuranceType;
  contract_type: ContractType | null;
  premium_65m: number | null;
  premium_65f: number | null;
  payment_period: string | null;
  min_age: number | null;
  max_age: number | null;
  coverage: Record<string, unknown> | null;
  conditions: string | null;
  source_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // FSS pension 전용 필드
  avg_prft_rate: number | null;
  dcls_rate: number | null;
  guar_rate: string | null;
  btrm_prft_rate_1: number | null;
  btrm_prft_rate_2: number | null;
  btrm_prft_rate_3: number | null;
  sale_start_day: string | null;
  mntn_cnt: number | null;
  join_way: string | null;
  pnsn_kind_nm: string | null;
  prdt_type_nm: string | null;
  etc: string | null;
}

export interface InsuranceOptionRow {
  id: string;
  product_id: string;
  entry_age: string | null;
  entry_age_nm: string | null;
  start_age: string | null;
  start_age_nm: string | null;
  monthly_payment: string | null;
  monthly_payment_nm: string | null;
  payment_period: string | null;
  payment_period_nm: string | null;
  receipt_term: string | null;
  receipt_term_nm: string | null;
  receipt_amount: number | null;
}

export interface UpdateLogRow {
  id: string;
  updated_at: string;
  updated_by: string | null;
  change_type: ChangeType;
  product_id: string | null;
  note: string | null;
}

export interface Database {
  public: {
    Tables: {
      insurance_products: {
        Row: InsuranceProductRow;
        Insert: Omit<InsuranceProductRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<InsuranceProductRow, "id" | "created_at">>;
      };
      insurance_options: {
        Row: InsuranceOptionRow;
        Insert: Omit<InsuranceOptionRow, "id">;
        Update: Partial<Omit<InsuranceOptionRow, "id">>;
      };
      insurance_update_logs: {
        Row: UpdateLogRow;
        Insert: Omit<UpdateLogRow, "id" | "updated_at">;
        Update: Partial<Omit<UpdateLogRow, "id" | "updated_at">>;
      };
    };
  };
}
