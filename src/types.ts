
export type Language = 'en' | 'ar' | 'ku';

export interface MultilingualString {
  en: string;
  ar: string;
  ku: string;
}

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  name_ku: string;
  image_url: string;
  order_index: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name_en: string;
  name_ar: string;
  name_ku: string;
  desc_en: string;
  desc_ar: string;
  desc_ku: string;
  price: number;
  image_url: string;
  is_available: boolean;
  order_index: number;
}

export interface MarketingSlide {
  id: string;
  image_url: string;
  link?: string;
  order_index: number;
}

export interface VenueSettings {
  name: string;
  logo_url?: string;
  splash_background_url?: string;
  menu_background_url?: string;
  phone?: string;
  phone_2?: string;
  location?: string;
  announcement?: {
    show: boolean;
    text_en: string;
    text_ar: string;
    text_ku: string;
    media_url: string;
    media_type: 'image' | 'video';
  };
  social_links: {
    instagram?: string;
    facebook?: string;
    snapchat?: string;
    tiktok?: string;
    whatsapp?: string;
    developer_whatsapp?: string;
  };
  working_hours?: {
    en?: string;
    ar?: string;
    ku?: string;
  };
  location_url?: string;
  theme: {
    primary_color: string;
    secondary_color: string;
    background_color: string;
    accent_color: string;
  };
}
