// src/components/AutomatedBrandLogo.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Check } from 'lucide-react';
import {
  BrandLogoConfig,
  getStoredBrandConfig,
  subscribeToBrandConfig,
  getActiveLogoUrl,
  saveBrandConfig,
  OFFICIAL_PRESETS
} from '../utils/brandLogoStore';

interface AutomatedBrandLogoProps {
  variant?: 'initial-banner' | 'final-footer' | 'hero-badge' | 'compact' | 'standalone';
  isDayMode?: boolean;
  className?: string;
  onOpenManager?: () => void;
  showEditButton?: boolean;
  overrideFormat?: 'square' | 'horizontal' | 'auto';
}

export const AutomatedBrandLogo: React.FC<AutomatedBrandLogoProps> = ({
  variant = 'initial-banner',
  isDayMode = false,
  className = '',
  onOpenManager,
  overrideFormat
}) => {
  const [config, setConfig] = useState<BrandLogoConfig>(getStoredBrandConfig());
  const [imgErrorIndex, setImgErrorIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dragCounter = useRef<number>(0);
  const clickCountRef = useRef<number>(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActiveRef = useRef<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeToBrandConfig((newConfig) => {
      setConfig(newConfig);
      setImgErrorIndex(0); // Reset fallback chain on new config
    });

    // Sync with server persisted configuration on mount
    fetch('/api/brand/logo')
      .then((res) => res.json())
      .then((serverConfig) => {
        if (serverConfig && serverConfig.activePreset) {
          setConfig((prev) => ({ ...prev, ...serverConfig }));
        }
      })
      .catch(() => {});

    return unsubscribe;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor suba una imagen válida (PNG, SVG, JPG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        saveBrandConfig({
          activePreset: 'custom',
          customUrl: dataUrl,
          format: 'auto'
        });
        showToast('✓ Logotipo corporativo actualizado y sincronizado');
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers (desktop discreet upload)
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Header Banner Click Handlers:
  // - Single click: smooth scroll to top
  // - Alt+Click / Ctrl+Click / Meta+Click: open logo manager modal
  // - Triple click: open logo manager modal
  const handleBannerClick = (e: React.MouseEvent) => {
    if (isLongPressActiveRef.current) {
      isLongPressActiveRef.current = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Alt+Click, Ctrl+Click or Cmd+Click: Secret manager trigger
    if (e.altKey || e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      clickCountRef.current = 0;
      onOpenManager?.();
      return;
    }

    // Triple-click: Secret manager trigger
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 3 || e.detail >= 3) {
      clickCountRef.current = 0;
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      e.preventDefault();
      e.stopPropagation();
      onOpenManager?.();
      return;
    }

    // Single click: smooth scroll navigation to top
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 280);
  };

  // Mobile Touch Handlers: 2-second Long-Press to open logo manager
  const handleTouchStart = () => {
    isLongPressActiveRef.current = false;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(60);
        } catch (_) {}
      }
      onOpenManager?.();
    }, 2000);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Footer click: purely smooth scroll to top
  const handleFooterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const activeFormat = overrideFormat || config.format;
  const isHorizontalFormat =
    (activeFormat === 'horizontal' ||
      (activeFormat === 'auto' && config.activePreset === 'horizontal')) &&
    config.activePreset !== 'isotipo';

  // Build fallback cascade - Always ensuring "Logo sin letras" is validated and linked
  const primaryUrl = getActiveLogoUrl(config, variant === 'initial-banner' ? 'initial-banner' : 'final-footer');
  const candidateUrls: string[] = [primaryUrl];

  if (isHorizontalFormat) {
    candidateUrls.push(
      OFFICIAL_PRESETS.horizontal.url,
      ...OFFICIAL_PRESETS.horizontal.fallbackUrls,
      '/Logo con letras.jpg',
      '/logo-con-letras.jpg',
      '/Logo sin letras.jpg',
      '/logo-sin-letras.jpg'
    );
  } else {
    candidateUrls.push(
      '/Logo sin letras.jpg',
      '/logo-sin-letras.jpg',
      '/Logo%20sin%20letras.jpg',
      OFFICIAL_PRESETS.isotipo.url,
      ...OFFICIAL_PRESETS.isotipo.fallbackUrls,
      OFFICIAL_PRESETS.cuadrado.url,
      '/solo-logo-sin-letras.png',
      '/Logo con letras.jpg'
    );
  }

  // Deduplicate candidates and filter out empty strings
  const uniqueCandidates = Array.from(new Set(candidateUrls.filter(Boolean)));
  const currentSrc =
    uniqueCandidates[Math.min(imgErrorIndex, uniqueCandidates.length - 1)] || '/Logo sin letras.jpg';

  const handleImageError = () => {
    if (imgErrorIndex < uniqueCandidates.length - 1) {
      setImgErrorIndex((prev) => prev + 1);
    }
  };

  // 1. HERO BADGE VARIANT
  if (variant === 'hero-badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shrink-0 ${
          isDayMode
            ? 'bg-white/90 border-[#1ea1c2]/30 shadow-sm'
            : 'bg-black/40 border-white/15 backdrop-blur-md'
        } ${className}`}
        title="ASEING · Logotipo Corporativo"
      >
        <div className="w-5 h-5 rounded-md overflow-hidden bg-white p-0.5 shadow-xs flex-none flex items-center justify-center shrink-0">
          <img
            src={currentSrc}
            alt="ASEING"
            onError={handleImageError}
            className="w-full h-full object-contain shrink-0"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-xs font-mono font-bold tracking-wider text-[#1ea1c2] shrink-0">
          ASEING
        </span>
      </div>
    );
  }

  // 2. INITIAL BANNER VARIANT (Header / Top Banner)
  if (variant === 'initial-banner') {
    return (
      <div
        className={`relative group inline-flex items-center gap-2 sm:gap-3 select-none cursor-pointer shrink-0 min-w-0 z-20 ${className}`}
        onClick={handleBannerClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        title="ASEING · Clic para ir al inicio | Alt+Clic o triple clic para gestionar logos"
      >
        {/* Drag & Drop Highlight Overlay (appears only when dragging an image file over the logo) */}
        {isDragging && (
          <div className="absolute -inset-2 z-50 rounded-2xl border-2 border-dashed border-[#1ea1c2] bg-[#120325]/95 backdrop-blur-md flex items-center justify-center gap-2 px-3 py-1 animate-pulse shadow-lg shadow-[#1ea1c2]/40 pointer-events-none">
            <Upload size={16} className="text-[#1ea1c2] animate-bounce shrink-0" />
            <span className="text-xs font-bold text-white font-mono tracking-tight whitespace-nowrap">
              Soltar para actualizar logo
            </span>
          </div>
        )}

        {/* Horizontal banner layout */}
        {isHorizontalFormat ? (
          <div className="relative shrink-0 flex items-center">
            <div
              className={`p-1 sm:p-1.5 rounded-xl transition-all duration-300 flex items-center justify-center shrink-0 ${
                isDayMode
                  ? 'bg-white border border-purple-950/10 shadow-sm'
                  : 'bg-white/95 border border-white/20 shadow-lg shadow-[#1ea1c2]/10'
              } ${config.glowEffect ? 'group-hover:shadow-[#1ea1c2]/30' : ''}`}
            >
              <img
                src={currentSrc}
                alt="ASEING Asesoría Industrial y Gestión de Negocios"
                onError={handleImageError}
                className="h-8 sm:h-11 w-auto max-w-[130px] xs:max-w-[170px] sm:max-w-[210px] object-contain shrink-0 rounded-md transition-transform duration-300 group-hover:scale-[1.02]"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
                referrerPolicy="no-referrer"
              />
            </div>

            {config.glowEffect && (
              <div className="absolute -inset-1 bg-gradient-to-r from-[#1ea1c2]/20 via-[#3c65cd]/15 to-[#b80068]/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />
            )}
          </div>
        ) : (
          /* Standard Square Emblem + High-Contrast Brand Typography */
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <div className="relative shrink-0 flex items-center justify-center">
              <div
                className={`p-1 rounded-xl transition-all duration-300 flex items-center justify-center shrink-0 ${
                  isDayMode
                    ? 'bg-white shadow-md border border-purple-950/10'
                    : 'bg-white shadow-lg border border-white/20 shadow-[#1ea1c2]/15'
                } group-hover:scale-105`}
              >
                <img
                  src={currentSrc}
                  alt="ASEING Logo"
                  onError={handleImageError}
                  className="h-8 w-8 xs:h-9 xs:w-9 sm:h-11 sm:w-11 object-contain shrink-0 rounded-lg"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                  referrerPolicy="no-referrer"
                />
              </div>

              {config.glowEffect && (
                <div className="absolute -inset-1 bg-gradient-to-r from-[#1ea1c2]/30 to-[#b80068]/30 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />
              )}
            </div>

            <div className="flex flex-col leading-none shrink-0">
              <div className="flex items-center">
                <span className="text-xl sm:text-2xl font-black tracking-tight font-sans whitespace-nowrap">
                  <span className={`${isDayMode ? 'text-[#1e0338]' : 'text-white'} transition-colors`}>
                    ASE
                  </span>
                  <span style={{ color: '#007BFF' }}>ING</span>
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-mono tracking-wider font-semibold text-[#1ea1c2] mt-0.5 hidden xs:inline-block whitespace-nowrap">
                INGENIERÍA & GESTIÓN
              </span>
            </div>
          </div>
        )}

        {/* Real-time Feedback Toast (shown temporarily when a logo is updated) */}
        {toastMessage && (
          <div className="absolute top-full mt-2 left-0 z-50 px-3 py-1.5 rounded-lg bg-[#120325]/95 border border-[#1ea1c2] text-white text-xs font-medium shadow-xl backdrop-blur-md flex items-center gap-2 whitespace-nowrap animate-in fade-in slide-in-from-top-1 pointer-events-none">
            <Check size={14} className="text-emerald-400 flex-none" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // 3. FINAL FOOTER VARIANT (Pie de página / Logo Final)
  if (variant === 'final-footer') {
    return (
      <div
        className={`relative group inline-flex flex-col gap-2 select-none cursor-pointer shrink-0 min-w-0 ${className}`}
        onClick={handleFooterClick}
        title="ASEING · Clic para deslizar hacia el inicio de la página"
      >
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isHorizontalFormat ? (
            <div className="relative shrink-0">
              <div className="p-1 sm:p-1.5 rounded-xl bg-white shadow-md border border-white/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-[1.02]">
                <img
                  src={currentSrc}
                  alt="ASEING Asesoría Industrial y Gestión de Negocios"
                  onError={handleImageError}
                  className="h-8 sm:h-9 w-auto max-w-[160px] sm:max-w-[190px] object-contain shrink-0 rounded-md"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                  referrerPolicy="no-referrer"
                />
              </div>
              {config.glowEffect && (
                <div className="absolute -inset-1 bg-gradient-to-r from-[#1ea1c2]/20 to-[#b80068]/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="relative shrink-0">
                <div className="bg-white p-1 rounded-xl shadow-md border border-white/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                  <img
                    src={currentSrc}
                    alt="ASEING"
                    onError={handleImageError}
                    className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0 rounded-lg"
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                    referrerPolicy="no-referrer"
                  />
                </div>
                {config.glowEffect && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#1ea1c2]/30 to-[#b80068]/30 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />
                )}
              </div>

              <div className="flex flex-col leading-none shrink-0">
                <span className="text-xl font-black tracking-tight font-sans whitespace-nowrap">
                  <span className="text-white">ASE</span>
                  <span style={{ color: '#007BFF' }}>ING</span>
                </span>
                <span className="text-[9px] font-mono tracking-wider font-semibold text-[#1ea1c2] mt-0.5 whitespace-nowrap">
                  CONSULTORÍA INDUSTRIAL
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default compact or standalone
  return (
    <div
      className={`flex items-center gap-2 cursor-pointer shrink-0 ${className}`}
      onClick={handleFooterClick}
      title="ASEING · Clic para deslizar al inicio de página"
    >
      <div className="bg-white p-1 rounded-lg shadow-sm flex items-center justify-center shrink-0">
        <img
          src={currentSrc}
          alt="ASEING"
          onError={handleImageError}
          className="h-8 w-8 object-contain shrink-0 rounded"
          referrerPolicy="no-referrer"
        />
      </div>
      <span className="text-sm font-bold font-sans shrink-0 whitespace-nowrap">
        <span className="text-white">ASE</span>
        <span style={{ color: '#007BFF' }}>ING</span>
      </span>
    </div>
  );
};
