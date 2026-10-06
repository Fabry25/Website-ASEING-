import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Layers,
  Timer,
  CircleDollarSign,
  Award,
  Leaf,
  ShieldAlert,
  Sparkles,
  ClipboardCheck,
  GraduationCap,
  Globe,
  Smartphone,
  TrendingUp,
  Cpu,
  Check,
  Plus,
  ArrowUpRight,
  HeartPulse,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { ServiceItem } from '../types';
import { SERVICES_CATALOG } from '../data/servicesData';

interface ServicesSectionProps {
  onAddToCart: (service: ServiceItem) => void;
  selectedServiceIds: string[];
  onOpenErpDemo?: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onAddToCart, selectedServiceIds, onOpenErpDemo }) => {
  const [filter, setFilter] = useState<string>('todos');

  const categories = [
    { id: 'todos', name: 'Todos los Servicios' },
    { id: 'produccion', name: 'Planificación & Planta' },
    { id: 'costos', name: 'Tiempos & Costos' },
    { id: 'iso', name: 'Certificaciones ISO' },
    { id: 'sst', name: 'Seguridad SST' },
    { id: 'digital', name: 'Apps & Web' },
    { id: 'inversion', name: 'Inversión Financiera' }
  ];

  const handleSelectAppAndScroll = (service: ServiceItem) => {
    // Si no está seleccionado aún, lo activa y agrega automáticamente al cotizador y resumen
    if (!selectedServiceIds.includes(service.id)) {
      onAddToCart(service);
    }
    // Desplaza y resalta suavemente la fila correspondiente en la tabla del cotizador
    setTimeout(() => {
      const targetRow = document.getElementById(`service-row-${service.id}`);
      if (targetRow) {
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetRow.classList.add('ring-2', 'ring-[#1ea1c2]', 'bg-[#2e1354]');
        setTimeout(() => {
          targetRow.classList.remove('ring-2', 'ring-[#1ea1c2]', 'bg-[#2e1354]');
        }, 2200);
      } else {
        const pricingEl = document.getElementById('precios');
        if (pricingEl) {
          pricingEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 70);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity size={20} className="text-[#1ea1c2]" />;
      case 'Layers':
        return <Layers size={20} className="text-[#3c65cd]" />;
      case 'Timer':
        return <Timer size={20} className="text-[#1ea1c2]" />;
      case 'CircleDollarSign':
        return <CircleDollarSign size={20} className="text-[#25d366]" />;
      case 'Award':
        return <Award size={20} className="text-[#b80068]" />;
      case 'Leaf':
        return <Leaf size={20} className="text-[#25d366]" />;
      case 'ShieldAlert':
        return <ShieldAlert size={20} className="text-amber-400" />;
      case 'Sparkles':
        return <Sparkles size={20} className="text-[#b80068]" />;
      case 'ClipboardCheck':
        return <ClipboardCheck size={20} className="text-[#1ea1c2]" />;
      case 'GraduationCap':
        return <GraduationCap size={20} className="text-[#3c65cd]" />;
      case 'Globe':
        return <Globe size={20} className="text-[#1ea1c2]" />;
      case 'Smartphone':
        return <Smartphone size={20} className="text-[#b80068]" />;
      case 'TrendingUp':
        return <TrendingUp size={20} className="text-[#25d366]" />;
      case 'Cpu':
        return <Cpu size={20} className="text-[#3c65cd]" />;
      default:
        return <Activity size={20} className="text-[#1ea1c2]" />;
    }
  };

  const filteredServices =
    filter === 'todos'
      ? SERVICES_CATALOG
      : SERVICES_CATALOG.filter((s) => s.category === filter);

  const hasOtherServicesSelected = selectedServiceIds.some((id) => id !== 'diagnostico-inicial');

  return (
    <section id="servicios" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1ea1c2]/10 border border-[#1ea1c2]/20 text-xs font-mono text-[#1ea1c2] mb-3">
          <span>PORTAFOLIO DE SOLUCIONES TÉCNICAS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Especialidades Técnicas para su Operación
        </h2>
        <p className="text-base text-[#bfa9dc] mt-3">
          Siete frentes de trabajo que conectan la planta con el sistema de gestión, reduciendo tiempos improductivos y protegiendo el margen de su negocio.
        </p>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap gap-2 pt-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filter === cat.id
                  ? 'bg-[#1ea1c2] text-white shadow-md shadow-[#1ea1c2]/20'
                  : 'bg-white/5 border border-white/10 text-[#bfa9dc] hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service, idx) => {
          const isSelected = selectedServiceIds.includes(service.id);

          return (
            <motion.div
              key={service.id}
              id={`service-card-${service.id}`}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: (idx % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-colors duration-300 border ${
                isSelected
                  ? 'bg-[#220d3f] border-[#1ea1c2] shadow-xl shadow-[#1ea1c2]/10 ring-1 ring-[#1ea1c2]'
                  : 'bg-[#18082e] border-white/10 hover:border-white/25 hover:-translate-y-1'
              }`}
            >
              <div>
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {getIcon(service.iconName)}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {service.savingsBadge && service.savingsBadge !== service.modalidad && (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#b80068] text-white">
                        {service.savingsBadge}
                      </span>
                    )}
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                      service.modalidad === 'Pago Único' || service.modalidad === 'Único'
                        ? 'bg-[#1ea1c2]/20 text-[#1ea1c2] border border-[#1ea1c2]/30 font-bold'
                        : 'bg-white/5 text-[#bfa9dc]'
                    }`}>
                      {service.modalidad}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  {service.title}
                </h3>
                <p className="text-xs text-[#bfa9dc] mb-4 leading-relaxed">
                  {service.shortDesc}
                </p>

                {/* Deliverables Checklist */}
                <div className="space-y-1.5 py-3 border-t border-white/5 text-xs text-[#f3effa]">
                  <div className="text-[11px] font-mono text-[#1ea1c2] uppercase">Entregables clave:</div>
                  {service.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check size={13} className="text-[#1ea1c2] mt-0.5 flex-none" />
                      <span className="text-xs text-[#bfa9dc]">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Timeline info */}
                <div className="text-[11px] text-[#bfa9dc] font-mono mt-3">
                  ⏱ Plazo estimado: <span className="text-white">{service.estimatedDays}</span>
                </div>

                {/* Payment Condition Highlight */}
                {service.paymentCondition && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px] uppercase font-mono tracking-wider">
                      <Sparkles size={13} className="text-emerald-400" />
                      <span>Condición de Pago Oficial:</span>
                    </div>
                    <p className="text-[11px] text-emerald-100/90 mt-1 leading-snug">
                      {service.paymentCondition}
                    </p>
                    {hasOtherServicesSelected ? (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500 text-[#0c2715] font-bold text-[10px] font-mono shadow-sm">
                        <Check size={12} />
                        <span>¡CONDICIÓN APLICADA! Diagnóstico 100% Bonificado ($0.00)</span>
                      </div>
                    ) : (
                      <div className="mt-1.5 text-[10px] text-[#bfa9dc] font-mono">
                        💡 Agregue cualquier otro servicio del catálogo y este valor no se cobrará.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price and Add-to-Quote / Payment Action */}
              <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#bfa9dc] font-mono uppercase">
                    {service.id === 'diagnostico-inicial' && hasOtherServicesSelected ? (
                      <span className="text-emerald-400 font-bold">Inversión (Bonificada):</span>
                    ) : (
                      'Inversión:'
                    )}
                  </div>
                  {service.id === 'diagnostico-inicial' && hasOtherServicesSelected ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold font-mono text-emerald-400">USD $0.00</span>
                      <span className="text-xs line-through text-[#bfa9dc]/60 font-mono">USD $30</span>
                    </div>
                  ) : (
                    <div className="text-lg font-bold font-mono text-white">
                      USD ${service.price}
                      {service.modalidad === 'Mensual' && <span className="text-xs font-normal text-[#bfa9dc]">/mes</span>}
                      {service.modalidad === 'Licencia mensual' && <span className="text-xs font-normal text-[#bfa9dc]">/mes</span>}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onAddToCart(service)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1ea1c2] text-white shadow-md'
                      : service.id === 'diagnostico-inicial' && hasOtherServicesSelected
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check size={14} />
                      <span>
                        {service.id === 'diagnostico-inicial' && hasOtherServicesSelected
                          ? 'Agregado ($0.00)'
                          : 'Agregado'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>
                        {service.id === 'diagnostico-inicial' && hasOtherServicesSelected
                          ? 'Agregar Gratis'
                          : 'Agregar'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Specialty Cards: 1. Production App QR + 2. Nipponflex Wellness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        {/* App de Planificación con Código QR interactivo */}
        <motion.div
          id="specialty-card-app-planificacion"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1b0833] to-[#250d44] border border-white/15 flex flex-col justify-between shadow-xl gap-4"
        >
          {/* Fila principal con QR a la izquierda y Contenido a la derecha */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Contenedor Limpio del Código QR */}
            <a
              href="https://aseing-erp-plan-control-produccion-1.ai.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 sm:p-3.5 rounded-2xl bg-white border border-white/20 shadow-lg flex flex-col items-center justify-center flex-none transition-transform hover:scale-[1.03] active:scale-[0.98] duration-200 self-center sm:self-start cursor-pointer group"
              title="Abrir App ERP en Cloud Run: https://aseing-erp-plan-control-produccion-1.ai.studio (Contraseña de ingreso: ERP-ASEING)"
            >
              <img
                src="/images/qr/codigo-qr-erp-aseing.png"
                alt="Código QR App ERP - Control de Producción ASEING"
                className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
              <span className="text-[10px] font-mono font-bold text-[#1e0338] mt-1.5 tracking-wider text-center group-hover:text-[#3a0ca3] transition-colors flex items-center gap-1">
                ESCANEAR APP DEMO <ExternalLink size={10} className="inline opacity-70" />
              </span>
            </a>

            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#1ea1c2]">
                <Smartphone size={14} />
                <span>TECNOLOGÍA PROPIA ASEING</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                App Web de Planificación y Control de Producción
              </h3>
              <p className="text-xs text-[#bfa9dc] leading-relaxed">
                Elimine las planillas de papel. Nuestro software en la nube permite a su equipo registrar el avance de órdenes de fabricación, tiempos de parada y cumplimiento de pedidos desde cualquier dispositivo móvil o terminal de planta.
              </p>
              <div className="pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const appCompra = SERVICES_CATALOG.find((s) => s.id === 'app-planificacion');
                    const appMensual = SERVICES_CATALOG.find((s) => s.id === 'app-planificacion-mensual');
                    return (
                      <>
                        {appCompra && (
                          <button
                            type="button"
                            onClick={() => handleSelectAppAndScroll(appCompra)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              selectedServiceIds.includes('app-planificacion')
                                ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                            }`}
                          >
                            {selectedServiceIds.includes('app-planificacion') ? (
                              <Check size={13} />
                            ) : (
                              <Plus size={13} />
                            )}
                            <span>
                              {selectedServiceIds.includes('app-planificacion')
                                ? 'Compra Seleccionada ($4.300)'
                                : '+ Comprar App ($4.300)'}
                            </span>
                          </button>
                        )}
                        {appMensual && (
                          <button
                            type="button"
                            onClick={() => handleSelectAppAndScroll(appMensual)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              selectedServiceIds.includes('app-planificacion-mensual')
                                ? 'bg-[#1ea1c2] text-slate-950 shadow-md font-semibold'
                                : 'bg-[#1ea1c2]/20 text-[#1ea1c2] border border-[#1ea1c2]/30 hover:bg-[#1ea1c2]/30'
                            }`}
                          >
                            {selectedServiceIds.includes('app-planificacion-mensual') ? (
                              <Check size={13} />
                            ) : (
                              <Plus size={13} />
                            )}
                            <span>
                              {selectedServiceIds.includes('app-planificacion-mensual')
                                ? 'Licencia Seleccionada ($92 / mes por (3 usuarios))'
                                : '+ Licencia Mensual ($92 / mes por (3 usuarios))'}
                            </span>
                          </button>
                        )}
                        <a
                          href="#precios"
                          onClick={(e) => {
                            e.preventDefault();
                            const el = document.getElementById('precios');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-xs text-[#bfa9dc] hover:text-white flex items-center gap-1 ml-auto transition-colors cursor-pointer"
                        >
                          <span>Ver en Cotizador</span>
                          <ArrowUpRight size={13} />
                        </a>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Franja Horizontal Optimizada y Justificada a lo Ancho del Contenedor */}
          <div className="w-full pt-3 border-t border-white/10">
            <p className="text-xs sm:text-[13px] text-[#e0d4f5] text-justify leading-relaxed tracking-normal font-sans">
              Escanee este código con la cámara de su móvil para explorar los módulos de ERP - Control de Producción tiempo real (Modo Demo) Contraseña de ingreso: ERP-ASEING
            </p>
          </div>
        </motion.div>

        {/* Salud y Bienestar · Energy by Nipponflex */}
        <motion.div
          id="specialty-card-nipponflex"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1b0833] to-[#250d44] border border-white/15 flex flex-col justify-between shadow-xl"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#25d366]">
              <HeartPulse size={14} />
              <span>BIENESTAR LABORAL & SALUD</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Sesiones de Bienestar Complementario · Nipponflex
            </h3>
            <p className="text-xs text-[#bfa9dc] leading-relaxed">
              Sesiones demostrativas gratuitas con tecnología japonesa (FIR Power, Ion Balls, Magneto FIR Power, restauradores de agua ARA y sueño ARS) basadas en los 4 elementos de la naturaleza, para favorecer la relajación y el descanso de sus colaboradores.
            </p>
            <p className="text-[11px] text-[#bfa9dc]/70 italic border-l-2 border-white/20 pl-3">
              *Terapia complementaria de bienestar; no sustituye diagnóstico ni tratamiento médico. Consulte a su médico ante cualquier condición de salud.
            </p>
          </div>
          <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-bold">Sesión de Cortesía Gratuita</span>
            <a
              href="https://wa.me/message/N7T75H32ML4YE1"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95"
            >
              <span>Coordinar por WhatsApp</span>
              <ArrowUpRight size={14} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
