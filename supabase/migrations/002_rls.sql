-- OneRonnoco Migration 002: Row Level Security
-- Enable RLS on every table and apply all policies

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributor_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributor_mapping_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.velocity_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.velocity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage all users" ON public.users FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Directors can view all users" ON public.users FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director')));

-- ROMs
CREATE POLICY "Authenticated users view roms" ON public.roms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins manage roms" ON public.roms FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Reference tables — read for all authenticated
CREATE POLICY "Authenticated view distributors" ON public.distributors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated view divisions" ON public.distributor_divisions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated view programs" ON public.programs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated view equipment" ON public.equipment FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated view form_registry" ON public.form_registry FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated view pipeline_templates" ON public.pipeline_templates FOR SELECT USING (auth.role() = 'authenticated');

-- Admin manage reference tables
CREATE POLICY "Admins manage distributors" ON public.distributors FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins manage programs" ON public.programs FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins manage equipment" ON public.equipment FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins manage form_registry" ON public.form_registry FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Customers
CREATE POLICY "Authenticated view customers" ON public.customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins directors manage customers" ON public.customers FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director')));
CREATE POLICY "Sales reps can insert customers" ON public.customers FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director','sales_rep')));

-- Leads
CREATE POLICY "Sales reps see own leads" ON public.leads FOR SELECT USING (assigned_rep_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director')));
CREATE POLICY "Sales reps update own leads" ON public.leads FOR UPDATE USING (assigned_rep_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director')));
CREATE POLICY "Authenticated insert leads" ON public.leads FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director','sales_rep')));
CREATE POLICY "Lead event visibility mirrors lead" ON public.lead_events FOR SELECT USING (EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_id AND (l.assigned_rep_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director')))));
CREATE POLICY "Authenticated insert lead_events" ON public.lead_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Deals
CREATE POLICY "Sales reps see own deals" ON public.deals FOR SELECT USING (assigned_rep_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director','ops')));
CREATE POLICY "Sales reps update own deals" ON public.deals FOR UPDATE USING (assigned_rep_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director','ops')));
CREATE POLICY "Authenticated insert deals" ON public.deals FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director','sales_rep','ops')));
CREATE POLICY "Authenticated view deal_equipment" ON public.deal_equipment FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert deal_events" ON public.deal_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated view deal_events" ON public.deal_events FOR SELECT USING (auth.role() = 'authenticated');

-- Installations
CREATE POLICY "Authenticated view installations" ON public.installations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Ops manage installations" ON public.installations FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director','ops')));

-- Velocity
CREATE POLICY "Admins directors manage velocity_uploads" ON public.velocity_uploads FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director')));
CREATE POLICY "Authenticated view velocity_records" ON public.velocity_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins insert velocity_records" ON public.velocity_records FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director')));
CREATE POLICY "Authenticated view mapping_profiles" ON public.distributor_mapping_profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins directors manage mapping_profiles" ON public.distributor_mapping_profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director')));

-- Notifications
CREATE POLICY "Users see own notifications" ON public.notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "System insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (recipient_id = auth.uid());

-- Activity log
CREATE POLICY "Admins view activity_log" ON public.activity_log FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','director')));
CREATE POLICY "System insert activity_log" ON public.activity_log FOR INSERT WITH CHECK (true);
