import React from 'react';
import { ExternalLink } from 'lucide-react';
import { AutomatedBrandLogo } from './AutomatedBrandLogo';

interface FooterProps {
  onOpenPortal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPortal }) => {
  return (
    <footer id="main-footer" className="bg-[#0b0217] border-t border-white/10 text-xs text-[#bfa9dc] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info (Logo Final Corporativo Sincronizado) */}
          <div className="lg:col-span-4 space-y-4">
            <AutomatedBrandLogo
              variant="final-footer"
              showEditButton={false}
            />

            <p className="text-xs text-[#bfa9dc] leading-relaxed">
              Asesoría industrial y gestión de negocios, planificación y control de producción (PCP), costeo por órdenes e implementación de Normas ISO 9001:2026, ISO 14001:2026 y ISO 45001.
            </p>

            <div className="text-[11px] text-[#bfa9dc]/80 pt-1">
              Dirección Técnica: <strong>Profesionales con experiencia en diferentes áreas</strong>
            </div>
          </div>

          {/* Quick Links: Services */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
              Servicios Industriales
            </h5>
            <ul className="space-y-2">
              <li><a href="#servicios" className="hover:text-white transition-colors">Planificación y Control (PCP)</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Estudio de Tiempos y Movimientos</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Costeo y Control de Costos</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">App de Planificación Fabril</a></li>
              <li><a href="#servicios" className="hover:text-white transition-colors">Asesoría en Inversión Financiera</a></li>
            </ul>
          </div>

          {/* Quick Links: ISO */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
              Normas & Certificaciones
            </h5>
            <ul className="space-y-2">
              <li><a href="#iso" className="hover:text-white transition-colors">Norma ISO 9001:2026 (Calidad)</a></li>
              <li><a href="#iso" className="hover:text-white transition-colors">Norma ISO 14001:2026 (Ambiente)</a></li>
              <li><a href="#iso" className="hover:text-white transition-colors">Norma ISO 45001:2018 (SST)</a></li>
              <li><a href="#iso" className="hover:text-white transition-colors">Paquete Trinorma Integrado</a></li>
              <li><a href="#iso" className="hover:text-white transition-colors">Auditoría Interna y Pre-Auditoría</a></li>
            </ul>
          </div>

          {/* Client Portal & Security */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
              Portal del Cliente
            </h5>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={onOpenPortal}
                  className="text-left text-[#1ea1c2] hover:underline"
                >
                  Consultar Estado de Orden
                </button>
              </li>
              <li><a href="#precios" className="hover:text-white transition-colors">Cotizador en Línea</a></li>
              <li><a href="https://payp.page.link/QEYpZ" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">Payphone Oficial <ExternalLink size={10} /></a></li>
              <li><a href="#contacto" className="hover:text-white transition-colors">Soporte Técnico</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#bfa9dc]">
          <div>
            © 2026 ASEING Consultores. Asesoría Industrial y Gestión de Negocios. - TODOS LOS DERECHOS RESERVADOS
          </div>
          <div className="flex items-center gap-4">
            <span>Ambato · Ecuador</span>
            <span>•</span>
            <span>Seguridad PCI-DSS & Payphone</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
