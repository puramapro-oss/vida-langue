-- VIDA LANGUE — Schema Supabase
-- Schema dédié : vida_langue (exposé dans PGRST_DB_SCHEMAS côté VPS)

CREATE SCHEMA IF NOT EXISTS vida_langue;
SET search_path TO vida_langue, public;

-- ────────────────────────────────────────────────────────────────────
-- AUTH & PROFILS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  pseudo TEXT UNIQUE,
  bio TEXT,

  -- Langues
  language_native TEXT DEFAULT 'fr',
  languages_learning TEXT[] DEFAULT '{}',
  level_per_language JSONB DEFAULT '{}',
  preferred_language TEXT DEFAULT 'fr',

  -- Gamification douce
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_title TEXT DEFAULT 'Graine',
  streak INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,

  -- Énergies Vida (4 monnaies)
  vida_energy INTEGER DEFAULT 100,
  impact_points INTEGER DEFAULT 0,
  light_points INTEGER DEFAULT 0,
  soul_tokens INTEGER DEFAULT 0,
  vida_credits INTEGER DEFAULT 0,
  cashback_points INTEGER DEFAULT 0,

  -- Parrainage
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES vida_langue.profiles(id) ON DELETE SET NULL,

  -- Abonnement (mirroir rapide, source de vérité = subscriptions)
  subscription_status TEXT DEFAULT 'free',
  subscription_plan TEXT DEFAULT 'free',
  trial_ends_at TIMESTAMPTZ,
  half_price_lifetime BOOLEAN DEFAULT false,

  -- Compat akasha-derived dashboard
  plan TEXT DEFAULT 'free',
  plan_tier TEXT DEFAULT 'essential',
  role TEXT DEFAULT 'user',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_use_case TEXT,
  onboarding_level TEXT,
  interests TEXT[] DEFAULT '{}',
  accent_color TEXT DEFAULT 'emerald',
  tutorial_completed BOOLEAN DEFAULT false,
  wallet_balance NUMERIC(10,2) DEFAULT 0,
  daily_questions INTEGER DEFAULT 0,
  credits INTEGER DEFAULT 0,

  -- Accessibilité & préférences
  accessibility_settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotence webhook Stripe : empeche un event redeliverre par Stripe/karma
-- de re-executer le handler (double-credit wallet/referral, cf task_plan.md P3).
CREATE TABLE IF NOT EXISTS vida_langue.stripe_events (
  event_id TEXT PRIMARY KEY,
  type TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON vida_langue.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_referral ON vida_langue.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe ON vida_langue.profiles(stripe_customer_id);

CREATE TABLE IF NOT EXISTS vida_langue.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE UNIQUE,
  notification_mode TEXT DEFAULT 'zen' CHECK (notification_mode IN ('zen','focus','deep','silent','custom')),
  theme TEXT DEFAULT 'dark',
  font_size TEXT DEFAULT 'medium',
  haptic_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  accessibility_mode JSONB DEFAULT '{}',
  quiet_hours JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────
-- ABONNEMENTS & PAIEMENTS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  plan TEXT CHECK (plan IN ('monthly','yearly','half_price_lifetime')),
  status TEXT CHECK (status IN ('trial','active','paused','half_price_lifetime','cancelled')) DEFAULT 'trial',
  price_cents INTEGER NOT NULL,
  discount_percent INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  trial_ends_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  pause_reason TEXT,
  stripe_subscription_id TEXT,
  paypal_subscription_id TEXT,
  apple_transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subs_user ON vida_langue.subscriptions(user_id);

CREATE TABLE IF NOT EXISTS vida_langue.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'EUR',
  type TEXT CHECK (type IN ('subscription','product','donation','commission','redistribution')),
  provider TEXT CHECK (provider IN ('stripe','paypal','apple','internal')),
  stripe_payment_id TEXT,
  paypal_order_id TEXT,
  status TEXT DEFAULT 'completed',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  number TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'paid',
  pdf_url TEXT,
  issued_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  rewards_granted JSONB DEFAULT '{}',
  contest_entries_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────
-- PARRAINAGE & INFLUENCEURS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending','subscribed','churned')) DEFAULT 'pending',
  referrer_earning_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

CREATE TABLE IF NOT EXISTS vida_langue.influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE UNIQUE,
  promo_code TEXT UNIQUE,
  promo_link TEXT,
  promo_expires_at TIMESTAMPTZ,
  commission_first_percent INTEGER DEFAULT 50,
  commission_recurring_percent INTEGER DEFAULT 10,
  total_earned_cents INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  bio TEXT,
  social_links JSONB DEFAULT '{}',
  tier TEXT DEFAULT 'bronze',
  kit_downloaded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.influencer_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES vida_langue.influencers(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES vida_langue.profiles(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES vida_langue.subscriptions(id) ON DELETE SET NULL,
  commission_cents INTEGER NOT NULL,
  recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────
-- APPRENTISSAGE
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  mode TEXT CHECK (mode IN ('neuroflow','holotalk','phonetic','sleep','hypno','reality','group','spiritual')),
  duration_seconds INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  words_learned INTEGER DEFAULT 0,
  fluency_score NUMERIC(5,2),
  flow_state_percent NUMERIC(5,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON vida_langue.sessions(user_id);

CREATE TABLE IF NOT EXISTS vida_langue.vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  word TEXT NOT NULL,
  phonetic_vida TEXT,
  translation TEXT,
  familiarity_score INTEGER DEFAULT 0 CHECK (familiarity_score BETWEEN 0 AND 100),
  last_seen TIMESTAMPTZ,
  next_review TIMESTAMPTZ,
  times_correct INTEGER DEFAULT 0,
  times_wrong INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, language, word)
);

CREATE INDEX IF NOT EXISTS idx_vocab_user_lang ON vida_langue.vocabulary(user_id, language);

CREATE TABLE IF NOT EXISTS vida_langue.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES vida_langue.sessions(id) ON DELETE SET NULL,
  ai_persona TEXT CHECK (ai_persona IN ('friend','colleague','coach','vendor','boss','client','flirt','default')) DEFAULT 'default',
  language TEXT,
  title TEXT,
  model TEXT DEFAULT 'vida-main',
  messages JSONB DEFAULT '[]',
  corrections JSONB DEFAULT '[]',
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES vida_langue.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  model TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  fluency_percent NUMERIC(5,2) DEFAULT 0,
  words_known INTEGER DEFAULT 0,
  hours_spoken NUMERIC(8,2) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  phonetic_graduation TEXT CHECK (phonetic_graduation IN ('full_phonetic','mix','native')) DEFAULT 'full_phonetic',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, language)
);

-- ────────────────────────────────────────────────────────────────────
-- MISSIONS & IMPACT
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('solo','duo','group','humanitarian','promo','ecological','spiritual')),
  reward_type TEXT CHECK (reward_type IN ('vida_credits','contest_entries','products','cashback','light_points','euros')),
  reward_value INTEGER DEFAULT 0,
  language TEXT,
  difficulty TEXT DEFAULT 'easy',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES vida_langue.missions(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending','in_progress','completed','verified')) DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  impact_generated JSONB DEFAULT '{}',
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.impact_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  impact_type TEXT CHECK (impact_type IN ('ecological','human','social','wellbeing')),
  impact_value NUMERIC(12,2),
  equivalent_text TEXT,
  location_lat NUMERIC(9,6),
  location_lng NUMERIC(9,6),
  partner_org TEXT,
  proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_impact_user ON vida_langue.impact_log(user_id);

-- ────────────────────────────────────────────────────────────────────
-- FIL DE VIE & GAMIFICATION
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.life_thread (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE UNIQUE,
  total_actions INTEGER DEFAULT 0,
  total_impact JSONB DEFAULT '{}',
  active_days INTEGER DEFAULT 0,
  pause_periods JSONB DEFAULT '[]',
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────
-- GAINS & REDISTRIBUTION
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.user_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  source TEXT CHECK (source IN ('mission','referral','cashback','redistribution','contest','influencer')),
  amount_cents INTEGER DEFAULT 0,
  vida_credits INTEGER DEFAULT 0,
  contest_entries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────
-- JEUX CONCOURS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('weekly','monthly','yearly','special')),
  prizes JSONB DEFAULT '[]',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  contest_id UUID REFERENCES vida_langue.contests(id) ON DELETE CASCADE,
  entries_count INTEGER DEFAULT 1,
  source TEXT CHECK (source IN ('usage','subscription','purchase','mission','referral')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.contest_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES vida_langue.contests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  prize TEXT,
  rank INTEGER,
  announced_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────
-- RITUEL HEBDOMADAIRE
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.weekly_rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme TEXT CHECK (theme IN ('depollution','peace','love','forgiveness','gratitude','abundance')),
  date DATE UNIQUE,
  participants_count INTEGER DEFAULT 0,
  impact JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────
-- SOCIAL
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  language TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES vida_langue.social_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────
-- PUB INTERNE
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.internal_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  target_audience JSONB DEFAULT '{}',
  budget_cents INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────
-- NEWSLETTER & PRODUITS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE SET NULL,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT -1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE UNIQUE,
  mode TEXT CHECK (mode IN ('zen','focus','deep','silent','custom')) DEFAULT 'zen',
  frequency TEXT DEFAULT 'normal',
  quiet_hours JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────
-- SUPPORT / FAQ / CONTACT
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  responded BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS vida_langue.faq_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT,
  question TEXT,
  answer TEXT,
  search_keywords TEXT,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  iban TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending','processing','completed','rejected')) DEFAULT 'pending',
  notes TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON vida_langue.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON vida_langue.withdrawals(status);

-- ────────────────────────────────────────────────────────────────────
-- TRIGGERS : auto-profile + updated_at
-- ────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION vida_langue.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_code TEXT;
BEGIN
  v_code := upper(substring(md5(NEW.id::text || clock_timestamp()::text) from 1 for 8));
  INSERT INTO vida_langue.profiles (
    id, email, display_name, referral_code, trial_ends_at,
    subscription_status, subscription_plan
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    v_code,
    now() + interval '14 days',
    'trial',
    'trial'
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO vida_langue.user_preferences (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO vida_langue.life_thread (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO vida_langue.streaks (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_vida_langue ON auth.users;
CREATE TRIGGER on_auth_user_created_vida_langue
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION vida_langue.handle_new_user();

CREATE OR REPLACE FUNCTION vida_langue.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_touch ON vida_langue.profiles;
CREATE TRIGGER trg_profiles_touch BEFORE UPDATE ON vida_langue.profiles
  FOR EACH ROW EXECUTE FUNCTION vida_langue.touch_updated_at();

DROP TRIGGER IF EXISTS trg_subs_touch ON vida_langue.subscriptions;
CREATE TRIGGER trg_subs_touch BEFORE UPDATE ON vida_langue.subscriptions
  FOR EACH ROW EXECUTE FUNCTION vida_langue.touch_updated_at();

-- ────────────────────────────────────────────────────────────────────
-- RLS : activation sur toutes les tables
-- ────────────────────────────────────────────────────────────────────

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'vida_langue'
  LOOP
    EXECUTE format('ALTER TABLE vida_langue.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- Policies : self-access pour les tables user_id
DO $$
BEGIN
  -- profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='profiles' AND policyname='profiles_self_select') THEN
    CREATE POLICY profiles_self_select ON vida_langue.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='profiles' AND policyname='profiles_self_update') THEN
    CREATE POLICY profiles_self_update ON vida_langue.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='profiles' AND policyname='profiles_self_insert') THEN
    CREATE POLICY profiles_self_insert ON vida_langue.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  -- user_preferences
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='user_preferences' AND policyname='prefs_self') THEN
    CREATE POLICY prefs_self ON vida_langue.user_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  -- subscriptions (lecture self)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='subscriptions' AND policyname='subs_self_select') THEN
    CREATE POLICY subs_self_select ON vida_langue.subscriptions FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- sessions / vocabulary / conversations / messages / user_progress
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='sessions' AND policyname='sessions_self') THEN
    CREATE POLICY sessions_self ON vida_langue.sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='vocabulary' AND policyname='vocab_self') THEN
    CREATE POLICY vocab_self ON vida_langue.vocabulary FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='conversations' AND policyname='conv_self') THEN
    CREATE POLICY conv_self ON vida_langue.conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='messages' AND policyname='msg_self') THEN
    CREATE POLICY msg_self ON vida_langue.messages FOR ALL USING (
      EXISTS (SELECT 1 FROM vida_langue.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='user_progress' AND policyname='progress_self') THEN
    CREATE POLICY progress_self ON vida_langue.user_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  -- missions : lecture publique
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='missions' AND policyname='missions_public_read') THEN
    CREATE POLICY missions_public_read ON vida_langue.missions FOR SELECT USING (active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='user_missions' AND policyname='um_self') THEN
    CREATE POLICY um_self ON vida_langue.user_missions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='impact_log' AND policyname='impact_self') THEN
    CREATE POLICY impact_self ON vida_langue.impact_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  -- life_thread / achievements / streaks
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='life_thread' AND policyname='lt_self') THEN
    CREATE POLICY lt_self ON vida_langue.life_thread FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='achievements' AND policyname='ach_self') THEN
    CREATE POLICY ach_self ON vida_langue.achievements FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='streaks' AND policyname='str_self') THEN
    CREATE POLICY str_self ON vida_langue.streaks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  -- earnings / referrals
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='user_earnings' AND policyname='earn_self') THEN
    CREATE POLICY earn_self ON vida_langue.user_earnings FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='referrals' AND policyname='ref_select') THEN
    CREATE POLICY ref_select ON vida_langue.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
  END IF;

  -- contests : public read
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='contests' AND policyname='contests_public') THEN
    CREATE POLICY contests_public ON vida_langue.contests FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='contest_entries' AND policyname='entries_self') THEN
    CREATE POLICY entries_self ON vida_langue.contest_entries FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='contest_winners' AND policyname='winners_public') THEN
    CREATE POLICY winners_public ON vida_langue.contest_winners FOR SELECT USING (true);
  END IF;

  -- social : lecture publique, écriture self
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='social_posts' AND policyname='posts_public_read') THEN
    CREATE POLICY posts_public_read ON vida_langue.social_posts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='social_posts' AND policyname='posts_self_write') THEN
    CREATE POLICY posts_self_write ON vida_langue.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='social_comments' AND policyname='comments_public_read') THEN
    CREATE POLICY comments_public_read ON vida_langue.social_comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='social_comments' AND policyname='comments_self_write') THEN
    CREATE POLICY comments_self_write ON vida_langue.social_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- notifications self
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='notifications' AND policyname='notif_self') THEN
    CREATE POLICY notif_self ON vida_langue.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='notification_settings' AND policyname='nset_self') THEN
    CREATE POLICY nset_self ON vida_langue.notification_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  -- weekly_rituals public read
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='weekly_rituals' AND policyname='rituals_public') THEN
    CREATE POLICY rituals_public ON vida_langue.weekly_rituals FOR SELECT USING (true);
  END IF;

  -- products public read
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='products' AND policyname='products_public') THEN
    CREATE POLICY products_public ON vida_langue.products FOR SELECT USING (active = true);
  END IF;

  -- faq public read
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='faq_articles' AND policyname='faq_public') THEN
    CREATE POLICY faq_public ON vida_langue.faq_articles FOR SELECT USING (true);
  END IF;

  -- influencers self
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='influencers' AND policyname='inf_self') THEN
    CREATE POLICY inf_self ON vida_langue.influencers FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='influencer_sales' AND policyname='is_self') THEN
    CREATE POLICY is_self ON vida_langue.influencer_sales FOR SELECT USING (
      EXISTS (SELECT 1 FROM vida_langue.influencers i WHERE i.id = influencer_id AND i.user_id = auth.uid())
    );
  END IF;

  -- invoices / payments / donations self
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='invoices' AND policyname='inv_self') THEN
    CREATE POLICY inv_self ON vida_langue.invoices FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='payments' AND policyname='pay_self') THEN
    CREATE POLICY pay_self ON vida_langue.payments FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='donations' AND policyname='don_self') THEN
    CREATE POLICY don_self ON vida_langue.donations FOR SELECT USING (auth.uid() = user_id);
  END IF;
  -- withdrawals : self read + insert
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='withdrawals' AND policyname='wd_self_select') THEN
    CREATE POLICY wd_self_select ON vida_langue.withdrawals FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='withdrawals' AND policyname='wd_self_insert') THEN
    CREATE POLICY wd_self_insert ON vida_langue.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- internal_ads self (advertiser)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='internal_ads' AND policyname='ads_self') THEN
    CREATE POLICY ads_self ON vida_langue.internal_ads FOR ALL USING (auth.uid() = advertiser_user_id) WITH CHECK (auth.uid() = advertiser_user_id);
  END IF;

  -- contact_messages self write
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='contact_messages' AND policyname='contact_insert_any') THEN
    CREATE POLICY contact_insert_any ON vida_langue.contact_messages FOR INSERT WITH CHECK (true);
  END IF;

  -- newsletter public insert
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='vida_langue' AND tablename='newsletter_subscribers' AND policyname='news_public_insert') THEN
    CREATE POLICY news_public_insert ON vida_langue.newsletter_subscribers FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────
-- SEED
-- ────────────────────────────────────────────────────────────────────

INSERT INTO vida_langue.missions (title, description, type, reward_type, reward_value, language, difficulty) VALUES
  ('Première session NeuroFlow', 'Termine une session de 20 minutes pour activer ton cerveau.', 'solo', 'vida_credits', 50, 'en', 'easy'),
  ('10 mots en HoloTalk', 'Parle avec un personnage Vida et utilise 10 nouveaux mots.', 'solo', 'vida_credits', 30, 'en', 'easy'),
  ('Partage ton évolution', 'Poste une story de ta progression sur TikTok ou Instagram.', 'promo', 'vida_credits', 100, 'fr', 'easy'),
  ('Note Vida Langue', 'Laisse une note 5 étoiles sur l''App Store ou Play Store.', 'promo', 'vida_credits', 200, 'fr', 'easy'),
  ('Méditation gratitude', 'Écris 3 gratitudes du jour dans ta langue cible.', 'spiritual', 'light_points', 20, 'en', 'easy'),
  ('Rencontre en vrai', 'Rencontre une personne et parle 5 minutes dans ta langue cible.', 'group', 'vida_credits', 500, 'en', 'medium')
ON CONFLICT DO NOTHING;

INSERT INTO vida_langue.contests (title, description, type, start_date, end_date, status) VALUES
  ('Défi hebdo Vida', 'Progresse cette semaine et gagne des produits Vida + argent réel.', 'weekly', now(), now() + interval '7 days', 'live'),
  ('Grand concours mensuel', 'Les 10 plus grands progrès du mois se partagent la cagnotte.', 'monthly', date_trunc('month', now()), (date_trunc('month', now()) + interval '1 month') - interval '1 day', 'live')
ON CONFLICT DO NOTHING;

INSERT INTO vida_langue.weekly_rituals (theme, date, participants_count) VALUES
  ('gratitude', CURRENT_DATE, 0)
ON CONFLICT (date) DO NOTHING;

-- Super admin seed
INSERT INTO vida_langue.profiles (id, email, display_name, role, subscription_status, subscription_plan, plan, plan_tier, trial_ends_at)
SELECT u.id, u.email, 'Matiss', 'super_admin', 'active', 'yearly', 'complete', 'max', now() + interval '365 days'
FROM auth.users u WHERE u.email = 'matiss.frasne@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin', plan = 'complete', plan_tier = 'max';

-- FAQ Vida (15 articles)
INSERT INTO vida_langue.faq_articles (category, question, answer, search_keywords) VALUES
  ('apprentissage', 'Comment Vida Langue m''aide à apprendre une langue ?', 'Vida Langue combine 8 modes uniques (Natif Instinct, HoloTalk, NeuroFlow…) qui activent ton cerveau comme celui d''un natif. Tu apprends en parlant, en écoutant et en répétant — pas en mémorisant des listes. Le système de répétition espacée garde tes mots vivants : tu revois chaque mot juste avant de l''oublier.', 'apprendre langue methode immersion'),
  ('apprentissage', 'Combien de temps par jour pour progresser ?', '15 minutes par jour suffisent pour voir des résultats en 2 semaines. La clé c''est la régularité, pas la durée. Vida t''envoie un rappel doux à l''heure que tu choisis et garde ton streak vivant. Si tu as plus de temps, fais une session HoloTalk de 10 minutes — tu progresseras 3× plus vite.', 'temps duree quotidien minutes regularite streak'),
  ('apprentissage', 'Quelles langues puis-je apprendre ?', 'Vida Langue gère 16 langues : français, anglais, espagnol, allemand, italien, portugais, arabe, chinois, japonais, coréen, hindi, russe, turc, néerlandais, polonais, suédois. Tu peux apprendre plusieurs langues en parallèle — ton fil de vie suit les progrès de chacune séparément.', 'langues disponibles anglais espagnol arabe chinois japonais'),
  ('modes', 'À quoi servent les 8 modes ?', 'Chaque mode active une zone du cerveau différente. Natif Instinct → phonétique. HoloTalk → conversation. NeuroFlow → flow d''apprentissage profond. Sleep → mémorisation passive. Hypno → blocages. Reality → immersion AR. Group → communauté. Spiritual → connexion à la culture. Tu n''es pas obligé de tous les utiliser — commence par 2.', 'modes natif instinct holotalk neuroflow sleep hypno reality group spiritual'),
  ('phonetique', 'Qu''est-ce que Natif Instinct ?', 'Natif Instinct est notre méthode signature : pour chaque mot, tu vois 3 couches superposées — l''écriture réelle, la prononciation phonétique vraie (IPA), et une version "francisée" qui te montre comment dire le mot en utilisant des sons que tu connais déjà. Tu obtiens un accent natif en 30 jours.', 'phonetique natif instinct prononciation accent ipa'),
  ('phonetique', 'Mon micro ne marche pas en mode Natif Instinct', 'Vérifie que ton navigateur a bien la permission micro (cadenas dans la barre d''adresse → autoriser le microphone). Sur iPhone, Safari demande la permission à chaque session — c''est normal. Si ça ne marche toujours pas, recharge la page. La reconnaissance vocale fonctionne hors-ligne sur Chrome, Edge et Safari.', 'micro microphone permission reconnaissance vocale speech'),
  ('modes', 'HoloTalk : qui sont les 6 personas ?', 'Tu choisis avec qui tu parles : un local du pays (situations du quotidien), un expert (vocabulaire pro), un ami (langage familier), un prof (corrige tes erreurs), un voyageur (mots de voyage), un philosophe (discussions profondes). Chaque persona a sa voix et son style. Active ton micro et lance-toi.', 'holotalk persona conversation chat ia local expert ami prof voyageur'),
  ('abonnement', 'Combien coûte Vida Langue ?', 'Trois offres : Mensuel 12,90 €/mois, Annuel 108 €/an (-30 %, soit 9 €/mois), Moitié prix à vie 6,45 €/mois (uniquement si tu hésites à te désabonner). Les deux premières incluent 14 jours d''essai gratuit. Tu peux annuler à tout moment depuis ton wallet ou ton portail Stripe.', 'prix tarif abonnement mensuel annuel cout offre essai'),
  ('abonnement', 'Comment annuler mon abonnement ?', 'Va dans /dashboard/wallet et clique "Gérer mon abonnement" — tu arrives sur le portail Stripe officiel où tu peux annuler en 1 clic. Ton accès reste actif jusqu''à la fin de la période payée. Tu gardes tout ton fil de vie et ton vocabulaire si tu reviens plus tard.', 'annuler resilier desabonnement portail stripe wallet'),
  ('abonnement', 'L''essai 14 jours est-il vraiment gratuit ?', 'Oui, 100 % gratuit. Tu donnes ton moyen de paiement à l''inscription, mais aucun centime n''est prélevé pendant 14 jours. Tu reçois un email de rappel à J-3 — si tu annules avant la fin, tu ne payes rien. Si tu continues, le mensuel commence à 12,90 €.', 'essai gratuit trial 14 jours paiement carte'),
  ('parrainage', 'Comment fonctionne le parrainage ?', 'Tu obtiens un lien unique /go/[ton-code]. Chaque personne qui s''inscrit via ton lien et passe à l''abonnement payant te rapporte 50 % de son premier paiement (6,45 € pour un mensuel, 54 € pour un annuel). Les gains arrivent direct sur ton wallet, retrait IBAN dès 5 €.', 'parrainage referral filleul commission gain wallet'),
  ('parrainage', 'Quels sont les paliers de parrainage ?', '7 paliers : Graine (1 filleul) → Pousse (3) → Bourgeon (5) → Fleur (10) → Fruit (25) → Arbre (50) → Légende (100). Chaque palier débloque des récompenses bonus (mois gratuits, accès premium, badge). Ton tier monte automatiquement quand tes filleuls s''abonnent.', 'palier tier graine pousse bourgeon fleur fruit arbre legende parrainage'),
  ('wallet', 'Comment retirer mes gains ?', 'Va dans /dashboard/wallet, clique "Retirer", entre ton IBAN et le montant (minimum 5 €). Le virement arrive sur ton compte sous 48h ouvrées. Aucuns frais. Tu peux retirer autant de fois que tu veux, dès que ton solde dépasse 5 €.', 'retrait retirer wallet iban virement gains argent'),
  ('impact', 'Qu''est-ce que l''impact Vida ?', 'Chaque action que tu fais sur Vida (session, mission, vocabulaire) génère un impact réel mesuré sur 4 dimensions : écologique (arbres plantés, CO₂ évité), humain (heures d''aide à d''autres apprenants), social (nouvelles connexions), bien-être (minutes de calme). Tu vois ton impact cumulé dans /dashboard/impact.', 'impact ecologie ecologique arbres co2 dimensions humain social bien etre'),
  ('compte', 'Je n''arrive pas à me connecter', 'Vérifie d''abord ton email et ton mot de passe (sans espace). Si tu as oublié, clique "Mot de passe oublié" sur la page de connexion — tu reçois un lien par email. Si tu utilises Google, vérifie que tu es bien sur le bon compte. Toujours bloqué ? Contacte-nous via /contact, on te répond en moins de 24h.', 'connexion login mot de passe oublie google probleme acces')
ON CONFLICT DO NOTHING;
