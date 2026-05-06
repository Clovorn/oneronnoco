-- OneRonnoco Migration 001b: Remaining tables
-- Run this if 001_schema.sql stopped after creating roms/users/sequences

-- ============================================================
-- SECTION 2: Reference Data
-- ============================================================

CREATE TABLE IF NOT EXISTS public.distributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.distributor_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES public.distributors(id),
  name TEXT NOT NULL,
  division_code TEXT,
  region TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT CHECK (type IN ('branded','distributor','private_label')),
  jotform_form_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT,
  assigned_rep_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.form_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jotform_form_id TEXT NOT NULL UNIQUE,
  form_type TEXT NOT NULL CHECK (form_type IN ('lead','deal','velocity','other')),
  program_id UUID REFERENCES public.programs(id),
  description TEXT,
  field_mappings JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 3: Customers
-- ============================================================

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL,
  legal_business_name TEXT,
  account_number TEXT,
  customer_type TEXT CHECK (customer_type IN ('c_store','food_service','ocs','restaurant','other')),
  sub_group TEXT,
  is_current_customer BOOLEAN DEFAULT false,
  is_chain BOOLEAN DEFAULT false,
  chain_group_number TEXT,
  number_of_locations INTEGER,
  is_henderson_account BOOLEAN DEFAULT false,
  is_change_of_ownership BOOLEAN DEFAULT false,
  prior_account_number TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  contact_name TEXT,
  contact_cell TEXT,
  contact_email TEXT,
  distributor_id UUID REFERENCES public.distributors(id),
  division_id UUID REFERENCES public.distributor_divisions(id),
  distributor_customer_number TEXT,
  distributor_rep TEXT,
  distributor_rep_email TEXT,
  distributor_rep_phone TEXT,
  delivery_method TEXT CHECK (delivery_method IN ('distributor','dsd')),
  delivery_frequency TEXT,
  program_id UUID REFERENCES public.programs(id),
  coffee_program TEXT,
  current_coffee_supplier TEXT,
  velocity_status TEXT CHECK (velocity_status IN ('growing','stable','declining','at_risk','new','churned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 4: Leads Pipeline
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pipeline_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_type TEXT NOT NULL CHECK (route_type IN ('sales_rep','leasing','general')),
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  description TEXT,
  triggers_notification BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.pipeline_templates (route_type, step_number, step_name, triggers_notification) VALUES
  ('sales_rep', 1, 'New Lead', false),
  ('sales_rep', 2, 'Assign Rep', true),
  ('sales_rep', 3, 'Lead Received', true),
  ('sales_rep', 4, 'Customer Contacted', false),
  ('sales_rep', 5, 'Customer Won', true),
  ('sales_rep', 6, 'Deal Sheet', true),
  ('sales_rep', 7, 'Waiting Finance', false),
  ('sales_rep', 8, 'Deal Funded', true),
  ('sales_rep', 9, 'Customer Setup', false),
  ('sales_rep', 10, 'Equip Ordered', false),
  ('sales_rep', 11, 'Dist Notified', true),
  ('sales_rep', 12, 'Install Scheduled', true),
  ('sales_rep', 13, 'Complete', true),
  ('leasing', 1, 'New Lead', false),
  ('leasing', 2, 'Assign Rep', true),
  ('leasing', 3, 'Credit App Sent', false),
  ('leasing', 4, 'Credit Received', false),
  ('leasing', 5, 'Approved', true),
  ('leasing', 6, 'Paperwork Sent', false),
  ('leasing', 7, 'Paperwork Signed', false),
  ('leasing', 8, 'Deal Funded', true);

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_number TEXT UNIQUE DEFAULT 'LD-' || LPAD(NEXTVAL('public.lead_number_seq')::TEXT, 6, '0'),
  source TEXT CHECK (source IN ('jotform','manual','import')),
  jotform_submission_id TEXT,
  form_id TEXT,
  program_id UUID REFERENCES public.programs(id),
  assigned_rep_id UUID REFERENCES public.users(id),
  rte_number TEXT,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  store_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  customer_type TEXT,
  distributor_id UUID REFERENCES public.distributors(id),
  distributor_rep TEXT,
  pipeline_route TEXT DEFAULT 'sales_rep' CHECK (pipeline_route IN ('sales_rep','leasing','general')),
  current_step INTEGER DEFAULT 1,
  current_step_name TEXT DEFAULT 'New Lead',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','won','lost','on_hold')),
  lost_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.users(id),
  actor_name TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('created','step_advanced','rep_assigned','status_changed','note_added','jotform_synced')),
  from_step INTEGER,
  to_step INTEGER,
  from_status TEXT,
  to_status TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 5: Deal Processing
-- ============================================================

CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_number TEXT UNIQUE DEFAULT 'DL-' || LPAD(NEXTVAL('public.deal_number_seq')::TEXT, 6, '0'),
  lead_id UUID REFERENCES public.leads(id),
  jotform_submission_id TEXT,
  source TEXT CHECK (source IN ('jotform','manual')),
  assigned_rep_id UUID NOT NULL REFERENCES public.users(id),
  rte_number TEXT,
  rom_id UUID REFERENCES public.roms(id),
  customer_id UUID REFERENCES public.customers(id),
  store_name TEXT NOT NULL,
  legal_business_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  customer_type TEXT,
  sub_group TEXT,
  address_line1 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  distributor_id UUID REFERENCES public.distributors(id),
  division_id UUID REFERENCES public.distributor_divisions(id),
  parent_distributor TEXT,
  distributor_customer_number TEXT,
  distributor_rep TEXT,
  distributor_rep_email TEXT,
  delivery_method TEXT,
  delivery_frequency TEXT,
  program_id UUID REFERENCES public.programs(id),
  coffee_program TEXT,
  current_coffee_supplier TEXT,
  is_current_customer BOOLEAN DEFAULT false,
  customer_account_number TEXT,
  is_henderson_account BOOLEAN DEFAULT false,
  is_change_of_ownership BOOLEAN DEFAULT false,
  is_chain BOOLEAN DEFAULT false,
  deal_type TEXT NOT NULL CHECK (deal_type IN ('purchase','finance','lease','loan')),
  avg_monthly_coffee_spend DECIMAL(10,2),
  emergency_install BOOLEAN DEFAULT false,
  emergency_details TEXT,
  target_install_date DATE,
  need_by_date DATE,
  service_option TEXT,
  stage TEXT DEFAULT 'sales' CHECK (stage IN ('sales','leasing','finance','ops','installation','complete','lost')),
  current_step INTEGER DEFAULT 1,
  current_step_name TEXT DEFAULT 'New Deal',
  business_license_url TEXT,
  resale_certificate_url TEXT,
  beverage_bar_photos JSONB,
  store_front_photo_url TEXT,
  funded_at TIMESTAMPTZ,
  installed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deal_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES public.equipment(id),
  equipment_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  is_bundle BOOLEAN DEFAULT false,
  is_addon BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.users(id),
  actor_name TEXT,
  event_type TEXT NOT NULL,
  from_stage TEXT,
  to_stage TEXT,
  from_step INTEGER,
  to_step INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id),
  customer_id UUID REFERENCES public.customers(id),
  scheduled_date DATE,
  completed_date DATE,
  installer_name TEXT,
  installer_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','scheduled','in_progress','complete','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTION 6: Velocity Intelligence
-- ============================================================

CREATE TABLE IF NOT EXISTS public.distributor_mapping_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES public.distributors(id),
  profile_name TEXT NOT NULL,
  column_mappings JSONB NOT NULL,
  sample_headers JSONB,
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.velocity_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES public.distributors(id),
  division_id UUID REFERENCES public.distributor_divisions(id),
  uploaded_by UUID REFERENCES public.users(id),
  filename TEXT NOT NULL,
  period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year INTEGER NOT NULL,
  record_count INTEGER,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing','mapped','imported','error')),
  mapping_profile_id UUID REFERENCES public.distributor_mapping_profiles(id),
  ai_mapping_suggestion JSONB,
  error_log TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.velocity_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES public.velocity_uploads(id),
  distributor_id UUID NOT NULL REFERENCES public.distributors(id),
  division_id UUID REFERENCES public.distributor_divisions(id),
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  distributor_customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  store_address TEXT,
  route_name TEXT,
  distributor_rep TEXT,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  product_category TEXT,
  units_sold DECIMAL(10,2),
  dollar_value DECIMAL(10,2),
  unit_type TEXT,
  is_matched_to_customer BOOLEAN DEFAULT false,
  is_ronnoco_product BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_velocity_period ON public.velocity_records(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_velocity_customer ON public.velocity_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_velocity_distributor ON public.velocity_records(distributor_id);
CREATE INDEX IF NOT EXISTS idx_velocity_product ON public.velocity_records(product_category);

-- ============================================================
-- SECTION 7: Communications & Audit
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES public.users(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  channel TEXT DEFAULT 'email' CHECK (channel IN ('email','in_app','sms')),
  subject TEXT,
  body TEXT NOT NULL,
  trigger_event TEXT,
  related_entity_type TEXT CHECK (related_entity_type IN ('lead','deal','installation','velocity')),
  related_entity_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','read')),
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.users(id),
  actor_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
