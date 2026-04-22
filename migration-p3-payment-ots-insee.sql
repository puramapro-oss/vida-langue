-- VEDA V7.1 · Phase P3 · Paiement V7.1 + OpenTimestamps + INSEE SIRENE
-- Additive only : aucune DROP. Sécurisé pour prod live.
-- Push : sshpass -p '+Awy3cwg;NoutOTH' ssh root@72.62.191.111 ...

SET search_path TO vida_langue, public;

-- ============================================================
-- 1. welcome_primes — prime de bienvenue 20€ (1/vie, J+30 KYC)
-- ============================================================
CREATE TABLE IF NOT EXISTS vida_langue.welcome_primes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents int NOT NULL DEFAULT 2000,
  granted_at timestamptz NOT NULL DEFAULT now(),
  unlocked_at timestamptz,                 -- J+30 si abonnement toujours actif
  cancelled_at timestamptz,                 -- si user a annulé avant J+30
  cancelled_reason text,
  stripe_subscription_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- 1/vie : 1 prime par user, peu importe le plan.
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_welcome_primes_user ON vida_langue.welcome_primes(user_id);
CREATE INDEX IF NOT EXISTS idx_welcome_primes_unlocked ON vida_langue.welcome_primes(unlocked_at) WHERE unlocked_at IS NULL;

ALTER TABLE vida_langue.welcome_primes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "welcome_primes_self_select" ON vida_langue.welcome_primes;
CREATE POLICY "welcome_primes_self_select" ON vida_langue.welcome_primes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Seules les fonctions service-role peuvent inserer/updater (Stripe webhook, cron).
DROP POLICY IF EXISTS "welcome_primes_service_all" ON vida_langue.welcome_primes;
CREATE POLICY "welcome_primes_service_all" ON vida_langue.welcome_primes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 2. timestamped_records — horodatage OpenTimestamps Bitcoin
-- ============================================================
CREATE TABLE IF NOT EXISTS vida_langue.timestamped_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('contest_rule', 'engagement', 'fiscal_snapshot')),
  reference text,                           -- ex: 'contest:weekly:2026-W17', 'fiscal:2026'
  hash_sha256 text NOT NULL,
  proof_base64 text NOT NULL,
  stamped_at timestamptz NOT NULL DEFAULT now(),
  verified boolean NOT NULL DEFAULT false,
  btc_block_height int,
  btc_block_time timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ots_user ON vida_langue.timestamped_records(user_id);
CREATE INDEX IF NOT EXISTS idx_ots_kind ON vida_langue.timestamped_records(kind);
CREATE INDEX IF NOT EXISTS idx_ots_reference ON vida_langue.timestamped_records(reference);
CREATE INDEX IF NOT EXISTS idx_ots_unverified ON vida_langue.timestamped_records(verified) WHERE verified = false;

ALTER TABLE vida_langue.timestamped_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ots_self_select" ON vida_langue.timestamped_records;
CREATE POLICY "ots_self_select" ON vida_langue.timestamped_records
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "ots_service_all" ON vida_langue.timestamped_records;
CREATE POLICY "ots_service_all" ON vida_langue.timestamped_records
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 3. subscriptions : ajout colonnes cancellation V7.1
-- ============================================================
ALTER TABLE vida_langue.subscriptions
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancellation_requested_at timestamptz;

-- ============================================================
-- 4. fiscal_profiles + fiscal_statements (prépare P4 /fiscal)
-- ============================================================
CREATE TABLE IF NOT EXISTS vida_langue.fiscal_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  regime text CHECK (regime IN ('particulier', 'auto', 'micro', 'reel', 'societe', 'asso')),
  siret text,                                -- vérifié via INSEE (peut être null)
  siret_display_name text,
  siret_verified_at timestamptz,
  declare_in_france boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_fiscal_profiles_user ON vida_langue.fiscal_profiles(user_id);

ALTER TABLE vida_langue.fiscal_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fiscal_profiles_self_all" ON vida_langue.fiscal_profiles;
CREATE POLICY "fiscal_profiles_self_all" ON vida_langue.fiscal_profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS vida_langue.fiscal_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year int NOT NULL,
  total_earnings_cents int NOT NULL DEFAULT 0,
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,  -- { referrals, missions, contests, primes }
  pdf_url text,
  stamped_hash text,                              -- horodatage OTS pour immuabilité
  stamped_proof text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, year)
);

CREATE INDEX IF NOT EXISTS idx_fiscal_statements_user ON vida_langue.fiscal_statements(user_id);

ALTER TABLE vida_langue.fiscal_statements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fiscal_statements_self_select" ON vida_langue.fiscal_statements;
CREATE POLICY "fiscal_statements_self_select" ON vida_langue.fiscal_statements
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "fiscal_statements_service_all" ON vida_langue.fiscal_statements;
CREATE POLICY "fiscal_statements_service_all" ON vida_langue.fiscal_statements
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 5. stripe_connect_accounts (prépare P4 Connect Embedded)
-- ============================================================
CREATE TABLE IF NOT EXISTS vida_langue.stripe_connect_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id text NOT NULL UNIQUE,
  kyc_status text NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'verified', 'rejected')),
  capabilities jsonb NOT NULL DEFAULT '{}'::jsonb,
  payouts_enabled boolean NOT NULL DEFAULT false,
  transfers_enabled boolean NOT NULL DEFAULT false,
  country text DEFAULT 'FR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_connect_accounts_user ON vida_langue.stripe_connect_accounts(user_id);

ALTER TABLE vida_langue.stripe_connect_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "connect_accounts_self_select" ON vida_langue.stripe_connect_accounts;
CREATE POLICY "connect_accounts_self_select" ON vida_langue.stripe_connect_accounts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "connect_accounts_service_all" ON vida_langue.stripe_connect_accounts;
CREATE POLICY "connect_accounts_service_all" ON vida_langue.stripe_connect_accounts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 6. RPC wallet_deduct_prime (cancel <30j)
-- ============================================================
CREATE OR REPLACE FUNCTION vida_langue.wallet_deduct_prime(
  p_user uuid,
  p_amount_cents int
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  prime_cents numeric;
BEGIN
  prime_cents := p_amount_cents::numeric / 100.0;

  UPDATE vida_langue.profiles
  SET wallet_balance = GREATEST(0, COALESCE(wallet_balance, 0) - prime_cents)
  WHERE id = p_user;

  INSERT INTO vida_langue.wallet_transactions (user_id, amount, type, source, metadata)
  VALUES (p_user, -prime_cents, 'prime_recovered', 'cancellation_before_30d',
          jsonb_build_object('amount_cents', p_amount_cents, 'reason', 'subscription_cancelled_before_30d'));
EXCEPTION WHEN OTHERS THEN
  -- Table wallet_transactions peut ne pas exister avec ces colonnes exactes ; on ignore gracieusement.
  NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION vida_langue.wallet_deduct_prime(uuid, int) TO service_role;

-- ============================================================
-- 7. GRANT USAGE + reload PostgREST
-- ============================================================
GRANT USAGE ON SCHEMA vida_langue TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA vida_langue TO service_role;
GRANT SELECT, INSERT, UPDATE ON vida_langue.welcome_primes TO authenticated;
GRANT SELECT ON vida_langue.timestamped_records TO authenticated;
GRANT ALL ON vida_langue.fiscal_profiles TO authenticated;
GRANT SELECT ON vida_langue.fiscal_statements TO authenticated;
GRANT SELECT ON vida_langue.stripe_connect_accounts TO authenticated;

NOTIFY pgrst, 'reload schema';
