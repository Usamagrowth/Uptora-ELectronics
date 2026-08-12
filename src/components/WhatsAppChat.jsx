import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppChat() {
  return (
    <a
      href="https://wa.me/2349024988998"
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Uptora on WhatsApp"
      className="fixed bottom-4 right-4 z-50 flex items-center justify-center gap-2 rounded-full bg-brand-500 px-4 py-3 text-white shadow-xl shadow-brand-900/20 transition hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-300 dark:focus:ring-brand-900 sm:h-14 sm:w-14 sm:px-0 sm:gap-0"
    >
      <span className="text-sm font-bold sm:hidden">Contact Us</span>
      <FaWhatsapp className="h-6 w-6" />
    </a>
  );
}
