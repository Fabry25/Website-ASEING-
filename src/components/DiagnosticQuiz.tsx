import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, DollarSign } from 'lucide-react';
import { DiagnosticResult } from '../types';

interface DiagnosticQuizProps {
  onSelectRecommendedService: (serviceId: string) => void;
}

export const DiagnosticQuiz: React.FC<DiagnosticQuizProps> = ({ onSelectRecommendedService }) => {
  const [step, setStep] = useState<number>(0);
  const [sector, setSector] = useState<string>('manufactura');
  const [tiempos, setTiempos] = useState<string>('nulo');
  const [iso, setIso] = useState<string>('ninguno');
  const [sst, setSst] = useState<string>('incompleto');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/diagnostic/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industrySector: sector,
          controlTiempos: tiempos,
          estadoIso: iso,
          sstStatus: sst
        })
      });

      const data = await response.json();
      if (data.success && data.result) {
        setResult(data.result);
      }
    } catch (err) {
      // Fallback calculation in case of network interruption
      setResult({
        score: 45,
        level: 'Basico',
        summary: 'Su operación cuenta con potencial de ahorro inmediato del 20% mediante estandarización de tiempos y control de mermas.',
        strengths: ['Intención de mejora continua y control de procesos'],
        vulnerabilities: ['Falta de costeo estándar por orden de producción', 'Riesgo de multas por matrices de riesgo no actualizadas'],
        recommendedServices: ['diagnostico-inicial', 'tiempos-movimientos'],
        estimatedSavingsPotential: '20% - 30% en costos de fabricación'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setStep(0);
  };

  return (
    <section id="diagnostico" className="py-20 bg-[#140529] relative border-y border-white/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1ea1c2]/10 border border-[#1ea1c2]/30 text-xs font-mono text-[#1ea1c2] mb-3">
            <Sparkles size={14} />
            <span>EVALUADOR AUTOMATIZADO DE PLANTA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Diagnóstico Rápido de Eficiencia y Normas ISO
          </h2>
          <p className="text-sm sm:text-base text-[#bfa9dc] mt-2">
            Responda 4 preguntas operativas para obtener una estimación de pérdidas por tiempos muertos y el plan de acción recomendado por nuestros ingenieros.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#1d0a3a] border border-white/15 shadow-2xl">
          {!result ? (
            <div className="space-y-6">
              {/* Question 1: Sector */}
              {step === 0 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#1ea1c2]">
                    Paso 1 de 4 · Perfil Industrial
                  </span>
                  <h3 className="text-lg font-semibold text-white">
                    ¿Cuál es el sector productivo principal de su empresa?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      { id: 'manufactura', label: 'Manufactura, Textil o Calzado' },
                      { id: 'alimentos', label: 'Alimentos, Agroindustria o Bebidas' },
                      { id: 'metalmecanica', label: 'Metalmecánica o Construcción' },
                      { id: 'quimico', label: 'Química, Plásticos o Farmacéutica' },
                      { id: 'servicios', label: 'Logística, Bodegas o Servicios Técnicos' },
                      { id: 'otro', label: 'Otro sector productivo o comercial' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSector(opt.id);
                          setStep(1);
                        }}
                        className={`p-4 rounded-xl text-left text-sm font-medium border transition-all ${
                          sector === opt.id
                            ? 'bg-[#1ea1c2]/20 border-[#1ea1c2] text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-[#f3effa] hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 2: Tiempos y Costos */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#1ea1c2]">
                    Paso 2 de 4 · Control de Tiempos y Costos
                  </span>
                  <h3 className="text-lg font-semibold text-white">
                    ¿Cómo miden actualmente los tiempos de ciclo y el costo real por orden?
                  </h3>
                  <div className="space-y-3 pt-2">
                    {[
                      {
                        id: 'nulo',
                        title: 'No tenemos cronometraje formal ni costeo exacto',
                        sub: 'Calculamos precios por intuición o referencia del mercado; hay atrasos frecuentes de despacho.'
                      },
                      {
                        id: 'parcial',
                        title: 'Registros parciales en hojas de cálculo (Excel)',
                        sub: 'Medimos algunos puestos pero sin suplementos por fatiga ni prorrateo de CIF automatizado.'
                      },
                      {
                        id: 'avanzado',
                        title: 'Sistema estandarizado con tiempos estándar y ERP',
                        sub: 'Conocemos el OEE y el margen unitario con desviaciones mínimas de planta.'
                      }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setTiempos(opt.id);
                          setStep(2);
                        }}
                        className={`w-full p-4 rounded-xl text-left border transition-all ${
                          tiempos === opt.id
                            ? 'bg-[#1ea1c2]/20 border-[#1ea1c2] text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-[#f3effa] hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="text-sm font-semibold">{opt.title}</div>
                        <div className="text-xs text-[#bfa9dc] mt-1">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-xs text-[#bfa9dc] hover:text-white mt-2"
                  >
                    ← Volver al paso anterior
                  </button>
                </div>
              )}

              {/* Question 3: Normas ISO */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#1ea1c2]">
                    Paso 3 de 4 · Estandarización y Certificaciones ISO
                  </span>
                  <h3 className="text-lg font-semibold text-white">
                    ¿Cuál es el estado actual de las certificaciones ISO en su empresa?
                  </h3>
                  <div className="space-y-3 pt-2">
                    {[
                      {
                        id: 'ninguno',
                        title: 'No contamos con certificaciones ISO vigentes',
                        sub: 'Deseamos calificar como proveedores de empresas grandes o licitar con el Estado.'
                      },
                      {
                        id: 'en_proceso',
                        title: 'En proceso de implementación o con manuales desactualizados',
                        sub: 'Tenemos documentación dispersa que no se aplica en el día a día de planta.'
                      },
                      {
                        id: 'certificado',
                        title: 'Ya estamos certificados (ISO 9001:2026 / ISO 14001:2026 / ISO 45001)',
                        sub: 'Requerimos auditoría interna rigurosa y acompañamiento para la transición o recertificación.'
                      }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setIso(opt.id);
                          setStep(3);
                        }}
                        className={`w-full p-4 rounded-xl text-left border transition-all ${
                          iso === opt.id
                            ? 'bg-[#1ea1c2]/20 border-[#1ea1c2] text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-[#f3effa] hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="text-sm font-semibold">{opt.title}</div>
                        <div className="text-xs text-[#bfa9dc] mt-1">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[#bfa9dc] hover:text-white mt-2"
                  >
                    ← Volver al paso anterior
                  </button>
                </div>
              )}

              {/* Question 4: SST y Prevención */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#1ea1c2]">
                    Paso 4 de 4 · Seguridad y Salud en el Trabajo
                  </span>
                  <h3 className="text-lg font-semibold text-white">
                    ¿Disponen de matrices IPERC y reglamento de higiene y seguridad al día?
                  </h3>
                  <div className="space-y-3 pt-2">
                    {[
                      {
                        id: 'incompleto',
                        title: 'Documentación desactualizada o sin matrices de riesgo aprobadas',
                        sub: 'Preocupación por inspecciones laborales del Ministerio del Trabajo o del IESS.'
                      },
                      {
                        id: 'cumple',
                        title: 'Reglamento vigente y comités paritarios conformados',
                        sub: 'Buscamos dar el salto al estándar internacional ISO 45001:2018.'
                      }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSst(opt.id)}
                        className={`w-full p-4 rounded-xl text-left border transition-all ${
                          sst === opt.id
                            ? 'bg-[#1ea1c2]/20 border-[#1ea1c2] text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-[#f3effa] hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="text-sm font-semibold">{opt.title}</div>
                        <div className="text-xs text-[#bfa9dc] mt-1">{opt.sub}</div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs text-[#bfa9dc] hover:text-white"
                    >
                      ← Volver al paso anterior
                    </button>

                    <button
                      id="btn-evaluate-diagnosis"
                      type="button"
                      disabled={loading}
                      onClick={handleSubmit}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#1ea1c2] via-[#3c65cd] to-[#b80068] shadow-lg shadow-[#1ea1c2]/20 hover:opacity-95 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Calculando diagnóstico...</span>
                      ) : (
                        <>
                          <span>Generar Resultado Inmediato</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Results Presentation */
            <div className="space-y-6 animate-in zoom-in-95 duration-400">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#1ea1c2]">
                    RESULTADO DEL DIAGNÓSTICO OPERACIONAL
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    Nivel de Eficiencia:{' '}
                    <span
                      className={
                        result.level === 'Critico'
                          ? 'text-[#b80068]'
                          : result.level === 'Basico'
                          ? 'text-amber-400'
                          : result.level === 'Intermedio'
                          ? 'text-[#1ea1c2]'
                          : 'text-[#25d366]'
                      }
                    >
                      {result.level.toUpperCase()} ({result.score}/100)
                    </span>
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#bfa9dc] hover:text-white"
                >
                  <RotateCcw size={13} />
                  <span>Repetir prueba</span>
                </button>
              </div>

              {/* Score Bar */}
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-[#b80068] via-[#3c65cd] to-[#1ea1c2]"
                  style={{ width: `${result.score}%` }}
                />
              </div>

              {/* Summary Description */}
              <p className="text-sm text-[#f3effa] bg-white/[0.03] p-4 rounded-xl border border-white/5 leading-relaxed">
                {result.summary}
              </p>

              {/* Savings Potential Highlight */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#1ea1c2]/10 to-[#b80068]/10 border border-[#1ea1c2]/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1ea1c2]/20 flex items-center justify-center text-[#1ea1c2] flex-none">
                  <DollarSign size={20} />
                </div>
                <div>
                  <div className="text-xs text-[#bfa9dc] uppercase font-mono">Potencial Estimado de Recuperación:</div>
                  <div className="text-sm font-bold text-white">{result.estimatedSavingsPotential}</div>
                </div>
              </div>

              {/* Strengths & Vulnerabilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-xs font-bold text-[#25d366] mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>FORTALEZAS OBSERVADAS:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#bfa9dc]">
                    {result.strengths.map((s, idx) => (
                      <li key={idx}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-xs font-bold text-[#b80068] mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    <span>PUNTOS CRÍTICOS A CORREGIR:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#bfa9dc]">
                    {result.vulnerabilities.map((v, idx) => (
                      <li key={idx}>• {v}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Payment Condition notice */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs">
                <Sparkles size={16} className="text-emerald-400 mt-0.5 flex-none" />
                <div className="text-emerald-100/90 text-[11px] leading-relaxed">
                  <strong className="text-emerald-400 font-mono">Condición Especial ASEING: </strong>
                  Si contrata los servicios de cualquier ítem especificado y seleccionado en el catálogo oficial, no se cobrará el valor de Diagnóstico inicial de Procesos Productivos (100% bonificado).
                </div>
              </div>

              {/* Call to action: add recommended services to checkout */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-[#bfa9dc]">
                  Hemos pre-seleccionado los servicios recomendados para su empresa:
                </div>
                <button
                  id="btn-apply-recommended-service"
                  type="button"
                  onClick={() => {
                    const firstRecommended = result.recommendedServices[0] || 'diagnostico-inicial';
                    onSelectRecommendedService(firstRecommended);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#b80068] to-[#3a0ca3] hover:opacity-95 shadow-lg shadow-[#b80068]/20"
                >
                  <span>Cargar Servicios Recomendados en Cotizador</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
