import React from 'react';
import { Award, Shield, Target, Users2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const pillars = [
    {
      icon: <Award className="text-[#1ea1c2]" size={22} />,
      title: 'Equipo Técnico Certificado',
      desc: 'Consultores y auditores líderes calificados bajo normas ISO 9001:2026, ISO 14001:2026 e ISO 45001 con experiencia en manufactura, calzado, alimentos y metalmecánica.'
    },
    {
      icon: <Target className="text-[#3c65cd]" size={22} />,
      title: 'Metodología Estricta en Planta',
      desc: 'Levantamiento de tiempos y costos in situ, directamente en las estaciones de trabajo: tiempos reales, cuellos de botella reales y costos reales.'
    },
    {
      icon: <Shield className="text-[#b80068]" size={22} />,
      title: 'Acompañamiento Post-Certificación',
      desc: 'No abandonamos el proyecto al terminar la auditoría. Mantenemos el sistema activo para evitar que la certificación se pierda en las auditorías de seguimiento.'
    },
    {
      icon: <Users2 className="text-[#25d366]" size={22} />,
      title: 'Enfoque en la Seguridad de las Personas',
      desc: 'Ningún sistema de gestión se sostiene sin la salud y la participación del equipo humano. Cumplimos con la normativa ecuatoriana de SST de forma real.'
    }
  ];

  return (
    <section id="nosotros" className="py-24 bg-[#0f041d] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#1ea1c2]">
              <span>QUIÉNES SOMOS · INGENIERÍA APLICADA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Ingeniería aplicada a la operación real de su planta.
            </h2>
            <p className="text-sm sm:text-base text-[#bfa9dc] leading-relaxed">
              ASEING nació de la necesidad de conectar la planificación y control de producción con los sistemas de gestión ISO, en lugar de tratarlos como proyectos burocráticos separados.
            </p>
            <p className="text-sm sm:text-base text-[#bfa9dc] leading-relaxed">
              Bajo la dirección técnica de <strong>Profesionales con experiencia en diferentes áreas</strong>, acompañamos a gerentes de operaciones, jefes de planta y comités paritarios en todo el Ecuador para alcanzar rentabilidad medible y cumplimiento normativo blindado.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-white font-mono">
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">Ambato · Tungurahua</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">Cobertura Nacional Ecuador</span>
            </div>
          </div>

          {/* Right Column: 4 Strategic Pillars */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all space-y-2.5"
              >
                <div className="p-2.5 rounded-xl bg-white/5 w-fit border border-white/10">
                  {p.icon}
                </div>
                <h3 className="text-sm font-bold text-white">{p.title}</h3>
                <p className="text-xs text-[#bfa9dc] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
