import React from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

interface ContactSectionProps {
  onOpenRegisterModal?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = () => {
  return (
    <section id="contacto" className="py-16 sm:py-20 bg-[#140529] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1ea1c2]">
            CANAL DIRECTO DE ATENCIÓN TÉCNICA
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            Hablemos de su Planta y Procesos
          </h2>
          <p className="text-base text-[#bfa9dc] mt-2">
            Póngase en contacto con nuestro equipo técnico para coordinar una reunión de diagnóstico presencial o virtual.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact Details Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/5 text-[#1ea1c2] shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-[#bfa9dc]">Dirección Técnica:</h4>
                  <p className="text-sm font-semibold text-white mt-1">
                    Av. Imbabura y Maytacapac, Ambato, Ecuador
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/5 text-[#25d366] shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-[#bfa9dc]">WhatsApp Directo:</h4>
                  <a
                    href="https://wa.me/593984661214"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-white hover:text-[#25d366] font-mono mt-1 block transition-colors"
                  >
                    +593 984 661 214
                  </a>
                  <span className="text-[11px] text-[#bfa9dc]">Atención técnica directa</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/5 text-[#3c65cd] shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-[#bfa9dc]">Correos Oficiales:</h4>
                  <p className="text-sm font-semibold text-white mt-1">
                    aseingerencia1@gmail.com
                  </p>
                  <p className="text-xs text-[#bfa9dc] mt-0.5">
                    contacto@aseing.ec
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/5 text-amber-400 shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-[#bfa9dc]">Horario de Atención:</h4>
                  <p className="text-sm font-semibold text-white mt-1">
                    Lunes a viernes
                  </p>
                  <p className="text-xs text-[#bfa9dc] mt-0.5">
                    08:00 – 18:00 (Hora Ecuador)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Frame */}
          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-lg flex flex-col justify-between">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-78.6366559%2C-1.2600677%2C-78.6166559%2C-1.2400677&layer=mapnik&marker=-1.2500677%2C-78.6266559"
              className="w-full h-48 sm:h-56 lg:h-full min-h-[190px] border-0"
              loading="lazy"
              title="Ubicación ASEING Ambato"
            />
            <a
              href="https://www.google.com/maps/search/?api=1&query=Av.+Imbabura+y+Mayta+Capac,+Ambato,+Ecuador"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#1d0938] text-[#1ea1c2] hover:text-[#b80068] text-xs font-mono flex items-center justify-center gap-1.5 transition-colors border-t border-white/10"
            >
              <span>Abrir en Google Maps</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
