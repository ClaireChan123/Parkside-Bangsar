import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageCircle, FileText, Calendar, Building, Sparkles, CheckCircle2 } from 'lucide-react';

interface WhatsAppWidgetProps {
  lang: 'en' | 'zh';
  phoneNumber?: string;
}

export const WhatsAppIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({
  lang,
  phoneNumber = '60126579508'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  const presets = [
    {
      id: 'enquire',
      icon: MessageCircle,
      title: lang === 'en' ? 'General Enquiry' : '一般咨询',
      subtitle: lang === 'en' ? 'Pricing, availability & floorplans' : '价格、销售情况与户型资料',
      message: lang === 'en' 
        ? "Hi, I'm interested in Parkside Residences @ Setia Federal Hill. I'd like to enquire for more details." 
        : "您好，我对 Setia Federal Hill 的 Parkside Residences 感兴趣，想咨询更多项目详情与资料。"
    },
    {
      id: 'brochure',
      icon: FileText,
      title: lang === 'en' ? 'Digital Brochure' : '索取电子手册',
      subtitle: lang === 'en' ? 'Instant PDF masterplan & specifications' : '即刻获取高清项目图册与详细规格',
      message: lang === 'en' 
        ? "Hi, I'd like to request for the Parkside Residences digital brochure and project factsheet." 
        : "您好，我想索取 Parkside Residences 的官方电子宣传手册和项目资料册。"
    },
    {
      id: 'tour',
      icon: Calendar,
      title: lang === 'en' ? 'Book Showroom Tour' : '预约私人展厅参观',
      subtitle: lang === 'en' ? 'Private viewing at Bangsar Sales Gallery' : '专人陪同参观孟沙 (Bangsar) 销售展厅',
      message: lang === 'en' 
        ? "Hi, I'd like to book a private showroom tour at the Bangsar Sales Gallery for Parkside Residences." 
        : "您好，我想预约参观位于孟沙 (Bangsar) 的 Parkside Residences 私人展厅。"
    },
    {
      id: 'report',
      icon: Building,
      title: lang === 'en' ? 'Investor & Layout Pack' : '投资报告与精选户型',
      subtitle: lang === 'en' ? 'Rental yield analysis & early bird packages' : '租金回报率分析与早鸟优惠方案',
      message: lang === 'en' 
        ? "Hi, I'd like to receive the Parkside Residences Investor Report, Floorplans and early bird package details." 
        : "您好，我想索取 Parkside Residences 的投资者分析报告、全套户型图及早鸟优惠信息。"
    }
  ];

  const unitTypes = [
    { name: 'Type A (Studio - 485 sqft)', label: 'Type A' },
    { name: 'Type B (1+1 BR - 688 sqft)', label: 'Type B' },
    { name: 'Type C (2 BR - 828 sqft)', label: 'Type C' },
    { name: 'Type D (2+1 BR - 958 sqft)', label: 'Type D' },
    { name: 'Type E (3 BR - 1,228 sqft)', label: 'Type E' },
  ];

  const [customMessage, setCustomMessage] = useState(presets[0].message);

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setCustomMessage(presets[index].message);
  };

  const handleSelectUnit = (unitName: string) => {
    const msg = lang === 'en'
      ? `Hi, I'm interested in ${unitName} at Parkside Residences. Please share the pricing, layout and available units.`
      : `您好，我对 Parkside Residences 的 ${unitName} 户型感兴趣，请提供最新的价格、户型和房源列表。`;
    setCustomMessage(msg);
  };

  const handleSend = () => {
    const text = encodeURIComponent(customMessage);
    const url = `https://wa.me/${phoneNumber}?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[120] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 w-[92vw] max-w-[400px] bg-dark border border-gold/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-forest/90 via-dark to-dark p-5 border-b border-white/10 flex justify-between items-center relative">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0">
                    <WhatsAppIcon className="w-6 h-6" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-dark rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif text-base text-white font-medium tracking-tight">
                      {lang === 'en' ? 'Parkside Sales Gallery' : 'Parkside 官方销售团队'}
                    </h3>
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <p className="text-[10px] text-white/60 font-display uppercase tracking-wider flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                    {lang === 'en' ? 'Setia Federal Hill • Fast Response' : 'Setia Federal Hill • 在线即时回复'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body & Preset Options */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar bg-dark/95">
              {/* Official Welcome Speech Bubble */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 rounded-tl-none relative">
                <p className="text-xs text-white/90 leading-relaxed font-light">
                  {lang === 'en'
                    ? "Welcome to Parkside Residences Bangsar! Select a enquiry topic or send us a direct WhatsApp message below."
                    : "欢迎莅临 Parkside Residences Bangsar！请选择咨询主题或直接通过 WhatsApp 发送信息。"}
                </p>
                <span className="text-[9px] text-gold/70 block mt-1 font-display">
                  {lang === 'en' ? 'Official Developer Marketing' : '官方授权营销代表'}
                </span>
              </div>

              {/* Preset Category Buttons */}
              <div className="space-y-2">
                <label className="text-[9px] font-display uppercase tracking-widest text-gold/80 block">
                  {lang === 'en' ? 'Select Preset Query:' : '选择预设咨询内容：'}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {presets.map((item, idx) => {
                    const IconComp = item.icon;
                    const isSelected = selectedPresetIndex === idx;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectPreset(idx)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group ${
                          isSelected
                            ? 'bg-gold/15 border-gold text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-gold/40'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          isSelected ? 'bg-gold text-dark' : 'bg-white/10 text-gold group-hover:bg-gold group-hover:text-dark'
                        } transition-colors`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-display text-xs uppercase tracking-wider font-semibold text-white">
                              {item.title}
                            </span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-gold" />}
                          </div>
                          <p className="text-[10px] text-white/50 truncate font-light mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Unit Type Selector */}
              <div>
                <label className="text-[9px] font-display uppercase tracking-widest text-white/50 block mb-1.5">
                  {lang === 'en' ? 'Inquire Specific Unit:' : '咨询特选户型：'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {unitTypes.map((u) => (
                    <button
                      key={u.label}
                      onClick={() => handleSelectUnit(u.name)}
                      className="px-2.5 py-1 bg-white/5 hover:bg-gold/20 hover:border-gold border border-white/10 rounded-lg text-[10px] font-display text-white/80 hover:text-white transition-all"
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Message Box */}
              <div>
                <label className="text-[9px] font-display uppercase tracking-widest text-white/50 block mb-1">
                  {lang === 'en' ? 'Preset Message (Editable):' : '发送内容 (可自定义编辑)：'}
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-black/40 border border-white/15 focus:border-gold rounded-xl p-3 text-xs text-white placeholder-white/30 outline-none resize-none transition-colors font-light leading-relaxed"
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 bg-dark/90 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={handleSend}
                className="w-full py-3.5 px-5 bg-[#25D366] hover:bg-[#20bd5a] text-dark font-display text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_20px_rgba(37,211,102,0.3)] flex items-center justify-center gap-2 group cursor-pointer"
              >
                <WhatsAppIcon className="w-5 h-5 text-dark" />
                <span>{lang === 'en' ? 'Open WhatsApp' : '在 WhatsApp 中发送'}</span>
                <Send className="w-3.5 h-3.5 text-dark group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[9px] text-white/40 text-center font-display uppercase tracking-widest">
                {lang === 'en' ? 'Direct line to official sales consultant' : '直通官方销售代表WhatsApp顾问'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(prev => !prev)}
        className={`group relative flex items-center gap-3 p-3.5 md:p-4 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.4)] transition-all cursor-pointer ${
          isOpen ? 'bg-gold text-dark' : 'bg-[#25D366] text-dark hover:bg-[#20bd5a]'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-6 h-6 text-dark" />
          ) : (
            <WhatsAppIcon className="w-6 h-6 md:w-7 md:h-7 text-dark" />
          )}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full border-2 border-dark animate-ping" />
          )}
        </div>
        <span className="hidden sm:inline-block font-display text-[10px] md:text-xs uppercase font-bold tracking-widest text-dark pr-1">
          {isOpen 
            ? (lang === 'en' ? 'Close' : '关闭') 
            : (lang === 'en' ? 'WhatsApp Sales' : 'WhatsApp 咨询')}
        </span>
      </motion.button>
    </div>
  );
};
