// src/components/LogoManagerModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Check,
  RotateCcw,
  Sliders,
  Image as ImageIcon,
  CheckCircle2,
  Layers
} from 'lucide-react';
import {
  BrandLogoConfig,
  getStoredBrandConfig,
  saveBrandConfig,
  DEFAULT_BRAND_CONFIG,
  OFFICIAL_PRESETS,
  getActiveLogoUrl
} from '../utils/brandLogoStore';

interface LogoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDayMode?: boolean;
}

export const LogoManagerModal: React.FC<LogoManagerModalProps> = ({
  isOpen,
  onClose,
  isDayMode = false
}) => {
  const [config, setConfig] = useState<BrandLogoConfig>(getStoredBrandConfig());
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'automation'>('presets');
  const [previewDayMode, setPreviewDayMode] = useState<boolean>(isDayMode);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredBrandConfig());
      setPreviewDayMode(isDayMode);
    }
  }, [isOpen, isDayMode]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectPreset = (presetKey: 'cuadrado' | 'horizontal' | 'isotipo') => {
    const updated: Partial<BrandLogoConfig> = {
      activePreset: presetKey,
      customUrl: null,
      format: presetKey === 'horizontal' ? 'horizontal' : 'auto'
    };
    const saved = saveBrandConfig(updated);
    setConfig(saved);
    showToast(`✓ Logotipo configurado como: ${OFFICIAL_PRESETS[presetKey].title}`);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      showToast('Por favor seleccione un archivo de imagen válido (PNG, JPG, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        const updated = saveBrandConfig({
          activePreset: 'custom',
          customUrl: dataUrl
        });
        setConfig(updated);
        showToast('✓ Logotipo personalizado cargado y sincronizado automáticamente.');

        // Also persist to backend server
        fetch('/api/brand/logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updated,
            customUrl: dataUrl,
            filename: file.name
          })
        }).catch(() => {});
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormatChange = (format: 'auto' | 'square' | 'horizontal') => {
    const updated = saveBrandConfig({ format });
    setConfig(updated);
    showToast(`Formato de visualización ajustado a: ${format.toUpperCase()}`);
  };

  const handleToggleGlow = () => {
    const updated = saveBrandConfig({ glowEffect: !config.glowEffect });
    setConfig(updated);
  };

  const handleReset = () => {
    const reset = saveBrandConfig(DEFAULT_BRAND_CONFIG);
    setConfig(reset);
    showToast('✓ Restaurado al logotipo oficial predeterminado de ASEING.');
  };

  const activeUrl = getActiveLogoUrl(config);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#120424] border border-white/20 shadow-2xl text-white overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-[#1c0836] via-[#150529] to-[#0c0218]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1ea1c2] to-[#b80068] p-0.5 shadow flex items-center justify-center">
              <div className="w-full h-full bg-[#120424] rounded-[10px] flex items-center justify-center">
                <Sliders size={18} className="text-[#1ea1c2]" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>Automatización de Logotipos Corporativos</span>
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-[#1ea1c2]/20 text-[#1ea1c2] border border-[#1ea1c2]/30">
                  Banner Inicial & Final
                </span>
              </h3>
              <p className="text-xs text-[#bfa9dc]">
                Sincronice la identidad visual de la cabecera superior y del pie de página en tiempo real.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-[#bfa9dc] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="px-6 py-2 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check size={14} className="text-emerald-400 flex-none" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-gradient-to-r from-[#1ea1c2] to-[#3c65cd] text-white font-bold shadow-md'
                  : 'text-[#bfa9dc] hover:text-white'
              }`}
            >
              <ImageIcon size={14} />
              <span>Variantes Oficiales</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-[#b80068] to-[#4e0477] text-white font-bold shadow-md'
                  : 'text-[#bfa9dc] hover:text-white'
              }`}
            >
              <Upload size={14} />
              <span>Cargar Personalizado</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('automation')}
              className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'automation'
                  ? 'bg-gradient-to-r from-[#1ea1c2] to-[#b80068] text-white font-bold shadow-md'
                  : 'text-[#bfa9dc] hover:text-white'
              }`}
            >
              <Layers size={14} />
              <span>Reglas de Automatización</span>
            </button>
          </div>

          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="text-xs text-[#bfa9dc]">
                Seleccione el formato oficial registrado para que se aplique automáticamente tanto en el <strong>banner inicial (cabecera)</strong> como en el <strong>logo final (pie de página)</strong>:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Option 1: Isotipo Sin Letras (Default y Validado) */}
                <div
                  onClick={() => handleSelectPreset('isotipo')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    config.activePreset === 'isotipo'
                      ? 'bg-[#1ea1c2]/10 border-[#1ea1c2] shadow-lg shadow-[#1ea1c2]/10 ring-1 ring-[#1ea1c2]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#1ea1c2]">1:1 SIN LETRAS (RECOMENDADO)</span>
                      {config.activePreset === 'isotipo' && (
                        <CheckCircle2 size={16} className="text-[#1ea1c2]" />
                      )}
                    </div>
                    <div className="h-24 bg-white rounded-lg p-2 flex items-center justify-center shadow-inner">
                      <img
                        src={OFFICIAL_PRESETS.isotipo.url}
                        alt="Logo sin letras oficial ASEING"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/logo-sin-letras.jpg';
                        }}
                        className="h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Logo Sin Letras</div>
                      <p className="text-[11px] text-[#bfa9dc] leading-relaxed mt-1">
                        Emblema gráfico maestro "Logo sin letras", con tipografía de ingeniería sincronizada en el banner.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-mono text-[#1ea1c2]">
                    {config.activePreset === 'isotipo' ? '● Activo en banner y pie' : 'Hacer clic para activar'}
                  </div>
                </div>

                {/* Option 2: Horizontal */}
                <div
                  onClick={() => handleSelectPreset('horizontal')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    config.activePreset === 'horizontal'
                      ? 'bg-[#1ea1c2]/10 border-[#1ea1c2] shadow-lg shadow-[#1ea1c2]/10 ring-1 ring-[#1ea1c2]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#1ea1c2]">3:1 BANNER CON LETRAS</span>
                      {config.activePreset === 'horizontal' && (
                        <CheckCircle2 size={16} className="text-[#1ea1c2]" />
                      )}
                    </div>
                    <div className="h-24 bg-white rounded-lg p-2 flex items-center justify-center shadow-inner">
                      <img
                        src={OFFICIAL_PRESETS.horizontal.url}
                        alt="Logotipo Horizontal con letras"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/logo-con-letras.jpg';
                        }}
                        className="h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Logotipo Con Letras</div>
                      <p className="text-[11px] text-[#bfa9dc] leading-relaxed mt-1">
                        Formato apaisado con tipografía integrada en la misma imagen.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-mono text-[#1ea1c2]">
                    {config.activePreset === 'horizontal' ? '● Activo en toda la app' : 'Hacer clic para activar'}
                  </div>
                </div>

                {/* Option 3: Cuadrado */}
                <div
                  onClick={() => handleSelectPreset('cuadrado')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    config.activePreset === 'cuadrado'
                      ? 'bg-[#1ea1c2]/10 border-[#1ea1c2] shadow-lg shadow-[#1ea1c2]/10 ring-1 ring-[#1ea1c2]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#1ea1c2]">1:1 CUADRADO</span>
                      {config.activePreset === 'cuadrado' && (
                        <CheckCircle2 size={16} className="text-[#1ea1c2]" />
                      )}
                    </div>
                    <div className="h-24 bg-white rounded-lg p-2 flex items-center justify-center shadow-inner">
                      <img
                        src={OFFICIAL_PRESETS.cuadrado.url}
                        alt="Logotipo Cuadrado"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/Logo sin letras.jpg';
                        }}
                        className="h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Emblema ASEING</div>
                      <p className="text-[11px] text-[#bfa9dc] leading-relaxed mt-1">
                        Formato simétrico corporativo de alta resolución.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-mono text-[#1ea1c2]">
                    {config.activePreset === 'cuadrado' ? '● Activo en toda la app' : 'Hacer clic para activar'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="text-xs text-[#bfa9dc]">
                Suba un logotipo nuevo o actualizado para su empresa. Se guardará de inmediato y actualizará tanto el <strong>banner inicial</strong> como el <strong>logo final</strong>:
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files);
                }}
                className="border-2 border-dashed border-white/20 hover:border-[#1ea1c2] rounded-2xl p-8 text-center bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />

                <div className="w-12 h-12 mx-auto rounded-full bg-[#1ea1c2]/20 text-[#1ea1c2] flex items-center justify-center">
                  <Upload size={22} />
                </div>

                <div>
                  <div className="text-sm font-semibold text-white">
                    Arrastre su imagen aquí o haga clic para examinar
                  </div>
                  <div className="text-xs text-[#bfa9dc] mt-1">
                    Formatos recomendados: PNG transparente, SVG o JPG de alta resolución (mínimo 500x500 px)
                  </div>
                </div>
              </div>

              {config.customUrl && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center">
                      <img
                        src={config.customUrl}
                        alt="Logotipo personalizado"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Logotipo Personalizado Activo</div>
                      <div className="text-[10px] text-emerald-400 font-mono">Sincronizado en Banner Inicial y Logo Final</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono text-[#bfa9dc] hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
                  >
                    Quitar y volver a oficial
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUTOMATION RULES */}
          {activeTab === 'automation' && (
            <div className="space-y-4">
              <div className="text-xs text-[#bfa9dc]">
                Configuraciones y directivas de comportamiento para los contenedores de marca:
              </div>

              <div className="space-y-3">
                {/* Mode Selector */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <label className="text-xs font-bold text-white block">
                    Modo de Estructura de Logo
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'auto', label: 'Automático', desc: 'Adapta por resolución' },
                      { id: 'square', label: 'Siempre Cuadrado', desc: 'Icono + Texto ASEING' },
                      { id: 'horizontal', label: 'Banner Horizontal', desc: 'Logotipo apaisado 3:1' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleFormatChange(m.id as any)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          config.format === m.id
                            ? 'bg-[#1ea1c2]/20 border-[#1ea1c2] text-white'
                            : 'bg-black/20 border-white/10 text-[#bfa9dc] hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{m.label}</div>
                        <div className="text-[10px] opacity-75">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#1ea1c2]" />
                      <span>Resplandor Corporativo (Glow LED)</span>
                    </div>
                    <div className="text-[11px] text-[#bfa9dc] mt-0.5">
                      Añade un halo luminiscente elegante al pasar el cursor sobre el logo.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleGlow}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      config.glowEffect ? 'bg-[#1ea1c2]' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform transform ${
                        config.glowEffect ? 'translate-x-7' : 'translate-x-1'
                      } top-1 absolute`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SIMULTANEOUS DUAL LIVE PREVIEWS */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#1ea1c2] uppercase tracking-wider">
                // PREVISUALIZACIÓN EN TIEMPO REAL
              </span>
              <button
                type="button"
                onClick={() => setPreviewDayMode((prev) => !prev)}
                className="text-[11px] font-mono text-[#bfa9dc] hover:text-white px-2.5 py-1 rounded bg-white/10 border border-white/10 cursor-pointer"
              >
                Alternar Fondo: {previewDayMode ? 'Modo Día (Blanco)' : 'Modo Noche (Oscuro)'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preview 1: Banner Inicial */}
              <div className="rounded-xl border border-white/15 overflow-hidden">
                <div className="bg-black/50 px-3 py-1.5 border-b border-white/10 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-white font-semibold">1. Banner Inicial (Cabecera)</span>
                  <span className="text-[#1ea1c2]">sticky top-0</span>
                </div>
                <div
                  className={`p-4 flex items-center justify-start transition-colors ${
                    previewDayMode ? 'bg-white' : 'bg-[#0f041d]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-xl shadow-md border border-purple-950/10 flex items-center justify-center">
                      <img
                        src={activeUrl}
                        alt="Preview Banner Inicial"
                        className="h-10 w-auto max-w-[140px] object-contain"
                      />
                    </div>
                    {config.format !== 'horizontal' && (
                      <div className="leading-none">
                        <span className="text-xl font-black font-sans">
                          <span className={previewDayMode ? 'text-[#1e0338]' : 'text-white'}>ASE</span>
                          <span style={{ color: '#007BFF' }}>ING</span>
                        </span>
                        <div className="text-[9px] font-mono font-semibold text-[#1ea1c2] mt-0.5">
                          INGENIERÍA & GESTIÓN
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview 2: Logo Final */}
              <div className="rounded-xl border border-white/15 overflow-hidden">
                <div className="bg-black/50 px-3 py-1.5 border-b border-white/10 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-white font-semibold">2. Logo Final (Pie de Página)</span>
                  <span className="text-purple-300">footer</span>
                </div>
                <div className="p-4 flex items-center justify-start bg-[#0b0217]">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-xl shadow-md border border-white/20 flex items-center justify-center">
                      <img
                        src={activeUrl}
                        alt="Preview Logo Final"
                        className="h-10 w-auto max-w-[140px] object-contain"
                      />
                    </div>
                    {config.format !== 'horizontal' && (
                      <div className="leading-none">
                        <span className="text-xl font-black font-sans">
                          <span className="text-white">ASE</span>
                          <span style={{ color: '#007BFF' }}>ING</span>
                        </span>
                        <div className="text-[9px] font-mono font-semibold text-[#1ea1c2] mt-0.5">
                          CONSULTORÍA INDUSTRIAL
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/40">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#bfa9dc] hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Restablecer a Original</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#1ea1c2] to-[#3c65cd] hover:opacity-90 shadow-lg shadow-[#1ea1c2]/20 transition-all cursor-pointer"
          >
            Listo / Aplicado
          </button>
        </div>
      </div>
    </div>
  );
};
