import React from 'react';
import { motion } from 'motion/react';
import { Award, Leaf, ShieldAlert, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface IsoSectionProps {
  onSelectPackage: (packageId: string) => void;
}

export const IsoSection: React.FC<IsoSectionProps> = ({ onSelectPackage }) => {
  const standards = [
    {
      id: 'iso-9001',
      badge: 'ISO 9001:2026',
      name: 'Gestión de la Calidad (Norma ISO 9001:2026)',
      icon: <Award className="text-[#b80068]" size={24} />,
      desc: 'Enfoque en procesos, satisfacción del cliente, gestión de riesgos estratégicos y trazabilidad en toda la cadena de valor según la versión vigente ISO 9001:2026.',
      points: [
        'Mapeo de macroprocesos y fichas técnicas',
        'Protocolo de control de no conformidades',
        'Indicadores de calidad y satisfacción del cliente'
      ],
      price: 1400
    },
    {
      id: 'iso-14001',
      badge: 'ISO 14001:2026',
      name: 'Gestión Ambiental (Norma ISO 14001:2026)',
      icon: <Leaf className="text-[#25d366]" size={24} />,
      desc: 'Control operacional de aspectos ambientales, reducción de huella ecológica y cumplimiento estricto de la normativa ecuatoriana según la versión vigente ISO 14001:2026.',
      points: [
        'Matriz de aspectos e impactos ambientales',
        'Planes de contingencia y control de derrames',
        'Eficiencia energética y gestión de desechos'
      ],
      price: 1520
    },
    {
      id: 'iso-45001',
      badge: 'ISO 45001:2018',
      name: 'Seguridad y Salud en el Trabajo',
      icon: <ShieldAlert className="text-amber-400" size={24} />,
      desc: 'Prevención proactiva de accidentes laborales, matrices IPERC, ergonomía y cumplimiento ante el Ministerio del Trabajo e IESS.',
      points: [
        'Matriz de riesgos IPERC por puesto de trabajo',
        'Reglamento de Higiene y Seguridad aprobado',
        'Conformación y capacitación de brigadas de emergencia'
      ],
      price: 1680
    }
  ];

  const methodologySteps = [
    {
      step: '01',
      title: 'Diagnóstico de Brechas',
      desc: 'Inspección en planta para confrontar cada requisito de la norma contra la operación real de su empresa.'
    },
    {
      step: '02',
      title: 'Diseño e Implantación',
      desc: 'Desarrollo de procedimientos sin burocracia excesiva. Capacitamos a su equipo directamente en sus estaciones.'
    },
    {
      step: '03',
      title: 'Auditoría Interna',
      desc: 'Simulacro completo con auditores líderes para detectar no conformidades antes de la evaluación oficial.'
    },
    {
      step: '04',
      title: 'Acompañamiento en Certificación',
      desc: 'Presencia de nuestros ingenieros junto al ente certificador (ICONTEC, Bureau Veritas, SGS, etc.) hasta la emisión del certificado.'
    }
  ];

  return (
    <section id="iso" className="py-24 bg-[#140529] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b80068]/10 border border-[#b80068]/30 text-xs font-mono text-[#b80068] mb-3">
            <ShieldCheck size={14} />
            <span>SISTEMAS DE GESTIÓN INTERNACIONALES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Le llevamos a la certificación oficial, no solo al papel.
          </h2>
          <p className="text-base text-[#bfa9dc] mt-3">
            Nuestro compromiso es que el sistema de gestión funcione en la realidad de la planta, mejorando la productividad y garantizando el éxito en la auditoría externa.
          </p>
        </motion.div>

        {/* 3 Individual Standards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {standards.map((std, idx) => (
            <motion.div
              key={std.id}
              id={`iso-card-${std.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="p-6 rounded-2xl bg-[#1c0a37] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    {std.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1ea1c2] px-2.5 py-1 rounded-full bg-[#1ea1c2]/10 border border-[#1ea1c2]/20">
                    {std.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{std.name}</h3>
                <p className="text-xs text-[#bfa9dc] mb-4 leading-relaxed">{std.desc}</p>

                <div className="space-y-2 border-t border-white/5 pt-3">
                  {std.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs text-[#f3effa]">
                      <Check size={13} className="text-[#1ea1c2] mt-0.5 flex-none" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#bfa9dc] font-mono">PROYECTO COMPLETO:</div>
                  <div className="text-base font-bold font-mono text-white">USD ${std.price}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectPackage(std.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  Cotizar
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Paquete Trinorma Banner */}
        <motion.div
          id="featured-paquete-trinorma"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl p-8 bg-gradient-to-r from-[#20063f] via-[#310b5a] to-[#1a0533] border border-[#b80068]/50 shadow-2xl relative overflow-hidden mb-16"
        >
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#b80068]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b80068] text-white text-xs font-bold font-mono shadow-md">
                <Sparkles size={14} />
                <span>PAQUETE RECOMENDADO · AHORRO DEL 18% (USD $640 OFF)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Paquete Trinorma Integrado: ISO 9001:2026 + ISO 14001:2026 + ISO 45001
              </h3>
              <p className="text-sm text-[#bfa9dc] leading-relaxed max-w-2xl">
                Implemente Calidad, Medio Ambiente y Seguridad Ocupacional bajo una estructura de alto nivel unificada.
                Evite duplicar manuales, optimice horas de auditoría y capacite a sus equipos en un solo programa coordinado.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-white">
                <span className="flex items-center gap-1"><Check size={14} className="text-[#25d366]" /> Sistema documental único</span>
                <span className="flex items-center gap-1"><Check size={14} className="text-[#25d366]" /> Auditoría interna trinorma</span>
                <span className="flex items-center gap-1"><Check size={14} className="text-[#25d366]" /> Acompañamiento hasta la certificación</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
              <div className="text-right">
                <div className="text-xs text-[#bfa9dc] line-through font-mono">Precio individual: USD $4,600</div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white mt-0.5">
                  USD $3,960
                </div>
                <div className="text-[11px] text-[#25d366] font-mono font-semibold">Ahorro inmediato de USD $640</div>
              </div>
              <button
                id="btn-select-trinorma"
                type="button"
                onClick={() => onSelectPackage('paquete-iso-trinorma')}
                className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#b80068] to-[#3a0ca3] hover:opacity-95 shadow-xl shadow-[#b80068]/30 cursor-pointer"
              >
                <span>Contratar Paquete Trinorma</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* 4-Step Methodology Roadmap */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <span className="text-xs font-mono uppercase tracking-widest text-[#1ea1c2]">
              METODOLOGÍA RIGUROSA DE CAMPO
            </span>
            <h3 className="text-2xl font-bold text-white mt-1">
              Ruta Paso a Paso Hacia su Certificación
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {methodologySteps.map((m, idx) => (
              <motion.div
                key={idx}
                id={`methodology-step-${m.step}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#1ea1c2]/50 transition-all"
              >
                <div className="text-2xl font-extrabold font-mono text-[#1ea1c2] mb-2">{m.step}</div>
                <h4 className="text-sm font-bold text-white mb-1.5">{m.title}</h4>
                <p className="text-xs text-[#bfa9dc] leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
