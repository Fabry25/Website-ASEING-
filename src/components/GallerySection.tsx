import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, HardHat, Users, Factory } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Levantamiento de Procesos en Piso de Planta',
      subtitle: 'Estudio directo en estaciones de trabajo',
      desc: 'Trabajamos directamente junto a los operarios y supervisores para identificar cuellos de botella, pérdidas de material y tiempos improductivos reales antes de estructurar el plan maestro.',
      tag: 'FASE DE CAMPO',
      icon: <Factory size={24} className="text-[#1ea1c2]" />
    },
    {
      title: 'Capacitación y Formación de Mandos Medios',
      subtitle: 'Estandarización y cultura de calidad',
      desc: 'Capacitamos a jefes de turno y auditores internos en herramientas de calidad, metodología de 5S y control estadístico para asegurar que las mejoras se sostengan en el tiempo.',
      tag: 'TRANSFERENCIA DE CONOCIMIENTO',
      icon: <Users size={24} className="text-[#3c65cd]" />
    },
    {
      title: 'Auditorías de Seguimiento y Cumplimiento Normativo',
      subtitle: 'Revisión rigurosa con la alta dirección',
      desc: 'Medición de indicadores OEE, análisis de causas raíz y evaluación de riesgos ergonómicos y mecánicos para garantizar la conformidad en auditorías del ente certificador y entes de control.',
      tag: 'AUDITORÍA Y CONTROL',
      icon: <HardHat size={24} className="text-[#b80068]" />
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section id="galeria" className="py-24 bg-[#120325] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1ea1c2]">
            TRABAJO REAL DE INGENIERÍA EN TERRENO
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            Nuestro Equipo en Acción
          </h2>
          <p className="text-base text-[#bfa9dc] mt-2">
            No somos consultores de escritorio. Evaluamos la planta en el sitio, junto a las máquinas y las personas.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#1d0a3a] to-[#0f041d] shadow-2xl min-h-[360px] flex flex-col justify-between p-8 sm:p-12">
          {/* Slide Content */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                {slides[currentSlide].icon}
              </div>
              <span className="text-xs font-mono font-bold text-[#1ea1c2] px-3 py-1 rounded-full bg-[#1ea1c2]/10 border border-[#1ea1c2]/30">
                {slides[currentSlide].tag}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {slides[currentSlide].title}
            </h3>

            <p className="text-sm text-[#1ea1c2] font-semibold font-mono">
              {slides[currentSlide].subtitle}
            </p>

            <p className="text-sm sm:text-base text-[#bfa9dc] leading-relaxed">
              {slides[currentSlide].desc}
            </p>
          </div>

          {/* Controls Bar */}
          <div className="pt-8 mt-6 border-t border-white/10 flex items-center justify-between">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Ir al slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentSlide === i ? 'w-8 bg-[#1ea1c2]' : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Anterior"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Siguiente"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
