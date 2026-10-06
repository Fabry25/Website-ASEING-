import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, ShoppingCart, Search, FileText } from 'lucide-react';
import { AutomatedBrandLogo } from './AutomatedBrandLogo';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenPortal: () => void;
  onOpenRegisterModal: () => void;
  onOpenLogoManager?: () => void;
  isDayMode: boolean;
  onToggleTheme: () => void;
  isHighContrast?: boolean;
  onToggleHighContrast?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenPortal,
  onOpenRegisterModal,
  onOpenLogoManager,
  isDayMode,
  onToggleTheme,
  isHighContrast = false,
  onToggleHighContrast
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Servicios', href: '#servicios' },
    { name: 'Normas ISO', href: '#iso' },
    { name: 'Cotizador & Precios', href: '#precios' },
    { name: 'Diagnóstico Rápido', href: '#diagnostico' },
    { name: 'Galería', href: '#galeria' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Contacto', href: '#contacto' },
  ];

  return (
    <header
      id="main-header"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isDayMode
          ? scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-purple-950/10'
            : 'bg-white/85 backdrop-blur-sm border-b border-purple-950/5'
          : scrolled
          ? 'bg-[#120325]/90 backdrop-blur-md shadow-lg border-b border-white/10'
          : 'bg-[#0f041d]/80 backdrop-blur-sm border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          {/* Logo & Brand Identity (Banner Inicial) */}
          <div className="flex items-center shrink-0 min-w-0 z-20">
            <AutomatedBrandLogo
              variant="initial-banner"
              isDayMode={isDayMode}
              onOpenManager={onOpenLogoManager}
              showEditButton={false}
            />
          </div>

          {/* Desktop Navigation Links - Ocultos para mantener el header limpio (relegados al menú de hamburguesa) */}
          <nav className="hidden" aria-label="Navegación principal">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors relative py-1 hover:after:w-full after:w-0 after:h-[2px] after:bg-[#1ea1c2] after:absolute after:bottom-0 after:left-0 after:transition-all ${
                  isDayMode
                    ? 'text-[#5a4b73] hover:text-[#1e0338]'
                    : 'text-[#bfa9dc] hover:text-white'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Actions: Theme Toggle, Order Tracker, Cart, Register CTA & Hamburger Menu */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Theme Day/Night Toggle */}
            <button
              id="btn-theme-toggle"
              type="button"
              onClick={onToggleTheme}
              aria-label="Cambiar modo día/noche"
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isDayMode
                  ? 'border-purple-950/15 text-[#5a4b73] hover:text-[#1e0338] bg-black/5 hover:bg-black/10'
                  : 'border-white/10 text-[#bfa9dc] hover:text-white hover:border-[#1ea1c2]/40'
              }`}
              title={isDayMode ? 'Cambiar a modo noche' : 'Cambiar a modo día (horario Ecuador)'}
            >
              {isDayMode ? <Moon size={17} className="text-[#3a0ca3]" /> : <Sun size={17} className="text-amber-400" />}
            </button>

            {/* High Contrast Mode Quick Toggle */}
            {onToggleHighContrast && (
              <button
                id="btn-high-contrast-toggle"
                type="button"
                onClick={onToggleHighContrast}
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isHighContrast
                    ? 'bg-[#00f0ff] border-[#00f0ff] text-black shadow-md shadow-[#00f0ff]/25'
                    : isDayMode
                    ? 'border-zinc-300 text-zinc-800 bg-black/5 hover:border-black'
                    : 'border-white/20 text-[#e4e4e7] hover:text-white hover:border-[#00f0ff]/50'
                }`}
                title={isHighContrast ? 'Desactivar prueba de alto contraste' : 'Activar prueba de tema moderno de alto contraste'}
              >
                <span className={`w-2 h-2 rounded-full ${isHighContrast ? 'bg-black animate-pulse' : 'bg-[#00f0ff]'}`} />
                <span>{isHighContrast ? 'Alto Contraste: ON' : 'Alto Contraste'}</span>
              </button>
            )}

            {/* Portal Order Search */}
            <button
              id="btn-open-portal"
              type="button"
              onClick={onOpenPortal}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shrink-0 ${
                isDayMode
                  ? 'border-purple-950/15 text-[#5a4b73] hover:text-[#1e0338] hover:border-[#1ea1c2] bg-black/5'
                  : 'border-white/10 text-[#bfa9dc] hover:text-white hover:border-[#1ea1c2]/40'
              }`}
            >
              <Search size={14} className="text-[#1ea1c2]" />
              <span>Mis Órdenes</span>
            </button>

            {/* Cotizador / Cart Trigger */}
            <button
              id="btn-cart-trigger"
              type="button"
              onClick={onOpenCart}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shrink-0 ${
                isDayMode
                  ? 'bg-black/5 border-purple-950/15 text-[#1e0338] hover:border-[#1ea1c2]/60'
                  : 'bg-white/5 border-white/10 text-white hover:border-[#1ea1c2]/50'
              }`}
            >
              <ShoppingCart size={15} className="text-[#1ea1c2]" />
              <span className="hidden md:inline">Cotizador</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#b80068] text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Reemplazo por botón: Registro y Consulta (junto al carrito Cotizador) */}
            <button
              id="btn-registro-consulta"
              type="button"
              onClick={onOpenRegisterModal}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#b80068] via-[#4e0477] to-[#3a0ca3] hover:opacity-95 shadow-md shadow-[#b80068]/20 transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <FileText size={14} className="text-[#1ea1c2]" />
              <span className="hidden sm:inline">Registro y Consulta</span>
              <span className="sm:hidden">Registro</span>
            </button>

            {/* Hamburger Menu - Visible en todas las resoluciones (escritorio y móvil) */}
            <button
              id="btn-mobile-menu"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
                isDayMode
                  ? 'text-[#5a4b73] hover:text-[#1e0338] hover:bg-black/5'
                  : 'text-[#bfa9dc] hover:text-white hover:bg-white/5'
              }`}
              aria-label="Abrir menú de navegación"
              title="Menú de navegación"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Dropdown Menu (Accesible mediante hamburguesa en escritorio y móvil) */}
        {mobileMenuOpen && (
          <div className={`py-4 border-t rounded-b-2xl shadow-xl px-4 space-y-2 backdrop-blur-md transition-all ${
            isDayMode
              ? 'border-purple-950/10 bg-white/95 text-[#1e0338]'
              : 'border-white/10 bg-[#150428]/95 text-white'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 py-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDayMode
                      ? 'text-[#5a4b73] hover:text-[#1e0338] hover:bg-black/5'
                      : 'text-[#bfa9dc] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegisterModal();
                }}
                className="w-full sm:w-auto flex-1 text-center py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#b80068] via-[#4e0477] to-[#3a0ca3] flex items-center justify-center gap-2"
              >
                <FileText size={15} />
                <span>Registro y Consulta</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPortal();
                }}
                className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border ${
                  isDayMode
                    ? 'border-purple-950/15 bg-black/5 text-[#5a4b73] hover:text-[#1e0338]'
                    : 'border-white/10 bg-white/5 text-[#bfa9dc] hover:text-white'
                }`}
              >
                <Search size={15} className="text-[#1ea1c2]" />
                <span>Consultar Estado de Orden</span>
              </button>
              <a
                href="#precios"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full sm:w-auto flex-1 text-center py-2.5 px-4 rounded-xl font-semibold text-xs border ${
                  isDayMode
                    ? 'border-purple-950/15 bg-black/5 text-[#1e0338] hover:bg-black/10'
                    : 'border-white/10 bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                Cotizador & Payphone
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
