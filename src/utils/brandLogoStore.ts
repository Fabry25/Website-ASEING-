// src/utils/brandLogoStore.ts
// Centralized automated brand logo management for initial banner and final footer

export interface BrandLogoConfig {
  activePreset: 'cuadrado' | 'horizontal' | 'isotipo' | 'custom';
  customUrl?: string | null;
  format: 'auto' | 'square' | 'horizontal';
  glowEffect: boolean;
  bannerInitialSize: 'sm' | 'md' | 'lg';
  finalLogoSize: 'sm' | 'md' | 'lg';
  updatedAt: string;
}

export const OFFICIAL_PRESETS = {
  isotipo: {
    id: 'isotipo' as const,
    title: 'Isotipo Oficial Sin Letras (1:1)',
    description: 'Símbolo gráfico exclusivo "Logo sin letras" de ASEING. Optimizado para el banner principal.',
    url: '/Logo sin letras.jpg',
    fallbackUrls: [
      '/logo-sin-letras.jpg',
      '/Logo%20sin%20letras.jpg',
      '/solo-logo-sin-letras.png',
      '/Logo aseing cuadrado 7.png',
      '/LOGO ASEING 3.jpg'
    ]
  },
  cuadrado: {
    id: 'cuadrado' as const,
    title: 'Logotipo Cuadrado Oficial (1:1)',
    description: 'Emblema maestro "Logo sin letras" con tipografía de ingeniería sincronizada.',
    url: '/Logo sin letras.jpg',
    fallbackUrls: [
      '/logo-sin-letras.jpg',
      '/Logo%20sin%20letras.jpg',
      '/LOGO ASEING 3.jpg',
      '/Logo con letras.jpg'
    ]
  },
  horizontal: {
    id: 'horizontal' as const,
    title: 'Logotipo Horizontal Banner (3:1)',
    description: 'Formato apaisado de alta definición con tipografía integrada en imagen.',
    url: '/Logo con letras.jpg',
    fallbackUrls: [
      '/logo-con-letras.jpg',
      '/Logo%20con%20letras.jpg',
      '/Logo sin letras.jpg',
      '/logo-sin-letras.jpg'
    ]
  }
};

const STORAGE_KEY = 'aseing_brand_logo_config';
const EVENT_NAME = 'aseing:logo-updated';

export const DEFAULT_BRAND_CONFIG: BrandLogoConfig = {
  activePreset: 'isotipo',
  customUrl: null,
  format: 'square',
  glowEffect: true,
  bannerInitialSize: 'md',
  finalLogoSize: 'md',
  updatedAt: new Date().toISOString()
};

export function getStoredBrandConfig(): BrandLogoConfig {
  if (typeof window === 'undefined') return DEFAULT_BRAND_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // If previous config pointed to outdated nonexistent preset or lacked valid logo
      if (parsed.activePreset === 'horizontal' && !parsed.customUrl && parsed.format === 'horizontal') {
        // Softly normalize to isotipo ("Logo sin letras") if not custom
        parsed.activePreset = 'isotipo';
        parsed.format = 'square';
      }
      return { ...DEFAULT_BRAND_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn('[BrandLogo] Error reading config from storage:', err);
  }
  return DEFAULT_BRAND_CONFIG;
}

export function saveBrandConfig(config: Partial<BrandLogoConfig>): BrandLogoConfig {
  const current = getStoredBrandConfig();
  const updated: BrandLogoConfig = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    } catch (err) {
      console.warn('[BrandLogo] Error saving config to storage:', err);
    }

    // Persist asynchronously to backend server
    fetch('/api/brand/logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(() => {});
  }

  return updated;
}

export function subscribeToBrandConfig(callback: (config: BrandLogoConfig) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<BrandLogoConfig>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getStoredBrandConfig());
    }
  };

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

export function getActiveLogoUrl(config: BrandLogoConfig, context: 'initial-banner' | 'final-footer' | 'general' = 'general'): string {
  if (config.activePreset === 'custom' && config.customUrl) {
    return config.customUrl;
  }

  if (config.activePreset === 'isotipo') {
    return OFFICIAL_PRESETS.isotipo.url;
  }

  if (config.activePreset === 'horizontal' || config.format === 'horizontal') {
    return OFFICIAL_PRESETS.horizontal.url;
  }

  if (config.activePreset === 'cuadrado') {
    return OFFICIAL_PRESETS.cuadrado.url;
  }

  return OFFICIAL_PRESETS.isotipo.url;
}
