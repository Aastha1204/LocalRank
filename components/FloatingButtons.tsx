import { CONTACT, DEFAULT_WA_MESSAGE, waLink } from "@/config/site";
import { PhoneIcon, WhatsAppIcon } from "./Icons";

export default function FloatingButtons() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 md:hidden">
      <a href={`tel:${CONTACT.phone}`} aria-label="Call now" className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-xl">
        <PhoneIcon className="h-6 w-6" />
      </a>
      <a href={waLink(DEFAULT_WA_MESSAGE)} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="flex h-14 w-14 items-center justify-center rounded-full bg-[#15803d] text-white shadow-xl">
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </div>
  );
}

