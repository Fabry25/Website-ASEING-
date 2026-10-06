import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Camera, Check } from 'lucide-react';

interface HeroProps {
  onStartDiagnosis: () => void;
  onGoToPricing: () => void;
}

interface CarouselItem {
  src: string;
  userFilename: string;
  label: string;
  tag: string;
  detail: string;
  stepIndex: number;
}

const DEFAULT_CAROUSEL_IMAGES: CarouselItem[] = [
  {
    src: '/Supervisión en Terreno . Túnel Sopladora.jpg',
    userFilename: 'Supervisión en Terreno . Túnel Sopladora.jpg',
    label: 'Supervisión en Terreno · Túnel Sopladora',
    tag: 'MINERÍA & HIDROELÉCTRICA',
    detail: 'Inspección técnica de seguridad en túnel de excavación junto a brigadistas y bomberos.',
    stepIndex: 2 // Certificar / SST
  },
  {
    src: '/Entrenamiento Práctico SST . Manejo de Extintores.jpeg',
    userFilename: 'Entrenamiento Práctico SST . Manejo de Extintores.jpeg',
    label: 'Entrenamiento Práctico SST · Manejo de Extintores',
    tag: 'SEGURIDAD & SALUD EN EL TRABAJO',
    detail: 'Capacitación presencial in situ para brigadas contra incendios y respuesta ante emergencias.',
    stepIndex: 1 // Controlar / SST
  },
  {
    src: '/Comité Paritario de Seguridad e Higiene.jpeg',
    userFilename: 'Comité Paritario de Seguridad e Higiene.jpeg',
    label: 'Comité Paritario de Seguridad e Higiene',
    tag: 'GESTIÓN DIRECTIVA & NORMATIVA',
    detail: 'Conformación y capacitación del comité paritario para cumplimiento legal del Ministerio del Trabajo.',
    stepIndex: 0 // Planificar / Gestión
  },
  {
    src: '/Control de Procesos Productivos en Planta.jpeg',
    userFilename: 'Control de Procesos Productivos en Planta.jpeg',
    label: 'Control de Procesos Productivos en Planta',
    tag: 'BALANCEO DE LÍNEA & PRODUCTIVIDAD',
    detail: 'Estandarización de tiempos, métodos y tableros visuales de control operativo en piso de taller.',
    stepIndex: 3 // Mejorar / Procesos
  }
];

export const Hero: React.FC<HeroProps> = ({ onStartDiagnosis, onGoToPricing }) => {
  const [activeCycleStep, setActiveCycleStep] = useState<number>(0);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [carouselImages, setCarouselImages] = useState<CarouselItem[]>(DEFAULT_CAROUSEL_IMAGES);
  const [uploadToast, setUploadToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load any locally cached custom uploads
  useEffect(() => {
    try {
      const cached = localStorage.getItem('aseing_custom_carousel');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCarouselImages(parsed);
        }
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, carouselImages.length]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const fileArray = Array.from(files);
      const readPromises = fileArray.map((file) => {
        return new Promise<{ filename: string; dataUrl: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              filename: file.name,
              dataUrl: e.target?.result as string
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const loadedImages = await Promise.all(readPromises);

      // Match files to slots or update existing
      const updated = [...carouselImages];
      for (const img of loadedImages) {
        const fname = img.filename.toLowerCase();
        let slotIndex = -1;
        if (fname.includes('sopladora')) slotIndex = 0;
        else if (fname.includes('11.09.19') || fname.includes('extintor')) slotIndex = 1;
        else if (fname.includes('comite') || fname.includes('3.06.22')) slotIndex = 2;
        else if (fname.includes('proceso') || fname.includes('1.34.04') || fname.includes('1.34.05')) slotIndex = 3;

        if (slotIndex !== -1 && updated[slotIndex]) {
          updated[slotIndex] = {
            ...updated[slotIndex],
            src: img.dataUrl
          };
        }
      }

      setCarouselImages(updated);
      try {
        localStorage.setItem('aseing_custom_carousel', JSON.stringify(updated));
      } catch (_) {}

      // Also persist to server
      fetch('/api/carousel/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: loadedImages })
      }).catch(() => {});

      setUploadToast('¡Fotos ajustadas correctamente al contenedor!');
      setTimeout(() => setUploadToast(null), 4000);
    } catch (err) {
      console.error('Error cargando imágenes:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const cycleSteps = [
    {
      title: 'Planificar',
      phase: 'Fase 01',
      desc: 'Diseño de Planes Maestros (MPS), balanceo de estaciones de trabajo y programación de capacidad instalada.',
      color: '#1ea1c2',
      linkedSlide: 2
    },
    {
      title: 'Controlar',
      phase: 'Fase 02',
      desc: 'Cronometraje de tiempos y movimientos, costeo por órdenes de producción y tableros de piso en tiempo real.',
      color: '#3c65cd',
      linkedSlide: 1
    },
    {
      title: 'Certificar',
      phase: 'Fase 03',
      desc: 'Sistemas Integrados de Gestión ISO 9001:2026 (Calidad), ISO 14001:2026 (Ambiente) y ISO 45001 (SST) sin desviaciones.',
      color: '#b80068',
      linkedSlide: 0
    },
    {
      title: 'Mejorar',
      phase: 'Fase 04',
      desc: 'Reducción continua de mermas, digitalización con app propia y auditorías preventivas periódicas.',
      color: '#25d366',
      linkedSlide: 3
    }
  ];

  const handleSelectStep = (idx: number) => {
    setActiveCycleStep(idx);
    const linked = cycleSteps[idx]?.linkedSlide;
    if (typeof linked === 'number' && linked < carouselImages.length) {
      setActiveSlide(linked);
    }
  };

  return (
    <section id="hero-section" className="relative pt-12 pb-20 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#1ea1c2]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#b80068]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tag / Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 [.day-mode_&]:bg-[#1ea1c2]/10 border border-white/10 [.day-mode_&]:border-[#1ea1c2]/30 text-xs font-mono text-[#1ea1c2] [.day-mode_&]:text-[#0b6a82] tracking-wider font-semibold transition-colors shadow-xs">
              <span className="relative flex h-2 w-2 flex-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>ASESORÍA INDUSTRIAL Y GESTIÓN DE NEGOCIOS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              <span className="text-white [.day-mode_&]:text-[#1e0338] hero-contrast-text transition-colors duration-300">
                Controlamos cada{' '}
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1ea1c2] via-[#3c65cd] to-[#b80068]">
                tiempo, costo y proceso
              </span>{' '}
              <span className="text-white [.day-mode_&]:text-[#1e0338] hero-contrast-text transition-colors duration-300">
                de su producción.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#bfa9dc] [.day-mode_&]:text-[#5a4b73] max-w-2xl leading-relaxed transition-colors duration-300">
              ASEING acompaña a industrias y empresas en la planificación y control de la producción, especializados en
              estudios de tiempos y costos industriales, y la implementación integral de <strong>Normas ISO 9001:2026, ISO 14001:2026 & ISO 45001:2018</strong>.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-btn-pricing"
                type="button"
                onClick={onGoToPricing}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-[#b80068] via-[#4e0477] to-[#3a0ca3] hover:opacity-95 shadow-xl shadow-[#b80068]/25 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <span>Cotizar y Contratar en Línea</span>
                <ArrowRight size={16} />
              </button>

              <button
                id="hero-btn-diagnosis"
                type="button"
                onClick={onStartDiagnosis}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full font-semibold text-sm text-[#f3effa] [.day-mode_&]:text-[#1e0338] bg-white/5 [.day-mode_&]:bg-black/5 border border-white/15 [.day-mode_&]:border-black/15 hover:border-[#1ea1c2] hover:bg-[#1ea1c2]/10 transition-all cursor-pointer"
              >
                <Sparkles size={16} className="text-[#1ea1c2]" />
                <span>Diagnóstico Rápido de Planta</span>
              </button>
            </div>

            {/* Numerical Proof Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 [.day-mode_&]:border-black/10">
              <div className="p-3 rounded-xl bg-white/[0.03] [.day-mode_&]:bg-black/[0.03] border border-white/5 [.day-mode_&]:border-black/10">
                <div className="text-2xl lg:text-3xl font-bold font-mono text-white [.day-mode_&]:text-[#1e0338]">5+</div>
                <div className="text-xs text-[#bfa9dc] [.day-mode_&]:text-[#5a4b73]">Industrias asesoradas</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] [.day-mode_&]:bg-black/[0.03] border border-white/5 [.day-mode_&]:border-black/10">
                <div className="text-2xl lg:text-3xl font-bold font-mono text-[#1ea1c2]">38%</div>
                <div className="text-xs text-[#bfa9dc] [.day-mode_&]:text-[#5a4b73]">Reducción media de costos</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] [.day-mode_&]:bg-black/[0.03] border border-white/5 [.day-mode_&]:border-black/10">
                <div className="text-2xl lg:text-3xl font-bold font-mono text-[#b80068]">96%</div>
                <div className="text-xs text-[#bfa9dc] [.day-mode_&]:text-[#5a4b73]">Certificaciones aprobadas</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] [.day-mode_&]:bg-black/[0.03] border border-white/5 [.day-mode_&]:border-black/10">
                <div className="text-2xl lg:text-3xl font-bold font-mono text-white [.day-mode_&]:text-[#1e0338]">14</div>
                <div className="text-xs text-[#bfa9dc] [.day-mode_&]:text-[#5a4b73]">Años de experiencia</div>
              </div>
            </div>
          </div>

          {/* Right Column: Adjusted Carousel & ASEING Improvement Cycle */}
          <div className="lg:col-span-5">
            <div
              id="ciclo-mejora-container"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="relative rounded-3xl p-4 sm:p-6 overflow-hidden border border-white/20 bg-gradient-to-br from-[#1b0833]/90 via-[#120424]/95 to-[#0b0217]/95 shadow-2xl transition-all"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#25d366] animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-wider text-[#1ea1c2] font-bold">
                    // CICLO DE MEJORA ASEING
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Subir o actualizar fotos del carrusel"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-white/80 hover:text-white px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer"
                  >
                    <Camera size={12} className="text-[#1ea1c2]" />
                    <span>Cambiar fotos</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />

                  <span className="text-[11px] text-white font-mono font-medium px-2 py-0.5 rounded bg-white/10">
                    {activeSlide + 1} / {carouselImages.length}
                  </span>
                </div>
              </div>

              {/* Toast Notification */}
              {uploadToast && (
                <div className="mb-3 p-2 rounded-lg bg-[#25d366]/20 border border-[#25d366]/40 text-[#25d366] text-xs font-semibold flex items-center gap-2 animate-fade-in">
                  <Check size={14} />
                  <span>{uploadToast}</span>
                </div>
              )}

              {/* Dedicated Carousel Image Viewport Adjusted to Container Dimensions */}
              <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 border border-white/20 shadow-inner group">
                {carouselImages.map((img, idx) => (
                  <div
                    key={img.src}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    {/* Ambient Blurred Background (Ensures zero blank bars while maintaining aspect ratio) */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={img.src}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Main Foreground Image - Carefully sized to fit container without cropping heads/equipment */}
                    <img
                      src={img.src}
                      alt={img.label}
                      className="relative z-10 w-full h-full object-cover object-center brightness-105 contrast-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Subtle Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                    {/* Top Pill Badges */}
                    <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#1ea1c2] border border-[#1ea1c2]/30 shadow">
                        {img.tag}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white/90 border border-white/20">
                        CASO REAL
                      </span>
                    </div>

                    {/* Bottom Caption */}
                    <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-none">
                      <h3 className="text-sm sm:text-base font-bold text-white drop-shadow-md leading-snug">
                        {img.label}
                      </h3>
                      <p className="text-xs text-white/80 line-clamp-1 drop-shadow-sm mt-0.5">
                        {img.detail}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Floating Navigation Controls */}
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}
                  aria-label="Foto anterior"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer shadow-lg"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % carouselImages.length)}
                  aria-label="Foto siguiente"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer shadow-lg"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Bottom Dot Indicators */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 pointer-events-auto">
                  {carouselImages.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setActiveSlide(dotIdx)}
                      aria-label={`Ir a foto ${dotIdx + 1}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        dotIdx === activeSlide ? 'w-6 bg-[#1ea1c2]' : 'w-2 bg-white/40 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Interactive ASEING Improvement Cycle Stepper (Below Photo, perfectly fitted) */}
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#bfa9dc]">
                  <span className="font-semibold text-white">CICLO PHVA OPERATIVO</span>
                  <span>Seleccione una fase:</span>
                </div>

                {/* 4 Interactive Phase Tabs */}
                <div className="grid grid-cols-4 gap-1.5">
                  {cycleSteps.map((step, sIdx) => {
                    const isSelected = activeCycleStep === sIdx;
                    return (
                      <button
                        key={step.phase}
                        type="button"
                        onClick={() => handleSelectStep(sIdx)}
                        className={`p-2 rounded-xl text-left transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-white/15 border-[#1ea1c2] shadow-md shadow-[#1ea1c2]/10'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                        }`}
                      >
                        <div
                          className="text-[10px] font-mono font-bold"
                          style={{ color: isSelected ? step.color : '#8f77aa' }}
                        >
                          {step.phase}
                        </div>
                        <div className="text-xs font-bold text-white truncate mt-0.5">
                          {step.title}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Active Phase Description Card */}
                <div className="p-3 rounded-xl bg-black/50 border border-white/15 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cycleSteps[activeCycleStep].color }}
                    />
                    <span className="text-xs font-bold text-white">
                      {cycleSteps[activeCycleStep].phase} · {cycleSteps[activeCycleStep].title}
                    </span>
                  </div>
                  <p className="text-xs text-[#d4c6ec] leading-relaxed">
                    {cycleSteps[activeCycleStep].desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

