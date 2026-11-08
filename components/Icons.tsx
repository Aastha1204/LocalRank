type P = { className?: string };
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const WhatsAppIcon = ({ className }: P) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.600 6.600 0 0 1-3.300-2.900c-.2-.4.2-.4.700-1.300.1-.1 0-.3 0-.4l-.7-1.700c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.300 3 3 0 0 0-.9 2.200c0 1.300.9 2.500 1 2.700s1.800 2.800 4.400 3.900c1.600.7 2.300.8 3.100.6.500-.1 1.400-.6 1.600-1.200.2-.6.200-1.100.1-1.200s-.2-.2-.4-.3Z" />
  </svg>
);
export const PhoneIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M22 16.9v3a2 2 0 0 1-2.200 2 19.800 19.800 0 0 1-8.600-3.100 19.500 19.500 0 0 1-6-6A19.800 19.800 0 0 1 2.100 4.200 2 2 0 0 1 4.100 2h3a2 2 0 0 1 2 1.700c.1 1 .4 1.900.7 2.800a2 2 0 0 1-.5 2.100L8.100 9.900a16 16 0 0 0 6 6l1.300-1.200a2 2 0 0 1 2.100-.4c.9.3 1.800.6 2.800.7a2 2 0 0 1 1.700 2Z" /></svg>
);
export const MailIcon = ({ className }: P) => (
  <svg {...base} className={className}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
);
export const PinIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
export const CalendarIcon = ({ className }: P) => (
  <svg {...base} className={className}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);
export const ArrowIcon = ({ className }: P) => (
  <svg {...base} width={16} height={16} className={className}><path d="M7 17 17 7M8 7h9v9" /></svg>
);
export const CheckIcon = ({ className }: P) => (
  <svg {...base} width={18} height={18} className={className}><path d="m5 12 5 5 9-10" /></svg>
);
export const XIcon = ({ className }: P) => (
  <svg {...base} width={18} height={18} className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const ChevronIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="m6 9 6 6 6-6" /></svg>
);
export const ClockIcon = ({ className }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
);
export const ChatIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></svg>
);
export const GlobeIcon = ({ className }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" /></svg>
);
export const ListIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
);
export const PlayIcon = ({ className }: P) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}><path d="M8 5v14l11-7Z" /></svg>
);
export const SparkIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.100L5 10l5.1-1.900Z" /><path d="M19 17v4M17 19h4" /></svg>
);
export const BookIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M4 19.500A2.500 2.500 0 0 1 6.500 17H20V3H6.500A2.500 2.500 0 0 0 4 5.500Z" /><path d="M20 17v4H6.500A2.500 2.500 0 0 1 4 18.500" /></svg>
);
export const BotIcon = ({ className }: P) => (
  <svg {...base} className={className}><rect x="4" y="8" width="16" height="12" rx="3" /><path d="M12 8V4M9 13h.01M15 13h.01M9 17h6" /><circle cx="12" cy="3" r="1" /></svg>
);
export const GearIcon = ({ className }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.900 4.900l2.100 2.100M17 17l2.100 2.100M2 12h3M19 12h3M4.900 19.100 7 17M17 7l2.100-2.100" /></svg>
);
