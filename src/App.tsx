/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from './translations';
import { db, auth, login, logout, fetchConfig, saveConfig, subscribeToConfig } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  Trees, 
  TrainFront, 
  MapPin, 
  Building2, 
  Maximize2, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layout,
  Star,
  Users,
  Compass,
  Menu,
  X,
  Settings,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Box,
  Globe,
  LogIn,
  LogOut
} from 'lucide-react';

// --- Components ---

const VirtualTourModal = ({ url, onClose }: { url: string; onClose: () => void }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-dark/95 backdrop-blur-xl flex flex-col"
    >
      <div className="flex justify-between items-center px-6 md:px-10 py-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gold flex items-center justify-center">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-display text-[10px] md:text-[12px] uppercase tracking-widest text-white font-bold">360° Showroom Experience</h4>
            <p className="font-serif text-[10px] md:text-xs italic text-gold">Parkside Residences @ Setia Federal Hill</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center hover:bg-white/5 border border-white/10 rounded-full transition-all group"
        >
          <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
      </div>
      
      <div className="flex-1 relative bg-black">
        <iframe 
          src={url} 
          className="w-full h-full border-none"
          title="Virtual Tour"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="px-10 py-4 bg-dark border-t border-white/5 flex justify-center">
        <p className="font-display text-[9px] uppercase tracking-widest text-white/40">Use your mouse or finger to navigate the space</p>
      </div>
    </motion.div>
  );
};

const EditPanel = ({ 
  images, 
  onUpdate, 
  seo,
  onUpdateSeo,
  onReset,
  onSaveBulk 
}: { 
  images: any; 
  onUpdate: (key: string, url: string) => void;
  seo: any;
  onUpdateSeo: (key: string, value: string) => void;
  onReset: () => void;
  onSaveBulk: (newImages: any, newSeo: any) => Promise<any>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'gallery' | 'units' | 'facilities' | 'seo'>('general');
  const [typedPassword, setTypedPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTrigger, setShowTrigger] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkAdmin = () => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('admin') === 'true' || window.location.hash === '#admin') {
          setShowTrigger(true);
          setIsOpen(true);
        }
      };

      checkAdmin();
      window.addEventListener('hashchange', checkAdmin);

      let keySequence: string[] = [];
      const targetSequence = ['a', 'd', 'm', 'i', 'n'];
      
      const handleKeyDown = (e: KeyboardEvent) => {
        const targetTag = (e.target as HTMLElement)?.tagName;
        if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;

        keySequence.push(e.key.toLowerCase());
        keySequence = keySequence.slice(-targetSequence.length);
        
        if (JSON.stringify(keySequence) === JSON.stringify(targetSequence)) {
          setShowTrigger(true);
          setIsOpen(prev => !prev);
        }
      };

      const handleOpenAdmin = () => {
        setShowTrigger(true);
        setIsOpen(true);
      };

      window.addEventListener('open-admin-panel', handleOpenAdmin);
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('hashchange', checkAdmin);
        window.removeEventListener('open-admin-panel', handleOpenAdmin);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  const correctPassword = 'parkside2026123';

  const handleSave = async () => {
    if (!isUnlocked) {
      alert("Please enter the correct password first.");
      return;
    }
    
    setIsSaving(true);
    
    try {
      await onSaveBulk(images, seo);
      setTimeout(() => {
        setIsSaving(false);
        setIsOpen(false);
      }, 500);
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving: The database might be restricted. Ensure I've updated the rules for you!");
      setIsSaving(false);
    }
  };

  const handleUnlock = () => {
    if (typedPassword === correctPassword) {
      setIsUnlocked(true);
      setTypedPassword('');
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  const categories = {
    general: [
      { key: 'hero', label: 'Hero Background' },
      { key: 'vision', label: 'Overview Masterplan' },
      { key: 'locationMap', label: 'Location Map Image' }
    ],
    gallery: [
      { key: 'gallery1', label: 'Gallery 1 (Lobby/Hero)' },
      { key: 'gallery2', label: 'Gallery 2 (Refinement)' },
      { key: 'gallery3', label: 'Gallery 3 (Amenity)' },
      { key: 'gallery4', label: 'Gallery 4 (Amenity)' },
      { key: 'gallery5', label: 'Gallery 5 (Amenity)' },
      { key: 'gallery6', label: 'Gallery 6 (Amenity)' }
    ],
    units: [
      { key: 'unitA_1', label: 'Unit A - Layout 1' },
      { key: 'unitA_2', label: 'Unit A - Layout 2' },
      { key: 'unitA_3', label: 'Unit A - Layout 3' },
      { key: 'unitA_tour', label: 'Unit A - Virtual Tour URL' },
      { key: 'unitB_1', label: 'Unit B - Layout 1' },
      { key: 'unitB_2', label: 'Unit B - Layout 2' },
      { key: 'unitB_3', label: 'Unit B - Layout 3' },
      { key: 'unitB_tour', label: 'Unit B - Virtual Tour URL' },
      { key: 'unitC_1', label: 'Unit C - Layout 1' },
      { key: 'unitC_2', label: 'Unit C - Layout 2' },
      { key: 'unitC_3', label: 'Unit C - Layout 3' },
      { key: 'unitC_tour', label: 'Unit C - Virtual Tour URL' },
      { key: 'unitD_1', label: 'Unit D - Layout 1' },
      { key: 'unitD_2', label: 'Unit D - Layout 2' },
      { key: 'unitD_3', label: 'Unit D - Layout 3' },
      { key: 'unitD_tour', label: 'Unit D - Virtual Tour URL' },
      { key: 'unitE_1', label: 'Unit E - Layout 1' },
      { key: 'unitE_2', label: 'Unit E - Layout 2' },
      { key: 'unitE_3', label: 'Unit E - Layout 3' },
      { key: 'unitE_tour', label: 'Unit E - Virtual Tour URL' }
    ],
    facilities: [
      { key: 'facility8_1', label: 'Level 8: Retreat - Image 1' },
      { key: 'facility8_2', label: 'Level 8: Retreat - Image 2' },
      { key: 'facility8_3', label: 'Level 8: Retreat - Image 3' },
      { key: 'facility8_4', label: 'Level 8: Retreat - Image 4' },
      { key: 'facility43_1', label: 'Level 43: Collective - Image 1' },
      { key: 'facility43_2', label: 'Level 43: Collective - Image 2' },
      { key: 'facility43_3', label: 'Level 43: Collective - Image 3' },
      { key: 'facility43_4', label: 'Level 43: Collective - Image 4' },
      { key: 'facility61_1', label: 'Level 61: Sky - Image 1' },
      { key: 'facility61_2', label: 'Level 61: Sky - Image 2' },
      { key: 'facility61_3', label: 'Level 61: Sky - Image 3' },
      { key: 'facility61_4', label: 'Level 61: Sky - Image 4' }
    ]
  };

  return (
    <>
      {showTrigger && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[100] w-12 h-12 bg-dark border border-gold/50 text-gold flex items-center justify-center rounded-full shadow-2xl hover:scale-110 transition-transform group"
          title="Open Editor"
        >
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-0 right-0 h-full w-96 bg-white/95 backdrop-blur-xl z-[110] shadow-[-20px_0_60px_rgba(0,0,0,0.1)] border-l border-dark/5 p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-dark text-gold flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display text-[10px] uppercase tracking-widest text-dark font-bold">SEO & Image Admin</h4>
                  <p className="font-serif text-xs italic text-dark/40">Custom Settings Panel</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-dark/5 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-dark" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-dark/5 mb-8 shrink-0 overflow-x-auto gap-1 pb-1 scrollbar-none">
              {(['general', 'gallery', 'units', 'facilities', 'seo'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-2 font-display text-[9px] uppercase tracking-widest transition-all shrink-0 ${
                    activeTab === tab ? 'text-gold border-b-2 border-gold font-bold' : 'text-dark/40 border-b-2 border-transparent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-10 custom-scrollbar">
              {activeTab === 'seo' ? (
                <div className="space-y-6">
                  <div className="p-3 bg-amber-50/50 border border-amber-500/15 text-[10px] text-amber-800 leading-relaxed rounded">
                    <span className="font-bold">SEO/AEO/GEO Optimization Tip:</span> Ensure your meta keywords and description contain highly relevant localized keywords (Bangsar, Setia Federal Hill, Kuala Lumpur) with natural prose for AI answer engines.
                  </div>
                  <section className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-3 h-3 text-gold" />
                      <span className="font-display text-[9px] uppercase tracking-[0.2em] text-dark/60 font-medium">English Headline</span>
                    </div>
                    <input 
                      type="text" 
                      value={seo?.headline_en || ''}
                      onChange={(e) => onUpdateSeo('headline_en', e.target.value)}
                      className="w-full bg-dark/5 border border-dark/10 p-3 text-[10px] focus:border-gold outline-none transition-all"
                      placeholder="e.g. Parkside Residences: Nature's Rhythm In Bangsar"
                    />
                  </section>
                  <section className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-3 h-3 text-gold" />
                      <span className="font-display text-[9px] uppercase tracking-[0.2em] text-dark/60 font-medium">Chinese Headline</span>
                    </div>
                    <input 
                      type="text" 
                      value={seo?.headline_zh || ''}
                      onChange={(e) => onUpdateSeo('headline_zh', e.target.value)}
                      className="w-full bg-dark/5 border border-dark/10 p-3 text-[10px] focus:border-gold outline-none transition-all"
                      placeholder="e.g. Parkside Residences: 城心脉搏，自然律动"
                    />
                  </section>
                  <section className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-3 h-3 text-gold" />
                      <span className="font-display text-[9px] uppercase tracking-[0.2em] text-dark/60 font-medium">Meta Description</span>
                    </div>
                    <textarea 
                      rows={4}
                      value={seo?.description || ''}
                      onChange={(e) => onUpdateSeo('description', e.target.value)}
                      className="w-full bg-dark/5 border border-dark/10 p-3 text-[10px] focus:border-gold outline-none transition-all resize-none"
                      placeholder="e.g. Parkside Residences Bangsar offers premium luxury living within the 52-acre Setia Federal Hill masterplan..."
                    />
                  </section>
                  <section className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-3 h-3 text-gold" />
                      <span className="font-display text-[9px] uppercase tracking-[0.2em] text-dark/60 font-medium">Meta Keywords</span>
                    </div>
                    <textarea 
                      rows={3}
                      value={seo?.keywords || ''}
                      onChange={(e) => onUpdateSeo('keywords', e.target.value)}
                      className="w-full bg-dark/5 border border-dark/10 p-3 text-[10px] focus:border-gold outline-none transition-all resize-none font-mono text-[9px]"
                      placeholder="e.g. Parkside Residences Bangsar, Setia Federal Hill, Bangsar Luxury Condo"
                    />
                  </section>
                  <section className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-3 h-3 text-gold" />
                      <span className="font-display text-[9px] uppercase tracking-[0.2em] text-dark/60 font-medium">Google Site Verification Key</span>
                    </div>
                    <input 
                      type="text" 
                      value={seo?.googleVerification || ''}
                      onChange={(e) => onUpdateSeo('googleVerification', e.target.value)}
                      className="w-full bg-dark/5 border border-dark/10 p-3 text-[10px] focus:border-gold outline-none transition-all font-mono"
                      placeholder="e.g. SEr_TXbqdQipXgvNzvT_CRujszChYw3tfdur2iLt2D8"
                    />
                  </section>
                </div>
              ) : (
                categories[activeTab].map((item) => (
                  <section key={item.key} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-3 h-3 text-gold" />
                      <span className="font-display text-[9px] uppercase tracking-[0.2em] text-dark/60 font-medium">{item.label}</span>
                    </div>
                    <div className="relative group">
                      <input 
                        type="text" 
                        value={images[item.key]}
                        onChange={(e) => onUpdate(item.key, e.target.value)}
                        className="w-full bg-dark/5 border border-dark/10 p-3 text-[10px] font-mono focus:border-gold outline-none transition-all truncate"
                        placeholder="Paste image URL here..."
                      />
                      <div className="mt-4 aspect-video bg-dark/5 overflow-hidden border border-dark/5">
                        <img 
                          src={images[item.key]} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://picsum.photos/seed/error/800/600";
                          }}
                        />
                      </div>
                    </div>
                  </section>
                ))
              )}
            </div>
             <div className="mt-8 pt-8 border-t border-dark/5 space-y-4 shrink-0">
               {isUnlocked ? (
                 <div className="px-4 py-2 bg-green-50 text-green-700 text-[10px] flex items-center justify-between mb-4 border border-green-100">
                   <div className="flex items-center gap-2">
                     <ShieldCheck className="w-3 h-3" />
                     <span className="font-bold uppercase tracking-wider">Admin Access Granted</span>
                   </div>
                   <button onClick={() => setIsUnlocked(false)} className="text-green-800 hover:underline">Lock</button>
                 </div>
               ) : (
                 <div className="space-y-3 mb-4">
                   <p className="text-[9px] uppercase tracking-[0.2em] text-dark/40 font-bold">Admin Unlock</p>
                   <div className="flex gap-2">
                     <input 
                       type="password"
                       value={typedPassword}
                       onChange={(e) => setTypedPassword(e.target.value)}
                       placeholder="Enter master password"
                       className="flex-1 bg-cream/50 border border-dark/5 px-3 py-2 text-[10px] outline-none focus:border-gold"
                       onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                     />
                     <button 
                       onClick={handleUnlock}
                       className="bg-gold text-white px-4 py-2 text-[9px] uppercase tracking-widest font-bold hover:bg-gold/90 transition-all shadow-sm"
                     >
                       Unlock
                     </button>
                   </div>
                 </div>
               )}

               <button 
                onClick={handleSave}
                disabled={!isUnlocked || isSaving}
                className={`w-full py-4 font-display text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  isUnlocked ? 'bg-dark text-white hover:bg-dark/90' : 'bg-dark/10 text-dark/20 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className={`w-3 h-3 ${!isUnlocked ? 'opacity-20' : ''}`} />
                )}
                {isSaving ? 'Processing...' : isUnlocked ? 'Save Changes Globally' : 'Unlock First to Save'}
              </button>

              <button 
                onClick={onReset}
                className="w-full py-4 border border-dark/10 text-dark/40 font-display text-[10px] uppercase tracking-[0.2em] hover:text-dark hover:border-dark transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3 h-3" /> Restore All Defaults
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Navbar = ({ lang, setLang }: { lang: 'en' | 'zh', setLang: (l: 'en' | 'zh') => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = translations[lang].nav;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t.vision, href: '#vision' },
    { name: t.gallery, href: '#gallery' },
    { name: t.residences, href: '#layouts' },
    { name: t.location, href: '#location' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-cream/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="flex flex-col">
          <span className={`font-serif text-2xl tracking-tight leading-none ${isScrolled ? 'text-dark' : 'text-white'}`}>
            PARKSIDE
          </span>
          <span className={`font-display text-[10px] tracking-[0.3em] uppercase mt-1 ${isScrolled ? 'text-gold' : 'text-gold'}`}>
            RESIDENCES
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-10 items-center">
          {/* Language Switcher */}
          <div className="flex bg-dark/5 backdrop-blur-md p-1 rounded-full border border-white/10 mr-4">
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-full text-[9px] font-display uppercase tracking-widest transition-all ${
                lang === 'en' ? 'bg-gold text-white shadow-lg' : 'text-dark/40 hover:text-dark'
              } ${!isScrolled && lang !== 'en' ? 'text-white/40 hover:text-white' : ''}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('zh')}
              className={`px-3 py-1 rounded-full text-[9px] font-display uppercase tracking-widest transition-all ${
                lang === 'zh' ? 'bg-gold text-white shadow-lg' : 'text-dark/40 hover:text-dark'
              } ${!isScrolled && lang !== 'zh' ? 'text-white/40 hover:text-white' : ''}`}
            >
              CH
            </button>
          </div>

          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href}
              className={`font-display text-[11px] uppercase tracking-widest transition-colors hover:text-gold ${
                isScrolled ? 'text-dark' : 'text-white'
              }`}
            >
              {link.name}
            </a>
          ))}
          <a 
            href={`https://wa.me/60126579508?text=${encodeURIComponent(translations[lang].whatsapp.enquire)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-gold text-white font-display text-[11px] uppercase tracking-widest hover:bg-gold-dark transition-all"
          >
            {t.enquire}
          </a>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
              isScrolled ? 'border-dark/10 text-dark' : 'border-white/20 text-white'
            }`}
          >
            <span className="font-display text-[10px] uppercase font-bold">{lang === 'en' ? 'CH' : 'EN'}</span>
          </button>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={isScrolled ? 'text-dark' : 'text-white'} />
            ) : (
              <Menu className={isScrolled ? 'text-dark' : 'text-white'} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-cream shadow-xl border-t border-dark/5 p-6 md:hidden flex flex-col gap-6"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="font-display text-[12px] uppercase tracking-widest text-dark"
              >
                {link.name}
              </a>
            ))}
            <a 
              href={`https://wa.me/60126579508?text=${encodeURIComponent(translations[lang].whatsapp.enquire)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-gold text-white font-display text-[12px] uppercase tracking-widest text-center"
            >
              {t.enquire}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

interface SectionHeadingProps {
  subtitle: string;
  title: string;
  centered?: boolean;
  dark?: boolean;
}

const SectionHeading = ({ subtitle, title, centered = true, dark = false }: SectionHeadingProps) => (
  <div className={`mb-10 md:mb-16 ${centered ? 'text-center' : 'text-left'}`}>
    <motion.span 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="font-display text-[9px] md:text-[11px] uppercase tracking-[0.4em] text-gold mb-3 md:mb-4 block"
    >
      {subtitle}
    </motion.span>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className={`font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl ${dark ? 'text-white' : 'text-dark'} leading-[1.1] text-balance`}
    >
      {title}
    </motion.h2>
  </div>
);

interface PropertyStatProps {
  label: string;
  value: string;
  icon: React.ElementType;
}

const PropertyStat = ({ label, value, icon: Icon }: PropertyStatProps) => (
  <div className="flex flex-col items-center p-6 bg-white border border-dark/5 group hover:border-gold/30 transition-all duration-500">
    <div className="w-12 h-12 flex items-center justify-center bg-cream mb-4 group-hover:scale-110 transition-transform">
      <Icon className="w-5 h-5 text-gold" />
    </div>
    <span className="font-display text-[10px] uppercase tracking-widest text-dark/40 mb-1 text-center">{label}</span>
    <span className="font-serif text-xl text-dark text-center">{value}</span>
  </div>
);

interface UnitCardProps {
  type: string;
  title: string;
  detail: string;
  features: string[];
  isActive: boolean;
  onClick: () => void;
}

interface LayoutPreviewProps {
  activeUnit: string;
  activeLayoutIndex: number;
  units: Record<string, UnitInfo>;
  setActiveLayoutIndex: (index: number) => void;
  onTourClick?: (url: string) => void;
  className?: string;
}

const LayoutPreview: React.FC<LayoutPreviewProps & { lang: 'en' | 'zh' }> = ({ 
  activeUnit, 
  activeLayoutIndex, 
  units, 
  setActiveLayoutIndex,
  onTourClick,
  lang,
  className = ""
}) => {
  const currentUnit = units[activeUnit];
  const t = translations[lang].residences.labels;
  const furnishings = translations[lang].residences.furnishings;
  
  return (
    <div className={`space-y-6 md:space-y-8 ${className}`}>
      <div className="relative aspect-square overflow-hidden bg-cream border border-dark/5 shadow-inner">
        <AnimatePresence mode="wait">
          <motion.img 
            key={`${activeUnit}-${activeLayoutIndex}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
            src={currentUnit.images[activeLayoutIndex] || currentUnit.images[0]}
            alt={currentUnit.title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.includes('.png')) {
                target.src = target.src.replace('.png', '.jpg');
              } else if (target.src.includes('.webp')) {
                target.src = target.src.replace('.webp', '.jpg');
              } else if (target.src.includes('.jpeg')) {
                target.src = target.src.replace('.jpeg', '.jpg');
              }
            }}
            className="w-full h-full object-contain p-4 md:p-8"
          />
        </AnimatePresence>
        
        {/* Virtual Tour Floating Button */}
        {currentUnit.virtualTour && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onTourClick?.(currentUnit.virtualTour!)}
            className="absolute top-4 md:top-6 left-4 md:left-6 px-3 md:px-4 py-1.5 md:py-2 bg-gold/90 hover:bg-gold backdrop-blur-md text-white font-display text-[8px] md:text-[10px] uppercase tracking-widest z-10 flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Box className="w-3 md:w-4 h-3 md:h-4" />
            {t.showroom}
          </motion.button>
        )}

        <div className="absolute top-4 md:top-6 right-4 md:right-6 px-3 md:px-4 py-1.5 md:py-2 bg-dark/80 backdrop-blur-md text-white font-display text-[8px] md:text-[10px] uppercase tracking-widest z-10">
          {currentUnit.images.length > 1 ? `Layout 0${activeLayoutIndex + 1}` : 'Preview'}
        </div>

        {/* Layout Switcher */}
        {currentUnit.images.length > 1 && (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10 px-3 md:px-4 py-1.5 md:py-2 bg-dark/10 backdrop-blur-md rounded-full border border-white/10">
            {currentUnit.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveLayoutIndex(idx)}
                className={`w-2 md:w-2.5 h-2 md:h-2.5 rounded-full transition-all ${
                  activeLayoutIndex === idx ? 'bg-gold w-5 md:w-6' : 'bg-dark/20 hover:bg-dark/40'
                }`}
                title={`View Layout 0${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-6 md:p-8 bg-cream border border-dark/5 space-y-6 text-dark text-left">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h4 className="font-serif text-xl md:text-2xl italic text-dark">{t.furnishing}</h4>
          {currentUnit.images.length > 1 && (
            <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-display uppercase tracking-widest text-gold italic">
              <ImageIcon className="w-3 h-3" /> {currentUnit.images.length} {t.options}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {furnishings.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <ShieldCheck className="w-3 md:w-4 h-3 md:h-4 text-gold shrink-0" />
              <span className="text-[10px] md:text-xs text-dark/60 font-medium truncate">{item}</span>
            </div>
          ))}
        </div>
        {['C', 'D', 'E'].includes(activeUnit) && (
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-dark/10">
            <div className="flex items-center gap-3 text-gold">
              <Zap className="w-4 h-4" />
              <span className="font-display text-[9px] md:text-[10px] uppercase tracking-[0.2em] italic">{t.dualKey}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UnitCard: React.FC<UnitCardProps> = ({ type, title, detail, features, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left p-8 transition-all duration-500 border ${
      isActive ? 'bg-dark border-dark text-white' : 'bg-transparent border-dark/10 text-dark hover:border-gold'
    }`}
  >
    <div className="flex justify-between items-start mb-6">
      <span className={`font-display text-[12px] uppercase tracking-wider ${isActive ? 'text-gold' : 'text-dark/40'}`}>
        Type {type}
      </span>
      {isActive && <motion.div layoutId="arrow"><ArrowRight className="w-4 h-4 text-gold" /></motion.div>}
    </div>
    <h3 className="font-serif text-2xl mb-2">{title}</h3>
    <p className={`text-sm mb-6 ${isActive ? 'text-white/60' : 'text-dark/60'}`}>{detail}</p>
    <div className="flex flex-wrap gap-2">
      {features.map((f, i) => (
        <span key={i} className={`text-[10px] uppercase tracking-widest px-2 py-1 ${isActive ? 'bg-white/10 text-white/80' : 'bg-dark/5 text-dark/60'}`}>
          {f}
        </span>
      ))}
    </div>
  </button>
);

interface UnitInfo {
  title: string;
  detail: string;
  features: string[];
  images: string[];
  virtualTour?: string;
}

export default function App() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [activeUnit, setActiveUnit] = useState<string>('A');
  const t = translations[lang];
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'level8' | 'level43' | 'level61'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeLayoutIndex, setActiveLayoutIndex] = useState<number>(0);
  const [activeTourUrl, setActiveTourUrl] = useState<string | null>(null);

  // Reset layout index when unit changes
  useEffect(() => {
    setActiveLayoutIndex(0);
  }, [activeUnit]);

  const getImgSrc = (src: string | undefined, fallback: string = '/hero.jpeg') => {
    if (!src || src.trim() === '') return fallback;
    const cleanSrc = src.trim();
    if (cleanSrc.toLowerCase().includes('imgur')) return fallback;
    if (cleanSrc.startsWith('data:') || cleanSrc.startsWith('blob:')) return cleanSrc;
    if (cleanSrc.startsWith('/')) return cleanSrc;
    return cleanSrc.includes('?') ? cleanSrc : `${cleanSrc}?v=20260424`;
  };

  // --- Image State ---
  const defaultImages: Record<string, string> = {
    hero: "/hero.jpeg",
    vision: "/vision.jpeg",
    unitA_1: "/unitA_1.jpg",
    unitA_2: "",
    unitA_3: "",
    unitB_1: "/unitB_1.jpg",
    unitB_2: "",
    unitB_3: "",
    unitC_1: "/unitC_1.jpg",
    unitC_2: "/unitC_2.jpg",
    unitC_3: "",
    unitD_1: "/unitD_1.jpg",
    unitD_2: "/unitD_2.jpg",
    unitD_3: "/unitD_3.jpg",
    unitE_1: "/unitE_1.jpg",
    unitE_2: "/unitE_2.jpg",
    unitE_3: "",
    facility8_1: "/facility8_1.jpeg",
    facility8_2: "/facility8_2.jpeg",
    facility8_3: "/facility8_3.jpeg",
    facility8_4: "",
    facility43_1: "/facility43_1.jpeg",
    facility43_2: "/facility43_2.jpeg",
    facility43_3: "/facility43_3.jpeg",
    facility43_4: "",
    facility61_1: "/facility61_1.jpeg",
    facility61_2: "/facility61_2.jpeg",
    facility61_3: "/facility61_3.jpeg",
    facility61_4: "/facility61_4.jpeg",
    locationMap: "/locationMap.jpg",
    mainLobby: "/mainLobby.jpg",
    dropOff: "/dropOff.jpg",
    gallery1: "/facility8_1.jpeg",
    gallery2: "/facility61_1.jpeg",
    gallery3: "/facility43_1.jpeg",
    gallery4: "/facility8_2.jpeg",
    gallery5: "/facility61_2.jpeg",
    gallery6: "/facility43_2.jpeg",
    unitA_tour: "https://framemakers.com.my/clients/parkside/type-a/",
    unitB_tour: "",
    unitC_tour: "https://virtualtour.my/setia-federal-hill/parkside-residences/type-c1",
    unitD_tour: "https://virtualtour.my/setia-federal-hill/parkside-residences/type-d2",
    unitE_tour: "https://framemakers.com.my/clients/parkside/type-e2/",
  };

  const mergeImages = (saved: Record<string, string> | null) => {
    if (!saved) return defaultImages;
    const merged: Record<string, string> = { ...defaultImages };
    for (const key of Object.keys(defaultImages)) {
      if (saved[key] && saved[key].trim() !== '') {
        const val = saved[key].trim();
        // Ignore any imgur URLs previously saved
        if (val.toLowerCase().includes('imgur')) {
          merged[key] = defaultImages[key];
        } else if ((key.startsWith('unit') || key === 'locationMap') && (val.endsWith('.png') || val.endsWith('.webp') || val.endsWith('.jpeg'))) {
          merged[key] = defaultImages[key];
        } else if (key.startsWith('gallery') && val.includes('gallery')) {
          merged[key] = defaultImages[key];
        } else {
          merged[key] = val;
        }
      }
    }
    return merged;
  };

  const defaultSeo = {
    headline_en: "Parkside Residences: Nature's Rhythm In Bangsar",
    headline_zh: "Parkside Residences: 城心脉搏，自然律动",
    description: "Parkside Residences Bangsar offers premium luxury living within the 52-acre Setia Federal Hill masterplan. Exclusive suites starting from 485 sq. ft. Register for private viewing.",
    keywords: "Parkside Residences Bangsar, Setia Federal Hill, Bangsar Luxury Condo, KL New Property 2026, Bangsar Residential, SP Setia Federal Hill, Luxury Suites Bangsar",
    googleVerification: "SEr_TXbqdQipXgvNzvT_CRujszChYw3tfdur2iLt2D8"
  };

  const [seo, setSeo] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('parkside_custom_seo') : null;
    return saved ? JSON.parse(saved) : defaultSeo;
  });

  const [images, setImages] = useState(() => {
    // Fast path: Check local storage immediately before first render
    const saved = typeof window !== 'undefined' ? localStorage.getItem('parkside_custom_images') : null;
    return saved ? mergeImages(JSON.parse(saved)) : defaultImages;
  });

  const [hasCustomImages, setHasCustomImages] = useState(() => {
    return typeof window !== 'undefined' ? !!localStorage.getItem('parkside_custom_images') : false;
  });

  // Clean up any previously stored Imgur URLs from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('parkside_custom_images');
      if (saved && saved.toLowerCase().includes('imgur')) {
        try {
          const parsed = JSON.parse(saved);
          const cleaned: Record<string, string> = {};
          for (const [k, v] of Object.entries(parsed)) {
            if (typeof v === 'string' && !v.toLowerCase().includes('imgur')) {
              cleaned[k] = v;
            }
          }
          localStorage.setItem('parkside_custom_images', JSON.stringify(cleaned));
          setImages(mergeImages(cleaned));
        } catch (e) {
          localStorage.removeItem('parkside_custom_images');
        }
      }
    }
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Initial Config & Subscribe to Real-time Updates
  useEffect(() => {
    let isInitialLoad = true;
    const unsubscribe = subscribeToConfig((remoteConfig) => {
      if (remoteConfig) {
        if (remoteConfig.images) {
          setImages(mergeImages(remoteConfig.images));
          setHasCustomImages(true);
        }
        if (remoteConfig.seo) {
          setSeo(remoteConfig.seo);
        }
      } else {
        // Fallback to local storage ONLY if no remote config exists yet
        const savedImages = localStorage.getItem('parkside_custom_images');
        if (savedImages && !hasCustomImages) {
          setImages(mergeImages(JSON.parse(savedImages)));
          setHasCustomImages(true);
        }
        const savedSeo = localStorage.getItem('parkside_custom_seo');
        if (savedSeo) {
          setSeo(JSON.parse(savedSeo));
        }
      }
      
      if (isInitialLoad) {
        setIsLoadingConfig(false);
        isInitialLoad = false;
      }
    });

    // Safety timeout: if Firebase is too slow, show what we have after 300ms
    const timer = setTimeout(() => {
      setIsLoadingConfig(false);
    }, 300);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (hasCustomImages) {
      localStorage.setItem('parkside_custom_images', JSON.stringify(images));
    }
  }, [images, hasCustomImages]);

  useEffect(() => {
    localStorage.setItem('parkside_custom_seo', JSON.stringify(seo));
  }, [seo]);

  // Dynamic Head SEO Injector
  useEffect(() => {
    // 1. Title
    document.title = `Parkside Residences Bangsar | ${lang === 'en' ? (seo.headline_en || defaultSeo.headline_en) : (seo.headline_zh || defaultSeo.headline_zh)}`;
    
    // Helper to add or update metas
    const updateMeta = (nameAttr: string, valAttr: string, content: string) => {
      let meta = document.querySelector(`meta[${nameAttr}="${valAttr}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(nameAttr, valAttr);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('name', 'description', seo.description || defaultSeo.description);
    updateMeta('name', 'keywords', seo.keywords || defaultSeo.keywords);
    updateMeta('name', 'google-site-verification', seo.googleVerification || defaultSeo.googleVerification);

    // Open Graph
    updateMeta('property', 'og:title', `Parkside Residences Bangsar | ${lang === 'en' ? (seo.headline_en || defaultSeo.headline_en) : (seo.headline_zh || defaultSeo.headline_zh)}`);
    updateMeta('property', 'og:description', seo.description || defaultSeo.description);

    // Twitter
    updateMeta('property', 'twitter:title', `Parkside Residences Bangsar | ${lang === 'en' ? (seo.headline_en || defaultSeo.headline_en) : (seo.headline_zh || defaultSeo.headline_zh)}`);
    updateMeta('property', 'twitter:description', seo.description || defaultSeo.description);
  }, [seo, lang]);

  const updateImage = (key: string, url: string) => {
    setImages((prev: any) => ({ ...prev, [key]: url }));
    setHasCustomImages(true);
  };

  const resetImages = () => {
    setImages(defaultImages);
    setSeo(defaultSeo);
    localStorage.removeItem('parkside_custom_images');
    localStorage.removeItem('parkside_custom_seo');
  };

  const getUnitImages = (type: string) => {
    return [
      images[`unit${type}_1`],
      images[`unit${type}_2`],
      images[`unit${type}_3`]
    ].filter(Boolean);
  };

  const units: Record<string, UnitInfo> = {
    A: {
      title: t.residences.units.A.title,
      detail: t.residences.units.A.detail,
      features: t.residences.units.A.features,
      images: getUnitImages('A'),
      virtualTour: images.unitA_tour
    },
    B: {
      title: t.residences.units.B.title,
      detail: t.residences.units.B.detail,
      features: t.residences.units.B.features,
      images: getUnitImages('B'),
      virtualTour: images.unitB_tour
    },
    C: {
      title: t.residences.units.C.title,
      detail: t.residences.units.C.detail,
      features: t.residences.units.C.features,
      images: getUnitImages('C'),
      virtualTour: images.unitC_tour
    },
    D: {
      title: t.residences.units.D.title,
      detail: t.residences.units.D.detail,
      features: t.residences.units.D.features,
      images: getUnitImages('D'),
      virtualTour: images.unitD_tour
    },
    E: {
      title: t.residences.units.E.title,
      detail: t.residences.units.E.detail,
      features: t.residences.units.E.features,
      images: getUnitImages('E'),
      virtualTour: images.unitE_tour
    }
  };

  const getFacilityImages = (level: number) => {
    const list = [
      images[`facility${level}_1`],
      images[`facility${level}_2`],
      images[`facility${level}_3`],
      images[`facility${level}_4`]
    ].filter((img) => img && typeof img === 'string' && img.trim() !== '');

    if (list.length === 0) {
      return [
        defaultImages[`facility${level}_1`],
        defaultImages[`facility${level}_2`],
        defaultImages[`facility${level}_3`],
        defaultImages[`facility${level}_4`]
      ].filter((img) => img && typeof img === 'string' && img.trim() !== '');
    }
    return list;
  };

  const facilities = {
    8: {
      name: lang === 'en' ? "Parkside Retreat" : "Parkside 悦园",
      desc: lang === 'en' ? "An urban escape surrounded by curated foliage and tranquil water features." : "一个被精心挑选的绿植和宁静水景所环绕的都市避风港。",
      items: lang === 'en' ? ["Infinity Edge Pool", "Tropical Garden", "Jogging Path"] : ["无边际泳池", "热带花园", "慢步径"],
      images: getFacilityImages(8)
    },
    43: {
      name: lang === 'en' ? "Parkside Collective" : "Parkside 聚点",
      desc: lang === 'en' ? "Social spaces designed for connection, celebration, and collaborative work." : "专为社交、庆祝和协作办公而设计的社交空间。",
      items: lang === 'en' ? ["Games Room", "Co-working Hub", "Hammock Garden"] : ["游戏室", "共享办公空间", "吊床花园"],
      images: getFacilityImages(43)
    },
    61: {
      name: lang === 'en' ? "Parkside Sky" : "Parkside 云端",
      desc: lang === 'en' ? "Elite amenities at the pinnacle of luxury, overlooking the breathtaking KL skyline." : "位于奢华巅峰的顶级设施，俯瞰令人叹为观止的吉隆坡天际线。",
      items: lang === 'en' ? ["Sky Observation Deck", "Sky Lounge", "Sky Gym"] : ["空中观景台", "空中酒廊", "云端健身房"],
      images: getFacilityImages(61)
    }
  };

  return (
    <div className="font-sans">
      <AnimatePresence>
        {isLoadingConfig && (
          <motion.div 
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-cream flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                 <span className="font-serif text-3xl md:text-5xl tracking-tight leading-none text-dark">PARKSIDE</span>
                 <span className="font-display text-[10px] md:text-[12px] tracking-[0.4em] uppercase mt-2 text-gold">RESIDENCES</span>
              </motion.div>
              <div className="mt-8 w-48 h-[1px] bg-dark/5 relative overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gold"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar lang={lang} setLang={setLang} />

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-dark">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-transparent to-dark/80 z-10" />
        
        {/* Main Background Image */}
        <motion.img 
          initial={{ scale: 1.05, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          src={getImgSrc(images?.hero, '/hero.jpeg')}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src && !target.src.includes('hero.jpeg')) {
              target.src = '/hero.jpeg';
            }
          }}
          alt="Parkside Residences Bangsar - Luxury Living @ Setia Federal Hill KL"
          referrerPolicy="no-referrer"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-20 max-w-7xl mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="font-display text-[12px] uppercase tracking-[0.6em] text-gold mb-6 block">
              {t.hero.subtitle}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 md:mb-8 leading-[1.1] text-balance">
              {lang === 'en' ? (seo.headline_en || "Parkside Residences: Nature's Rhythm In Bangsar") : (seo.headline_zh || "Parkside Residences: 城心脉搏，自然律动")}
            </h1>
            <p className="font-display text-xs md:text-sm tracking-widest max-w-xl mx-auto mb-10 md:mb-12 text-white/70">
              {seo.description || t.hero.desc}
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a 
                href="#vision"
                className="px-10 py-4 bg-gold text-white font-display text-xs uppercase tracking-[0.2em] transform hover:scale-105 transition-all text-center"
              >
                {t.nav.vision}
              </a>
              <a 
                href="#layouts"
                className="px-10 py-4 border border-white/30 text-white font-display text-xs uppercase tracking-[0.2em] backdrop-blur-sm hover:bg-white hover:text-dark transition-all text-center"
              >
                {t.hero.explore}
              </a>
            </div>
          </motion.div>
        </div>


        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-gold to-transparent" />
        </motion.div>
      </section>

      {/* --- VISION SECTION --- */}
      <section id="vision" className="py-20 md:py-40 bg-cream relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <SectionHeading 
              subtitle={t.vision.subtitle}
              title={t.vision.title}
              centered={false}
            />
            <div className="space-y-6 text-dark/70 text-base md:text-lg leading-relaxed font-light">
              <p>
                {t.vision.desc}
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-4">
              <PropertyStat icon={Trees} label={t.vision.stats.anchor} value={lang === 'en' ? "Integrated Greenery" : "融合绿化"} />
              <PropertyStat icon={Maximize2} label={t.vision.stats.scale} value={(t.highlights.masterplan.title.match(/\d+/)?.[0] || '52') + ' ' + t.vision.stats.unit} />
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 border border-gold/20 -z-10 translate-x-8 translate-y-8" />
            <img 
              src={getImgSrc(images?.vision, '/vision.jpeg')} 
              alt="Parkside Residences Bangsar Masterplan - 52-Acre Urban Sanctuary" 
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('vision.jpeg')) {
                  target.src = '/vision.jpeg';
                }
              }}
              className="w-full h-auto transition-all duration-1000 shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* --- VIRTUAL EXPERIENCE (360 VR) --- */}
      <section className="bg-dark py-20 md:py-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12 md:mb-16">
          <SectionHeading 
            subtitle={lang === 'en' ? "Interactive View" : "互动体验"}
            title={t.residences.labels.showroom}
            dark
          />
        </div>
        
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative w-full aspect-video md:aspect-[21/9] min-h-[350px] md:min-h-[500px] bg-dark border border-gold/20 group overflow-hidden"
          >
            <iframe 
              src="https://framemakers.com.my/clients/parkside/"
              className="absolute inset-0 w-full h-full border-0"
              title="Parkside Residences 360VR"
              allowFullScreen
            />
            {/* Overlay if needed to prevent accidental scrolling on page scroll */}
            <div className="absolute top-4 md:top-6 right-4 md:right-6 pointer-events-none">
              <div className="px-3 md:px-4 py-1.5 md:py-2 bg-gold/90 text-white font-display text-[8px] md:text-[10px] uppercase tracking-widest shadow-xl">
                {lang === 'en' ? "Interactive Aerial View" : "互动全景航拍"}
              </div>
            </div>
          </motion.div>
          <div className="mt-6 md:mt-8 flex justify-center">
             <p className="font-display text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-white/40 italic text-center px-4">
               {lang === 'en' ? "Explore the Setia Federal Hill landscape in high-definition VR" : "在高清虚拟现实中探索 Setia Federal Hill 的景观"}
             </p>
          </div>
        </div>
      </section>

      {/* --- HIGHLIGHTS --- */}
      <section className="bg-dark py-20 md:py-32 overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading 
            subtitle={lang === 'en' ? "Specifications" : "项目规格"}
            title={lang === 'en' ? "The Blueprint of Luxury" : "奢华蓝图"}
            dark
          />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
            <div className="p-8 md:p-10 bg-dark group text-center md:text-left">
              <Building2 className="w-6 md:w-8 h-6 md:h-8 text-gold mx-auto md:mx-0 mb-6 group-hover:rotate-12 transition-transform" />
              <h4 className="font-display text-[9px] md:text-[10px] uppercase tracking-widest text-white/40 mb-2">{lang === 'en' ? "Structure" : "建筑高度"}</h4>
              <p className="font-serif text-xl md:text-2xl text-white">62 {lang === 'en' ? 'Storeys' : '层'}</p>
            </div>
            <div className="p-8 md:p-10 bg-dark group text-center md:text-left">
              <Users className="w-6 md:w-8 h-6 md:h-8 text-gold mx-auto md:mx-0 mb-6 group-hover:rotate-12 transition-transform" />
              <h4 className="font-display text-[9px] md:text-[10px] uppercase tracking-widest text-white/40 mb-2">{lang === 'en' ? "Exclusivity" : "珍藏单位"}</h4>
              <p className="font-serif text-xl md:text-2xl text-white">693 {lang === 'en' ? 'Units' : '个单位'}</p>
            </div>
            <div className="p-8 md:p-10 bg-dark group text-center md:text-left">
              <Compass className="w-6 md:w-8 h-6 md:h-8 text-gold mx-auto md:mx-0 mb-6 group-hover:rotate-12 transition-transform" />
              <h4 className="font-display text-[9px] md:text-[10px] uppercase tracking-widest text-white/40 mb-2">{lang === 'en' ? "Land Tenure" : "土地产权"}</h4>
              <p className="font-serif text-xl md:text-2xl text-white">{lang === 'en' ? 'Leasehold' : '租凭地契'}</p>
            </div>
            <div className="p-8 md:p-10 bg-dark group text-center md:text-left">
              <Zap className="w-6 md:w-8 h-6 md:h-8 text-gold mx-auto md:mx-0 mb-6 group-hover:rotate-12 transition-transform" />
              <h4 className="font-display text-[9px] md:text-[10px] uppercase tracking-widest text-white/40 mb-2">{lang === 'en' ? "Delivery" : "预计完工日期"}</h4>
              <p className="font-serif text-xl md:text-2xl text-white">Q1/2030</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SELLING POINTS --- */}
      <section id="features" className="py-20 md:py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12 md:gap-16">
            <div className="lg:col-span-1">
              <SectionHeading 
                subtitle={t.features.subtitle}
                title={lang === 'en' ? "Why Parkside" : "为何选择我们"}
                centered={false}
              />
              <p className="text-dark/60 font-light leading-relaxed mb-8 text-sm md:text-base">
                {t.features.desc2}
              </p>
              <a 
                href={`https://wa.me/60126579508?text=${encodeURIComponent(t.whatsapp.brochure)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group text-gold font-display text-[10px] md:text-xs uppercase tracking-widest"
              >
                {t.vision.btn} <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </a>
            </div>
            
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-10 lg:gap-16 mt-8 lg:mt-0">
              <div className="space-y-10 md:space-y-12">
                <div>
                  <div className="w-10 h-10 bg-forest/10 flex items-center justify-center mb-5 md:mb-6 rounded-sm">
                    <Trees className="w-5 h-5 text-forest" />
                  </div>
                  <h4 className="font-serif text-xl md:text-2xl mb-3 md:mb-4 text-dark italic">{t.highlights.masterplan.title}</h4>
                  <p className="text-dark/60 text-sm leading-relaxed">
                    {t.highlights.masterplan.desc}
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-gold/10 flex items-center justify-center mb-5 md:mb-6 rounded-sm">
                    <TrainFront className="w-5 h-5 text-gold" />
                  </div>
                  <h4 className="font-serif text-xl md:text-2xl mb-3 md:mb-4 text-dark italic">{t.highlights.connectivity.title}</h4>
                  <p className="text-dark/60 text-sm leading-relaxed">
                    {t.highlights.connectivity.desc}
                  </p>
                </div>
              </div>
              <div className="space-y-10 md:space-y-12">
                <div>
                  <div className="w-10 h-10 bg-dark/5 flex items-center justify-center mb-5 md:mb-6 rounded-sm">
                    <Star className="w-5 h-5 text-dark" />
                  </div>
                  <h4 className="font-serif text-xl md:text-2xl mb-3 md:mb-4 text-dark italic">{lang === 'en' ? "The Bangsar Premium" : "孟沙高端地段"}</h4>
                  <p className="text-dark/60 text-sm leading-relaxed">
                    {lang === 'en' ? "Established, high-demand area that historically maintains property value well. Prestige that speaks for itself." : "孟沙是一个成熟、高需求的地区，在历史上一直保持着良好的物业价值。其声望是不言而喻的。"}
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-forest/10 flex items-center justify-center mb-5 md:mb-6 rounded-sm">
                    <Layout className="w-5 h-5 text-forest" />
                  </div>
                  <h4 className="font-serif text-xl md:text-2xl mb-3 md:mb-4 text-dark italic">{lang === 'en' ? "Resort-Style Living" : "度假村式生活"}</h4>
                  <p className="text-dark/60 text-sm leading-relaxed">
                    {lang === 'en' ? "Jogging paths, landscaped gardens, and water features offer a quiet retreat from the city hustle." : "慢跑径、景观花园和水景设施为您在城市的喧嚣中提供了一个安静的避风港。"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CURATED MASTERPIECES GALLERY --- */}
      <section id="gallery" className="bg-white py-24 md:py-40">
        <div className="max-w-7xl mx-auto px-6 mb-12 md:mb-16 text-center">
          <SectionHeading 
            subtitle={t.gallery.subtitle}
            title={t.gallery.title}
          />
          
          {/* Gallery Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-5 mt-8">
            {[
              { id: 'all', label: lang === 'en' ? "All Masterpieces" : "全部画廊杰作" },
              { id: 'ground', label: lang === 'en' ? "Ground Level: Arrival & Lobby" : "G层: 尊荣大堂与落客区" },
              { id: 'level8', label: lang === 'en' ? "Level 8: Parkside Retreat" : "8层: Parkside 悦园" },
              { id: 'level43', label: lang === 'en' ? "Level 43: Parkside Collective" : "43层: Parkside 聚点" },
              { id: 'level61', label: lang === 'en' ? "Level 61: Parkside Sky" : "61层: Parkside 云端" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setGalleryFilter(tab.id as any)}
                className={`relative px-5 py-2.5 font-display text-[9px] md:text-[11px] uppercase tracking-[0.2em] transition-all duration-300 border ${
                  galleryFilter === tab.id 
                    ? 'bg-dark text-white border-dark shadow-md font-semibold' 
                    : 'bg-cream/50 text-dark/60 border-dark/10 hover:border-gold hover:text-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {(() => {
          const allGalleryMasterpieces = [
            {
              id: 'mainLobby',
              levelKey: 'ground',
              badge: 'Ground Level',
              categoryName: lang === 'en' ? 'Ground Level: Arrival & Lobby' : 'G层: 尊荣大堂与落客区',
              title: lang === 'en' ? 'Grand Main Lobby' : '尊荣主大堂',
              subtitle: lang === 'en' ? 'Double-Height Entrance & Grand Reception' : '挑高双层奢华大堂与前台接待',
              src: getImgSrc(images?.mainLobby, '/mainLobby.jpg'),
              fallback: '/mainLobby.jpg',
              gridClass: 'md:col-span-8 aspect-video md:aspect-[16/9]'
            },
            {
              id: 'dropOff',
              levelKey: 'ground',
              badge: 'Ground Level',
              categoryName: lang === 'en' ? 'Ground Level: Arrival & Lobby' : 'G层: 尊荣大堂与落客区',
              title: lang === 'en' ? 'Porte-Cochère & Drop-Off Area' : '落客门廊与贵宾大堂',
              subtitle: lang === 'en' ? 'Seamless VIP Arrival & Water Features' : '尊贵到访体验与水景迎宾门廊',
              src: getImgSrc(images?.dropOff, '/dropOff.jpg'),
              fallback: '/dropOff.jpg',
              gridClass: 'md:col-span-4 aspect-video md:aspect-[4/5]'
            },
            {
              id: 'f8_1',
              levelKey: 'level8',
              badge: 'Level 8',
              categoryName: lang === 'en' ? 'Level 8: Parkside Retreat' : '8层: Parkside 悦园',
              title: lang === 'en' ? 'Infinity Edge Pool' : '无边际泳池',
              subtitle: lang === 'en' ? 'Olympic-Length Lap Pool & Sun Deck' : '奥运标准无边际泳池与日光平台',
              src: getImgSrc(images?.facility8_1 || images?.gallery1, '/facility8_1.jpeg'),
              fallback: '/facility8_1.jpeg',
              gridClass: 'md:col-span-8 aspect-video md:aspect-[16/9]'
            },
            {
              id: 'f61_1',
              levelKey: 'level61',
              badge: 'Level 61',
              categoryName: lang === 'en' ? 'Level 61: Parkside Sky' : '61层: Parkside 云端',
              title: lang === 'en' ? 'Sky Lounge & Private Dining' : '云端会客室与私宴听',
              subtitle: lang === 'en' ? 'Panoramic Views over KL Skyline' : '俯瞰吉隆坡宏伟天际',
              src: getImgSrc(images?.facility61_1 || images?.gallery2, '/facility61_1.jpeg'),
              fallback: '/facility61_1.jpeg',
              gridClass: 'md:col-span-4 aspect-video md:aspect-[4/5]'
            },
            {
              id: 'f43_1',
              levelKey: 'level43',
              badge: 'Level 43',
              categoryName: lang === 'en' ? 'Level 43: Parkside Collective' : '43层: Parkside 聚点',
              title: lang === 'en' ? 'Co-Working Hub & Lounge' : '共享办公与高空休憩区',
              subtitle: lang === 'en' ? 'Collaborative Pods & Serene Space' : '高效办公与灵感激发场所',
              src: getImgSrc(images?.facility43_1 || images?.gallery3, '/facility43_1.jpeg'),
              fallback: '/facility43_1.jpeg',
              gridClass: 'md:col-span-4 aspect-square'
            },
            {
              id: 'f8_2',
              levelKey: 'level8',
              badge: 'Level 8',
              categoryName: lang === 'en' ? 'Level 8: Parkside Retreat' : '8层: Parkside 悦园',
              title: lang === 'en' ? 'Hydrotherapy Pool & Gardens' : '水疗池与热带植物园',
              subtitle: lang === 'en' ? 'Spa Cabanas & Verdant Foliage' : '隐秘凉亭与绿意盎然',
              src: getImgSrc(images?.facility8_2 || images?.gallery4, '/facility8_2.jpeg'),
              fallback: '/facility8_2.jpeg',
              gridClass: 'md:col-span-4 aspect-square'
            },
            {
              id: 'f61_2',
              levelKey: 'level61',
              badge: 'Level 61',
              categoryName: lang === 'en' ? 'Level 61: Parkside Sky' : '61层: Parkside 云端',
              title: lang === 'en' ? 'Skyline Horizon & Observatory Deck' : '云端全景观景台',
              subtitle: lang === 'en' ? 'Unobstructed 360° Vistas' : '360度无遮挡云端视野',
              src: getImgSrc(images?.facility61_2 || images?.gallery5, '/facility61_2.jpeg'),
              fallback: '/facility61_2.jpeg',
              gridClass: 'md:col-span-4 aspect-square'
            },
            {
              id: 'f43_2',
              levelKey: 'level43',
              badge: 'Level 43',
              categoryName: lang === 'en' ? 'Level 43: Parkside Collective' : '43层: Parkside 聚点',
              title: lang === 'en' ? 'Games & Entertainment Room' : '娱乐与休闲体验区',
              subtitle: lang === 'en' ? 'Social Lounge & Games Hub' : '高雅娱乐与亲朋相聚',
              src: getImgSrc(images?.facility43_2 || images?.gallery6, '/facility43_2.jpeg'),
              fallback: '/facility43_2.jpeg',
              gridClass: 'md:col-span-4 aspect-square'
            },
            {
              id: 'f8_3',
              levelKey: 'level8',
              badge: 'Level 8',
              categoryName: lang === 'en' ? 'Level 8: Parkside Retreat' : '8层: Parkside 悦园',
              title: lang === 'en' ? 'Jogging Track & Green Deck' : '园林慢跑道与绿化平台',
              subtitle: lang === 'en' ? 'Tropical Landscaped Gardens' : '热带植物景观园',
              src: getImgSrc(images?.facility8_3, '/facility8_3.jpeg'),
              fallback: '/facility8_3.jpeg',
              gridClass: 'md:col-span-4 aspect-square'
            },
            {
              id: 'f43_3',
              levelKey: 'level43',
              badge: 'Level 43',
              categoryName: lang === 'en' ? 'Level 43: Parkside Collective' : '43层: Parkside 聚点',
              title: lang === 'en' ? 'Yoga & Wellness Sanctuary' : '高空瑜伽与舒压房',
              subtitle: lang === 'en' ? 'Hammock Garden & Relaxation Pods' : '吊床花园与书香养心',
              src: getImgSrc(images?.facility43_3, '/facility43_3.jpeg'),
              fallback: '/facility43_3.jpeg',
              gridClass: 'md:col-span-4 aspect-square'
            },
            {
              id: 'f61_3',
              levelKey: 'level61',
              badge: 'Level 61',
              categoryName: lang === 'en' ? 'Level 61: Parkside Sky' : '61层: Parkside 云端',
              title: lang === 'en' ? 'Sky Cocktail Bar' : '云端星空酒吧',
              subtitle: lang === 'en' ? 'Bespoke Nighttime Ambiance' : '尊贵高空夜色交会所',
              src: getImgSrc(images?.facility61_3, '/facility61_3.jpeg'),
              fallback: '/facility61_3.jpeg',
              gridClass: 'md:col-span-4 aspect-square'
            },
            {
              id: 'f61_4',
              levelKey: 'level61',
              badge: 'Level 61',
              categoryName: lang === 'en' ? 'Level 61: Parkside Sky' : '61层: Parkside 云端',
              title: lang === 'en' ? 'Sky Gym & Altitude Fitness' : '云端高空健身中心',
              subtitle: lang === 'en' ? 'State-of-the-Art Training Equipment' : '顶级高空动能健身与健体',
              src: getImgSrc(images?.facility61_4, '/facility61_4.jpeg'),
              fallback: '/facility61_4.jpeg',
              gridClass: 'md:col-span-8 aspect-video md:aspect-[16/9]'
            }
          ];

          const filteredMasterpieces = galleryFilter === 'all'
            ? allGalleryMasterpieces
            : allGalleryMasterpieces.filter((item) => item.levelKey === galleryFilter);

          return (
            <>
              <div className="grid md:grid-cols-12 gap-6 px-6 max-w-[1600px] mx-auto">
                <AnimatePresence mode="popLayout">
                  {filteredMasterpieces.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      onClick={() => setLightboxIndex(allGalleryMasterpieces.findIndex(i => i.id === item.id))}
                      className={`${galleryFilter === 'all' ? item.gridClass : 'md:col-span-6 lg:col-span-4 aspect-video'} overflow-hidden relative group shadow-lg cursor-pointer bg-dark/5`}
                    >
                      <img
                        src={item.src}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.includes('.jpg')) {
                            target.src = target.src.replace('.jpg', '.jpeg');
                          } else if (target.src.includes('.jpeg')) {
                            target.src = target.src.replace('.jpeg', '.png');
                          } else if (!target.src.includes(item.fallback)) {
                            target.src = getImgSrc(item.fallback);
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                      
                      {/* Badge */}
                      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gold/90 backdrop-blur-md text-white font-display text-[9px] uppercase tracking-widest shadow-sm">
                        {item.badge}
                      </div>

                      {/* Info overlay */}
                      <div className="absolute bottom-6 left-6 right-6 text-white transition-all duration-500">
                        <p className="font-display text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-gold mb-1">{item.categoryName}</p>
                        <h4 className="font-serif text-xl md:text-2xl lg:text-3xl italic mb-1">{item.title}</h4>
                        <p className="text-xs text-white/70 font-light truncate">{item.subtitle}</p>
                      </div>

                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Lightbox Modal */}
              <AnimatePresence>
                {lightboxIndex !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[2000] bg-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
                  >
                    {/* Close button */}
                    <button
                      onClick={() => setLightboxIndex(null)}
                      className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    {/* Prev / Next */}
                    <button
                      onClick={() => setLightboxIndex((lightboxIndex - 1 + allGalleryMasterpieces.length) % allGalleryMasterpieces.length)}
                      className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                      onClick={() => setLightboxIndex((lightboxIndex + 1) % allGalleryMasterpieces.length)}
                      className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Main Lightbox Image */}
                    {(() => {
                      const cur = allGalleryMasterpieces[lightboxIndex];
                      return (
                        <div className="max-w-6xl w-full flex flex-col items-center gap-6">
                          <div className="relative max-h-[70vh] w-full flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl">
                            <motion.img
                              key={cur.id}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              transition={{ duration: 0.3 }}
                              src={cur.src}
                              alt={cur.title}
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.src.includes(cur.fallback)) {
                                  target.src = getImgSrc(cur.fallback);
                                }
                              }}
                              className="max-h-[70vh] w-auto max-w-full object-contain"
                            />
                          </div>

                          <div className="text-center text-white space-y-2 max-w-2xl">
                            <span className="px-3 py-1 bg-gold text-white font-display text-[9px] uppercase tracking-widest inline-block mb-1">
                              {cur.badge} • {cur.categoryName}
                            </span>
                            <h3 className="font-serif text-2xl md:text-4xl italic">{cur.title}</h3>
                            <p className="text-sm md:text-base text-white/70 font-light">{cur.subtitle}</p>
                            <p className="text-[10px] font-display uppercase tracking-widest text-white/40 pt-2">
                              {lightboxIndex + 1} / {allGalleryMasterpieces.length}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          );
        })()}
      </section>

      {/* --- RESIDENCES --- */}
      <section id="layouts" className="py-20 md:py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading 
            subtitle={t.residences.subtitle}
            title={t.residences.title}
          />
          
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16">
            <div className="space-y-4">
              {Object.entries(units).map(([unitKey, unit]) => (
                <div key={unitKey} className="space-y-4">
                  <UnitCard 
                    type={unitKey}
                    title={unit.title}
                    detail={unit.detail}
                    features={unit.features}
                    isActive={activeUnit === unitKey}
                    onClick={() => setActiveUnit(unitKey)}
                  />
                  {activeUnit === unitKey && (
                    <LayoutPreview 
                      activeUnit={activeUnit}
                      activeLayoutIndex={activeLayoutIndex}
                      units={units}
                      setActiveLayoutIndex={setActiveLayoutIndex}
                      onTourClick={setActiveTourUrl}
                      lang={lang}
                      className="lg:hidden mt-4"
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="hidden lg:block lg:sticky lg:top-32 h-fit">
              <LayoutPreview 
                activeUnit={activeUnit}
                activeLayoutIndex={activeLayoutIndex}
                units={units}
                setActiveLayoutIndex={setActiveLayoutIndex}
                onTourClick={setActiveTourUrl}
                lang={lang}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- LOCATION --- */}
      <section id="location" className="py-20 md:py-40 bg-dark text-white relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-gold/5 rounded-full blur-[80px] md:blur-[120px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeading 
            subtitle={t.location.subtitle}
            title={t.location.title}
            dark
          />
          
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="space-y-10 md:space-y-12">
              <div className="flex gap-6 md:gap-8 group">
                <div className="flex flex-col items-center">
                  <div className="w-px h-full bg-white/20 group-hover:bg-gold transition-colors" />
                </div>
                <div>
                  <h4 className="font-serif text-xl md:text-2xl mb-1 md:mb-4 italic text-gold">{lang === 'en' ? "400m to Bangsar LRT" : "距离孟沙LRT轻轨站400米"}</h4>
                  <p className="text-white/60 font-light leading-relaxed text-sm md:text-base">
                    {lang === 'en' ? "Seamless access to the city's rail network. Just one stop away from KL Sentral, connecting you to the country's primary transportation hub." : "无缝接入城市轨道网络。距离吉隆坡中央车站仅一站之遥，将您与国家的首要交通枢纽相连。"}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6 md:gap-8 group">
                <div className="flex flex-col items-center">
                  <div className="w-px h-full bg-white/20 group-hover:bg-gold transition-colors" />
                </div>
                <div>
                  <h4 className="font-serif text-xl md:text-2xl mb-1 md:mb-4 italic text-gold">{lang === 'en' ? "Direct Pedestrian Link" : "直连行人天桥"}</h4>
                  <p className="text-white/60 font-light leading-relaxed text-sm md:text-base">
                    {lang === 'en' ? "Connectivity reimagined. Future-proof pedestrian bridges directly to Mid Valley Megamall, the region's shopping sanctuary." : "重新定义连接。前瞻性的行人天桥直达 Mid Valley Megamall —— 该地区的购物天堂。"}
                  </p>
                </div>
              </div>

              <div className="flex gap-6 md:gap-8 group">
                <div className="flex flex-col items-center">
                  <div className="w-px h-full bg-white/20 group-hover:bg-gold transition-colors" />
                </div>
                <div>
                  <h4 className="font-serif text-xl md:text-2xl mb-1 md:mb-4 italic text-gold">{lang === 'en' ? "Gateway to KL Sentral" : "通往吉隆坡中央车站的门户"}</h4>
                  <p className="text-white/60 font-light leading-relaxed text-sm md:text-base">
                    {lang === 'en' ? "Strategic proximity to ERL Express, Commuter, and MRT lines—offering global connectivity within minutes of your doorstep." : "战略性地靠近 ERL 快铁、电动火车和捷运线 —— 在您家门口几分钟内即可实现与全球的连接。"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="aspect-square bg-white/5 border border-white/10 p-3 md:p-4 transition-all duration-700 group-hover:border-gold/30">
                <div className="w-full h-full border border-white/5 flex items-center justify-center relative bg-dark overflow-hidden">
                  <img 
                    src={getImgSrc(images?.locationMap, '/locationMap.jpg')} 
                    alt="Location Map" 
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('locationMap.jpg')) {
                        target.src = getImgSrc('/locationMap.jpg');
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <MapPin className="w-6 md:w-8 h-6 md:h-8 text-gold animate-bounce absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 drop-shadow-[0_0_10px_rgba(197,165,114,0.5)]" />
                </div>
              </div>
              <div className="mt-8 flex justify-center gap-8 md:gap-12">
                <div className="text-center">
                  <span className="block font-serif text-2xl md:text-3xl text-white">1 {lang === 'en' ? 'Stop' : '站'}</span>
                  <span className="font-display text-[8px] md:text-[9px] uppercase tracking-widest text-white/40">{lang === 'en' ? 'to KL Sentral' : '至吉隆坡中央车站'}</span>
                </div>
                <div className="text-center border-x border-white/10 px-8 md:px-12">
                  <span className="block font-serif text-2xl md:text-3xl text-white">400m</span>
                  <span className="font-display text-[8px] md:text-[9px] uppercase tracking-widest text-white/40">{lang === 'en' ? 'to LRT Station' : '步至轻轨站'}</span>
                </div>
                <div className="text-center">
                  <span className="block font-serif text-2xl md:text-3xl text-white">5 Mins</span>
                  <span className="font-display text-[8px] md:text-[9px] uppercase tracking-widest text-white/40">{lang === 'en' ? 'to Mid Valley' : '到 Mid Valley'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE MAP SECTION --- */}
      <section className="bg-dark pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/5 border border-white/10 p-2 md:p-3 shadow-2xl relative"
          >
            <div className="aspect-video md:aspect-[21/8] w-full bg-dark/50 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8092.332985346848!2d101.66237369357911!3d3.116453100000015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc49e06d96bcf3%3A0xab273ff01a9d761c!2sParkside%20Residences%20Bangsar%20(Sales%20Gallery)!5e1!3m2!1sen!2sus!4v1777286858634!5m2!1sen!2sus"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              ></iframe>
            </div>
            {/* Overlay to catch clicks and give a premium feel */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-dark to-transparent pointer-events-none" />
          </motion.div>
          <div className="mt-8 text-center">
            <motion.h3 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="font-display text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-gold mb-3"
            >
              {t.location.interactiveTitle}
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/30 text-[10px] md:text-[11px] font-light tracking-wide"
            >
              {lang === 'en' 
                ? "Visit our Sales Gallery: Setia Federal Hill, Bangsar, 59000 Kuala Lumpur" 
                : "欢迎莅临：马来西亚吉隆坡，孟沙，Setia Federal Hill 销售展厅 (59000)"}
            </motion.p>
          </div>
        </div>
      </section>

      {/* --- DEVELOPERS --- */}
      <section className="py-16 md:py-24 bg-cream border-t border-dark/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <span className="font-display text-[8px] md:text-[9px] uppercase tracking-[0.4em] md:tracking-[0.6em] text-dark/30 mb-8 md:mb-12 text-center text-balance">{lang === 'en' ? 'A Joint Visionary Development By' : '由以下开发商联合打造'}</span>
          <div className="flex flex-col md:flex-row gap-10 md:gap-32 items-center opacity-70">
            <div className="flex flex-col items-center">
              <span className="font-serif text-2xl md:text-3xl text-dark tracking-tighter">S P Setia</span>
              <span className="font-display text-[7px] md:text-[8px] uppercase tracking-widest text-dark/40">{lang === 'en' ? 'Built Of Distinction' : '品质建筑卓越设计'}</span>
            </div>
            <div className="hidden md:block w-px h-12 bg-dark/20" />
            <div className="flex flex-col items-center">
              <span className="font-serif text-2xl md:text-3xl text-dark tracking-wide">Mitsui Fudosan</span>
              <span className="font-display text-[7px] md:text-[8px] uppercase tracking-widest text-dark/40">{lang === 'en' ? 'Global Quality Japanese Standard' : '全球品质 日本标准'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTACT / FOOTER --- */}
      <footer className="bg-white border-t border-dark/5 pt-20 md:pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center mb-16 md:mb-24">
            <div className="max-w-2xl text-center">
              <SectionHeading 
                subtitle={t.footer.contact}
                title={t.footer.booking}
              />
              <p className="text-dark/60 font-light leading-relaxed mb-10 md:mb-12 text-sm md:text-base">
                {lang === 'en' ? "Don’t just enquire. Gain privileged access to the latest investor reports and exclusive pricing packages for the first launch at Setia Federal Hill." : "不要只是咨询。获取有关 Setia Federal Hill 首次发布的最新投资者报告和独家定价方案的特权。"}
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 md:gap-6 text-left">
                <a 
                  href={`https://wa.me/60126579508?text=${encodeURIComponent(t.whatsapp.report)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-5 md:gap-6 p-5 md:p-6 border border-dark/5 hover:border-gold transition-all group"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-cream group-hover:bg-gold transition-colors shrink-0">
                    <Maximize2 className="w-4 h-4 md:w-5 md:h-5 text-gold group-hover:text-white" />
                  </div>
                  <div>
                    <h5 className="font-display text-[8px] md:text-[10px] uppercase tracking-widest text-dark mb-1">{t.footer.links[0].label}</h5>
                    <p className="font-serif text-base md:text-lg text-dark/80 italic leading-tight">{t.footer.links[0].desc}</p>
                  </div>
                </a>
                <a 
                  href={`https://wa.me/60126579508?text=${encodeURIComponent(t.whatsapp.tour)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-5 md:gap-6 p-5 md:p-6 border border-dark/5 hover:border-gold transition-all group"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-cream group-hover:bg-gold transition-colors shrink-0">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gold group-hover:text-white" />
                  </div>
                  <div>
                    <h5 className="font-display text-[8px] md:text-[10px] uppercase tracking-widest text-dark mb-1">{t.footer.links[1].label}</h5>
                    <p className="font-serif text-base md:text-lg text-dark/80 italic leading-tight">{t.footer.links[1].desc}</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-10 md:pt-12 border-t border-dark/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="font-serif text-xl md:text-2xl tracking-tight leading-none text-dark">PARKSIDE</span>
              <span className="font-display text-[8px] md:text-[9px] tracking-[0.3em] uppercase mt-1 text-gold">RESIDENCES</span>
              <p className="font-display text-[8px] uppercase tracking-widest text-dark/40 mt-4 max-w-xs">{t.footer.address}</p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-8 gap-y-4">
                {t.footer.legal.map(s => (
                  <a key={s} href="#" className="font-display text-[8px] md:text-[9px] uppercase tracking-widest text-dark/40 hover:text-gold transition-colors">{s}</a>
                ))}
                <a href="#" className="font-display text-[8px] md:text-[9px] uppercase tracking-widest text-dark/40 hover:text-gold transition-colors">{lang === 'en' ? 'Privacy Policy' : '隐私政策'}</a>
                <a href="#" className="font-display text-[8px] md:text-[9px] uppercase tracking-widest text-dark/40 hover:text-gold transition-colors">{lang === 'en' ? 'Terms of Service' : '服务条款'}</a>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent('open-admin-panel'));
                  }} 
                  className="font-display text-[8px] md:text-[9px] uppercase tracking-widest text-dark/40 hover:text-gold transition-colors cursor-pointer"
                >
                  {lang === 'en' ? 'Admin Panel' : '管理后台'}
                </button>
              </div>
              <p className="font-display text-[7px] md:text-[8px] text-dark/30 max-w-2xl text-center leading-relaxed">
                {lang === 'en' 
                  ? "DISCLAIMER: This website is for informational purposes only. While every care has been taken in preparing this website, the developer and its agents cannot be held responsible for any inaccuracies. All visuals used are artist's impressions only. This is an authorized marketing website and not the official developer website."
                  : "免责声明：本网站仅供参考。在编写本网站时，我们已尽一切努力确保信息的准确性，但开发商及其代理人不对任何不准确之处负责。所有视觉效果仅为艺术家印象。这是一个授权的营销网站，而非官方开发商网站。"}
              </p>
            </div>
            
            <span className="font-display text-[8px] md:text-[9px] uppercase tracking-widest text-dark/20 text-center md:text-right shrink-0">
              © 2026 Parkside Residences. <br className="md:hidden" /> All Rights Reserved.
            </span>
          </div>
        </div>
      </footer>

      <EditPanel 
        images={images} 
        onUpdate={updateImage} 
        seo={seo}
        onUpdateSeo={(key: string, val: string) => {
          setSeo((prev: any) => ({ ...prev, [key]: val }));
        }}
        onReset={resetImages} 
        onSaveBulk={async (newImages: any, newSeo: any) => {
          return saveConfig(newImages, newSeo, null);
        }}
      />

      <AnimatePresence>
        {activeTourUrl && (
          <VirtualTourModal 
            url={activeTourUrl} 
            onClose={() => setActiveTourUrl(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
