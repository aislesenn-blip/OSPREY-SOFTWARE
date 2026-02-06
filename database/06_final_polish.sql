-- OSPREY FINAL POLISH & ONBOARDING GLUE
-- Updates the Onboarding Trigger to use the Automation Engine

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
    company_name TEXT;
    industry_type TEXT;
BEGIN
    company_name := new.raw_user_meta_data->>'company_name';
    industry_type := new.raw_user_meta_data->>'industry_type'; -- 'UNIVERSITY', 'COMPANY', etc.

    -- If company_name is provided, create a new organization
    IF company_name IS NOT NULL THEN
        INSERT INTO public.organizations (name, slug)
        VALUES (
            company_name,
            lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g')) -- Basic slug generation
        )
        RETURNING id INTO org_id;

        -- Create Profile linked to the new organization
        INSERT INTO public.profiles (id, organization_id, email, full_name)
        VALUES (
            new.id,
            org_id,
            new.email,
            company_name || ' Admin'
        );

        -- SEED DEFAULT NODES based on Industry Type
        -- Calls the function defined in 04_automation_onboarding.sql
        PERFORM initialize_organization_template(org_id, COALESCE(industry_type, 'COMPANY'));

    ELSE
        -- Handle invite case or join existing org
        INSERT INTO public.profiles (id, email)
        VALUES (new.id, new.email);
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
