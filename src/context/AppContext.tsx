import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Language, VenueSettings } from '../types';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  settings: VenueSettings | null;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: VenueSettings = {
  name: "",
  social_links: {},
  theme: {
    primary_color: "#C5A059",
    secondary_color: "#111111",
    background_color: "#070707",
    accent_color: "#E0D8D0"
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('preferred_language') as Language) || 'en';
  });
  const [settings, setSettings] = useState<VenueSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!supabase) {
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'venue_settings')
          .single();

        if (error) throw error;
        setSettings(data.value as VenueSettings);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();

    if (!supabase) return;

    // Real-time subscription for settings
    const subscription = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings', filter: 'key=eq.venue_settings' }, 
        payload => {
          setSettings(payload.new.value as VenueSettings);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('preferred_language', language);
  }, [language]);

  // Apply theme colors to CSS variables
  useEffect(() => {
    if (settings?.theme) {
      const root = document.documentElement;
      Object.entries(settings.theme).forEach(([key, value]) => {
        root.style.setProperty(`--${key.replace('_', '-')}`, value as string);
      });
    }
  }, [settings]);

  return (
    <AppContext.Provider value={{ language, setLanguage, settings, loading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
