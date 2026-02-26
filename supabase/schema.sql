-- ============================================
-- SilverFit Insurance Products Schema
-- ============================================

-- 보험 상품 테이블
CREATE TABLE insurance_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source          TEXT NOT NULL CHECK (source IN ('fss_api', 'manual')),
  product_code    TEXT,
  company         TEXT NOT NULL,
  product_name    TEXT NOT NULL,
  insurance_type  TEXT NOT NULL CHECK (insurance_type IN ('care', 'dementia', 'medical', 'pension')),
  contract_type   TEXT CHECK (contract_type IN ('renewal', 'non_renewal')),
  premium_65m     INTEGER,
  premium_65f     INTEGER,
  payment_period  TEXT,
  min_age         INTEGER,
  max_age         INTEGER,
  coverage        JSONB,
  conditions      TEXT,
  source_url      TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  -- FSS 연금 전용 필드
  avg_prft_rate     NUMERIC(6,2),
  dcls_rate         NUMERIC(6,2),
  guar_rate         TEXT,
  btrm_prft_rate_1  NUMERIC(6,2),
  btrm_prft_rate_2  NUMERIC(6,2),
  btrm_prft_rate_3  NUMERIC(6,2),
  sale_start_day    TEXT,
  mntn_cnt          INTEGER,
  join_way          TEXT,
  pnsn_kind_nm      TEXT,
  prdt_type_nm      TEXT,
  etc               TEXT
);

-- 연금 옵션 테이블 (시뮬레이터용)
CREATE TABLE insurance_options (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        UUID NOT NULL REFERENCES insurance_products(id) ON DELETE CASCADE,
  entry_age         TEXT,
  entry_age_nm      TEXT,
  start_age         TEXT,
  start_age_nm      TEXT,
  monthly_payment   TEXT,
  monthly_payment_nm TEXT,
  payment_period    TEXT,
  payment_period_nm TEXT,
  receipt_term      TEXT,
  receipt_term_nm   TEXT,
  receipt_amount    NUMERIC(12,0)
);

-- 업데이트 이력 테이블
CREATE TABLE insurance_update_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  updated_by  TEXT,
  change_type TEXT CHECK (change_type IN ('add', 'update', 'deactivate')),
  product_id  UUID REFERENCES insurance_products(id) ON DELETE SET NULL,
  note        TEXT
);

-- 인덱스
CREATE INDEX idx_products_type ON insurance_products(insurance_type) WHERE is_active = true;
CREATE INDEX idx_products_company ON insurance_products(company) WHERE is_active = true;
CREATE INDEX idx_products_source ON insurance_products(source);
CREATE INDEX idx_options_product ON insurance_options(product_id);
CREATE INDEX idx_logs_product ON insurance_update_logs(product_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON insurance_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security) - 읽기 공개, 쓰기 제한
ALTER TABLE insurance_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_update_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON insurance_products
  FOR SELECT USING (true);

CREATE POLICY "Public read options" ON insurance_options
  FOR SELECT USING (true);

CREATE POLICY "Public read logs" ON insurance_update_logs
  FOR SELECT USING (true);
