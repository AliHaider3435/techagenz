import chatIcon from "@/assets/chat-icon.png";

const WHATSAPP_NUMBER = "923001234567";
const DEFAULT_MESSAGE = "Hi Tech Agenz! I would like to know more about your services.";

function WhatsAppButton() {
  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand shadow-lg shadow-brand/30 transition-transform duration-300 hover:scale-110 hover:shadow-xl hover:shadow-brand/40 animate-float-slow"
    >
      <span className="absolute inset-0 rounded-full bg-brand opacity-75 animate-ping" />
      <img
        src={chatIcon}
        alt="Chat with us"
        className="relative h-7 w-7 object-contain"
        style={{ filter: "brightness(0) invert(1)" }}
      />
    </a>
  );
}

export default WhatsAppButton;