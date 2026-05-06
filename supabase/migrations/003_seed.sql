-- OneRonnoco Migration 003: Seed Data

-- Distributors
INSERT INTO public.distributors (name) VALUES
  ('Amcon'),('Burkland'),('Core-Mark'),('Douglas'),('DSD'),
  ('Eby Brown'),('Farner-Brocken'),('Gem State'),('Gummer'),
  ('Henry''s'),('HT Hackney'),('Holidway Wholesale'),('Imperial'),
  ('Merchants'),('MR Williams'),('NTC'),('Richmond Masters'),
  ('Peterey'),('Pitco Foods'),('Sledd'),('Southco'),('St Joe'),
  ('Stewart'),('Tri-Mart'),('Tripi Foods');

-- Core-Mark divisions
INSERT INTO public.distributor_divisions (distributor_id, name, division_code)
SELECT d.id, v.name, v.code FROM public.distributors d
CROSS JOIN (VALUES
  ('Albuquerque','#048'),('Atlanta','#178'),('Bakersfield','#023'),
  ('Carolina','#280'),('Corona','#035'),('Denver','#256'),
  ('Forrest City','#160'),('Fort Worth','#075'),('Grants Pass','#045'),
  ('Hayward','#007'),('Kentucky','#175'),('Las Vegas','#065'),
  ('Los Angeles','#021'),('Minneapolis','#170'),('New England','#081'),
  ('New England N','#150'),('Ohio','#077'),('Pennsylvania','#281'),
  ('Portland','#044'),('Sacramento','#016'),('Salt Lake City','#071'),
  ('Spokane','#053'),('Tampa','#140')
) AS v(name, code) WHERE d.name = 'Core-Mark';

-- Programs
INSERT INTO public.programs (name, type, jotform_form_id) VALUES
  ('Ronnoco Branded Program','branded', NULL),
  ('Java Select Program','distributor','260045399064863'),
  ('My Daily Crave Program','branded', NULL),
  ('Coffeehouse Program','branded', NULL),
  ('Cafe Perks Program','branded', NULL),
  ('Reflections Program','branded', NULL),
  ('Wild Horse Creek Program','branded', NULL),
  ('Private Label Program','private_label', NULL),
  ('Sledd Program','distributor', NULL);

-- ROMs
INSERT INTO public.roms (full_name) VALUES
  ('Rick Reeps'),('Tom Carel'),('Dermond Strickland'),('Brian Welter'),
  ('Shane Boswell'),('John Harding'),('Curtis Andrews'),('Scott Shumsky'),
  ('Kataua Fitzer'),('Randy Wolfe'),('James Morris');

-- Form registry
INSERT INTO public.form_registry (jotform_form_id, form_type, description, field_mappings) VALUES
  ('260154983685872', 'deal', 'General New Deal Sheet', '{
    "q3_salesRep": "assigned_rep_name",
    "q4_repEmail": "assigned_rep_email",
    "q5_rteNumber": "rte_number",
    "q7_isCurrentCustomer": "is_current_customer",
    "q8_customerAccount": "customer_account_number",
    "q9_cstoreOrFood": "customer_type",
    "q10_subGroup": "sub_group",
    "q11_hendersonAccount": "is_henderson_account",
    "q12_changeOfOwnership": "is_change_of_ownership",
    "q14_chainStore": "is_chain",
    "q16_storeName": "store_name",
    "q17_legalBusiness": "legal_business_name",
    "q18_address": "address",
    "q19_storePhone": "phone",
    "q20_contactName": "contact_name",
    "q21_contactCell": "contact_cell",
    "q22_contactEmail": "contact_email",
    "q23_coffeeProgram": "coffee_program",
    "q25_dsdOrIndirect": "delivery_method",
    "q26_deliveryFrequency": "delivery_frequency",
    "q28_parentDistributor": "parent_distributor",
    "q30_distributorWarehouse": "distributor_warehouse",
    "q31_distributorCustomer": "distributor_customer_number",
    "q32_distributorRep": "distributor_rep",
    "q33_distributorRepEmail": "distributor_rep_email",
    "q34_currentCoffeeSupplier": "current_coffee_supplier",
    "q36_serviceOption": "service_option",
    "q37_selectRom": "rom_name",
    "q39_dealType": "deal_type",
    "q40_avgMonthlySpend": "avg_monthly_coffee_spend",
    "q41_emergencyInstall": "emergency_install",
    "q43_targetInstallDate": "target_install_date",
    "q44_needByDate": "need_by_date",
    "q46_equipment": "equipment_selections"
  }'),
  ('253445565512862', 'lead', 'Distributor Lead/Deal Sheet', '{
    "q3_salesRep": "assigned_rep_name",
    "q4_rteNumber": "rte_number",
    "q5_repEmail": "assigned_rep_email",
    "q6_leadId": "lead_id_reference",
    "q8_isCurrentCustomer": "is_current_customer",
    "q9_customerType": "customer_type",
    "q10_contactName": "contact_name",
    "q11_contactCell": "contact_cell",
    "q12_contactEmail": "contact_email",
    "q14_equipmentPackage": "equipment_package",
    "q15_addOns": "equipment_addons"
  }'),
  ('260045399064863', 'lead', 'Java Select Lead App', '{}');
