
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_ku TEXT NOT NULL,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_ku TEXT NOT NULL,
    desc_en TEXT,
    desc_ar TEXT,
    desc_ku TEXT,
    price TEXT NOT NULL DEFAULT '0',
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.marketing_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    link TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert Default Settings
INSERT INTO public.settings (key, value)
VALUES ('venue_settings', '{
  "name": "",
  "logo_url": "",
  "splash_background_url": "",
  "phone": "",
  "phone_2": "",
  "location": "",
  "announcement": {
    "show": false,
    "text_en": "",
    "text_ar": "",
    "text_ku": "",
    "media_url": "",
    "media_type": "image"
  },
  "social_links": {
    "instagram": "",
    "facebook": "",
    "snapchat": "",
    "tiktok": "",
    "whatsapp": "",
    "developer_whatsapp": ""
  },
  "theme": {
    "primary_color": "#D4AF37",
    "secondary_color": "#1A1A1A",
    "background_color": "#000000",
    "accent_color": "#FFFFFF"
  }
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_slides ENABLE ROW LEVEL SECURITY;

-- 4. Set Policies
-- Public Read Access
CREATE POLICY "Public Read Access" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.items FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.marketing_slides FOR SELECT USING (true);

-- Admin Write Access (Example simple check, customize as needed)
-- In production, you would check request.auth.uid() against an admins table
CREATE POLICY "Admin All Access" ON public.settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access" ON public.items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access" ON public.marketing_slides FOR ALL USING (auth.role() = 'authenticated');
