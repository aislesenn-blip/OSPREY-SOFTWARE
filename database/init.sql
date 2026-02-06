-- OSPREY Complete Database Initialization Script
-- Execute this file in the Supabase SQL Editor to deploy the entire system.

-- 1. FOUNDATIONS
\ir database/schema.sql

-- 2. CORE ENGINES (Finance, HR, Inventory)
\ir database/02_core_engines.sql

-- 3. COMMUNICATION & REPORTING
\ir database/03_communication_reporting.sql

-- 4. AUTOMATION & ONBOARDING
\ir database/04_automation_onboarding.sql

-- 5. DEEP LOGIC AUDIT (Vote Book, Formulas, Blind Receiving)
\ir database/05_deep_logic_audit.sql

-- 6. FINAL POLISH (Onboarding Glue)
\ir database/06_final_polish.sql

-- Note: \ir is a psql meta-command. If using Supabase Web Editor,
-- you must copy-paste the contents of the files in the order above
-- or concatenate them manually.
