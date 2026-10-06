import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFab: React.FC = () => {
  const [hovered, setHovered] = useState(false);

  const defaultMsg = encodeURIComponent(
    'Hola ASEING, deseo consultar sobre los servicios de planificación de producción y certificación de Normas ISO.'
  );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
      {hovered && (
        <div className="hidden sm:block px-3 py-1.5 rounded-xl bg-[#1c0a37] border border-white/20 text-white text-xs font-medium shadow-xl animate-in fade-in slide-in-from-right-2 duration-200">
          ¿Tiene dudas? Escríbanos a WhatsApp
        </div>
      )}

      <a
        id="wa-floating-btn"
        href={`https://wa.me/593984661214?text=${defaultMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp a ASEING"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#1ea1c2] via-[#25d366] to-[#128c7e] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
};
