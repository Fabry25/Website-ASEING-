import React, { useState } from 'react';
import {
  X,
  Lock,
  Eye,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  Boxes,
  Calendar,
  Search,
  Filter,
  BarChart3,
  QrCode,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Info,
  Sparkles,
  Key,
  FileText,
  Check
} from 'lucide-react';

interface ErpDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (planId: 'app-planificacion' | 'app-planificacion-mensual') => void;
}

interface ProductionOrder {
  id: string;
  product: string;
  client: string;
  lot: string;
  units: number;
  completedUnits: number;
  status: 'in_progress' | 'quality_check' | 'planned' | 'completed';
  statusLabel: string;
  line: string;
  operator: string;
  progress: number;
  cycleTime: string;
  startedAt: string;
  eta: string;
  priority: string;
}

export const ErpDemoModal: React.FC<ErpDemoModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('ERP-ASEING');
  const [passwordError, setPasswordError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ops' | 'gantt' | 'inventory' | 'bom' | 'oee'>('ops');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOpId, setSelectedOpId] = useState<string>('OP-2026-084');

  // Modales interactivos de solo lectura para formularios inspeccionables
  const [inspectingOp, setInspectingOp] = useState<ProductionOrder | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  const [isNewBomModalOpen, setIsNewBomModalOpen] = useState<boolean>(false);

  // BOM seleccionado
  const [selectedBomId, setSelectedBomId] = useState<'bom-1' | 'bom-2' | 'bom-3'>('bom-1');

  // Categoría de inventario seleccionada
  const [inventoryCategory, setInventoryCategory] = useState<string>('all');
  const [inventorySearch, setInventorySearch] = useState<string>('');

  // Estación OEE seleccionada
  const [selectedOeeStation, setSelectedOeeStation] = useState<string>('general');

  // Show temporary toast notification when user attempts a write action
  const showBlockedActionToast = (actionName: string) => {
    setToastMessage(`Acción "${actionName}" deshabilitada en MODO DEMOSTRACIÓN (Solo Lectura)`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim().toUpperCase() === 'ERP-ASEING') {
      setIsAuthenticated(true);
      setPasswordError('');
      setToastMessage('Acceso confirmado con credencial ERP-ASEING · Modo Demo activo');
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setPasswordError('Contraseña incorrecta. Utilice exactamente: ERP-ASEING');
    }
  };

  if (!isOpen) return null;

  // Mock Production Orders (OPs)
  const productionOrders: ProductionOrder[] = [
    {
      id: 'OP-2026-084',
      product: 'Botín Industrial Cuero Dieléctrico T-41',
      client: 'Manufacturas Metalmecánicas del Austro',
      lot: 'LOT-2026-09A',
      units: 1200,
      completedUnits: 980,
      status: 'in_progress',
      statusLabel: 'En Proceso de Línea',
      line: 'Línea 2 - Ensamble & Pegado',
      operator: 'Ing. Marco Paredes',
      progress: 81.6,
      cycleTime: '48 seg/par',
      startedAt: '06/10/2026 07:30',
      eta: '07/10/2026 14:00',
      priority: 'Alta'
    },
    {
      id: 'OP-2026-085',
      product: 'Envase PET 500ml Cilíndrico Cristalino',
      client: 'Alimentos Procesados Tungurahua S.A.',
      lot: 'LOT-2026-09B',
      units: 25000,
      completedUnits: 25000,
      status: 'quality_check',
      statusLabel: 'Control de Calidad',
      line: 'Línea 1 - Inyección & Soplado',
      operator: 'Téc. Sofía Villacís',
      progress: 100,
      cycleTime: '3.2 seg/ciclo',
      startedAt: '05/10/2026 08:00',
      eta: '06/10/2026 12:00',
      priority: 'Media'
    },
    {
      id: 'OP-2026-086',
      product: 'Perfil Estructural Galvanizado 100x50x2mm',
      client: 'Estructuras Andinas Cía. Ltda.',
      lot: 'LOT-2026-09C',
      units: 450,
      completedUnits: 150,
      status: 'in_progress',
      statusLabel: 'En Proceso de Línea',
      line: 'Línea 3 - Rolado & Soldadura',
      operator: 'Oper. Jorge Caiza',
      progress: 33.3,
      cycleTime: '2.4 min/barra',
      startedAt: '06/10/2026 09:15',
      eta: '08/10/2026 18:00',
      priority: 'Urgente'
    },
    {
      id: 'OP-2026-087',
      product: 'Caja Cartón Corrugado Triple Onda Master',
      client: 'Exportadora Bananera del Guayas',
      lot: 'LOT-2026-09D',
      units: 5000,
      completedUnits: 0,
      status: 'planned',
      statusLabel: 'Programada / Espera MP',
      line: 'Línea 4 - Troquelado & Pegado',
      operator: 'Téc. Luis Freire',
      progress: 0,
      cycleTime: '1.1 seg/caja',
      startedAt: 'Programada 07/10',
      eta: '09/10/2026 16:30',
      priority: 'Normal'
    },
    {
      id: 'OP-2026-088',
      product: 'Suela Poliuretano Bidensidad Antideslizante',
      client: 'Calzados y Cuero del Centro',
      lot: 'LOT-2026-08E',
      units: 3400,
      completedUnits: 3400,
      status: 'completed',
      statusLabel: 'Concluida & Lista Despacho',
      line: 'Línea 2 - Inyección Directa',
      operator: 'Téc. Andrea Morales',
      progress: 100,
      cycleTime: '22 seg/par',
      startedAt: '04/10/2026 07:00',
      eta: 'Finalizada 05/10',
      priority: 'Media'
    }
  ];

  // Mock Inventory
  const inventoryItems = [
    { sku: 'MP-CUERO-01', name: 'Cuero Vaqueta Hidrofugado 2.0mm', category: 'Materia Prima', stock: 1420, min: 500, unit: 'dm²', cost: 2.45, status: 'Óptimo' },
    { sku: 'MP-POLI-02', name: 'Poliuretano Isocianato Grado Industrial', category: 'Químicos', stock: 240, min: 300, unit: 'kg', cost: 6.80, status: 'Reorden Necesario' },
    { sku: 'INS-OJAL-08', name: 'Ojalillo Metálico Anticorrosivo #4', category: 'Insumos', stock: 45000, min: 10000, unit: 'u', cost: 0.02, status: 'Óptimo' },
    { sku: 'MP-RESINA-PET', name: 'Resina PET Virgen Grado Alimentos', category: 'Materia Prima', stock: 3200, min: 1500, unit: 'kg', cost: 1.65, status: 'Óptimo' },
    { sku: 'INS-PIGM-AZUL', name: 'Masterbatch Pigmento Azul Cobalto', category: 'Insumos', stock: 45, min: 100, unit: 'kg', cost: 14.50, status: 'Stock Crítico' },
    { sku: 'PT-BOTIN-41', name: 'Botín Industrial Cuero Dieléctrico T-41', category: 'Terminado', stock: 120, min: 50, unit: 'pares', cost: 28.90, status: 'Óptimo' },
    { sku: 'MP-BOBINA-GALV', name: 'Bobina Acero Galvanizado 2mm ASTM', category: 'Materia Prima', stock: 8500, min: 3000, unit: 'kg', cost: 1.15, status: 'Óptimo' },
    { sku: 'INS-SOLDA-MIG', name: 'Alambre Soldadura Microalambre ER70S-6', category: 'Insumos', stock: 18, min: 25, unit: 'rollos', cost: 38.00, status: 'Reorden Necesario' }
  ];

  // Recetas BOM Interactivas
  const bomData = {
    'bom-1': {
      code: 'BOM-PROD-01',
      title: 'Botín Industrial Cuero Dieléctrico T-41',
      unitCost: 18.42,
      unit: 'par',
      leadTime: '3 días',
      materials: [
        { name: 'Cuero Vaqueta Hidrofugado (22 dm²)', cost: 5.39, percentage: '29.3%' },
        { name: 'Puntera Policarbonato 200J (1 par)', cost: 3.10, percentage: '16.8%' },
        { name: 'Suela PU Inyectada Bidensidad (1 par)', cost: 4.50, percentage: '24.4%' },
        { name: 'Plantilla Antiperforante Kevlar (1 par)', cost: 3.80, percentage: '20.6%' },
        { name: 'Hilos, ojalillos y pegamento poliuretánico', cost: 1.63, percentage: '8.9%' }
      ]
    },
    'bom-2': {
      code: 'BOM-PROD-02',
      title: 'Envase PET 500ml Cilíndrico Cristalino',
      unitCost: 0.088,
      unit: 'unidad',
      leadTime: '1 día',
      materials: [
        { name: 'Resina PET Virgen Grado Alimentos (24 g)', cost: 0.040, percentage: '45.5%' },
        { name: 'Preforma Inyectada y Estirada PCO-1881', cost: 0.028, percentage: '31.8%' },
        { name: 'Tapa Roscada PEAD con liner de seguridad', cost: 0.012, percentage: '13.6%' },
        { name: 'Caja corrugada empaque colectivo (x100)', cost: 0.008, percentage: '9.1%' }
      ]
    },
    'bom-3': {
      code: 'BOM-PROD-03',
      title: 'Perfil Estructural Galvanizado 100x50x2mm (6m)',
      unitCost: 22.15,
      unit: 'barra',
      leadTime: '2 días',
      materials: [
        { name: 'Chapa Acero Galvanizado G-90 (18.2 kg)', cost: 17.29, percentage: '78.1%' },
        { name: 'Alambre de Soldadura ER70S-6 (0.4 kg)', cost: 1.85, percentage: '8.3%' },
        { name: 'Gas Mezcla Argón/CO2 (0.15 m³)', cost: 1.20, percentage: '5.4%' },
        { name: 'Recubrimiento anticorrosivo de cordón', cost: 1.81, percentage: '8.2%' }
      ]
    }
  };

  // Filtered production orders
  const filteredOrders = productionOrders.filter((op) => {
    const matchesSearch =
      op.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.client.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      op.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filtered inventory
  const filteredInventory = inventoryItems.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.name.toLowerCase().includes(inventorySearch.toLowerCase());

    const matchesCategory =
      inventoryCategory === 'all' || item.category === inventoryCategory;

    return matchesSearch && matchesCategory;
  });

  const selectedOp = productionOrders.find((op) => op.id === selectedOpId) || productionOrders[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-[#140628] border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">

        {/* 1. BARRA SUPERIOR FLOTANTE OBLIGATORIA: MODO DEMOSTRACIÓN (SOLO LECTURA) */}
        <div className="sticky top-0 z-40 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md border-b border-amber-600/30">
          <div className="flex items-center gap-2 font-black tracking-wide text-xs sm:text-sm">
            <span className="p-1 rounded bg-black/15 flex items-center justify-center">
              <Lock size={15} className="text-slate-950" />
            </span>
            <span className="uppercase">MODO DEMOSTRACIÓN - Visualización de Módulos (Solo Lectura)</span>
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-black/20 text-[10px] font-mono font-bold">
              Base de Datos Protegida
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline-block text-[11px] font-medium text-slate-900">
              Contraseña de ingreso: <strong className="font-mono bg-black/15 px-1.5 py-0.5 rounded">ERP-ASEING</strong>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-slate-950 transition-colors cursor-pointer"
              title="Cerrar vista de demostración"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Toast flotante de bloqueo de acciones de escritura */}
        {toastMessage && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-rose-600/95 text-white text-xs font-semibold shadow-xl border border-rose-400 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
            <ShieldAlert size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Si no estuviera autenticado con la contraseña, pantalla de acceso seguro */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto my-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Key size={28} />
            </div>
            <h3 className="text-lg font-bold text-white">Ingreso a App ERP ASEING (Modo Demo)</h3>
            <p className="text-xs text-[#bfa9dc]">
              Ingrese la contraseña de demostración indicada en el código QR para desbloquear la navegación de módulos en solo lectura.
            </p>
            <form onSubmit={handlePasswordSubmit} className="w-full space-y-3 pt-2">
              <div>
                <input
                  type="text"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Contraseña: ERP-ASEING"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-center font-mono font-bold text-sm tracking-wider uppercase text-white focus:outline-none focus:border-amber-400"
                />
                {passwordError && (
                  <p className="text-[11px] text-rose-400 mt-1 font-semibold">{passwordError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 cursor-pointer shadow-lg"
              >
                Ingresar al Modo Demo
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Modal Header & Navigation */}
            <div className="px-6 py-3.5 bg-[#1b0a34] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1ea1c2] to-[#3a0ca3] flex items-center justify-center shadow-md">
                  <Boxes size={22} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      App ERP ASEING · Control de Producción en Tiempo Real
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Modo Demo Activo
                    </span>
                  </div>
                  <p className="text-xs text-[#bfa9dc]">
                    Exploración interactiva de tableros Kanban, Gantt fabril, inventario, estructuras BOM y OEE en tiempo real.
                  </p>
                </div>
              </div>

              {/* Botones de acción rápida para contratar */}
              <div className="flex items-center gap-2">
                {onSelectPlan && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectPlan('app-planificacion');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles size={13} />
                      <span>Comprar App ($4.300)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectPlan('app-planificacion-mensual');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#1ea1c2] hover:bg-[#20b9de] text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <span>Licencia ($92 / mes por 3 usuarios)</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 py-2 bg-white/[0.02] border-b border-white/10 flex items-center gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('ops')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'ops'
                    ? 'bg-gradient-to-r from-[#1ea1c2]/30 to-[#3a0ca3]/40 text-white border border-[#1ea1c2]/40 shadow-sm'
                    : 'text-[#bfa9dc] hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers size={14} />
                <span>Tablero de OPs (Kanban Fabril)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">5</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('gantt')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'gantt'
                    ? 'bg-gradient-to-r from-[#1ea1c2]/30 to-[#3a0ca3]/40 text-white border border-[#1ea1c2]/40 shadow-sm'
                    : 'text-[#bfa9dc] hover:text-white hover:bg-white/5'
                }`}
              >
                <Calendar size={14} />
                <span>Gantt & Secuenciamiento</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-gradient-to-r from-[#1ea1c2]/30 to-[#3a0ca3]/40 text-white border border-[#1ea1c2]/40 shadow-sm'
                    : 'text-[#bfa9dc] hover:text-white hover:bg-white/5'
                }`}
              >
                <Boxes size={14} />
                <span>Inventarios & Stock</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">8</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bom')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'bom'
                    ? 'bg-gradient-to-r from-[#1ea1c2]/30 to-[#3a0ca3]/40 text-white border border-[#1ea1c2]/40 shadow-sm'
                    : 'text-[#bfa9dc] hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity size={14} />
                <span>Estructuras & BOM</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('oee')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'oee'
                    ? 'bg-gradient-to-r from-[#1ea1c2]/30 to-[#3a0ca3]/40 text-white border border-[#1ea1c2]/40 shadow-sm'
                    : 'text-[#bfa9dc] hover:text-white hover:bg-white/5'
                }`}
              >
                <BarChart3 size={14} />
                <span>Monitoreo OEE & Paradas</span>
              </button>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

              {/* TAB 1: KANBAN FABRIL & ESTADO DE OPS */}
              {activeTab === 'ops' && (
                <div className="space-y-4">
                  {/* Barra de Controles & Botón Desactivado: Crear Orden (OP) */}
                  <div className="p-4 rounded-2xl bg-[#1b0a34] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                      <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bfa9dc]" />
                        <input
                          type="text"
                          placeholder="Buscar por OP, cliente o producto..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-[#bfa9dc]/60 focus:outline-none focus:border-[#1ea1c2]"
                        />
                      </div>

                      {/* Filtro de estado */}
                      <div className="flex items-center gap-1 text-xs">
                        <Filter size={14} className="text-[#bfa9dc] hidden sm:inline" />
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#1ea1c2]"
                        >
                          <option value="all" className="bg-[#1b0a34]">Todas las OPs</option>
                          <option value="in_progress" className="bg-[#1b0a34]">En Proceso</option>
                          <option value="quality_check" className="bg-[#1b0a34]">Control Calidad</option>
                          <option value="planned" className="bg-[#1b0a34]">Programadas</option>
                          <option value="completed" className="bg-[#1b0a34]">Concluidas</option>
                        </select>
                      </div>

                      <span className="text-xs text-[#bfa9dc] font-mono shrink-0 hidden md:inline">
                        {filteredOrders.length} OPs
                      </span>
                    </div>

                    {/* BOTONES BLOQUEADOS OBLIGATORIOS: CREAR ORDEN (OP) & NUEVO LOTE */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled
                        onClick={() => {
                          showBlockedActionToast('Crear Orden (OP)');
                          setIsNewOrderModalOpen(true);
                        }}
                        className="opacity-60 cursor-not-allowed px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-white/80 flex items-center gap-1.5 shadow-none transition-all hover:bg-white/15"
                        title="Desactivado en Modo Demostración (Solo Lectura)"
                      >
                        <Lock size={13} className="text-amber-400" />
                        <span>+ Crear Orden (OP)</span>
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 ml-1">
                          Solo Lectura
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled
                        onClick={() => showBlockedActionToast('+ Nuevo Lote')}
                        className="opacity-50 cursor-not-allowed px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 flex items-center gap-1"
                        title="Desactivado en Modo Demostración"
                      >
                        <Lock size={12} />
                        <span>+ Lote</span>
                      </button>
                    </div>
                  </div>

                  {/* Grid de Órdenes de Producción */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders.map((op) => {
                      const isSelected = selectedOpId === op.id;
                      return (
                        <div
                          key={op.id}
                          onClick={() => setSelectedOpId(op.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#210c41] border-[#1ea1c2] shadow-lg ring-1 ring-[#1ea1c2]/50'
                              : 'bg-[#18082e] border-white/10 hover:border-white/25 hover:bg-[#1c0a37]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/10">
                            <div>
                              <span className="text-xs font-mono font-bold text-[#1ea1c2]">
                                {op.id}
                              </span>
                              <span className="text-[10px] font-mono text-[#bfa9dc] block">
                                Lote: {op.lot}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              op.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : op.status === 'quality_check'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : op.status === 'in_progress'
                                ? 'bg-[#1ea1c2]/20 text-[#1ea1c2] border border-[#1ea1c2]/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {op.statusLabel}
                            </span>
                          </div>

                          <div className="pt-2 space-y-2">
                            <h4 className="text-xs font-semibold text-white line-clamp-1">
                              {op.product}
                            </h4>
                            <p className="text-[11px] text-[#bfa9dc]">
                              Cliente: <strong className="text-white">{op.client}</strong>
                            </p>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="text-[#bfa9dc]">Avance: {op.completedUnits} / {op.units} u</span>
                                <span className="text-[#1ea1c2] font-bold">{op.progress}%</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#1ea1c2] to-emerald-400 rounded-full"
                                  style={{ width: `${op.progress}%` }}
                                />
                              </div>
                            </div>

                            <div className="pt-1 flex items-center justify-between text-[11px] text-[#bfa9dc]/80 font-mono">
                              <span>⚙️ {op.line}</span>
                              <span>⏱ {op.cycleTime}</span>
                            </div>

                            {/* Botones de acción individuales BLOQUEADOS: Editar OP y Eliminar OP */}
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectingOp(op);
                                }}
                                className="text-[11px] text-[#1ea1c2] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                              >
                                <Eye size={12} />
                                <span>Ver Ficha (Solo Lectura)</span>
                              </button>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showBlockedActionToast('Editar OP');
                                    setInspectingOp(op);
                                  }}
                                  className="opacity-50 cursor-not-allowed p-1 rounded bg-white/5 text-white/50 hover:text-amber-400"
                                  title="Edición bloqueada en modo lectura"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  disabled
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showBlockedActionToast('Eliminar OP');
                                  }}
                                  className="opacity-50 cursor-not-allowed p-1 rounded bg-white/5 text-white/50 hover:text-rose-400"
                                  title="Eliminación bloqueada en modo lectura"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Trazabilidad QR en tiempo real para la orden seleccionada */}
                  {selectedOp && (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center gap-4">
                      <div className="p-3 bg-white rounded-xl flex-none shadow-md">
                        <QrCode size={64} className="text-[#18082e]" />
                        <span className="text-[9px] font-mono font-bold text-[#18082e] block text-center mt-1">
                          QR PISO PLANTA
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">Etiqueta QR de Trazabilidad Fabril ({selectedOp.id})</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                            Lectura Móvil Activa
                          </span>
                        </div>
                        <p className="text-[#bfa9dc]">
                          En una planta real, los operarios escanean esta etiqueta con celular o terminal para registrar tiempos de parada, inicio de lote y salida a control de calidad sin digitar planillas de papel.
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#1ea1c2]">
                          <span>Lote: {selectedOp.lot}</span>
                          <span>•</span>
                          <span>Estación: {selectedOp.line}</span>
                          <span>•</span>
                          <span>Responsable: {selectedOp.operator}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DIAGRAMA DE GANTT & SECUENCIAMIENTO */}
              {activeTab === 'gantt' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#1b0a34] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Línea de Tiempo y Balanceo de Cargas (Gantt Fabril)</h3>
                      <p className="text-xs text-[#bfa9dc]">
                        Secuenciamiento por estaciones, turnos de 8 horas y optimización de cuellos de botella en tiempo real.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled
                      onClick={() => showBlockedActionToast('Reprogramar Turno')}
                      className="opacity-50 cursor-not-allowed px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-white/70 flex items-center gap-1.5"
                      title="Acción bloqueada en Modo Demostración"
                    >
                      <Lock size={12} className="text-amber-400" />
                      <span>+ Rebalancear Línea (Bloqueado)</span>
                    </button>
                  </div>

                  {/* Visual Gantt Lines */}
                  <div className="p-5 rounded-2xl bg-[#18082e] border border-white/10 space-y-4 overflow-x-auto">
                    <div className="min-w-[650px] space-y-3">
                      {/* Time Header */}
                      <div className="grid grid-cols-12 gap-1 text-[11px] font-mono text-[#bfa9dc] border-b border-white/10 pb-2">
                        <div className="col-span-3 text-white font-bold">Estación / Línea</div>
                        <div className="col-span-3 text-center">Turno Mañana (07:00 - 12:00)</div>
                        <div className="col-span-3 text-center">Turno Tarde (12:00 - 17:00)</div>
                        <div className="col-span-3 text-center">Turno Noche (17:00 - 22:00)</div>
                      </div>

                      {/* Station 1 */}
                      <div className="grid grid-cols-12 gap-1 items-center py-2 border-b border-white/5 text-xs">
                        <div className="col-span-3 font-semibold text-white">Línea 1 · Inyección & Soplado</div>
                        <div className="col-span-9 bg-white/5 h-8 rounded-lg relative overflow-hidden flex items-center px-2">
                          <div className="absolute left-[5%] w-[45%] h-6 rounded bg-[#1ea1c2] text-slate-950 font-bold text-[11px] flex items-center px-2 shadow">
                            OP-085 (Envase PET) - 100%
                          </div>
                          <div className="absolute left-[55%] w-[35%] h-6 rounded bg-purple-500/80 text-white font-bold text-[11px] flex items-center px-2 shadow">
                            Mantenimiento Preventivo
                          </div>
                        </div>
                      </div>

                      {/* Station 2 */}
                      <div className="grid grid-cols-12 gap-1 items-center py-2 border-b border-white/5 text-xs">
                        <div className="col-span-3 font-semibold text-white">Línea 2 · Ensamble & Pegado</div>
                        <div className="col-span-9 bg-white/5 h-8 rounded-lg relative overflow-hidden flex items-center px-2">
                          <div className="absolute left-[0%] w-[65%] h-6 rounded bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center px-2 shadow">
                            OP-084 (Botín Dieléctrico) - 81.6%
                          </div>
                          <div className="absolute left-[70%] w-[25%] h-6 rounded bg-amber-500/80 text-slate-950 font-bold text-[11px] flex items-center px-2 shadow">
                            Ajuste de Matriz
                          </div>
                        </div>
                      </div>

                      {/* Station 3 */}
                      <div className="grid grid-cols-12 gap-1 items-center py-2 border-b border-white/5 text-xs">
                        <div className="col-span-3 font-semibold text-white">Línea 3 · Rolado & Soldadura</div>
                        <div className="col-span-9 bg-white/5 h-8 rounded-lg relative overflow-hidden flex items-center px-2">
                          <div className="absolute left-[15%] w-[50%] h-6 rounded bg-[#3a0ca3] text-white font-bold text-[11px] flex items-center px-2 shadow">
                            OP-086 (Perfil Galvanizado) - 33.3%
                          </div>
                        </div>
                      </div>

                      {/* Station 4 */}
                      <div className="grid grid-cols-12 gap-1 items-center py-2 text-xs">
                        <div className="col-span-3 font-semibold text-white">Línea 4 · Empaque & Despacho</div>
                        <div className="col-span-9 bg-white/5 h-8 rounded-lg relative overflow-hidden flex items-center px-2">
                          <div className="absolute left-[30%] w-[60%] h-6 rounded bg-cyan-600 text-white font-bold text-[11px] flex items-center px-2 shadow">
                            OP-088 (Suela PU) - Concluida
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INVENTARIOS & STOCK */}
              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#1b0a34] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Control de Stock, Materias Primas y Punto de Reorden</h3>
                      <p className="text-xs text-[#bfa9dc]">
                        Trazabilidad de almacén con alertas automáticas de rotura de inventario y costos valorizados.
                      </p>
                    </div>

                    {/* BOTÓN BLOQUEADO OBLIGATORIO: + NUEVO PRODUCTO & BOM */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled
                        onClick={() => {
                          showBlockedActionToast('+ Nuevo Producto & BOM');
                          setIsNewBomModalOpen(true);
                        }}
                        className="opacity-60 cursor-not-allowed px-3.5 py-2 rounded-xl bg-white/10 text-xs font-bold text-white/80 flex items-center gap-1.5 transition-all"
                        title="Desactivado en Modo Demostración"
                      >
                        <Lock size={13} className="text-amber-400" />
                        <span>+ Nuevo Producto & BOM</span>
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 ml-1">
                          Solo Lectura
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled
                        onClick={() => showBlockedActionToast('+ Ajuste de Inventario')}
                        className="opacity-50 cursor-not-allowed px-3 py-2 rounded-xl bg-white/5 text-xs text-white/60 flex items-center gap-1"
                        title="Desactivado en Modo Demostración"
                      >
                        <Lock size={12} />
                        <span>Ajuste Stock</span>
                      </button>
                    </div>
                  </div>

                  {/* Filtros de Inventario */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {['all', 'Materia Prima', 'Químicos', 'Insumos', 'Terminado'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setInventoryCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl font-medium cursor-pointer transition-all ${
                            inventoryCategory === cat
                              ? 'bg-[#1ea1c2] text-slate-950 font-bold'
                              : 'bg-white/5 text-[#bfa9dc] hover:text-white'
                          }`}
                        >
                          {cat === 'all' ? 'Todas las Categorías' : cat}
                        </button>
                      ))}
                    </div>

                    <div className="relative min-w-[200px]">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bfa9dc]" />
                      <input
                        type="text"
                        placeholder="Filtrar SKU o material..."
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-[#bfa9dc]/60 focus:outline-none focus:border-[#1ea1c2]"
                      />
                    </div>
                  </div>

                  {/* Tabla de Inventarios */}
                  <div className="rounded-2xl border border-white/10 bg-[#18082e] overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[620px]">
                      <thead className="bg-white/5 text-[#bfa9dc] font-mono uppercase text-[10px] border-b border-white/10">
                        <tr>
                          <th className="p-3">Código SKU</th>
                          <th className="p-3">Descripción del Ítem</th>
                          <th className="p-3">Categoría</th>
                          <th className="p-3 text-right">Stock Actual</th>
                          <th className="p-3 text-right">Mínimo</th>
                          <th className="p-3 text-right">Costo Unit.</th>
                          <th className="p-3 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredInventory.map((item) => (
                          <tr key={item.sku} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-mono font-bold text-[#1ea1c2]">{item.sku}</td>
                            <td className="p-3 text-white font-medium">{item.name}</td>
                            <td className="p-3 text-[#bfa9dc]">{item.category}</td>
                            <td className="p-3 text-right font-mono font-bold text-white">
                              {item.stock} {item.unit}
                            </td>
                            <td className="p-3 text-right font-mono text-[#bfa9dc]">{item.min} {item.unit}</td>
                            <td className="p-3 text-right font-mono text-emerald-400">USD ${item.cost.toFixed(2)}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                                item.status === 'Óptimo'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : item.status === 'Reorden Necesario'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-rose-500/20 text-rose-300 font-bold'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: ESTRUCTURAS & BOM (BILL OF MATERIALS) */}
              {activeTab === 'bom' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#1b0a34] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Estructura de Recetas y Lista de Materiales (BOM)</h3>
                      <p className="text-xs text-[#bfa9dc]">
                        Cálculo exacto de consumo por orden de fabricación y explosión de materiales para compras.
                      </p>
                    </div>

                    {/* BOTÓN BLOQUEADO OBLIGATORIO: + NUEVO PRODUCTO & BOM */}
                    <button
                      type="button"
                      disabled
                      onClick={() => {
                        showBlockedActionToast('+ Nuevo Producto & BOM');
                        setIsNewBomModalOpen(true);
                      }}
                      className="opacity-60 cursor-not-allowed px-3.5 py-2 rounded-xl bg-white/10 text-xs font-bold text-white/80 flex items-center gap-1.5"
                      title="Desactivado en Modo Demostración"
                    >
                      <Lock size={13} className="text-amber-400" />
                      <span>+ Nuevo Producto & BOM</span>
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 ml-1">
                        Solo Lectura
                      </span>
                    </button>
                  </div>

                  {/* Selector interactivo de productos BOM */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(bomData) as Array<keyof typeof bomData>).map((key) => {
                      const item = bomData[key];
                      const isSelected = selectedBomId === key;
                      return (
                        <div
                          key={key}
                          onClick={() => setSelectedBomId(key)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#210c41] border-[#1ea1c2] ring-1 ring-[#1ea1c2]/50 shadow'
                              : 'bg-[#18082e] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <span className="text-[10px] font-mono text-[#1ea1c2] font-bold block">{item.code}</span>
                          <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{item.title}</h4>
                          <span className="text-xs font-mono text-emerald-400 font-bold mt-1 block">
                            Costo MP: USD ${item.unitCost} / {item.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ejemplo BOM Interactivo Seleccionado */}
                  {(() => {
                    const currentBom = bomData[selectedBomId];
                    return (
                      <div className="p-5 rounded-2xl bg-[#18082e] border border-white/10 space-y-4">
                        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2">
                          <div>
                            <span className="text-xs text-[#1ea1c2] font-mono font-bold">{currentBom.code}</span>
                            <h4 className="text-sm font-bold text-white">{currentBom.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-white/5 text-[11px] font-mono text-[#bfa9dc]">
                              Lead Time: {currentBom.leadTime}
                            </span>
                            <span className="px-3 py-1 rounded-xl bg-white/10 text-xs font-mono text-emerald-400 font-bold">
                              Costo Estándar MP: USD ${currentBom.unitCost} / {currentBom.unit}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          {currentBom.materials.map((mat, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-white/5 flex items-center justify-between hover:bg-white/[0.08] transition-colors">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[#1ea1c2] font-bold text-[11px]">{idx + 1}.</span>
                                <span>{mat.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-[#bfa9dc]">{mat.percentage}</span>
                                <span className="font-mono text-white font-bold">USD ${mat.cost.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 5: MONITOREO OEE & PARADAS DE PLANTA */}
              {activeTab === 'oee' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-[#18082e] border border-white/10 text-center">
                      <span className="text-xs text-[#bfa9dc] block">Disponibilidad</span>
                      <span className="text-2xl font-black font-mono text-[#1ea1c2] mt-1 block">92.4%</span>
                      <span className="text-[10px] text-emerald-400 mt-1 block">Meta: 90%</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#18082e] border border-white/10 text-center">
                      <span className="text-xs text-[#bfa9dc] block">Rendimiento</span>
                      <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">88.6%</span>
                      <span className="text-[10px] text-amber-400 mt-1 block">Meta: 92%</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#18082e] border border-white/10 text-center">
                      <span className="text-xs text-[#bfa9dc] block">Calidad (PPM)</span>
                      <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">99.1%</span>
                      <span className="text-[10px] text-emerald-400 mt-1 block">Scrap: 0.9%</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1ea1c2]/20 to-[#3a0ca3]/30 border border-[#1ea1c2]/30 text-center">
                      <span className="text-xs text-[#bfa9dc] block font-bold">OEE Global Fabril</span>
                      <span className="text-2xl font-black font-mono text-white mt-1 block">81.1%</span>
                      <span className="text-[10px] text-emerald-400 mt-1 block">Clase Mundial: 85%</span>
                    </div>
                  </div>

                  {/* Registro de Paradas */}
                  <div className="p-4 rounded-2xl bg-[#18082e] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-bold text-white">Registro de Paradas de Máquina (En Tiempo Real)</span>
                      <button
                        type="button"
                        disabled
                        onClick={() => showBlockedActionToast('Registrar Parada')}
                        className="opacity-50 cursor-not-allowed px-3 py-1 rounded-xl bg-white/10 text-xs text-white/70 flex items-center gap-1"
                        title="Desactivado en Modo Demostración"
                      >
                        <Lock size={11} className="text-amber-400" />
                        <span>+ Registrar Parada (Bloqueado)</span>
                      </button>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between">
                        <div>
                          <strong className="text-amber-400">Línea 2 - Ensamble:</strong> Ajuste de matriz por cambio de modelo (OP-084)
                        </div>
                        <span className="font-mono text-white font-bold">18 min</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between">
                        <div>
                          <strong className="text-purple-400">Línea 1 - Inyección:</strong> Mantenimiento preventivo de boquilla térmica
                        </div>
                        <span className="font-mono text-white font-bold">25 min</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between">
                        <div>
                          <strong className="text-cyan-400">Línea 3 - Rolado:</strong> Espera de bobina de acero desde bodega central
                        </div>
                        <span className="font-mono text-white font-bold">12 min</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-[#1b0a34] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#bfa9dc]">
                <Info size={14} className="text-[#1ea1c2]" />
                <span>
                  Entorno de demostración interactivo ASEING. Todos los módulos operan en <strong>Modo Solo Lectura</strong>.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-colors cursor-pointer"
                >
                  Cerrar Demo
                </button>
              </div>
            </div>
          </>
        )}

      </div>

      {/* FORMULARIO DE EDICIÓN O DETALLE DE REGISTRO (BLOQUEADO EN MODO SOLO LECTURA) */}
      {inspectingOp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#1b0a34] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col">
            {/* Header del formulario */}
            <div className="p-4 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                  <Lock size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Ficha de Orden de Producción ({inspectingOp.id})</h4>
                  <span className="text-[10px] font-mono text-amber-300 font-semibold uppercase">
                    Formulario Bloqueado · Modo Demostración (Solo Lectura)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingOp(null)}
                className="p-1 rounded-lg text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Aviso informativo en el formulario */}
            <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-200 flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-amber-400" />
              <span>
                Los campos se presentan deshabilitados. La edición y eliminación de registros están bloqueadas para asegurar los datos demostrativos.
              </span>
            </div>

            {/* Campos del Formulario de Edición (Deshabilitados) */}
            <div className="p-5 space-y-3.5 text-xs overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#bfa9dc] block mb-1">Código OP</label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={inspectingOp.id}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono opacity-80 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#bfa9dc] block mb-1">Lote Fabril</label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={inspectingOp.lot}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono opacity-80 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#bfa9dc] block mb-1">Cliente Solicitante</label>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={inspectingOp.client}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white opacity-80 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#bfa9dc] block mb-1">Producto a Fabricar</label>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={inspectingOp.product}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white opacity-80 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#bfa9dc] block mb-1">Unidades Programadas</label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={`${inspectingOp.units} unidades`}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono opacity-80 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#bfa9dc] block mb-1">Unidades Concluidas</label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={`${inspectingOp.completedUnits} unidades`}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono opacity-80 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#bfa9dc] block mb-1">Línea de Producción</label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={inspectingOp.line}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white opacity-80 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#bfa9dc] block mb-1">Responsable</label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={inspectingOp.operator}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white opacity-80 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción del Formulario (Bloqueados) */}
            <div className="p-4 bg-[#140628] border-t border-white/10 flex items-center justify-between gap-2">
              <button
                type="button"
                disabled
                onClick={() => showBlockedActionToast('Eliminar Registro de OP')}
                className="opacity-50 cursor-not-allowed px-3 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5"
                title="Desactivado en Modo Demostración"
              >
                <Trash2 size={13} />
                <span>Eliminar OP (Inhabilitado)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingOp(null)}
                  className="px-3.5 py-2 rounded-xl bg-white/10 text-xs text-white hover:bg-white/15"
                >
                  Cerrar Ficha
                </button>
                <button
                  type="button"
                  disabled
                  onClick={() => showBlockedActionToast('Guardar Cambios')}
                  className="opacity-50 cursor-not-allowed px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow"
                  title="Desactivado en Modo Demostración"
                >
                  <Lock size={12} />
                  <span>Guardar Cambios (Inhabilitado)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN DE ORDEN OP (BLOQUEADO EN DEMOSTRACIÓN) */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#1b0a34] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col">
            <div className="p-4 bg-amber-500/20 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-amber-400" />
                <h4 className="text-sm font-bold text-white">Formulario de Nueva Orden (OP)</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-1 rounded-lg text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-200">
              <strong>Acción Bloqueada:</strong> El botón "+ Crear Orden (OP)" está inhabilitado en Modo Demostración para salvaguardar los registros reales.
            </div>
            <div className="p-5 space-y-3 text-xs opacity-70">
              <div>
                <label className="text-[11px] text-[#bfa9dc] block mb-1">Nombre del Cliente</label>
                <input disabled placeholder="Ej: Industria Andina S.A." className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white cursor-not-allowed" />
              </div>
              <div>
                <label className="text-[11px] text-[#bfa9dc] block mb-1">Producto o Fórmula BOM</label>
                <input disabled placeholder="Seleccione producto terminado..." className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#bfa9dc] block mb-1">Cantidad a Producir</label>
                  <input disabled placeholder="0" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-[11px] text-[#bfa9dc] block mb-1">Fecha Prometida Entrega</label>
                  <input disabled placeholder="dd/mm/aaaa" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white cursor-not-allowed" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#140628] border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs text-white"
              >
                Cerrar
              </button>
              <button
                type="button"
                disabled
                className="opacity-50 cursor-not-allowed px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Crear Registro (Bloqueado)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN DE BOM (BLOQUEADO EN DEMOSTRACIÓN) */}
      {isNewBomModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#1b0a34] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col">
            <div className="p-4 bg-amber-500/20 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-amber-400" />
                <h4 className="text-sm font-bold text-white">Alta de Receta / BOM</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsNewBomModalOpen(false)}
                className="p-1 rounded-lg text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-200">
              <strong>Acción Bloqueada:</strong> El botón "+ Nuevo Producto & BOM" está desactivado en Modo Demostración para evitar alteraciones en los costos estándar y recetas.
            </div>
            <div className="p-5 space-y-3 text-xs opacity-70">
              <div>
                <label className="text-[11px] text-[#bfa9dc] block mb-1">Código de Producto (SKU)</label>
                <input disabled placeholder="Ej: BOM-PROD-04" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white cursor-not-allowed" />
              </div>
              <div>
                <label className="text-[11px] text-[#bfa9dc] block mb-1">Descripción del Producto Terminado</label>
                <input disabled placeholder="Nombre del producto..." className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white cursor-not-allowed" />
              </div>
            </div>
            <div className="p-4 bg-[#140628] border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewBomModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs text-white"
              >
                Cerrar
              </button>
              <button
                type="button"
                disabled
                className="opacity-50 cursor-not-allowed px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Guardar BOM (Bloqueado)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
