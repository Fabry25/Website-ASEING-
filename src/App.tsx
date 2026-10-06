import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DiagnosticQuiz } from './components/DiagnosticQuiz';
import { ServicesSection } from './components/ServicesSection';
import { IsoSection } from './components/IsoSection';
import { PricingCheckout } from './components/PricingCheckout';
import { GallerySection } from './components/GallerySection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ClientPortalModal } from './components/ClientPortalModal';
import { RegisterModal } from './components/RegisterModal';
import { LogoManagerModal } from './components/LogoManagerModal';
import { ErpDemoModal } from './components/ErpDemoModal';
import { WhatsAppFab } from './components/WhatsAppFab';
import { ServiceItem, Order } from './types';
import { SERVICES_CATALOG } from './data/servicesData';

export default function App() {
  // Initial Day Mode detection for Ecuador (America/Guayaquil, 06:00 - 17:59)
  const [isDayMode, setIsDayMode] = useState<boolean>(() => {
    try {
      const hour = parseInt(
        new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          hour12: false,
          timeZone: 'America/Guayaquil',
        }).format(new Date()),
        10
      );
      return hour >= 6 && hour < 18;
    } catch (e) {
      return false;
    }
  });

  // Client Cart state
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>(() => {
    const defaultDiagnostic = SERVICES_CATALOG.find((s) => s.id === 'diagnostico-inicial');
    return defaultDiagnostic ? [defaultDiagnostic] : [];
  });

  // Client Portal modal
  const [isPortalOpen, setIsPortalOpen] = useState<boolean>(false);

  // Register & Consultation Modal
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  // Brand Logo Automation & Customization Modal
  const [isLogoModalOpen, setIsLogoModalOpen] = useState<boolean>(false);

  // ERP Demo Modal (activated via QR code scan or demo button)
  const [isErpDemoOpen, setIsErpDemoOpen] = useState<boolean>(false);

  // Automatically detect QR code scan or URL hash for ERP Demo (#demo-erp, #erp-demo, etc.)
  useEffect(() => {
    const handleCheckUrlDemo = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (
        hash === '#demo-erp' ||
        hash === '#erp-demo' ||
        hash === '#demo' ||
        hash === '#app-demo' ||
        params.get('demo') === 'erp' ||
        params.get('erp') === 'demo'
      ) {
        setIsErpDemoOpen(true);
      }
    };

    handleCheckUrlDemo();
    window.addEventListener('hashchange', handleCheckUrlDemo);
    return () => window.removeEventListener('hashchange', handleCheckUrlDemo);
  }, []);

  const handleCloseErpDemo = () => {
    setIsErpDemoOpen(false);
    if (
      window.location.hash === '#demo-erp' ||
      window.location.hash === '#erp-demo' ||
      window.location.hash === '#demo' ||
      window.location.hash === '#app-demo'
    ) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  // Modern High-Contrast Theme Test Mode
  // Default to true as requested: "Solo quiero una prueba para ver si me gusta y después confirmar cambios"
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('aseing_high_contrast_theme');
      if (stored !== null) {
        return stored === 'true';
      }
      return true; // Active for test by default
    } catch (_) {
      return true;
    }
  });

  // Synchronize high-contrast class on document element
  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }
    try {
      localStorage.setItem('aseing_high_contrast_theme', String(isHighContrast));
    } catch (_) {}
  }, [isHighContrast]);

  const handleToggleHighContrast = () => {
    setIsHighContrast((prev) => !prev);
  };

  // Synchronize day-mode class on document element
  useEffect(() => {
    if (isDayMode) {
      document.documentElement.classList.add('day-mode');
    } else {
      document.documentElement.classList.remove('day-mode');
    }
  }, [isDayMode]);

  const toggleTheme = () => {
    setIsDayMode((prev) => !prev);
  };

  const handleToggleService = (service: ServiceItem) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleSelectPackage = (packageId: string) => {
    const found = SERVICES_CATALOG.find((s) => s.id === packageId);
    if (found) {
      setSelectedServices((prev) => {
        if (!prev.some((s) => s.id === found.id)) {
          return [...prev, found];
        }
        return prev;
      });
      // Scroll to pricing
      const el = document.getElementById('precios');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectRecommendedService = (serviceId: string) => {
    const found = SERVICES_CATALOG.find((s) => s.id === serviceId);
    if (found) {
      setSelectedServices((prev) => {
        if (!prev.some((s) => s.id === found.id)) {
          return [...prev, found];
        }
        return prev;
      });
    }
    const el = document.getElementById('precios');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearCart = () => {
    setSelectedServices([]);
  };

  const handleOrderCompleted = (order: Order) => {
    console.log('[ASEING] Order confirmed and activated:', order);
  };

  const selectedServiceIds = selectedServices.map((s) => s.id);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
      {/* Header (Banner Inicial con Logotipo Automatizado) */}
      <Header
        cartCount={selectedServices.length}
        onOpenCart={() => {
          const el = document.getElementById('precios');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenPortal={() => setIsPortalOpen(true)}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onOpenLogoManager={() => setIsLogoModalOpen(true)}
        isDayMode={isDayMode}
        onToggleTheme={toggleTheme}
        isHighContrast={isHighContrast}
        onToggleHighContrast={handleToggleHighContrast}
      />

      {/* Hero Section */}
      <Hero
        onStartDiagnosis={() => {
          const el = document.getElementById('diagnostico');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onGoToPricing={() => {
          const el = document.getElementById('precios');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Interactive Plant Diagnostic Tool */}
      <DiagnosticQuiz onSelectRecommendedService={handleSelectRecommendedService} />

      {/* Services Section */}
      <ServicesSection
        onAddToCart={handleToggleService}
        selectedServiceIds={selectedServiceIds}
        onOpenErpDemo={() => setIsErpDemoOpen(true)}
      />

      {/* ISO Certification Section & Trinorma */}
      <IsoSection onSelectPackage={handleSelectPackage} />

      {/* Pricing & Automated Payment Workflow */}
      <PricingCheckout
        selectedServices={selectedServices}
        onToggleService={handleToggleService}
        onClearCart={handleClearCart}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Field Work Gallery */}
      <GallerySection />

      {/* About Section */}
      <AboutSection />

      {/* Contact & Technical Channel Hub */}
      <ContactSection onOpenRegisterModal={() => setIsRegisterModalOpen(true)} />

      {/* Footer (Logo Final Sincronizado con Desplazamiento Suave al Inicio) */}
      <Footer onOpenPortal={() => setIsPortalOpen(true)} />

      {/* ERP Demo Modal (Modo Demostración / Solo Lectura) */}
      <ErpDemoModal
        isOpen={isErpDemoOpen}
        onClose={handleCloseErpDemo}
        onSelectPlan={(planId) => handleSelectPackage(planId)}
      />

      {/* Client Portal Modal */}
      <ClientPortalModal isOpen={isPortalOpen} onClose={() => setIsPortalOpen(false)} />

      {/* Register & Technical Consultation Modal (Webhook Google Apps Script) */}
      <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} />

      {/* Brand Logo Automation & Customization Modal */}
      <LogoManagerModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        isDayMode={isDayMode}
      />

      {/* WhatsApp Floating Action Button */}
      <WhatsAppFab />
    </div>
  );
}
