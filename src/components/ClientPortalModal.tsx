import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  Printer,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Download,
  Edit3,
  Check,
  AlertCircle,
  Briefcase,
  Sparkles,
  RefreshCw,
  Mail,
  Send,
  FileCode
} from 'lucide-react';
import { Order } from '../types';

interface ClientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('ASE-2026-1042');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  // Rescheduling / editing state
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:30');
  const [isSavingDate, setIsSavingDate] = useState(false);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  const handleSendNotification = async (orderNumber: string) => {
    setIsSendingEmail(true);
    setEmailNotice(null);
    try {
      const res = await fetch(`/api/orders/${orderNumber}/send-notification`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setEmailNotice(`✓ Comprobante digital de orden y registro enviado con éxito a ${order?.billingInfo.email} y aseingerencia1@gmail.com`);
      } else {
        setEmailNotice(data.error || 'Error al enviar correo.');
      }
    } catch (err) {
      setEmailNotice('Error de conexión al enviar correo.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);
    setScheduleSuccessMsg('');
    setIsEditingDate(false);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(searchTerm.trim())}`);
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
        // Pre-populate reschedule inputs
        if (data.order.scheduledAuditDate) {
          const [d, t] = data.order.scheduledAuditDate.split(' ');
          if (d) setNewDate(d);
          if (t) setNewTime(t);
        }
      } else {
        setError(data.error || 'No se encontró ninguna orden o comprobante con ese identificador.');
      }
    } catch (err: any) {
      setError('Error al consultar el servidor. Verifique su conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Internal & External Automation: Update / Link Technical Visit Date
  const handleSaveScheduledDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !newDate) return;

    setIsSavingDate(true);
    setScheduleSuccessMsg('');

    try {
      const scheduledAuditDate = `${newDate} ${newTime}`;
      const res = await fetch(`/api/orders/${encodeURIComponent(order.orderNumber)}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledAuditDate,
          notes: 'Fecha de visita técnica vinculada/reprogramada desde el Portal del Cliente.'
        })
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setScheduleSuccessMsg('¡Visita técnica enlazada y sincronizada automáticamente!');
        setIsEditingDate(false);
        setTimeout(() => setScheduleSuccessMsg(''), 4500);
      } else {
        setError(data.error || 'No se pudo actualizar la fecha de visita técnica.');
      }
    } catch (err: any) {
      setError('Error al guardar la nueva fecha de visita técnica.');
    } finally {
      setIsSavingDate(false);
    }
  };

  // Automated Google Calendar Link Generator
  const getGoogleCalendarUrl = () => {
    if (!order || !order.scheduledAuditDate) return '#';
    try {
      const [dPart, tPart] = order.scheduledAuditDate.split(' ');
      const [year, month, day] = (dPart || '2026-09-24').split('-').map(Number);
      const [hours, minutes] = (tPart || '09:30').split(':').map(Number);

      // Start date (Ecuador UTC-5 approx)
      const startDate = new Date(Date.UTC(year, month - 1, day, (hours || 9) + 5, minutes || 30));
      const endDate = new Date(startDate.getTime() + 2.5 * 60 * 60 * 1000); // 2.5 hours duration

      const formatIso = (dt: Date) => dt.toISOString().replace(/-|:|\.\d+/g, '');

      const title = encodeURIComponent(`Visita Técnica ASEING - ${order.billingInfo.companyName}`);
      const servicesList = order.items.map((i) => i.serviceTitle).join(', ');
      const details = encodeURIComponent(
        `Visita técnica y auditoría enlazada para: ${servicesList}\n\n` +
          `Orden de Pedido: ${order.orderNumber}\n` +
          `Empresa: ${order.billingInfo.companyName}\n` +
          `RUC / Cédula: ${order.billingInfo.rucOrId}\n` +
          `Ubicación: ${order.billingInfo.address || 'Instalaciones de la empresa'}, ${order.billingInfo.city || 'Ecuador'}\n` +
          `Dirección Técnica: Profesionales con experiencia en diferentes áreas\n` +
          `ASEING Consultores Industriales | WhatsApp: +593 984 661 214\n` +
          `Enlace directo automatizado por el Portal del Cliente ASEING.`
      );
      const location = encodeURIComponent(
        `${order.billingInfo.address || 'Instalaciones del cliente'}, ${order.billingInfo.city || 'Ambato, Ecuador'}`
      );

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatIso(
        startDate
      )}/${formatIso(endDate)}&details=${details}&location=${location}`;
    } catch {
      return '#';
    }
  };

  // Automated iCalendar (.ICS) Download for Outlook / Apple Calendar / Mobile
  const handleDownloadIcs = () => {
    if (!order || !order.scheduledAuditDate) return;

    try {
      const [dPart, tPart] = order.scheduledAuditDate.split(' ');
      const [year, month, day] = (dPart || '2026-09-24').split('-').map(Number);
      const [hours, minutes] = (tPart || '09:30').split(':').map(Number);

      const startDate = new Date(Date.UTC(year, month - 1, day, (hours || 9) + 5, minutes || 30));
      const endDate = new Date(startDate.getTime() + 2.5 * 60 * 60 * 1000);

      const formatIso = (dt: Date) => dt.toISOString().replace(/-|:|\.\d+/g, '');
      const servicesList = order.items.map((i) => i.serviceTitle).join(', ');

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ASEING Consultores//Portal del Cliente//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:aseing-visita-${order.orderNumber}-${Date.now()}@aseing.com`,
        `DTSTAMP:${formatIso(new Date())}`,
        `DTSTART:${formatIso(startDate)}`,
        `DTEND:${formatIso(endDate)}`,
        `SUMMARY:Visita Técnica ASEING - ${order.billingInfo.companyName}`,
        `DESCRIPTION:Visita técnica y auditoría enlazada para: ${servicesList}\\nOrden: ${order.orderNumber}\\nEmpresa: ${order.billingInfo.companyName}\\nDirección Técnica: Profesionales con experiencia en diferentes áreas\\nContacto: +593 984 661 214`,
        `LOCATION:${order.billingInfo.address || 'Instalaciones de la empresa'}, ${order.billingInfo.city || 'Ecuador'}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Visita_Tecnica_${order.orderNumber}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generating .ics', e);
    }
  };

  // External WhatsApp Link with Complete Pre-filled Context
  const getWhatsappUrl = () => {
    if (!order) return 'https://wa.me/593984661214';
    const servicesList = order.items.map((i) => i.serviceTitle).join(', ');
    const text =
      `*ASEING CONSULTORA - VISITA TÉCNICA PROGRAMADA Y ENLAZADA*\n\n` +
      `Estimado equipo técnico de ASEING,\n` +
      `Confirmo los detalles de la visita técnica para mi orden:\n\n` +
      `📋 *Nº de Orden:* ${order.orderNumber}\n` +
      `🏢 *Empresa:* ${order.billingInfo.companyName}\n` +
      `📋 *RUC/ID:* ${order.billingInfo.rucOrId}\n` +
      `🛠️ *Servicio(s) Contratado(s):* ${servicesList}\n` +
      `📅 *Fecha de Visita Técnica Enlazada:* ${order.scheduledAuditDate || 'Por coordinar'}\n` +
      `📍 *Dirección:* ${order.billingInfo.address || 'Instalaciones del cliente'}, ${order.billingInfo.city || 'Ecuador'}\n` +
      `💰 *Inversión Total Contratada:* USD $${order.total.toFixed(2)}\n` +
      `💳 *Modalidad de Pago:* ${order.paymentModality === 'deposit_50' ? 'Abono Inicial del 50%' : 'Pago Completo (100%)'}\n` +
      (order.paymentModality === 'deposit_50'
        ? `💵 *Monto Abonado Hoy:* USD $${(order.amountPaidToday ?? (order.total * 0.5)).toFixed(2)}\n⏳ *Saldo Pendiente:* USD $${(order.pendingBalance ?? (order.total * 0.5)).toFixed(2)} (A liquidar contra entrega)\n\n`
        : `\n`) +
      `_Enlace automático validado desde el Portal del Cliente ASEING._`;

    return `https://wa.me/593984661214?text=${encodeURIComponent(text)}`;
  };

  // Format date nicely in Spanish
  const formatScheduledDateSpanish = (dateStr?: string) => {
    if (!dateStr) return 'Por coordinar';
    try {
      const [dPart, tPart] = dateStr.split(' ');
      if (!dPart) return dateStr;
      const [year, month, day] = dPart.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      const formattedDate = dateObj.toLocaleDateString('es-EC', options);
      return `${formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)} a las ${tPart || '09:30'}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#190730] border border-white/20 p-5 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#1ea1c2]/10 border border-[#1ea1c2]/30 text-[11px] font-mono uppercase tracking-wider text-[#1ea1c2]">
              <Sparkles size={12} />
              <span>PORTAL DEL CLIENTE ASEING</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
              Consulta de Órdenes & Comprobantes
            </h3>
            <p className="text-xs text-[#bfa9dc] mt-0.5">
              Enlace automático de visita técnica, estado de servicios y gestión de auditorías.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#bfa9dc] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="space-y-2">
          <label className="block text-xs font-mono text-[#bfa9dc]">
            Ingrese su Número de Orden (ej. <span className="text-white font-bold">ASE-2026-1042</span>) o Correo Electrónico:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-3.5 text-[#bfa9dc]" />
              <input
                type="text"
                required
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ASE-2026-XXXX o correo@empresa.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:border-[#1ea1c2] focus:outline-none focus:ring-1 focus:ring-[#1ea1c2]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#1ea1c2] to-[#3a0ca3] hover:opacity-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-md flex-none"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Consultando...</span>
                </>
              ) : (
                <span>Consultar</span>
              )}
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between text-[11px] text-[#bfa9dc] pt-0.5 gap-2">
            <span>
              Órdenes de prueba: <button type="button" onClick={() => setSearchTerm('ASE-2026-1042')} className="text-[#1ea1c2] hover:underline font-mono font-bold">ASE-1042</button> · <button type="button" onClick={() => setSearchTerm('ASE-2026-4401')} className="text-[#1ea1c2] hover:underline font-mono font-bold">Auditoría $440</button> · <button type="button" onClick={() => setSearchTerm('ASE-2026-2501')} className="text-emerald-400 hover:underline font-mono font-bold">App Compra $250</button> · <button type="button" onClick={() => setSearchTerm('ASE-2026-3001')} className="text-[#1ea1c2] hover:underline font-mono font-bold">App Licencia $30/m</button>
            </span>
            <span className="text-emerald-400 font-mono">● Enlace en tiempo real activo</span>
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="flex-none text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success toast for schedule update */}
        {scheduleSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="flex-none text-emerald-400" />
            <span className="font-semibold">{scheduleSuccessMsg}</span>
          </div>
        )}

        {/* Order Details View & Automated Technical Visit Linking */}
        {order && (
          <div id="printable-receipt" className="space-y-4 pt-2 border-t border-white/10 text-xs">
            {/* Header Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white text-lg font-black">{order.orderNumber}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#bfa9dc] uppercase">
                    {order.paymentModality === 'deposit_50' ? 'ABONO 50%' : order.paymentMethod ? order.paymentMethod.toUpperCase() : 'COMPROBANTE'}
                  </span>
                </div>
                <div className="text-[11px] text-[#bfa9dc]">
                  Fecha de emisión: {new Date(order.createdAt).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase flex items-center gap-1.5 ${
                    order.paymentStatus === 'approved'
                      ? 'bg-[#25d366]/20 text-[#25d366] border border-[#25d366]/30'
                      : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  }`}
                >
                  {order.paymentStatus === 'approved' ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <Clock size={13} />
                  )}
                  <span>
                    {order.paymentStatus === 'approved'
                      ? (order.paymentModality === 'deposit_50' ? 'ABONO 50% REGISTRADO' : 'PAGO COMPLETO APROBADO')
                      : order.paymentStatus === 'pending_verification'
                      ? 'PAGO EN VERIFICACIÓN (PRODUBANCO)'
                      : 'COMPROBANTE GENERADO'}
                  </span>
                </span>
              </div>
            </div>

            {/* HIGH-IMPACT AUTOMATION BLOCK: VISITA TÉCNICA ENLAZADA AUTOMÁTICAMENTE */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1ea1c2]/15 via-[#1c0a37] to-[#3a0ca3]/20 border border-[#1ea1c2]/40 shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#1ea1c2]/20 text-[#1ea1c2] border border-[#1ea1c2]/30">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#1ea1c2] font-bold">
                      ENLACE AUTOMÁTICO DE VISITA TÉCNICA
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white">
                      Visita Técnica Programada del Servicio Contratado
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                    ✓ ENLAZADA AUTOMÁTICAMENTE
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingDate(!isEditingDate)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#bfa9dc] hover:text-white border border-white/10 flex items-center gap-1 text-[11px] font-mono transition-colors"
                    title="Reprogramar o ajustar fecha"
                  >
                    <Edit3 size={13} />
                    <span>{isEditingDate ? 'Cerrar' : 'Ajustar Fecha'}</span>
                  </button>
                </div>
              </div>

              {/* Date & Time Big Banner */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] text-[#bfa9dc]">Fecha y hora de intervención técnica:</div>
                  <div className="text-sm sm:text-base font-bold text-[#1ea1c2] font-mono mt-0.5">
                    {formatScheduledDateSpanish(order.scheduledAuditDate)}
                  </div>
                </div>
                <div className="text-[11px] font-mono text-[#bfa9dc] sm:text-right">
                  <div>Estado: <strong className="text-emerald-400">Agendada y Notificada</strong></div>
                  <div>Asignación: <strong className="text-white">Equipo Técnico ASEING</strong></div>
                </div>
              </div>

              {/* Linked Service Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#f3effa]">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="text-[#bfa9dc] flex items-center gap-1 font-mono text-[10px]">
                    <Briefcase size={12} className="text-[#1ea1c2]" />
                    <span>SERVICIO(S) ENLAZADO(S):</span>
                  </div>
                  <div className="font-semibold text-white">
                    {order.items.map((i) => i.serviceTitle).join(' • ')}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="text-[#bfa9dc] flex items-center gap-1 font-mono text-[10px]">
                    <MapPin size={12} className="text-pink-400" />
                    <span>LUGAR / MODALIDAD:</span>
                  </div>
                  <div className="font-semibold text-white">
                    {order.billingInfo.address ? `${order.billingInfo.address}, ${order.billingInfo.city || ''}` : `Instalaciones del cliente (${order.billingInfo.city || 'Ecuador'})`}
                  </div>
                </div>
              </div>

              {/* Protocol Note */}
              <div className="text-[11px] text-[#bfa9dc] bg-white/[0.02] p-2 rounded-lg border border-white/5 leading-relaxed">
                <strong>Protocolo de visita:</strong> Levantamiento inicial de procesos productivos, auditoría de cumplimiento normativo (ISO/SST/Costos) y definición de hoja de ruta técnica personalizada.
              </div>

              {/* Inline Reschedule / Adjustment Form (Internal & External Automation) */}
              {isEditingDate && (
                <form onSubmit={handleSaveScheduledDate} className="p-3.5 rounded-xl bg-black/40 border border-[#1ea1c2]/50 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs text-white font-bold">
                    <span>Ajustar o Reagendar Visita Técnica:</span>
                    <span className="text-[10px] text-[#bfa9dc] font-mono">Sincronización directa</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-[#bfa9dc] mb-1">Nueva Fecha:</label>
                      <input
                        type="date"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-[#1ea1c2] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-[#bfa9dc] mb-1">Hora Programada:</label>
                      <select
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#1c0a37] border border-white/10 text-white font-mono text-xs focus:border-[#1ea1c2] focus:outline-none"
                      >
                        <option value="09:00">09:00 AM (Primer turno matutino)</option>
                        <option value="09:30">09:30 AM (Recomendado)</option>
                        <option value="11:30">11:30 AM (Turno medio día)</option>
                        <option value="14:30">02:30 PM (Turno vespertino)</option>
                        <option value="16:00">04:00 PM (Turno tarde)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingDate(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-[#bfa9dc] hover:text-white text-xs font-mono"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingDate || !newDate}
                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#1ea1c2] to-[#3a0ca3] text-white text-xs font-bold font-mono hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isSavingDate ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <Check size={13} />
                          <span>Guardar y Enlazar Automáticamente</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* EXTERNAL AUTOMATION BUTTONS: Google Calendar, .ICS download, WhatsApp notification */}
              <div className="pt-1 flex flex-wrap items-center gap-2">
                {/* 1. Google Calendar Direct Sync */}
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center gap-1.5 font-medium transition-colors"
                >
                  <Calendar size={14} className="text-[#1ea1c2]" />
                  <span className="text-[11px]">Añadir a Google Calendar</span>
                  <ExternalLink size={11} className="text-[#bfa9dc]" />
                </a>

                {/* 2. Download .ICS for Apple / Outlook / Mobile */}
                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer"
                >
                  <Download size={14} className="text-emerald-400" />
                  <span className="text-[11px]">Descargar Recordatorio (.ICS)</span>
                </button>

                {/* 3. Confirm via WhatsApp */}
                <a
                  href={getWhatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-[#25d366]/20 hover:bg-[#25d366]/30 border border-[#25d366]/40 text-white flex items-center justify-center gap-1.5 font-medium transition-colors"
                >
                  <ExternalLink size={14} className="text-[#25d366]" />
                  <span className="text-[11px]">Confirmar por WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Client Info Grid */}
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] font-mono text-[#bfa9dc] uppercase">Cliente / Razón Social:</div>
                <div className="text-white font-semibold text-xs sm:text-sm mt-0.5">{order.billingInfo.companyName}</div>
                <div className="text-[#bfa9dc] text-[11px] mt-0.5">RUC / Cédula: <strong className="text-white font-mono">{order.billingInfo.rucOrId}</strong></div>
                {order.billingInfo.legalRepresentative && (
                  <div className="text-[#bfa9dc] text-[11px]">Contacto: {order.billingInfo.legalRepresentative}</div>
                )}
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono text-[#bfa9dc] uppercase">Ubicación y Canales:</div>
                <div className="text-[#bfa9dc] text-[11px]">Email: <span className="text-white">{order.billingInfo.email}</span></div>
                {order.billingInfo.phone && (
                  <div className="text-[#bfa9dc] text-[11px]">Teléfono: <span className="text-white font-mono">{order.billingInfo.phone}</span></div>
                )}
                {order.billingInfo.city && (
                  <div className="text-[#bfa9dc] text-[11px]">Ciudad: <span className="text-white">{order.billingInfo.city}</span></div>
                )}
              </div>
            </div>

            {/* Contracted Services Table */}
            <div className="space-y-1.5 py-1">
              <div className="text-[11px] font-mono text-[#1ea1c2] uppercase font-bold">
                Servicios Contratados en esta Orden:
              </div>
              <div className="space-y-1">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-white p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <div>
                      <div className="font-medium text-xs flex items-center gap-2 flex-wrap">
                        <span>• {it.serviceTitle}</span>
                        {(it.serviceId === 'planificacion-control' || it.serviceTitle.toLowerCase().includes('planificación y control')) && (
                          <span className="px-1.5 py-0.5 rounded bg-[#1ea1c2]/20 text-[#1ea1c2] border border-[#1ea1c2]/30 text-[9px] font-mono font-bold">
                            Pago Único
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#bfa9dc]">
                        {it.serviceId === 'planificacion-control'
                          ? 'Implementación técnica y acompañamiento inicial • Inversión de Pago Único ($380)'
                          : 'Incluye asesoría técnica y visita programada'}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs">USD ${it.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-[#bfa9dc]">
                <span>Subtotal Neto:</span>
                <span>USD ${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Bonificación / Descuento Especial:</span>
                  <span>- USD ${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#bfa9dc]">
                <span>IVA 15% (Ecuador):</span>
                <span>USD ${order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white border-t border-white/10 pt-1.5 text-sm font-bold">
                <span className="text-[#bfa9dc]">Inversión Total Contratada:</span>
                <span className="text-[#1ea1c2] font-black font-mono">USD ${order.total.toFixed(2)}</span>
              </div>
              {order.paymentModality === 'deposit_50' && (
                <div className="pt-2 border-t border-white/10 space-y-1">
                  <div className="flex justify-between text-emerald-400 font-semibold text-xs">
                    <span>Monto Abonado Hoy (50% + IVA):</span>
                    <span className="font-bold font-mono">USD ${(order.amountPaidToday ?? (order.total * 0.5)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-amber-300 font-semibold text-xs">
                    <span>Saldo Pendiente (Contra Entrega):</span>
                    <span className="font-bold font-mono">USD ${(order.pendingBalance ?? (order.total * 0.5)).toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-[#bfa9dc] italic pt-0.5">
                    * El 50% restante será liquidado al finalizar el servicio o entrega de resultados.
                  </div>
                </div>
              )}
            </div>

            {/* Official Fiscal & Tributary Status Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1ea1c2]/15 via-[#18082e] to-[#25d366]/15 border border-[#1ea1c2]/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#1ea1c2]/20 text-[#1ea1c2] border border-[#1ea1c2]/30">
                    <FileCode size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#1ea1c2] font-bold">
                      COMPROBANTE ELECTRÓNICO DIGITAL • CONTROL SRI
                    </div>
                    <div className="text-xs font-bold text-white">
                      ASEING CONSULTORÍA INDUSTRIAL • RUC: 1803227857001
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  REGISTRO TRIBUTARIO VALIDADOR
                </span>
              </div>

              {/* Strict SRI Legal Clarification */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] leading-relaxed">
                <strong>Aviso Legal y Tributario:</strong> La plataforma web emite este Comprobante Digital de Orden y Abono/Pago. La Factura Electrónica oficial autorizada por el SRI es generada directamente por el departamento contable de ASEING a través del portal externo del SRI tras liquidar o conciliar el saldo, y enviada con sus archivos autorizados (.xml / .pdf) a su correo registrado.
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-1 font-mono text-[11px] text-[#bfa9dc]">
                <div className="flex justify-between">
                  <span>RUC Emisor Oficial:</span>
                  <strong className="text-white">1803227857001</strong>
                </div>
                <div className="flex justify-between">
                  <span>Dirección Técnica:</span>
                  <span className="text-white">Ing. John F. Suárez J. M.Sc.</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between text-[#bfa9dc] gap-1 pt-1 border-t border-white/10">
                  <span>Envío automático a:</span>
                  <strong className="text-emerald-400 truncate">{order.billingInfo.email}</strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {order.paymentStatus === 'approved' ? (
                  <>
                    <a
                      href={`/api/orders/${order.orderNumber}/pdf`}
                      download={`Comprobante-ASEING-${order.orderNumber}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#1ea1c2]/30 via-[#3a0ca3]/30 to-[#b80068]/30 hover:opacity-95 text-white border border-[#1ea1c2]/40 font-mono text-[11px] flex items-center gap-1.5 transition-colors"
                    >
                      <Download size={13} className="text-[#1ea1c2]" />
                      <span>Descargar Comprobante PDF</span>
                    </a>

                    <button
                      type="button"
                      disabled={isSendingEmail}
                      onClick={() => handleSendNotification(order.orderNumber)}
                      className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Send size={12} className={isSendingEmail ? 'animate-pulse text-[#1ea1c2]' : 'text-emerald-400'} />
                      <span>{isSendingEmail ? 'Enviando comprobante...' : 'Reenviar a mi Correo'}</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[11px] font-mono">
                    <Clock size={14} className="text-amber-300 shrink-0" />
                    <span>Transferencia en Verificación: El comprobante oficial PDF se habilitará una vez conciliado el abono.</span>
                  </div>
                )}

                <a
                  href={`/api/orders/${order.orderNumber}/sri-invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-[#1ea1c2]/20 hover:bg-[#1ea1c2]/30 text-[#1ea1c2] border border-[#1ea1c2]/30 font-mono text-[11px] flex items-center gap-1.5 transition-colors"
                >
                  <FileCode size={12} />
                  <span>Referencia Fiscal XML</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              {emailNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={14} className="flex-none text-emerald-400" />
                  <span>{emailNotice}</span>
                </div>
              )}
            </div>

            {/* Verification Token / Digital Receipt Proof */}
            {order.payphoneReceiptToken && (
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px] font-mono text-[#bfa9dc]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Comprobante Digital Token:</span>
                </div>
                <span className="text-white font-bold">{order.payphoneReceiptToken}</span>
              </div>
            )}

            {/* Printable Footnote for Print View */}
            <div className="hidden print:block pt-4 border-t border-gray-300 text-[10px] text-gray-600">
              <p>Este documento constituye el comprobante oficial de orden y enlace de visita técnica emitido por el sistema automatizado de ASEING Consultores. Dirección Técnica: Profesionales con experiencia en diferentes áreas. Ambato, Ecuador.</p>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
              >
                <Printer size={15} />
                <span>Imprimir Comprobante & Constancia</span>
              </button>
              <a
                href={getWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-all shadow"
              >
                <span>Atención Técnica Directa</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
