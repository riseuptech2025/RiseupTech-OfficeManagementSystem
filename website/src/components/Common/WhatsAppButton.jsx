import React from 'react';

const WhatsAppButton = () => {
  // Country code + number, no "+", no spaces
  const phoneNumber = '9779827399860';
  const message = 'Hello! I would like to know more about your services.';

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="
        group fixed bottom-6 right-6 z-[1000]
        flex h-16 w-16 items-center justify-center
        rounded-full
        bg-gradient-to-br from-[#2AF598] via-[#25D366] to-[#1EBE5A]
        text-white
        shadow-[0_8px_24px_rgba(37,211,102,0.45)]
        ring-4 ring-white/20
        transition-all duration-300 ease-out
        hover:scale-110 hover:shadow-[0_12px_32px_rgba(37,211,102,0.7)]
        hover:ring-white/40
        active:scale-95
        max-sm:bottom-5 max-sm:right-5 max-sm:h-14 max-sm:w-14
      "
    >
      {/* Always-on slow ping ring (draws attention) */}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] animate-whatsapp-ping-slow" />

      {/* Faster pulse ring on hover */}
      <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#25D366] opacity-0 group-hover:animate-whatsapp-pulse" />

      {/* Unread message bubble badge */}
      <span
        className="
          pointer-events-none absolute -top-1 -right-1 z-20
          flex h-6 w-6 items-center justify-center
          rounded-full bg-red-500 text-[11px] font-bold text-white
          shadow-md ring-2 ring-white
          opacity-0 animate-bubble-in
        "
      >
        1
      </span>

      {/* Tooltip with arrow + online dot */}
      <span
        className="
          pointer-events-none absolute right-[76px] z-20
          flex items-center gap-2 whitespace-nowrap
          rounded-lg bg-gray-900/95 px-3 py-2
          text-sm font-medium text-white
          shadow-xl backdrop-blur-sm
          opacity-0 translate-x-2
          transition-all duration-300 ease-out
          group-hover:opacity-100 group-hover:translate-x-0
          max-sm:hidden
        "
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        Chat with us
        {/* Arrow */}
        <span className="absolute -right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-gray-900/95" />
      </span>

      {/* WhatsApp icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="relative z-10 h-8 w-8 max-sm:h-7 max-sm:w-7 drop-shadow-sm"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.244-.66.244-1.018 0-.086-.03-.158-.073-.23-.158-.243-2.115-1.205-2.65-1.476zM16.13 24.83c-1.36 0-2.72-.38-3.888-1.09l-2.703.723.733-2.634a7.29 7.29 0 0 1-1.398-4.29c0-4.02 3.27-7.29 7.29-7.29 1.946 0 3.775.76 5.15 2.14a7.24 7.24 0 0 1 2.14 5.15c0 4.02-3.27 7.29-7.324 7.29zm0-16.014c-4.844 0-8.786 3.942-8.786 8.786 0 1.543.4 3.06 1.17 4.39L6.86 27.29l5.4-1.42a8.77 8.77 0 0 0 4.2 1.07c4.845 0 8.787-3.94 8.787-8.785 0-2.347-.915-4.553-2.573-6.212a8.72 8.72 0 0 0-6.212-2.573z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;