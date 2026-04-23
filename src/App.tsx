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

const EditPanel = ({ images, onUpdate, onReset }: { 
  images: any; 
  onUpdate: (key: string, url: string) => void;
  onReset: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'gallery' | 'units' | 'facilities'>('general');
  const [typedPassword, setTypedPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const correctPassword = 'parkside2026123';

  const handleSave = async () => {
    if (!isUnlocked) {
      alert("Please enter the correct password first.");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // We pass null as user since we're using password auth now
      await saveConfig(images, null);
      // Wait a tiny bit for a better feel
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
      { key: 'vision', label: 'Vision Masterplan' },
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
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] w-12 h-12 bg-dark border border-gold/50 text-gold flex items-center justify-center rounded-full shadow-2xl hover:scale-110 transition-transform group"
        title="Open Editor"
      >
        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
      </button>

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
                  <h4 className="font-display text-[10px] uppercase tracking-widest text-dark font-bold">Image Editor</h4>
                  <p className="font-serif text-xs italic text-dark/40">Custom Gallery Management</p>
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
            <div className="flex border-b border-dark/5 mb-8 shrink-0">
              {(Object.keys(categories) as Array<keyof typeof categories>).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 pb-3 font-display text-[9px] uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'text-gold border-b border-gold' : 'text-dark/40 border-b border-transparent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-10 custom-scrollbar">
              {categories[activeTab].map((item) => (
                <section key={item.key} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-3 h-3 text-gold" />
                    <span className="font-display text-[9px] uppercase tracking-[0.2em] text-dark/60 font-medium">{item.label} URL</span>
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
              ))}
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
    { name: t.amenities, href: '#facilities' },
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
  const [isLoadingConfig, setIsLoadingConfig] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('parkside_custom_images')) {
      return false;
    }
    return true;
  });
  const [activeUnit, setActiveUnit] = useState<string>('A');
  const t = translations[lang];
  const [activeFacility, setActiveFacility] = useState<number>(8);
  const [activeLayoutIndex, setActiveLayoutIndex] = useState<number>(0);
  const [activeFacilityImageIndex, setActiveFacilityImageIndex] = useState<number>(0);
  const [activeTourUrl, setActiveTourUrl] = useState<string | null>(null);

  // Reset layout index when unit changes
  useEffect(() => {
    setActiveLayoutIndex(0);
  }, [activeUnit]);

  // Reset facility image index when level changes
  useEffect(() => {
    setActiveFacilityImageIndex(0);
  }, [activeFacility]);

  // --- Image State ---
  const defaultImages = {
    hero: "https://picsum.photos/seed/tower-residence/1920/1080",
    vision: "https://picsum.photos/seed/city-facade/1000/1200",
    unitA_1: "https://picsum.photos/seed/unit-a-1/1200/800",
    unitA_2: "",
    unitA_3: "",
    unitB_1: "https://picsum.photos/seed/unit-b-1/1200/800",
    unitB_2: "",
    unitB_3: "",
    unitC_1: "https://picsum.photos/seed/unit-c-1/1200/800",
    unitC_2: "",
    unitC_3: "",
    unitD_1: "https://picsum.photos/seed/unit-d-1/1200/800",
    unitD_2: "",
    unitD_3: "",
    unitE_1: "https://picsum.photos/seed/unit-e-1/1200/800",
    unitE_2: "",
    unitE_3: "",
    facility8_1: "https://picsum.photos/seed/luxury-condo-amenities-8/1200/800",
    facility8_2: "",
    facility8_3: "",
    facility8_4: "",
    facility43_1: "https://picsum.photos/seed/luxury-condo-amenities-43/1200/800",
    facility43_2: "",
    facility43_3: "",
    facility43_4: "",
    facility61_1: "https://picsum.photos/seed/luxury-condo-amenities-61/1200/800",
    facility61_2: "",
    facility61_3: "",
    facility61_4: "",
    locationMap: "https://picsum.photos/seed/kuala-lumpur-map/1200/1200",
    gallery1: "https://picsum.photos/seed/luxury-lobby/1920/1080",
    gallery2: "https://picsum.photos/seed/luxury-lifestyle/1920/1080",
    gallery3: "https://picsum.photos/seed/amenity-3/1200/800",
    gallery4: "https://picsum.photos/seed/amenity-4/1200/800",
    gallery5: "https://picsum.photos/seed/amenity-5/1200/800",
    gallery6: "https://picsum.photos/seed/amenity-6/1200/800",
    unitA_tour: "https://framemakers.com.my/clients/parkside/type-a/",
    unitB_tour: "",
    unitC_tour: "https://virtualtour.my/setia-federal-hill/parkside-residences/type-c1",
    unitD_tour: "https://virtualtour.my/setia-federal-hill/parkside-residences/type-d2",
    unitE_tour: "https://framemakers.com.my/clients/parkside/type-e2/",
  };

  const [images, setImages] = useState(() => {
    // Fast path: Check local storage immediately before first render
    const saved = typeof window !== 'undefined' ? localStorage.getItem('parkside_custom_images') : null;
    return saved ? JSON.parse(saved) : defaultImages;
  });

  const [hasCustomImages, setHasCustomImages] = useState(() => {
    return typeof window !== 'undefined' ? !!localStorage.getItem('parkside_custom_images') : false;
  });

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Initial Config & Subscribe to Real-time Updates
  useEffect(() => {
    // If we are already showing cached images, we don't need to block
    // but we still fetch the latest in the background
    
    let isInitialLoad = true;
    const unsubscribe = subscribeToConfig((remoteImages) => {
      if (remoteImages) {
        setImages(remoteImages);
        setHasCustomImages(true);
      } else {
        // Fallback to local storage ONLY if no remote config exists yet
        const saved = localStorage.getItem('parkside_custom_images');
        if (saved && !hasCustomImages) {
          setImages(JSON.parse(saved));
          setHasCustomImages(true);
        }
      }
      
      if (isInitialLoad) {
        setIsLoadingConfig(false);
        isInitialLoad = false;
      }
    });

    // Safety timeout: if Firebase is too slow, show what we have after 1s
    const timer = setTimeout(() => {
      setIsLoadingConfig(false);
    }, 1200);

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

  const updateImage = (key: string, url: string) => {
    setImages((prev: any) => ({ ...prev, [key]: url }));
    setHasCustomImages(true);
  };

  const resetImages = () => {
    setImages(defaultImages);
    localStorage.removeItem('parkside_custom_images');
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
    return [
      images[`facility${level}_1`],
      images[`facility${level}_2`],
      images[`facility${level}_3`],
      images[`facility${level}_4`]
    ].filter(Boolean);
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
          key={images.hero}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.5 }}
          src={images.hero}
          alt="Parkside Residences Bangsar - Luxury Living @ Setia Federal Hill KL"
          referrerPolicy="no-referrer"
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
            <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl lg:text-9xl mb-6 md:mb-8 leading-[0.9] text-balance">
              {lang === 'en' ? (
                <>The Future of <br className="hidden sm:block" /> <span className="italic">Bangsar Living</span></>
              ) : (
                <>{t.hero.title}</>
              )}
            </h1>
            <p className="font-display text-xs md:text-base uppercase tracking-widest max-w-xl mx-auto mb-10 md:mb-12 text-white/70">
              {t.hero.desc}
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
              src={images.vision} 
              alt="Parkside Residences Bangsar Masterplan - 52-Acre Urban Sanctuary" 
              referrerPolicy="no-referrer"
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

      {/* --- CINEMATIC GALLERY --- */}
      <section className="bg-white py-24 md:py-40">
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <SectionHeading 
            subtitle={t.gallery.subtitle}
            title={t.gallery.title}
          />
        </div>
        
        <div className="grid md:grid-cols-12 gap-6 px-6 max-w-[1600px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-8 aspect-video md:aspect-[16/9] overflow-hidden relative group shadow-lg"
          >
            <img 
              src={images.gallery1} 
              alt="Luxury Living" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-dark/20 group-hover:bg-transparent transition-colors duration-500" />
            <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
               <p className="font-display text-[8px] md:text-[10px] uppercase tracking-[0.3em] mb-1 md:mb-2">{lang === 'en' ? "Exquisite Grandeur" : "精致庄华"}</p>
               <h4 className="font-serif text-2xl md:text-3xl italic">{lang === 'en' ? "The Arrival Experience" : "到访体验"}</h4>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-4 aspect-video md:aspect-[4/5] overflow-hidden relative group shadow-lg"
          >
            <img 
              src={images.gallery2} 
              alt="Luxury Detail" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-dark/20 group-hover:bg-transparent transition-colors duration-500" />
            <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
               <p className="font-display text-[8px] md:text-[10px] uppercase tracking-[0.3em] mb-1 md:mb-2">{lang === 'en' ? "Refined Spaces" : "精致空间"}</p>
               <h4 className="font-serif text-2xl md:text-3xl italic">{lang === 'en' ? "Thoughtful Craft" : "精雕细琢"}</h4>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FACILITIES --- */}
      <section id="facilities" className="bg-cream py-20 md:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading 
            subtitle={t.nav.amenities}
            title={lang === 'en' ? "A Triad of Experiences" : "三重感官体验"}
          />
          
          <div className="flex flex-wrap justify-center mb-12 md:mb-16 gap-4 md:gap-8">
            {[8, 43, 61].map((level) => (
              <button 
                key={level}
                onClick={() => setActiveFacility(level)}
                className={`relative px-4 md:px-6 py-3 md:py-4 font-display text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all ${
                  activeFacility === level ? 'text-dark font-semibold' : 'text-dark/30 hover:text-dark/60'
                }`}
              >
                {lang === 'en' ? 'LEVEL' : '楼层'} {level}
                {activeFacility === level && (
                  <motion.div 
                    layoutId="facilityUnderline"
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-gold"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <motion.div
              key={activeFacility}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 md:y-8"
            >
              <h3 className="font-serif text-3xl md:text-4xl text-dark italic leading-tight">{facilities[activeFacility].name}</h3>
              <p className="text-dark/60 text-lg md:text-xl font-light leading-relaxed">
                {facilities[activeFacility].desc}
              </p>
              <ul className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                {facilities[activeFacility].items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-dark/80 group">
                    <span className="w-2 md:w-3 h-px bg-gold group-hover:w-6 transition-all shrink-0" />
                    <span className="font-display text-[10px] md:text-[11px] uppercase tracking-widest">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <div className="relative aspect-video overflow-hidden border border-dark/5 bg-cream">
               <AnimatePresence mode="wait">
                <motion.img 
                  key={`${activeFacility}-${activeFacilityImageIndex}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.6 }}
                  src={facilities[activeFacility].images[activeFacilityImageIndex] || facilities[activeFacility].images[0]}
                  alt={facilities[activeFacility].name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-1000"
                />
               </AnimatePresence>

               {/* Facility Image Switcher */}
               {facilities[activeFacility].images.length > 1 && (
                <div className="absolute bottom-6 right-6 flex gap-3 z-10 px-4 py-2 bg-dark/20 backdrop-blur-md rounded-full">
                  {facilities[activeFacility].images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveFacilityImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeFacilityImageIndex === idx ? 'bg-gold' : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
               )}

               {/* Label */}
               <div className="absolute top-6 left-6 px-4 py-2 bg-dark/80 backdrop-blur-md text-white font-display text-[9px] uppercase tracking-widest z-10">
                 {facilities[activeFacility].images.length > 1 ? (lang === 'en' ? `View 0${activeFacilityImageIndex + 1}` : `视图 0${activeFacilityImageIndex + 1}`) : (lang === 'en' ? 'Level Experience' : '楼层体验')}
               </div>
            </div>
          </div>
        </div>
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
                    src={images.locationMap} 
                    alt="Location Map" 
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

      {/* --- AMENITY GRID (EXTRA IMAGES) --- */}
      <section className="py-20 md:py-24 bg-white border-t border-dark/5">
        <div className="max-w-7xl mx-auto px-6 mb-12 md:mb-16">
          <SectionHeading 
            subtitle={t.gallery.subtitle}
            title={t.gallery.title}
            centered={true}
          />
        </div>
        <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[3, 4, 5, 6].map((i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="overflow-hidden relative group aspect-square bg-cream border border-dark/5 shadow-sm"
            >
              <img 
                src={images[`gallery${i}`]} 
                alt={`Amenity ${i}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                 <span className="font-display text-[8px] uppercase tracking-widest text-white border border-white/20 px-3 py-1 backdrop-blur-sm">{lang === 'en' ? 'View Space' : '查看空间'}</span>
              </div>
            </motion.div>
          ))}
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
            
            <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-8 gap-y-4">
              {t.footer.legal.map(s => (
                <a key={s} href="#" className="font-display text-[8px] md:text-[9px] uppercase tracking-widest text-dark/40 hover:text-gold transition-colors">{s}</a>
              ))}
            </div>
            
            <span className="font-display text-[8px] md:text-[9px] uppercase tracking-widest text-dark/20 text-center md:text-right">
              © 2026 Parkside Residences. <br className="md:hidden" /> All Rights Reserved.
            </span>
          </div>
        </div>
      </footer>

      <EditPanel 
        images={images} 
        onUpdate={updateImage} 
        onReset={resetImages} 
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
