-- FormaDesk Supabase Schema & Row Level Security (RLS)

-- 1. Create Companies Table
CREATE TABLE public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    state_code TEXT,
    gst_number TEXT,
    country TEXT DEFAULT 'India',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Profiles Table (Linked to Auth Users & Companies)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'owner',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Invoices Table
CREATE TABLE public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    pi_number TEXT NOT NULL,
    pi_date TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    place_of_supply TEXT,
    
    -- JSONB columns for structured data snapshots
    company_snapshot JSONB NOT NULL,
    buyer_details JSONB NOT NULL,
    items JSONB NOT NULL,
    gst_details JSONB NOT NULL,
    totals JSONB NOT NULL,
    additional_details JSONB NOT NULL,
    
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- PROFILES: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- COMPANIES: Users can only see and update the company they belong to
CREATE POLICY "Users can view their company" 
    ON public.companies FOR SELECT 
    USING (id IN (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can update their company" 
    ON public.companies FOR UPDATE 
    USING (id IN (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()));

-- Only allow insert if the user is creating a new company during signup (handled by Edge Function/RPC usually, or allow authenticated users to create a company if they don't have one)
CREATE POLICY "Authenticated users can create a company" 
    ON public.companies FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- INVOICES: Users can only CRUD invoices belonging to their company_id
CREATE POLICY "Users can view their company invoices" 
    ON public.invoices FOR SELECT 
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can insert invoices for their company" 
    ON public.invoices FOR INSERT 
    WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can update their company invoices" 
    ON public.invoices FOR UPDATE 
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can delete their company invoices" 
    ON public.invoices FOR DELETE 
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()));

-- FUNCTIONS & TRIGGERS
-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. Create Customers Table
CREATE TABLE public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    state TEXT,
    state_code TEXT,
    gst_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company customers" 
    ON public.customers FOR SELECT 
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can insert customers for their company" 
    ON public.customers FOR INSERT 
    WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can update their company customers" 
    ON public.customers FOR UPDATE 
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Users can delete their company customers" 
    ON public.customers FOR DELETE 
    USING (company_id IN (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid()));

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
