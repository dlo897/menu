import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { MapPin } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { setLanguage, settings, loading } = useApp();
  const navigate = useNavigate();

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    navigate('/menu');
  };

  const languages: { code: Language; label: string; dir: 'ltr' | 'rtl' }[] = [
    { code: 'ku', label: 'کوردی', dir: 'rtl' },
    { code: 'ar', label: 'العربية', dir: 'rtl' },
    { code: 'en', label: 'English', dir: 'ltr' },
  ];

  if (loading) return <div className="h-screen bg-black" />;

  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      {/* Cinematic Background */}
      <motion.div 
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0"
      >
        {settings?.splash_background_url?.match(/\.(mp4|webm|ogg)$/) ? (
          <video 
            src={settings.splash_background_url} 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img 
            src={settings?.splash_background_url || ""} 
            className="w-full h-full object-cover"
            alt="Background"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl px-6 text-center">
        {settings?.location_url && (
          <motion.a
            href={settings.location_url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-black/40 backdrop-blur-xl border border-primary/20 rounded-full text-[10px] uppercase tracking-[0.3em] text-primary mb-12 hover:bg-primary/20 transition-all"
          >
            <MapPin className="w-3 h-3" />
            {settings.location || 'Find Us'}
          </motion.a>
        )}
        
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.5 }}
        >
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="mx-auto h-32 mb-8 object-contain" />
          ) : (
            <h1 className="font-serif text-6xl text-primary mb-4 tracking-widest uppercase italic">{settings?.name}</h1>
          )}
          <div className="mb-16" />
        </motion.div>

        <div className="flex flex-row justify-center items-center gap-4 md:gap-8 flex-wrap">
          {languages.map((lang, idx) => (
            <motion.button
              key={lang.code}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 + idx * 0.1, type: "spring", stiffness: 100 }}
              onClick={() => handleSelectLanguage(lang.code)}
              className="group min-w-[140px] py-4 px-6 rounded-full border border-primary/20 bg-black/40 backdrop-blur-xl flex flex-col items-center hover:border-primary hover:bg-primary/20 transition-all duration-700 shadow-2xl shadow-black"
            >
              <span className="text-xl md:text-2xl font-serif tracking-widest text-[#D4AF37] group-hover:scale-110 transition-transform duration-500">{lang.label}</span>
              <div className="w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-700 mt-2 opacity-50" />
            </motion.button>
          ))}
        </div>
      </div>


    </div>
  );
};

export default LandingPage;
