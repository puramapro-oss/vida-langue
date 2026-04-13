-- VIDA LANGUE — Migration Phase A : Spirituel + Financer + Points
-- Tables : aides, affirmations, awakening_events, gratitude_entries,
--          intentions, breath_sessions, purama_points, point_transactions,
--          point_shop_items, point_purchases, support_escalations
-- ALTER profiles : awakening_level, affirmations_seen, purama_points

SET search_path TO vida_langue, public;

-- ────────────────────────────────────────────────────────────────────
-- ALTER PROFILES : colonnes spirituelles + points
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE vida_langue.profiles
  ADD COLUMN IF NOT EXISTS awakening_level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS affirmations_seen INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS purama_points INTEGER DEFAULT 0;

-- ────────────────────────────────────────────────────────────────────
-- AFFIRMATIONS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.affirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT CHECK (category IN ('love','power','abundance','health','wisdom','gratitude')) NOT NULL,
  text_fr TEXT NOT NULL,
  text_en TEXT NOT NULL,
  frequency_weight INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────
-- AWAKENING EVENTS (XP spirituel)
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.awakening_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  xp_gained INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_awakening_user ON vida_langue.awakening_events(user_id);

-- ────────────────────────────────────────────────────────────────────
-- GRATITUDE ENTRIES
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.gratitude_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tagged_user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gratitude_user ON vida_langue.gratitude_entries(user_id);

-- ────────────────────────────────────────────────────────────────────
-- INTENTIONS QUOTIDIENNES
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  fulfilled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_intentions_user ON vida_langue.intentions(user_id);

-- ────────────────────────────────────────────────────────────────────
-- BREATH SESSIONS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.breath_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  pattern TEXT CHECK (pattern IN ('coherence','relaxing','energizing')) NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  cycles_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_breath_user ON vida_langue.breath_sessions(user_id);

-- ────────────────────────────────────────────────────────────────────
-- PURAMA POINTS + TRANSACTIONS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.purama_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE UNIQUE,
  balance INTEGER DEFAULT 0,
  lifetime_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT CHECK (type IN ('earn','spend','convert')) NOT NULL,
  source TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pt_user ON vida_langue.point_transactions(user_id);

-- ────────────────────────────────────────────────────────────────────
-- BOUTIQUE POINTS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.point_shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT CHECK (category IN ('reduction','subscription','ticket','feature','cash')) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cost_points INTEGER NOT NULL,
  value_description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vida_langue.point_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES vida_langue.point_shop_items(id) ON DELETE SET NULL,
  points_spent INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pp_user ON vida_langue.point_purchases(user_id);

-- ────────────────────────────────────────────────────────────────────
-- SUPPORT ESCALATIONS (chatbot → email)
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.support_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES vida_langue.profiles(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  responded BOOLEAN DEFAULT false
);

-- ────────────────────────────────────────────────────────────────────
-- AIDES (module /financer)
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vida_langue.aides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  type_aide TEXT CHECK (type_aide IN ('formation','emploi','social','handicap','jeune','senior','reconversion','mobilite','numerique','culture','regional')) NOT NULL,
  profil_eligible TEXT[] DEFAULT '{}',
  situation_eligible TEXT[] DEFAULT '{}',
  montant_max INTEGER,
  url_officielle TEXT,
  description TEXT,
  region TEXT,
  handicap_only BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────
-- RLS sur les nouvelles tables
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE vida_langue.affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vida_langue.awakening_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE vida_langue.gratitude_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vida_langue.intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vida_langue.breath_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vida_langue.purama_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE vida_langue.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vida_langue.point_shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vida_langue.point_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE vida_langue.support_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vida_langue.aides ENABLE ROW LEVEL SECURITY;

-- Policies
-- affirmations : lecture publique
CREATE POLICY IF NOT EXISTS affirmations_public ON vida_langue.affirmations FOR SELECT USING (true);

-- awakening_events : self
CREATE POLICY IF NOT EXISTS awaken_self ON vida_langue.awakening_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- gratitude_entries : self
CREATE POLICY IF NOT EXISTS grat_self ON vida_langue.gratitude_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- intentions : self
CREATE POLICY IF NOT EXISTS int_self ON vida_langue.intentions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- breath_sessions : self
CREATE POLICY IF NOT EXISTS breath_self ON vida_langue.breath_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- purama_points : self
CREATE POLICY IF NOT EXISTS pp_self ON vida_langue.purama_points FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- point_transactions : self read
CREATE POLICY IF NOT EXISTS pt_self ON vida_langue.point_transactions FOR SELECT USING (auth.uid() = user_id);

-- point_shop_items : lecture publique
CREATE POLICY IF NOT EXISTS shop_public ON vida_langue.point_shop_items FOR SELECT USING (active = true);

-- point_purchases : self
CREATE POLICY IF NOT EXISTS purch_self ON vida_langue.point_purchases FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- support_escalations : self insert
CREATE POLICY IF NOT EXISTS esc_self_insert ON vida_langue.support_escalations FOR INSERT WITH CHECK (true);

-- aides : lecture publique
CREATE POLICY IF NOT EXISTS aides_public ON vida_langue.aides FOR SELECT USING (active = true);

-- ────────────────────────────────────────────────────────────────────
-- GRANTS
-- ────────────────────────────────────────────────────────────────────

GRANT ALL ON ALL TABLES IN SCHEMA vida_langue TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA vida_langue TO postgres, anon, authenticated, service_role;

-- ────────────────────────────────────────────────────────────────────
-- SEED : 30 affirmations
-- ────────────────────────────────────────────────────────────────────

INSERT INTO vida_langue.affirmations (category, text_fr, text_en) VALUES
  ('power', 'Chaque mot que je prononce me rapproche de la fluidite.', 'Every word I speak brings me closer to fluency.'),
  ('power', 'Ma voix porte la force de toutes les langues que j''apprends.', 'My voice carries the strength of every language I learn.'),
  ('power', 'Je suis capable de maitriser n''importe quelle langue.', 'I am capable of mastering any language.'),
  ('power', 'Mon cerveau est une machine a apprendre, chaque jour plus performante.', 'My brain is a learning machine, improving every day.'),
  ('power', 'Les erreurs sont mes meilleurs professeurs.', 'Mistakes are my best teachers.'),
  ('wisdom', 'Apprendre une langue, c''est ouvrir une porte vers un nouveau monde.', 'Learning a language is opening a door to a new world.'),
  ('wisdom', 'Chaque culture que je decouvre enrichit ma vision du monde.', 'Every culture I discover enriches my worldview.'),
  ('wisdom', 'La patience est la cle de tout apprentissage profond.', 'Patience is the key to all deep learning.'),
  ('wisdom', 'Je ne traduis pas, je pense dans une nouvelle langue.', 'I don''t translate, I think in a new language.'),
  ('wisdom', 'Comprendre une langue, c''est comprendre une ame.', 'Understanding a language is understanding a soul.'),
  ('abundance', 'Parler plusieurs langues multiplie mes opportunites.', 'Speaking multiple languages multiplies my opportunities.'),
  ('abundance', 'Chaque langue est un tresor que je porte en moi.', 'Every language is a treasure I carry within me.'),
  ('abundance', 'Mon investissement dans les langues me revient au centuple.', 'My investment in languages returns a hundredfold.'),
  ('abundance', 'Les connexions humaines sont ma plus grande richesse.', 'Human connections are my greatest wealth.'),
  ('abundance', 'Je cree de la valeur a chaque conversation.', 'I create value with every conversation.'),
  ('love', 'Je m''aime assez pour m''offrir le don des langues.', 'I love myself enough to give myself the gift of languages.'),
  ('love', 'Chaque langue me connecte a des millions de coeurs.', 'Every language connects me to millions of hearts.'),
  ('love', 'Je parle avec amour, dans toutes les langues.', 'I speak with love, in every language.'),
  ('love', 'La bienveillance envers moi-meme accelere mon apprentissage.', 'Self-kindness accelerates my learning.'),
  ('love', 'Je celebre chaque petit progres avec gratitude.', 'I celebrate every small progress with gratitude.'),
  ('health', 'Apprendre des langues renforce mon cerveau chaque jour.', 'Learning languages strengthens my brain every day.'),
  ('health', 'Mon esprit est vif, agile et pret a absorber.', 'My mind is sharp, agile and ready to absorb.'),
  ('health', 'La concentration que je developpe me sert dans tous les domaines.', 'The focus I develop serves me in all areas.'),
  ('health', 'Je prends soin de mon cerveau en le nourrissant de nouvelles langues.', 'I take care of my brain by feeding it new languages.'),
  ('health', 'Chaque session est un exercice de sante mentale.', 'Every session is a mental health exercise.'),
  ('gratitude', 'Je suis reconnaissant de pouvoir apprendre une nouvelle langue aujourd''hui.', 'I am grateful to be able to learn a new language today.'),
  ('gratitude', 'Merci a mon cerveau pour sa capacite infinie d''apprentissage.', 'Thank you to my brain for its infinite learning capacity.'),
  ('gratitude', 'Je suis reconnaissant pour chaque personne qui m''aide a progresser.', 'I am grateful for every person who helps me progress.'),
  ('gratitude', 'Merci pour la beaute de chaque langue que je decouvre.', 'Thank you for the beauty of every language I discover.'),
  ('gratitude', 'La gratitude ouvre mon esprit a de nouveaux apprentissages.', 'Gratitude opens my mind to new learning.');

-- ────────────────────────────────────────────────────────────────────
-- SEED : 45 aides (/financer)
-- ────────────────────────────────────────────────────────────────────

INSERT INTO vida_langue.aides (nom, type_aide, profil_eligible, situation_eligible, montant_max, url_officielle, description, region, handicap_only) VALUES
  ('CPF - Compte Personnel de Formation', 'formation', '{"salarie","demandeur_emploi","independant"}', '{"actif","reconversion","formation"}', 5000, 'https://www.moncompteformation.gouv.fr', 'Financez vos formations en langues avec votre solde CPF. Jusqu''a 5000 euros mobilisables.', NULL, false),
  ('AIF - Aide Individuelle a la Formation', 'formation', '{"demandeur_emploi"}', '{"chomage","reconversion"}', 8000, 'https://www.pole-emploi.fr/candidat/en-formation/les-aides-a-la-formation.html', 'France Travail finance votre formation quand aucun autre dispositif ne la couvre.', NULL, false),
  ('POEI - Preparation Operationnelle a l''Emploi Individuelle', 'formation', '{"demandeur_emploi"}', '{"chomage","reconversion"}', 5000, 'https://www.pole-emploi.fr/candidat/en-formation/les-aides-a-la-formation/la-preparation-operationnelle-a.html', 'Formation pre-embauche financee par France Travail + l''employeur.', NULL, false),
  ('Plan de developpement des competences', 'formation', '{"salarie"}', '{"actif","formation"}', 10000, 'https://travail-emploi.gouv.fr/formation-professionnelle/', 'Votre employeur finance votre formation en langues dans le cadre du plan de l''entreprise.', NULL, false),
  ('Pro-A - Reconversion par alternance', 'reconversion', '{"salarie"}', '{"reconversion"}', 9000, 'https://travail-emploi.gouv.fr/formation-professionnelle/formation-en-alternance-10751/pro-a', 'Reconversion ou promotion en alternance pour les salaries.', NULL, false),
  ('Aide aux createurs d''entreprise (ACRE)', 'emploi', '{"independant","createur"}', '{"creation_entreprise"}', 0, 'https://www.service-public.fr/particuliers/vosdroits/F11677', 'Exoneration de charges pour les createurs. Combinez avec CPF pour les langues.', NULL, false),
  ('Cheque formation regionale - Ile-de-France', 'regional', '{"demandeur_emploi","jeune"}', '{"chomage","formation"}', 3000, 'https://www.iledefrance.fr/cheque-formation', 'La Region IDF finance des formations pour les demandeurs d''emploi.', 'ile-de-france', false),
  ('Cheque formation - Auvergne-Rhone-Alpes', 'regional', '{"demandeur_emploi"}', '{"chomage","formation"}', 3500, 'https://www.auvergnerhonealpes.fr/', 'Formation financee par la Region AURA pour les demandeurs d''emploi.', 'auvergne-rhone-alpes', false),
  ('Pass Formation - Nouvelle-Aquitaine', 'regional', '{"demandeur_emploi","jeune"}', '{"chomage","formation"}', 3000, 'https://les-aides.nouvelle-aquitaine.fr/', 'Aide regionale a la formation en Nouvelle-Aquitaine.', 'nouvelle-aquitaine', false),
  ('Cheque Qualification - Occitanie', 'regional', '{"demandeur_emploi"}', '{"chomage","formation"}', 5000, 'https://www.laregion.fr/', 'Financement regional formation qualifiante en Occitanie.', 'occitanie', false),
  ('Aide formation - Grand Est', 'regional', '{"demandeur_emploi"}', '{"chomage","formation"}', 4000, 'https://www.grandest.fr/', 'Aide regionale a la formation en Grand Est.', 'grand-est', false),
  ('PMSMP - Periode de Mise en Situation en Milieu Professionnel', 'emploi', '{"demandeur_emploi","jeune"}', '{"chomage","decouverte"}', 0, 'https://www.pole-emploi.fr', 'Decouvrez un metier a l''international pendant 1 mois. Maintien des allocations.', NULL, false),
  ('Garantie Jeunes / CEJ - Contrat Engagement Jeune', 'jeune', '{"jeune"}', '{"chomage","insertion"}', 528, 'https://www.1jeune1solution.gouv.fr', 'Accompagnement intensif pour les 16-25 ans avec allocation mensuelle.', NULL, false),
  ('Aide Mobili-Pass', 'mobilite', '{"salarie"}', '{"mobilite_professionnelle"}', 3500, 'https://www.actionlogement.fr/aide-mobili-pass', 'Aide Action Logement pour la mobilite professionnelle (frais de double residence, etc.).', NULL, false),
  ('Aide a la mobilite internationale (AMI)', 'mobilite', '{"etudiant"}', '{"etudes_etranger","stage_etranger"}', 400, 'https://www.etudiant.gouv.fr', 'Aide mensuelle pour les etudiants boursiers partant a l''etranger.', NULL, false),
  ('Bourse Erasmus+', 'mobilite', '{"etudiant","jeune"}', '{"etudes_etranger","stage_etranger","formation"}', 600, 'https://info.erasmusplus.fr/', 'Bourse mensuelle pour etudier ou effectuer un stage en Europe.', NULL, false),
  ('AGEFIPH - Aide a la formation des travailleurs handicapes', 'handicap', '{"salarie","demandeur_emploi"}', '{"handicap","formation"}', 5000, 'https://www.agefiph.fr', 'Financement complementaire formation pour les personnes en situation de handicap.', NULL, true),
  ('FIPHFP - Fonds pour l''insertion des personnes handicapees (fonction publique)', 'handicap', '{"fonctionnaire"}', '{"handicap","formation"}', 5000, 'https://www.fiphfp.fr', 'Aide formation specifique pour les agents de la fonction publique handicapes.', NULL, true),
  ('AAH et complement de ressources', 'handicap', '{"handicap"}', '{"handicap"}', 971, 'https://www.service-public.fr/particuliers/vosdroits/F12242', 'Allocation adulte handicape cumulable avec des aides a la formation.', NULL, true),
  ('Aide a la creation d''entreprise pour les handicapes (AGEFIPH)', 'handicap', '{"handicap","createur"}', '{"handicap","creation_entreprise"}', 6300, 'https://www.agefiph.fr/aides-handicap/aide-a-la-creation-dactivite', 'Subvention pour les handicapes qui creent leur entreprise.', NULL, true),
  ('Transition Pro (ex-Fongecif)', 'reconversion', '{"salarie"}', '{"reconversion"}', 36000, 'https://www.transitionspro.fr', 'Financement d''un projet de transition professionnelle (conge + formation).', NULL, false),
  ('FNE-Formation', 'formation', '{"salarie"}', '{"actif","formation","activite_partielle"}', 12000, 'https://travail-emploi.gouv.fr/le-ministere-en-action/relance-activite/plan-de-relance/formation-des-salaries', 'Aide aux entreprises pour former les salaries, renforcee post-COVID.', NULL, false),
  ('Aide au retour a l''emploi formation (AREF)', 'formation', '{"demandeur_emploi"}', '{"chomage","formation"}', 0, 'https://www.pole-emploi.fr', 'Maintien de l''allocation chomage pendant une formation validee par France Travail.', NULL, false),
  ('OPCO - Aide sectorielle formation', 'formation', '{"salarie"}', '{"actif","formation"}', 8000, 'https://travail-emploi.gouv.fr/ministere/acteurs/partenaires/opco', 'Votre OPCO (operateur de competences) peut financer vos formations linguistiques.', NULL, false),
  ('Aide a la garde d''enfant pour parent en formation (AGEPI)', 'social', '{"demandeur_emploi"}', '{"parent","formation"}', 520, 'https://www.pole-emploi.fr', 'Aide de France Travail pour les frais de garde pendant une formation.', NULL, false),
  ('RSA et droits connexes', 'social', '{"demandeur_emploi","inactif"}', '{"rsa","insertion"}', 607, 'https://www.service-public.fr/particuliers/vosdroits/N19775', 'Le RSA permet d''acceder a des formations financees sans impact sur l''allocation.', NULL, false),
  ('Prime d''activite', 'social', '{"salarie","independant"}', '{"actif","faibles_revenus"}', 586, 'https://www.caf.fr/allocataires/droits-et-prestations/connaitre-vos-droits-selon-votre-situation/vous-etes-salarie/la-prime-d-activite', 'Complement de revenu cumulable avec formation CPF.', NULL, false),
  ('Bourse CROUS sur criteres sociaux', 'social', '{"etudiant"}', '{"etudes","faibles_revenus"}', 6335, 'https://www.messervices.etudiant.gouv.fr', 'Bourse etudiante sur criteres sociaux, cumulable avec Erasmus.', NULL, false),
  ('CIF - Conge Individuel de Formation (DOM-TOM)', 'formation', '{"salarie"}', '{"actif","formation"}', 15000, 'https://www.service-public.fr', 'Dispositif specifique DOM-TOM pour la formation professionnelle.', 'dom-tom', false),
  ('Aide departementale insertion', 'social', '{"demandeur_emploi"}', '{"rsa","insertion"}', 1000, 'https://www.service-public.fr', 'Aide departementale complementaire pour les beneficiaires RSA en formation.', NULL, false),
  ('Pass Numerique', 'numerique', '{"demandeur_emploi","senior","jeune"}', '{"illectronisme","formation"}', 200, 'https://www.inclusion-numerique.fr', 'Cheques numeriques pour des formations incluant les outils en ligne de langues.', NULL, false),
  ('Aide individuelle CAF', 'social', '{"parent"}', '{"parent","faibles_revenus"}', 800, 'https://www.caf.fr', 'Aide ponctuelle de la CAF pour des projets de formation.', NULL, false),
  ('VAE - Validation des Acquis de l''Experience', 'formation', '{"salarie","demandeur_emploi","independant"}', '{"actif","reconversion","chomage"}', 3000, 'https://www.vae.gouv.fr', 'Faites reconnaitre vos competences linguistiques acquises par l''experience.', NULL, false),
  ('Micro-credit personnel garanti', 'social', '{"demandeur_emploi","inactif","independant"}', '{"faibles_revenus","formation"}', 5000, 'https://www.france-microcredit.org', 'Pret solidaire pour financer une formation (taux reduit, garanti par l''Etat).', NULL, false),
  ('Aide a la reprise ou creation d''entreprise (ARCE)', 'emploi', '{"demandeur_emploi","createur"}', '{"creation_entreprise"}', 0, 'https://www.pole-emploi.fr', '45% des droits chomage restants en capital pour creer son activite.', NULL, false),
  ('Passeport de competences (Mon Parcours Handicap)', 'handicap', '{"handicap"}', '{"handicap","formation"}', 0, 'https://www.monparcourshandicap.gouv.fr', 'Plateforme d''orientation et d''acces aux droits formation pour les handicapes.', NULL, true),
  ('Service civique + formation', 'jeune', '{"jeune"}', '{"service_civique"}', 600, 'https://www.service-civique.gouv.fr', 'Indemnite mensuelle + acces a des formations complementaires en langues.', NULL, false),
  ('Programme Sesame (sport)', 'jeune', '{"jeune"}', '{"sport","formation"}', 6000, 'https://www.sports.gouv.fr', 'Aide pour les jeunes souhaitant combiner sport et formation professionnelle.', NULL, false),
  ('CIVIS - Contrat d''Insertion dans la Vie Sociale', 'jeune', '{"jeune"}', '{"insertion","chomage"}', 450, 'https://www.service-public.fr', 'Accompagnement renforce des 16-25 ans vers l''emploi avec allocation.', NULL, false),
  ('Aide exceptionnelle apprentissage', 'jeune', '{"jeune","etudiant"}', '{"alternance","apprentissage"}', 6000, 'https://travail-emploi.gouv.fr', 'Aide a l''employeur = plus de chances d''etre recrute en alternance.', NULL, false),
  ('Cheque culture / Pass Culture', 'culture', '{"jeune"}', '{"jeune","culture"}', 300, 'https://pass.culture.fr', 'Credit culture utilisable pour des ressources pedagogiques en langues.', NULL, false),
  ('Aide a la mobilite Parcoursup', 'mobilite', '{"etudiant"}', '{"mobilite","etudes"}', 500, 'https://www.etudiant.gouv.fr', 'Aide financiere pour les etudiants qui changent d''academie via Parcoursup.', NULL, false),
  ('Cle-A / Socle de connaissances', 'formation', '{"salarie","demandeur_emploi"}', '{"actif","chomage","faibles_qualifications"}', 0, 'https://www.certificat-clea.fr', 'Certification gratuite des competences de base, incluant la communication en langues.', NULL, false),
  ('PLIE - Plan Local pour l''Insertion et l''Emploi', 'social', '{"demandeur_emploi"}', '{"insertion","chomage"}', 2000, 'https://www.service-public.fr', 'Accompagnement personnalise par les collectivites locales, incluant formations.', NULL, false),
  ('Compte Engagement Citoyen (CEC)', 'social', '{"benevole","jeune"}', '{"benevolat","service_civique"}', 720, 'https://www.moncompteformation.gouv.fr', 'Heures CPF supplementaires pour les benevoles et anciens service civique.', NULL, false);

-- ────────────────────────────────────────────────────────────────────
-- SEED : boutique items
-- ────────────────────────────────────────────────────────────────────

INSERT INTO vida_langue.point_shop_items (category, name, description, cost_points, value_description) VALUES
  ('reduction', '-10% sur l''abonnement', 'Reduction de 10% sur votre prochain mois', 1000, '10% de reduction'),
  ('reduction', '-30% sur l''abonnement', 'Reduction de 30% sur votre prochain mois', 3000, '30% de reduction'),
  ('reduction', '-50% sur l''abonnement', 'Reduction de 50% sur votre prochain mois', 5000, '50% de reduction'),
  ('subscription', '1 mois gratuit', 'Un mois d''abonnement offert', 10000, '1 mois gratuit'),
  ('subscription', '1 mois Starter', 'Un mois d''abonnement Starter', 15000, 'Abonnement Starter'),
  ('ticket', '1 ticket tirage mensuel', 'Un ticket supplementaire pour le tirage', 500, '+1 chance au tirage'),
  ('feature', '3 credits IA bonus', 'Trois questions supplementaires au coach IA', 800, '+3 credits IA'),
  ('cash', '2,50 euros en wallet', 'Conversion directe en euros sur votre wallet', 25000, '2,50 euros'),
  ('cash', '5 euros en wallet', 'Conversion directe en euros sur votre wallet', 50000, '5,00 euros'),
  ('cash', '10 euros en wallet', 'Conversion directe en euros sur votre wallet', 100000, '10,00 euros');

-- NOTIFY PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
