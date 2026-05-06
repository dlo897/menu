import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Settings, LayoutGrid, Utensils, Palette, LogOut, ChevronRight, Save, Upload, Image as ImageIcon, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HexColorPicker } from "react-colorful";

// Helper to upload files to Supabase Storage
const uploadFile = async (file: File, bucket: string = 'media') => {
  if (!supabase) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};

const AdminDashboard: React.FC = () => {
  const { settings } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'theme' | 'categories' | 'items'>('general');
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Form States
  const [venueName, setVenueName] = useState(settings?.name || '');
  const [logoUrl, setLogoUrl] = useState(settings?.logo_url || '');
  const [splashUrl, setSplashUrl] = useState(settings?.splash_background_url || '');
  const [menuBgUrl, setMenuBgUrl] = useState(settings?.menu_background_url || '');
  const [phone, setPhone] = useState(settings?.phone || '');
  const [phone2, setPhone2] = useState(settings?.phone_2 || '');
  const [announcement, setAnnouncement] = useState(settings?.announcement || {
    show: false,
    text_en: '',
    text_ar: '',
    text_ku: '',
    media_url: '',
    media_type: 'image'
  });
  const [locationName, setLocationName] = useState(settings?.location || '');
  const [locationUrl, setLocationUrl] = useState(settings?.location_url || '');
  const [socialLinks, setSocialLinks] = useState({
    instagram: settings?.social_links?.instagram || '',
    facebook: settings?.social_links?.facebook || '',
    snapchat: settings?.social_links?.snapchat || '',
    tiktok: settings?.social_links?.tiktok || '',
    whatsapp: settings?.social_links?.whatsapp || '',
    developer_whatsapp: settings?.social_links?.developer_whatsapp || ''
  });
  const [workingHours, setWorkingHours] = useState(settings?.working_hours || {
    en: '',
    ar: '',
    ku: ''
  });
  const [colors, setColors] = useState(settings?.theme || {
    primary_color: "#D4AF37",
    secondary_color: "#111111",
    background_color: "#070707",
    accent_color: "#E0D8D0"
  });

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      navigate('/admin/login');
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate('/admin/login');
    });
  }, [navigate]);

  useEffect(() => {
    if (settings) {
      setVenueName(settings.name);
      setColors(settings.theme);
      setLogoUrl(settings.logo_url || '');
      setSplashUrl(settings.splash_background_url || '');
      setMenuBgUrl(settings.menu_background_url || '');
      setPhone(settings.phone || '');
      setPhone2(settings.phone_2 || '');
      setAnnouncement(settings.announcement || {
        show: false,
        text_en: '',
        text_ar: '',
        text_ku: '',
        media_url: '',
        media_type: 'image'
      });
      setLocationName(settings.location || '');
      setLocationUrl(settings.location_url || '');
      setSocialLinks({
        instagram: settings.social_links?.instagram || '',
        facebook: settings.social_links?.facebook || '',
        snapchat: settings.social_links?.snapchat || '',
        tiktok: settings.social_links?.tiktok || '',
        whatsapp: settings.social_links?.whatsapp || '',
        developer_whatsapp: settings.social_links?.developer_whatsapp || ''
      });
      setWorkingHours(settings.working_hours || {
        en: '',
        ar: '',
        ku: ''
      });
    }
  }, [settings]);

  const handleUpdateSettings = async () => {
    if (!supabase) return;
    setLoading(true);
    const newSettings = {
      ...settings,
      name: venueName,
      logo_url: logoUrl,
      splash_background_url: splashUrl,
      menu_background_url: menuBgUrl,
      phone: phone,
      phone_2: phone2,
      announcement: announcement,
      location: locationName,
      location_url: locationUrl,
      social_links: socialLinks,
      working_hours: workingHours,
      theme: colors
    };

    const { error } = await supabase
      .from('settings')
      .update({ value: newSettings })
      .eq('key', 'venue_settings');

    if (error) {
      alert('Error updating settings: ' + error.message);
    } else {
      alert('Settings updated successfully! Changes are live.');
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadLoading(true);
    try {
      const url = await uploadFile(file);
      if (url) setter(url);
    } catch (error: any) {
      console.error('Upload Error:', error);
      alert(`Upload failed! Please ensure you have a public bucket named "media" in your Supabase Storage.\n\nError: ${error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-black text-accent flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 sticky top-0 h-screen">
         <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
               <Settings className="w-4 h-4 text-primary" />
            </div>
         </div>

         <nav className="flex-1 space-y-2">
            {[
              { id: 'general', label: 'Venue Details', icon: Settings },
              { id: 'theme', label: 'Design Engine', icon: Palette },
              { id: 'categories', label: 'Categories', icon: LayoutGrid },
              { id: 'items', label: 'Menu Items', icon: Utensils },
              { id: 'marketing', label: 'Marketing Slides', icon: ImageIcon },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-primary text-black' : 'hover:bg-white/5 text-accent/60'}`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest font-bold">{tab.label}</span>
                </div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
         </nav>

         <button 
           onClick={handleLogout}
           className="mt-12 flex items-center gap-3 p-4 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
         >
           <LogOut className="w-4 h-4" />
           <span className="text-xs uppercase tracking-widest font-bold">Sign Out</span>
         </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 max-w-4xl">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-serif mb-2 tracking-tight">
              {activeTab === 'general' && 'Venue Settings'}
              {activeTab === 'theme' && 'Visual Identity'}
              {activeTab === 'categories' && 'Manage Categories'}
              {activeTab === 'items' && 'Manage Menu'}
            </h2>
            <p className="text-[10px] text-accent/40 uppercase tracking-[0.4em]">Proprietary Management System</p>
          </div>
          <button 
            onClick={handleUpdateSettings}
            disabled={loading}
            className="bg-accent text-black px-8 py-3 rounded-full flex items-center gap-2 hover:scale-[1.05] transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Publishing..." : "Publish Changes"}
          </button>
        </header>

        <div className="bg-secondary/30 backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 overflow-y-auto max-h-[80vh] scrollbar-hide">
          {activeTab === 'general' && (
            <div className="space-y-12">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">Venue Branding Name</label>
                <input 
                  type="text" 
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-3xl px-8 py-5 outline-none focus:border-primary/50 transition-all text-xl font-serif"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">App Logo</label>
                  <div className="relative group">
                    <div className="w-full h-32 bg-black/40 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center p-4">
                      {uploadLoading ? (
                        <div className="animate-pulse text-primary text-[10px] uppercase tracking-widest font-bold">Uploading...</div>
                      ) : logoUrl ? (
                        <img src={logoUrl} className="h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-white/20" />
                      )}
                      <input type="file" onChange={(e) => handleFileUpload(e, setLogoUrl)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" disabled={uploadLoading} title="Upload Logo" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">Landing Background (Video/Image)</label>
                  <div className="relative group">
                    <div className="w-full h-32 bg-black/40 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center p-4">
                      {uploadLoading ? (
                        <div className="animate-pulse text-primary text-[10px] uppercase tracking-widest font-bold">Uploading...</div>
                      ) : splashUrl ? (
                         splashUrl.endsWith('.mp4') ? <Film className="w-8 h-8 text-primary" /> : <img src={splashUrl} className="h-full w-full object-cover rounded-2xl" />
                      ) : (
                        <Upload className="w-8 h-8 text-white/20" />
                      )}
                      <input type="file" onChange={(e) => handleFileUpload(e, setSplashUrl)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,video/*" disabled={uploadLoading} title="Upload Background" />
                    </div>
                  </div>
                </div>
                <div className="col-span-full">
                  <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">Menu Background Layer (Optional)</label>
                  <div className="relative group">
                    <div className="w-full h-32 bg-black/40 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center p-4">
                      {uploadLoading ? (
                        <div className="animate-pulse text-primary text-[10px] uppercase tracking-widest font-bold">Uploading...</div>
                      ) : menuBgUrl ? (
                         menuBgUrl.endsWith('.mp4') ? <Film className="w-8 h-8 text-primary" /> : <img src={menuBgUrl} className="h-full w-full object-cover rounded-2xl" />
                      ) : (
                        <Upload className="w-8 h-8 text-white/20" />
                      )}
                      <input type="file" onChange={(e) => handleFileUpload(e, setMenuBgUrl)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,video/*" disabled={uploadLoading} title="Upload Menu Background" />
                    </div>
                  </div>
                  <p className="text-[10px] text-accent/20 mt-2 ml-4">This background will appear behind the menu items as a subtle layer.</p>
                </div>

                <div className="col-span-full space-y-8">
                  <h3 className="text-primary font-serif italic text-lg border-b border-white/5 pb-2">Business Presence</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">Location Name</label>
                      <input 
                        type="text" 
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        placeholder="e.g. Center Mall, 2nd Floor"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">Google Maps Link</label>
                      <input 
                        type="text" 
                        value={locationUrl}
                        onChange={(e) => setLocationUrl(e.target.value)}
                        placeholder="https://goo.gl/maps/..."
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">Phone Number 1</label>
                      <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+964..."
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">Phone Number 2 (Optional)</label>
                      <input 
                        type="text" 
                        value={phone2}
                        onChange={(e) => setPhone2(e.target.value)}
                        placeholder="+964..."
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <h3 className="text-primary font-serif italic text-lg border-b border-white/5 pb-2">Announcement / Event Overlay</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-center gap-4 py-4">
                      <button 
                        onClick={() => setAnnouncement(prev => ({ ...prev, show: !prev.show }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${announcement.show ? 'bg-primary' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${announcement.show ? 'left-7' : 'left-1'}`} />
                      </button>
                      <span className="text-sm uppercase tracking-widest text-accent/60">Show Announcement Section</span>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">Media Type</label>
                      <select 
                        value={announcement.media_type}
                        onChange={(e) => setAnnouncement(prev => ({ ...prev, media_type: e.target.value as any }))}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm appearance-none"
                      >
                        <option value="image" className="bg-black">Image</option>
                        <option value="video" className="bg-black">Video</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                       <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">Media (Upload or Direct Link)</label>
                       <div className="flex flex-col md:flex-row gap-4">
                         <div className="flex-1">
                           <input 
                             type="text" 
                             value={announcement.media_url}
                             onChange={(e) => setAnnouncement(prev => ({ ...prev, media_url: e.target.value }))}
                             placeholder="https://..."
                             className="w-full h-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm"
                           />
                         </div>
                         <div className="relative group w-32 h-32 flex-shrink-0">
                           <div className="w-full h-full bg-black/40 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center p-4">
                             {uploadLoading ? (
                               <div className="animate-pulse text-primary text-[10px] uppercase tracking-widest font-bold">...</div>
                             ) : announcement.media_url ? (
                               announcement.media_type === 'video' ? <Film className="w-6 h-6 text-primary" /> : <img src={announcement.media_url} className="h-full w-full object-cover rounded-xl" />
                             ) : (
                               <Upload className="w-6 h-6 text-white/20" />
                             )}
                             <input 
                               type="file" 
                               onChange={(e) => handleFileUpload(e, (url) => setAnnouncement(prev => ({ ...prev, media_url: url })))} 
                               className="absolute inset-0 opacity-0 cursor-pointer" 
                               accept={announcement.media_type === 'video' ? "video/*" : "image/*"} 
                               disabled={uploadLoading} 
                               title="Upload Media" 
                             />
                           </div>
                         </div>
                       </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">English Description</label>
                      <textarea 
                        value={announcement.text_en}
                        onChange={(e) => setAnnouncement(prev => ({ ...prev, text_en: e.target.value }))}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm min-h-[100px]"
                      />
                    </div>

                    <div dir="rtl">
                      <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">Arabic Description</label>
                      <textarea 
                        value={announcement.text_ar}
                        onChange={(e) => setAnnouncement(prev => ({ ...prev, text_ar: e.target.value }))}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm min-h-[100px]"
                      />
                    </div>

                    <div dir="rtl">
                      <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">Kurdish Description</label>
                      <textarea 
                        value={announcement.text_ku}
                        onChange={(e) => setAnnouncement(prev => ({ ...prev, text_ku: e.target.value }))}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm min-h-[100px]"
                      />
                    </div>
                  </div>

                  <h3 className="text-primary font-serif italic text-lg border-b border-white/5 pb-2">Social Connections</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { key: 'instagram', label: 'Instagram' },
                      { key: 'facebook', label: 'Facebook' },
                      { key: 'snapchat', label: 'Snapchat' },
                      { key: 'tiktok', label: 'TikTok' },
                      { key: 'whatsapp', label: 'Venue WhatsApp' },
                      { key: 'developer_whatsapp', label: 'Developer WhatsApp' },
                    ].map(social => (
                      <div key={social.key}>
                        <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">{social.label}</label>
                        <input 
                          type="text" 
                          value={(socialLinks as any)[social.key]}
                          onChange={(e) => setSocialLinks(prev => ({ ...prev, [social.key]: e.target.value }))}
                          placeholder={social.key === 'developer_whatsapp' ? "Programming Specialist Number" : `Link to ${social.label}`}
                          className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <h3 className="text-primary font-serif italic text-lg border-b border-white/5 pb-2">Working Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">Hours (English)</label>
                      <input 
                        type="text" 
                        value={workingHours.en}
                        onChange={(e) => setWorkingHours(prev => ({ ...prev, en: e.target.value }))}
                        placeholder="Mon - Sat: 10AM - 11PM"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">Hours (Arabic)</label>
                      <input 
                        type="text" 
                        value={workingHours.ar}
                        onChange={(e) => setWorkingHours(prev => ({ ...prev, ar: e.target.value }))}
                        placeholder="يومياً من ١٠ صباحاً"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm text-right font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-accent/40 mb-3 ml-4">Hours (Kurdish)</label>
                      <input 
                        type="text" 
                        value={workingHours.ku}
                        onChange={(e) => setWorkingHours(prev => ({ ...prev, ku: e.target.value }))}
                        placeholder="ڕۆژانە ١٠ بەیانی"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm text-right font-sans"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="grid grid-cols-2 gap-12">
              {[
                { key: 'primary_color', label: 'Primary Brand Color' },
                { key: 'background_color', label: 'Surface Background' },
                { key: 'secondary_color', label: 'Container/Card Fill' },
                { key: 'accent_color', label: 'Text/Contrast Color' },
              ].map(color => (
                <div key={color.key} className="space-y-4">
                  <label className="block text-[10px] uppercase tracking-widest text-accent/40 ml-4">{color.label}</label>
                  <HexColorPicker 
                    color={(colors as any)[color.key]} 
                    onChange={(newColor) => setColors(prev => ({ ...prev, [color.key]: newColor }))} 
                    className="w-full !h-48"
                  />
                  <div className="flex items-center gap-3 px-6 py-4 bg-black/40 rounded-full border border-white/5">
                    <div className="w-6 h-6 rounded-full border border-white/10" style={{ backgroundColor: (colors as any)[color.key] }} />
                    <span className="text-xs font-mono uppercase tracking-widest">{(colors as any)[color.key]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'items' && <ItemManager />}
          {activeTab === 'marketing' && <MarketingManager />}
        </div>
      </main>
    </div>
  );
};

// --- Management Components ---

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('order_index');
    setCategories(data || []);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    let imageUrl = editing?.image_url;

    try {
      if (imageFile) {
        imageUrl = await uploadFile(imageFile);
      }

      const payload = {
        name_en: formData.get('name_en'),
        name_ar: formData.get('name_ar'),
        name_ku: formData.get('name_ku'),
        image_url: imageUrl,
        order_index: parseInt(formData.get('order_index') as string) || 0,
      };

      if (editing) {
        await supabase.from('categories').update(payload).eq('id', editing.id);
      } else {
        await supabase.from('categories').insert([payload]);
      }

      setEditing(null);
      setImageFile(null);
      fetchCategories();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Category Submit Error:', error);
      alert('Error saving category: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-8 rounded-3xl border border-white/5">
        <h4 className="col-span-full text-primary font-serif italic text-lg">{editing ? 'Edit Category' : 'Register New Category'}</h4>
        <div className="col-span-full flex justify-center mb-4">
          <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden">
             {imageFile ? (
               <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" />
             ) : editing?.image_url ? (
               <img src={editing.image_url} className="w-full h-full object-cover" />
             ) : <Upload className="w-6 h-6 text-primary/30" />}
             <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
          </div>
        </div>
        <input name="name_en" defaultValue={editing?.name_en} placeholder="English Label" className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm" required />
        <input name="name_ar" defaultValue={editing?.name_ar} placeholder="العنوان العربي" className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm text-right font-sans" required />
        <input name="name_ku" defaultValue={editing?.name_ku} placeholder="ناوی کوردی" className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm text-right font-sans" required />
        <input name="order_index" type="number" defaultValue={editing?.order_index || 0} placeholder="Priority (Order)" className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm" />
        <div className="col-span-full flex gap-4">
          <button type="submit" disabled={loading} className="flex-1 bg-primary text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[10px]">
             {loading ? 'Processing Sync...' : (editing ? 'Update Category' : 'Create Category')}
          </button>
          {editing && <button type="button" onClick={() => {setEditing(null); setImageFile(null);}} className="text-accent/40 text-[10px] uppercase font-bold tracking-widest px-6">Cancel</button>}
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary transition-all">
            <div className="flex items-center gap-4">
              <img src={cat.image_url} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
              <div className="text-left font-sans">
                <p className="text-sm font-semibold">{cat.name_en} | {cat.name_ar}</p>
                <p className="text-[9px] text-accent/30 uppercase tracking-[0.2em]">{cat.name_ku}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(cat)} className="px-4 py-2 text-[9px] uppercase tracking-tighter bg-white/5 rounded-full">Edit</button>
              <button onClick={() => supabase.from('categories').delete().eq('id', cat.id).then(fetchCategories)} className="px-4 py-2 text-[9px] uppercase tracking-tighter text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ItemManager: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchData = async () => {
    const { data: cats } = await supabase.from('categories').select('*').order('order_index');
    const { data: menuItems } = await supabase.from('items').select('*, categories(name_en)').order('order_index');
    setCategories(cats || []);
    setItems(menuItems || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    let imageUrl = editing?.image_url;

    try {
      if (imageFile) {
        imageUrl = await uploadFile(imageFile);
      }

      const payload = {
        category_id: formData.get('category_id'),
        name_en: formData.get('name_en'),
        name_ar: formData.get('name_ar'),
        name_ku: formData.get('name_ku'),
        desc_en: formData.get('desc_en'),
        desc_ar: formData.get('desc_ar'),
        desc_ku: formData.get('desc_ku'),
        price: formData.get('price') as string,
        image_url: imageUrl,
        is_available: true,
        order_index: parseInt(formData.get('order_index') as string) || 0,
      };

      if (editing) {
        await supabase.from('items').update(payload).eq('id', editing.id);
      } else {
        await supabase.from('items').insert([payload]);
      }

      setEditing(null);
      setImageFile(null);
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Submit Error:', error);
      alert('Error saving item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/20 p-8 rounded-3xl border border-white/5">
        <h4 className="col-span-full text-primary font-serif italic text-lg">{editing ? 'Edit Dish' : 'Add New Dish'}</h4>
        <div className="col-span-full flex justify-center mb-4">
           <div className="relative w-48 h-32 rounded-3xl border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden">
              {imageFile ? (
                <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" />
              ) : editing?.image_url ? (
                <img src={editing.image_url} className="w-full h-full object-cover" />
              ) : <ImageIcon className="w-8 h-8 text-primary/30" />}
              <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
           </div>
        </div>
        <select name="category_id" defaultValue={editing?.category_id} className="col-span-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-accent/60" required>
           <option value="">Choose Category</option>
           {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
        </select>
        <input name="name_en" defaultValue={editing?.name_en} placeholder="Name (EN)" className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm" required />
        <input name="name_ar" defaultValue={editing?.name_ar} placeholder="الإسم (AR)" className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm text-right font-sans" required />
        <input name="name_ku" defaultValue={editing?.name_ku} placeholder="ناو (KU)" className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm text-right font-sans" required />
        <input name="price" type="text" defaultValue={editing?.price} placeholder="Price (e.g. 5000 IQD or 5$)" className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm" required />
        <input name="order_index" type="number" defaultValue={editing?.order_index || 0} placeholder="Display Priority" className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm" />
        
        <textarea name="desc_en" defaultValue={editing?.desc_en} placeholder="Description (English)" className="col-span-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none h-24 text-sm" />
        <textarea name="desc_ar" defaultValue={editing?.desc_ar} placeholder="الوصف بالعربية" className="col-span-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none h-24 text-sm text-right font-sans" />
        <textarea name="desc_ku" defaultValue={editing?.desc_ku} placeholder="وەسف بە کوردی" className="col-span-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none h-24 text-sm text-right font-sans" />

        <div className="col-span-full flex gap-4">
          <button type="submit" disabled={loading} className="flex-1 bg-primary text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[10px]">
             {loading ? 'Transmitting Data...' : (editing ? 'Save Changes' : 'Launch Dish')}
          </button>
          {editing && <button type="button" onClick={() => {setEditing(null); setImageFile(null);}} className="text-accent/40 text-[10px] uppercase font-bold tracking-widest px-6">Cancel</button>}
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary transition-all">
            <div className="flex items-center gap-4">
              <img src={item.image_url} className="w-14 h-14 rounded-xl object-cover" />
              <div className="text-left font-sans">
                <p className="text-sm font-semibold">{item.name_en} <span className="text-primary ml-2">{item.price}</span></p>
                <p className="text-[10px] text-accent/30 uppercase tracking-widest">{item.categories?.name_en || 'DA Selection'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(item)} className="px-4 py-2 text-[9px] uppercase tracking-tighter bg-white/5 rounded-full">Edit</button>
              <button onClick={() => supabase.from('items').delete().eq('id', item.id).then(fetchData)} className="px-4 py-2 text-[9px] uppercase tracking-tighter text-red-500">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MarketingManager: React.FC = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchSlides = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('marketing_slides').select('*').order('order_index');
    setSlides(data || []);
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    let imageUrl = editing?.image_url;

    try {
      if (imageFile) {
        imageUrl = await uploadFile(imageFile);
      }

      const payload = {
        image_url: imageUrl,
        order_index: parseInt(formData.get('order_index') as string) || 0,
        is_active: true
      };

      if (editing) {
        await supabase.from('marketing_slides').update(payload).eq('id', editing.id);
      } else {
        await supabase.from('marketing_slides').insert([payload]);
      }

      setEditing(null);
      setImageFile(null);
      fetchSlides();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Promo Submit Error:', error);
      alert('Error saving slide: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-8 rounded-3xl border border-white/5">
        <h4 className="col-span-full text-primary font-serif italic text-lg">{editing ? 'Edit Slide' : 'Add Promo Slide'}</h4>
        <div className="col-span-full flex justify-center mb-4">
          <div className="relative w-full h-40 rounded-3xl border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden">
             {imageFile ? (
               <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" />
             ) : editing?.image_url ? (
               <img src={editing.image_url} className="w-full h-full object-cover" />
             ) : <Upload className="w-6 h-6 text-primary/30" />}
             <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
          </div>
        </div>
        <input name="order_index" type="number" defaultValue={editing?.order_index || 0} placeholder="Priority" className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none text-sm" />
        <div className="flex gap-4 items-end">
          <button type="submit" disabled={loading} className="w-full bg-primary text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[10px]">
             {loading ? 'Processing...' : (editing ? 'Update Slide' : 'Publish Slide')}
          </button>
          {editing && <button type="button" onClick={() => {setEditing(null); setImageFile(null);}} className="text-accent/40 text-[10px] uppercase font-bold tracking-widest px-6">Cancel</button>}
        </div>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pb-20">
        {slides.map(slide => (
          <div key={slide.id} className="group relative aspect-video rounded-3xl overflow-hidden border border-white/5 hover:border-primary transition-all">
            <img src={slide.image_url} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button onClick={() => setEditing(slide)} className="bg-white text-black px-4 py-2 rounded-full text-[9px] uppercase font-bold">Edit</button>
              <button onClick={() => supabase.from('marketing_slides').delete().eq('id', slide.id).then(fetchSlides)} className="bg-red-500 text-white px-4 py-2 rounded-full text-[9px] uppercase font-bold">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
