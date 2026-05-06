import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, Phone, Instagram, Facebook, Menu, X, Clock, MapPin, Music, MessageCircle, Ghost, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Category, MenuItem, MarketingSlide } from '../types';

const MenuPage: React.FC = () => {
  const { language, setLanguage, settings } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [slides, setSlides] = useState<MarketingSlide[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isRTL = language === 'ar' || language === 'ku';

  const workingHours = settings?.working_hours?.[language] || settings?.working_hours?.en || '';

  const socialLinks = [
    { id: 'instagram', icon: Instagram, url: settings?.social_links?.instagram, label: 'Instagram' },
    { id: 'tiktok', icon: Music, url: settings?.social_links?.tiktok, label: 'TikTok' },
    { id: 'whatsapp', icon: MessageCircle, url: settings?.social_links?.whatsapp ? `https://wa.me/${settings.social_links.whatsapp.replace(/[^0-9]/g, '')}` : null, label: 'WhatsApp' },
    { id: 'snapchat', icon: Ghost, url: settings?.social_links?.snapchat, label: 'Snapchat' },
    { id: 'facebook', icon: Facebook, url: settings?.social_links?.facebook, label: 'Facebook' },
  ].filter(link => link.url);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const [catsRes, itemsRes, slidesRes] = await Promise.all([
        supabase.from('categories').select('*').order('order_index'),
        supabase.from('items').select('*').order('order_index'),
        supabase.from('marketing_slides').select('*').order('order_index'),
      ]);

      setCategories(catsRes.data || []);
      setItems(itemsRes.data || []);
      setSlides(slidesRes.data || []);
      if (catsRes.data?.length) setActiveCategory(catsRes.data[0].id);
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredItems = activeCategory 
    ? items.filter(item => item.category_id === activeCategory && item.is_available)
    : items.filter(item => item.is_available);

  if (loading) return <div className="h-screen flex items-center justify-center bg-background text-primary">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="font-serif italic text-xl tracking-[0.3em] uppercase"
    >
      DA
    </motion.div>
  </div>;

  return (
    <div className={`min-h-screen bg-background text-accent relative font-sans`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dynamic Background Layer */}
      <div className="fixed inset-0 z-0">
          {settings?.menu_background_url ? (
            settings.menu_background_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
              <video src={settings.menu_background_url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-30" />
            ) : (
              <img src={settings.menu_background_url} className="w-full h-full object-cover opacity-30" alt="Background" />
            )
          ) : (
            <div className="w-full h-full bg-[#050505]" />
          )}
          <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Sidebar Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" 
            />
            <motion.aside
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-[85%] max-w-sm bg-[#0a0a0a] z-[101] shadow-2xl overflow-y-auto border-r border-white/5 flex flex-col`}
            >
              <div className="p-8 flex justify-between items-center border-b border-white/5">
                <span className="font-serif italic text-xl text-primary">{settings?.name}</span>
                <button onClick={() => setIsSidebarOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <X className="w-5 h-5 text-accent/60" />
                </button>
              </div>

              <div className="flex-1 p-8 space-y-12">
                {/* Working Hours */}
                {workingHours && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                        {language === 'ar' ? 'ساعات العمل' : language === 'ku' ? 'کاتەکانی کارکردن' : 'Working Hours'}
                      </span>
                    </div>
                    <p className="text-sm text-accent/60 font-light leading-relaxed whitespace-pre-line">{workingHours}</p>
                  </div>
                )}

                {/* Location & Phone */}
                {(settings?.location || settings?.location_url || settings?.phone || settings?.phone_2) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <MapPin className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                        {language === 'ar' ? 'الموقع والتواصل' : language === 'ku' ? 'ناونیشان و پەیوەندی' : 'Location & Contact'}
                      </span>
                    </div>
                    {settings?.location && <p className="text-sm text-accent/60 font-light leading-relaxed">{settings.location}</p>}
                    
                    <div className="space-y-2">
                      {settings?.phone && (
                        <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-sm text-accent/60 hover:text-primary transition-colors">
                          <Phone className="w-3 h-3" />
                          <span>{settings.phone}</span>
                        </a>
                      )}
                      {settings?.phone_2 && (
                        <a href={`tel:${settings.phone_2}`} className="flex items-center gap-3 text-sm text-accent/60 hover:text-primary transition-colors">
                          <Phone className="w-3 h-3" />
                          <span>{settings.phone_2}</span>
                        </a>
                      )}
                    </div>

                    {settings?.location_url && (
                      <a 
                        href={settings.location_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block text-[9px] uppercase tracking-widest text-primary border-b border-primary/30 pb-1"
                      >
                        {language === 'ar' ? 'عرض على الخريطة' : language === 'ku' ? 'لە سەر نەخشە بیبینە' : 'View on Gallery'}
                      </a>
                    )}
                  </div>
                )}

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-primary">
                      <Search className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                        {language === 'ar' ? 'تواصل معنا' : language === 'ku' ? 'پەیوندیمان پێوە بکە' : 'Get Connected'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {socialLinks.map(link => (
                        <a 
                          key={link.id} 
                          href={link.url!} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/40 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <link.icon className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-xs uppercase tracking-widest font-medium">{link.label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-accent/20" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <a 
                href={settings?.social_links?.developer_whatsapp ? `https://wa.me/${settings.social_links.developer_whatsapp.replace(/[^0-9]/g, '')}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-8 border-t border-white/5 opacity-40 hover:opacity-80 transition-opacity text-[9px] uppercase tracking-[0.5em] text-center block"
              >
                Powered by DA
              </a>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/5 px-8 py-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
           >
             <Menu className="w-5 h-5 text-primary" />
           </button>
           {settings?.logo_url ? (
             <img src={settings.logo_url} alt="Logo" className="h-10 w-auto" />
           ) : (
             <span className="font-serif italic text-2xl tracking-[0.1em] text-primary">{settings?.name}</span>
           )}
         </div>
         <div className="flex gap-4 items-center">
           <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
              {['en', 'ar', 'ku'].map((l) => (
                <button 
                  key={l}
                  onClick={() => setLanguage(l as any)}
                  className={`px-3 py-1 text-[9px] rounded-full tracking-widest uppercase transition-all ${language === l ? 'bg-primary text-black font-bold' : 'text-accent/40'}`}
                >
                  {l}
                </button>
              ))}
           </div>
         </div>
      </header>

      {/* Hero / Marketing Slider */}
      {slides.length > 0 && (
        <section className="relative z-10 h-52 overflow-hidden border-b border-white/5 mx-6 mt-6 rounded-[40px]">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
          <img src={slides[0].image_url} alt="Promo" className="absolute inset-0 w-full h-full object-cover z-0" />
          <div className="absolute inset-0 flex items-center px-12 z-20">
            <div className="max-w-md">
            </div>
          </div>
        </section>
      )}

      {/* Announcement Section */}
      {settings?.announcement?.show && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-6 mt-8 overflow-hidden rounded-[32px] border border-white/5 bg-white/5 backdrop-blur-2xl"
        >
          <div className="flex flex-col md:flex-row">
            {settings.announcement.media_url && (
              <div className="w-full md:w-2/5 aspect-[16/9] md:aspect-square">
                {settings.announcement.media_type === 'video' ? (
                  <video 
                    src={settings.announcement.media_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={settings.announcement.media_url}
                    alt="Announcement"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            )}
            <div className={`p-8 flex flex-col justify-center ${!settings.announcement.media_url ? 'w-full text-center' : 'w-full md:w-3/5'}`}>
              <div className="inline-flex items-center gap-2 text-primary text-[9px] uppercase tracking-[0.4em] mb-4 mx-auto md:mx-0 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {language === 'ar' ? 'حدث قادم' : language === 'ku' ? 'چالاکی داهاتوو' : 'Upcoming Event'}
              </div>
              <p className="text-accent/70 text-base md:text-lg font-light leading-relaxed font-serif italic">
                {settings.announcement[`text_${language}` as keyof typeof settings.announcement] || settings.announcement.text_en}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* Categories */}
      <section className="relative z-10 h-36 px-8 flex items-center gap-6 overflow-x-auto scrollbar-hide py-4">
        {categories.map(cat => {
          const catName = language === 'en' ? cat.name_en : language === 'ar' ? cat.name_ar : cat.name_ku;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center gap-3 shrink-0 transition-all duration-700 ${isActive ? 'scale-110' : 'opacity-30 hover:opacity-100'}`}
            >
              <div className={`w-16 h-16 rounded-full border-2 p-1 transition-all duration-700 ${isActive ? 'border-primary bg-primary/20 shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'border-white/10'}`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-black/40">
                  <img 
                    src={cat.image_url} 
                    alt={catName} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className={`text-[10px] tracking-widest uppercase font-bold text-center max-w-[80px] line-clamp-1 ${isActive ? 'text-primary' : 'text-accent/60'}`}>
                {catName}
              </span>
            </button>
          );
        })}
      </section>

      {/* Products Grid */}
      <main className="relative z-10 px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        <AnimatePresence mode="popLayout">
          {filteredItems.map(item => {
            const name = language === 'en' ? item.name_en : language === 'ar' ? item.name_ar : item.name_ku;
            const desc = language === 'en' ? item.desc_en : language === 'ar' ? item.desc_ar : item.desc_ku;
            const subName = language !== 'ar' ? item.name_ar : item.name_en;

            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group flex flex-col bg-white/5 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden hover:border-primary/40 transition-all duration-700"
              >
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={item.image_url} 
                    alt={name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6 flex flex-col gap-1">
                  <h3 className="text-[15px] font-medium tracking-wide uppercase transition-colors group-hover:text-primary">{name}</h3>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] text-accent/30 uppercase tracking-[0.2em]">{subName}</p>
                    <span className="text-[13px] text-primary font-bold tracking-widest">{item.price}</span>
                  </div>
                  <p className="text-[11px] text-accent/40 leading-relaxed line-clamp-2 mt-2 font-light italic">{desc}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-20 border-t border-white/5 text-center space-y-6">
        <div className="w-12 h-px bg-primary/20 mx-auto" />
      </footer>
    </div>
  );
};

export default MenuPage;
