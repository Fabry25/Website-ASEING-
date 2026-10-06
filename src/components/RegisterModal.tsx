import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Mail,
  Building2,
  User,
  Phone,
  Briefcase,
  Layers,
  FileText,
  Code2,
  Copy,
  Check,
  Settings2,
  ExternalLink,
  MessageCircle,
  RotateCcw,
  UserPlus,
  Sparkles
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

// Validaciones en tiempo real para correo electrónico y teléfono
export const validateEmail = (email: string): string | null => {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'El correo electrónico es requerido.';
  }
  if (/\s/.test(trimmed)) {
    return 'El correo no debe contener espacios en blanco.';
  }
  if (!trimmed.includes('@')) {
    return 'Debe incluir el símbolo "@" (ej. contacto@empresa.com).';
  }
  const parts = trimmed.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return 'Formato de correo incompleto (ej. contacto@empresa.com).';
  }
  if (!parts[1].includes('.')) {
    return 'El dominio del correo debe incluir una extensión válida (ej. .com, .ec).';
  }
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Ingrese un formato de correo válido (ej. contacto@empresa.com).';
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  const trimmed = phone.trim();
  if (!trimmed) {
    return 'El número telefónico o WhatsApp es requerido.';
  }
  if (/[^0-9+\s\-().]/.test(trimmed)) {
    return 'Solo se admiten números, signo "+" y separadores (- o espacios).';
  }
  if (trimmed.includes('+')) {
    if (trimmed.indexOf('+') !== 0 || (trimmed.match(/\+/g) || []).length > 1) {
      return 'El signo "+" solo puede ir al inicio como código internacional.';
    }
  }
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 7) {
    return 'El número es muy corto (mínimo 7 dígitos numéricos).';
  }
  if (digitsOnly.length > 15) {
    return 'El número excede el límite internacional estándar (máximo 15 dígitos).';
  }
  if (trimmed.startsWith('09') && digitsOnly.length !== 10) {
    return 'Un celular ecuatoriano (09...) debe tener exactamente 10 dígitos (ej. 0984661214).';
  }
  if (trimmed.startsWith('+593') && digitsOnly.length < 11) {
    return 'Formato ecuatoriano internacional incompleto (ej. +593 984 661 214).';
  }
  return null;
};

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  defaultService = 'Diagnóstico Inicial'
}) => {
  const initialFormState = {
    nombre: '',
    empresa: '',
    correo: '',
    telefono: '',
    cargo: '',
    servicioInteres: defaultService,
    mensaje: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [touched, setTouched] = useState<{
    nombre?: boolean;
    empresa?: boolean;
    correo?: boolean;
    telefono?: boolean;
  }>({});

  const [submittedLeadSummary, setSubmittedLeadSummary] = useState({
    nombre: '',
    empresa: '',
    correo: '',
    telefono: '',
    servicioInteres: ''
  });

  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const isSubmittingRef = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err' | 'info'; text: string } | null>(null);

  // Validación en tiempo real
  const emailError = validateEmail(formData.correo);
  const phoneError = validatePhone(formData.telefono);
  const isEmailDirty = formData.correo.trim().length > 0;
  const isPhoneDirty = formData.telefono.trim().length > 0;

  const showEmailError = Boolean((touched.correo || isEmailDirty) && emailError);
  const isEmailValid = Boolean(isEmailDirty && !emailError);

  const showPhoneError = Boolean((touched.telefono || isPhoneDirty) && phoneError);
  const isPhoneValid = Boolean(isPhoneDirty && !phoneError);

  const handleBlur = (field: 'nombre' | 'empresa' | 'correo' | 'telefono') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Función para encerar y limpiar por completo el formulario
  const resetForm = () => {
    isSubmittingRef.current = false;
    setIsSent(false);
    setLoading(false);
    setFormData({
      nombre: '',
      empresa: '',
      correo: '',
      telefono: '',
      cargo: '',
      servicioInteres: defaultService || 'Diagnóstico Inicial',
      mensaje: ''
    });
    setTouched({});
    setSubmitted(false);
    setStatusMsg(null);
  };

  // Google Apps Script Webhook URL oficial de ASEING (Fallback de respaldo)
  const scriptUrl =
    import.meta.env.VITE_GOOGLE_SCRIPT_URL && import.meta.env.VITE_GOOGLE_SCRIPT_URL !== '...'
      ? import.meta.env.VITE_GOOGLE_SCRIPT_URL
      : 'https://script.google.com/macros/s/AKfycbyNHSVfUwWoUG_hq0ESP6DqLoXecaK9trHwEsDCbVHn3A-o6MrX-9xL6N1_-2ffPYgDnA/exec';

  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('aseing_gas_webhook_url')?.trim();
      // Si existe un rastro de la URL anterior, limpiarlo de inmediato
      if (
        stored &&
        (stored.includes('...') ||
          stored.includes('AKfycbxbg9muIaVtB') ||
          stored !== scriptUrl ||
          !stored.startsWith('https://'))
      ) {
        localStorage.removeItem('aseing_gas_webhook_url');
        return scriptUrl;
      }
      return stored || scriptUrl;
    } catch (_) {
      return scriptUrl;
    }
  });
  const [showConfig, setShowConfig] = useState(false);
  const [showScriptCode, setShowScriptCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (defaultService) {
      setFormData((prev) => ({ ...prev, servicioInteres: defaultService }));
    }
  }, [defaultService]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveWebhook = (url: string) => {
    const cleanUrl = url.trim();
    setWebhookUrl(cleanUrl);
    localStorage.setItem('aseing_gas_webhook_url', cleanUrl);
    setShowConfig(false);
    setStatusMsg({
      type: 'info',
      text: 'URL de Webhook actualizada exitosamente en el navegador.'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Inmediata prevención síncrona contra doble clic y doble envío concurrente
    if (isSubmittingRef.current || isSent || loading) {
      return;
    }

    // Verificación estricta en tiempo real antes de procesar el envío
    const currentEmailErr = validateEmail(formData.correo);
    const currentPhoneErr = validatePhone(formData.telefono);
    const currentNameErr = !formData.nombre.trim() ? 'El nombre completo es requerido.' : null;
    const currentCompanyErr = !formData.empresa.trim() ? 'La empresa u organización es requerida.' : null;

    if (currentEmailErr || currentPhoneErr || currentNameErr || currentCompanyErr) {
      setTouched({
        nombre: true,
        empresa: true,
        correo: true,
        telefono: true
      });

      const firstErrorDetail = currentEmailErr
        ? `Correo inválido: ${currentEmailErr}`
        : currentPhoneErr
        ? `Teléfono inválido: ${currentPhoneErr}`
        : currentNameErr
        ? `Nombre obligatorio: ${currentNameErr}`
        : `Empresa obligatoria: ${currentCompanyErr}`;

      setStatusMsg({
        type: 'err',
        text: `Envío detenido. ${firstErrorDetail}`
      });

      // Enfocar automáticamente el primer campo que requiere atención
      if (currentNameErr) {
        document.getElementById('input-register-nombre')?.focus();
      } else if (currentCompanyErr) {
        document.getElementById('input-register-empresa')?.focus();
      } else if (currentEmailErr) {
        document.getElementById('input-register-correo')?.focus();
      } else if (currentPhoneErr) {
        document.getElementById('input-register-telefono')?.focus();
      }
      return;
    }

    // BLOQUEO INSTANTÁNEO AL MOMENTO DEL CLIC:
    // El botón cambia inmediatamente a "Enviado", se deshabilita y se bloquea el puntero
    isSubmittingRef.current = true;
    setIsSent(true);
    setLoading(true);
    setStatusMsg(null);

    // Limpiar cualquier rastro de la URL anterior en el localStorage antes de enviar la petición
    try {
      const stored = localStorage.getItem('aseing_gas_webhook_url');
      if (
        stored &&
        (stored.includes('...') ||
          stored.includes('AKfycbxbg9muIaVtB') ||
          stored !== scriptUrl ||
          !stored.startsWith('https://'))
      ) {
        localStorage.removeItem('aseing_gas_webhook_url');
      }
    } catch (_) {}

    const targetGasUrl = scriptUrl;
    const submissionPayload = {
      ...formData,
      webhookUrl: targetGasUrl,
      fechaEnvio: new Date().toISOString(),
      origen: 'Web ASEING - Modal Registro y Consulta',
      cuentaGestion: 'aseingerencia1@gmail.com',
      hojaDestino: 'Proyecto Web 1'
    };

    let success = false;
    let errorMessage = '';

    // VÍA ÚNICA CENTRALIZADA:
    // Se envía exclusivamente al backend /api/leads para persistencia y ejecución estricta del Webhook de Google Apps Script.
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        success = true;
      } else {
        errorMessage = data?.error || `Error en el servidor (HTTP ${res.status}): No se pudo procesar el registro ni sincronizar con Google Apps Script.`;
      }
    } catch (err: any) {
      console.error('[ASEING] Error en llamada a /api/leads:', err);
      errorMessage = err?.message || 'Error de conexión con el servidor. Por favor verifique su conexión a internet.';
    }

    setLoading(false);

    if (success) {
      // Guardar respaldo de los datos enviados para la confirmación en pantalla
      setSubmittedLeadSummary({
        nombre: formData.nombre,
        empresa: formData.empresa,
        correo: formData.correo,
        telefono: formData.telefono,
        servicioInteres: formData.servicioInteres
      });

      // ENCERAR Y BORRAR COMPLETAMENTE LOS DATOS DEL FORMULARIO
      setFormData({
        nombre: '',
        empresa: '',
        correo: '',
        telefono: '',
        cargo: '',
        servicioInteres: defaultService || 'Diagnóstico Inicial',
        mensaje: ''
      });

      setSubmitted(true);
      setStatusMsg({
        type: 'ok',
        text: '¡Solicitud enviada con éxito! Se registró en la hoja "Proyecto Web 1" y se envió un correo único de confirmación.'
      });
    } else {
      // Si ocurrió un error en la red, restablecer el botón para permitir reintento
      isSubmittingRef.current = false;
      setIsSent(false);
      setStatusMsg({
        type: 'err',
        text: errorMessage || 'No se pudo completar el envío. Por favor, intente nuevamente o contáctenos por WhatsApp.'
      });
    }
  };

  const handleCopyScript = () => {
    const code = `function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var rawData = e.postData ? e.postData.contents : "";
    var data = rawData ? JSON.parse(rawData) : (e.parameter || {});
    var fecha = Utilities.formatDate(new Date(), "America/Guayaquil", "dd/MM/yyyy HH:mm:ss");
    
    var fileName = "Proyecto Web 1";
    var files = DriveApp.getFilesByName(fileName);
    var spreadsheet = files.hasNext() ? SpreadsheetApp.open(files.next()) : SpreadsheetApp.create(fileName);
    var sheet = spreadsheet.getSheetByName("Proyecto Web 1") || spreadsheet.getSheets()[0];
    sheet.setName("Proyecto Web 1");

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Fecha y Hora", "Nombre", "Empresa", "Correo", "Teléfono", "Cargo", "Servicio", "Mensaje", "Estado"]);
      sheet.getRange(1, 1, 1, 9).setBackground("#18082e").setFontColor("#ffffff").setFontWeight("bold");
    }

    sheet.appendRow([fecha, data.nombre, data.empresa, data.correo, data.telefono, data.cargo, data.servicioInteres, data.mensaje, "Nuevo"]);

    if (data.correo) {
      MailApp.sendEmail({
        to: data.correo,
        subject: "ASEING | Confirmación de Solicitud: " + (data.servicioInteres || "Consulta Técnica"),
        body: "Estimado(a) " + data.nombre + ",\\n\\nHemos recibido su solicitud para la empresa " + data.empresa + ". Un ingeniero se comunicará en breve.\\n\\nWhatsApp: +593 984 661 214\\nDirección Técnica: Profesionales con experiencia en diferentes áreas\\naseingerencia1@gmail.com",
        name: "ASEING Consultoría",
        replyTo: "aseingerencia1@gmail.com"
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}`;

    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#190730] border border-white/20 p-5 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 select-none">
          <div
            onDoubleClick={() => setShowConfig((prev) => !prev)}
            className="cursor-default"
            title=""
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1ea1c2] animate-ping" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#1ea1c2]">
                ATENCIÓN & EVALUACIÓN TÉCNICA
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
              Registro y Consulta Técnica
            </h3>
            <p className="text-xs text-[#bfa9dc] mt-0.5">
              Dirección Técnica: <strong>Profesionales con experiencia en diferentes áreas</strong> · Ambato, Ecuador
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              className="p-2 rounded-xl text-[#bfa9dc] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Optional Webhook Configuration Bar (Acceso Oculto de Administración) */}
        {showConfig && (
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-[#1ea1c2]/30 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1ea1c2]">
                <Settings2 size={15} />
                <span>CONFIGURACIÓN PRIVADA DE WEBHOOK (ADMIN)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowScriptCode(!showScriptCode)}
                  className="text-[11px] font-mono text-[#bfa9dc] hover:text-white flex items-center gap-1 underline"
                >
                  <Code2 size={13} />
                  <span>{showScriptCode ? 'Ocultar código .gs' : 'Ver código .gs'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfig(false)}
                  className="text-[11px] font-mono text-rose-300 hover:text-rose-200 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20"
                >
                  Ocultar
                </button>
              </div>
            </div>
            <p className="text-[11px] text-[#bfa9dc] leading-relaxed">
              Al enviar el formulario, los datos se registrarán en la hoja{' '}
              <strong className="text-white">"Proyecto Web 1"</strong> y se enviará la confirmación por correo desde{' '}
              <strong className="text-[#1ea1c2]">aseingerencia1@gmail.com</strong>.
            </p>

            <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-[11.5px] text-amber-200/90 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-300">
                <span>¿Por qué no aparece aún la hoja en tu Google Drive?</span>
              </div>
              <p className="text-[11px] text-amber-100/80 leading-relaxed">
                Google Sheets solo genera el archivo <strong>"Proyecto Web 1"</strong> en el momento en que se ejecuta el script por primera vez. Puedes crearla de 2 formas:
              </p>
              <ol className="list-decimal pl-4 space-y-0.5 text-[10.5px] text-amber-100/90 font-mono">
                <li>
                  <strong>Crearla tú mismo:</strong> Ve a <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-white underline">sheets.new</a> con tu cuenta <span className="text-[#1ea1c2]">aseingerencia1@gmail.com</span> y renómbrala exactamente a: <span className="bg-black/40 px-1 py-0.5 rounded text-white font-bold">Proyecto Web 1</span>.
                </li>
                <li>
                  <strong>Crearla desde Apps Script:</strong> En tu editor de Google Apps Script, selecciona la función <span className="bg-black/40 px-1 py-0.5 rounded text-emerald-300">crearOVerificarHojaPrueba</span> y haz clic en <strong>Ejecutar</strong>. ¡Aparecerá el enlace directo en pantalla!
                </li>
              </ol>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:border-[#1ea1c2] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSaveWebhook(webhookUrl)}
                className="px-4 py-2 rounded-xl bg-[#1ea1c2] hover:bg-[#1ea1c2]/90 text-white text-xs font-bold font-mono cursor-pointer"
              >
                Guardar URL
              </button>
            </div>

            {/* Code Snippet Viewer */}
            {showScriptCode && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#bfa9dc]">
                  <span>Código para pegar en Google Apps Script (Code.gs):</span>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="flex items-center gap-1 text-[#1ea1c2] hover:underline"
                  >
                    {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedCode ? '¡Copiado!' : 'Copiar script'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/50 border border-white/10 text-[10.5px] font-mono text-emerald-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {`// Hoja destino: "Proyecto Web 1"
// Correo: aseingerencia1@gmail.com (MailApp.sendEmail)
// Archivo completo disponible en: google-apps-script/Code.gs`}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Status Alert */}
        {statusMsg && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
              statusMsg.type === 'ok'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : statusMsg.type === 'info'
                ? 'bg-[#1ea1c2]/10 border border-[#1ea1c2]/30 text-[#1ea1c2]'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMsg.type === 'ok' ? (
              <CheckCircle2 size={17} className="flex-none mt-0.5" />
            ) : (
              <AlertCircle size={17} className="flex-none mt-0.5" />
            )}
            <span className="leading-relaxed">{statusMsg.text}</span>
          </div>
        )}

        {/* Success View */}
        {submitted ? (
          <div className="py-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#25d366]/20 border border-[#25d366]/40 text-[#25d366] flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-bold text-white">¡Registro y Consulta Recibidos!</h4>
              <p className="text-xs sm:text-sm text-[#bfa9dc] max-w-md mx-auto leading-relaxed">
                Los datos fueron procesados para la empresa <strong className="text-white">{submittedLeadSummary.empresa || 'su empresa'}</strong>.
                {submittedLeadSummary.correo && (
                  <>
                    {' '}Se ha disparado la confirmación al correo <strong className="text-[#1ea1c2]">{submittedLeadSummary.correo}</strong>.
                  </>
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 max-w-md mx-auto text-left text-xs space-y-1.5 font-mono">
              <div className="text-[#1ea1c2] text-[11px] font-bold uppercase">Resumen del registro enviado:</div>
              <div className="text-white">• Servicio: {submittedLeadSummary.servicioInteres}</div>
              <div className="text-white">• Contacto: {submittedLeadSummary.nombre} ({submittedLeadSummary.telefono})</div>
              <div className="text-[#bfa9dc]">• Hoja de destino: Proyecto Web 1 (Google Sheets)</div>
            </div>

            <p className="text-xs text-emerald-400 font-mono">
              ✓ El formulario ha sido encerado y vaciado para un nuevo ingreso.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                id="btn-register-another-lead"
                onClick={resetForm}
                className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs text-white bg-gradient-to-r from-[#1ea1c2] to-[#3a0ca3] hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#1ea1c2]/20"
              >
                <UserPlus size={15} />
                <span>Registrar Otro Cliente Nuevo</span>
              </button>

              <a
                href={`https://wa.me/593984661214?text=${encodeURIComponent(
                  `Hola ASEING, acabo de registrar mi consulta para ${submittedLeadSummary.empresa} (${submittedLeadSummary.nombre}) sobre ${submittedLeadSummary.servicioInteres}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2"
              >
                <MessageCircle size={15} />
                <span>Confirmar por WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-xs text-[#bfa9dc] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs sm:text-sm font-medium text-[#bfa9dc]">
              Complete los datos para solicitar una propuesta o diagnóstico para su Empresa.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="input-register-nombre" className="block text-xs font-mono text-[#bfa9dc] mb-1.5">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className={`absolute left-3.5 top-3 transition-colors ${
                      touched.nombre && !formData.nombre.trim() ? 'text-rose-400' : 'text-[#bfa9dc]'
                    }`}
                  />
                  <input
                    id="input-register-nombre"
                    type="text"
                    required
                    placeholder="Ej. Ing. Marco Salazar"
                    value={formData.nombre}
                    onChange={(e) => {
                      setFormData({ ...formData, nombre: e.target.value });
                      if (!touched.nombre && e.target.value.length > 0) {
                        setTouched((prev) => ({ ...prev, nombre: true }));
                      }
                    }}
                    onBlur={() => handleBlur('nombre')}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 text-white text-xs transition-colors focus:outline-none ${
                      touched.nombre && !formData.nombre.trim()
                        ? 'border border-rose-500/80 bg-rose-500/[0.08] focus:border-rose-400'
                        : 'border border-white/10 focus:border-[#1ea1c2]'
                    }`}
                  />
                </div>
                {touched.nombre && !formData.nombre.trim() && (
                  <p className="text-[11px] text-rose-300 mt-1 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle size={12} className="text-rose-400 shrink-0" />
                    El nombre completo es requerido.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="input-register-empresa" className="block text-xs font-mono text-[#bfa9dc] mb-1.5">
                  Empresa u Organización *
                </label>
                <div className="relative">
                  <Building2
                    size={15}
                    className={`absolute left-3.5 top-3 transition-colors ${
                      touched.empresa && !formData.empresa.trim() ? 'text-rose-400' : 'text-[#bfa9dc]'
                    }`}
                  />
                  <input
                    id="input-register-empresa"
                    type="text"
                    required
                    placeholder="Ej. Calzado Andino Cía. Ltda."
                    value={formData.empresa}
                    onChange={(e) => {
                      setFormData({ ...formData, empresa: e.target.value });
                      if (!touched.empresa && e.target.value.length > 0) {
                        setTouched((prev) => ({ ...prev, empresa: true }));
                      }
                    }}
                    onBlur={() => handleBlur('empresa')}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 text-white text-xs transition-colors focus:outline-none ${
                      touched.empresa && !formData.empresa.trim()
                        ? 'border border-rose-500/80 bg-rose-500/[0.08] focus:border-rose-400'
                        : 'border border-white/10 focus:border-[#1ea1c2]'
                    }`}
                  />
                </div>
                {touched.empresa && !formData.empresa.trim() && (
                  <p className="text-[11px] text-rose-300 mt-1 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle size={12} className="text-rose-400 shrink-0" />
                    La empresa u organización es requerida.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="input-register-correo" className="block text-xs font-mono text-[#bfa9dc]">
                    Correo Electrónico *
                  </label>
                  {isEmailValid && (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 font-mono animate-in fade-in">
                      <CheckCircle2 size={12} />
                      Correo válido
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail
                    size={15}
                    className={`absolute left-3.5 top-3 transition-colors ${
                      showEmailError
                        ? 'text-rose-400'
                        : isEmailValid
                        ? 'text-emerald-400'
                        : 'text-[#bfa9dc]'
                    }`}
                  />
                  <input
                    id="input-register-correo"
                    type="email"
                    required
                    placeholder="nombre@empresa.com"
                    value={formData.correo}
                    onChange={(e) => {
                      setFormData({ ...formData, correo: e.target.value });
                      if (!touched.correo && e.target.value.length > 0) {
                        setTouched((prev) => ({ ...prev, correo: true }));
                      }
                    }}
                    onBlur={() => handleBlur('correo')}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 text-white text-xs transition-all focus:outline-none ${
                      showEmailError
                        ? 'border border-rose-500/80 bg-rose-500/[0.08] focus:border-rose-400 focus:ring-1 focus:ring-rose-500/40'
                        : isEmailValid
                        ? 'border border-emerald-500/60 bg-emerald-500/[0.05] focus:border-emerald-400'
                        : 'border border-white/10 focus:border-[#1ea1c2]'
                    }`}
                    aria-invalid={showEmailError}
                    aria-describedby={showEmailError ? 'correo-error' : undefined}
                  />
                  {showEmailError && (
                    <AlertCircle size={15} className="absolute right-3.5 top-3 text-rose-400 pointer-events-none animate-in fade-in" />
                  )}
                  {isEmailValid && (
                    <Check size={15} className="absolute right-3.5 top-3 text-emerald-400 pointer-events-none animate-in fade-in" />
                  )}
                </div>
                {showEmailError ? (
                  <div id="correo-error" className="flex items-center gap-1.5 mt-1.5 text-[11.5px] text-rose-300 animate-in fade-in duration-150" role="alert">
                    <AlertCircle size={13} className="shrink-0 text-rose-400" />
                    <span>{emailError}</span>
                  </div>
                ) : (
                  <span className="text-[10.5px] text-[#bfa9dc]/70 mt-1 block">
                    Aquí recibirá la autorespuesta automática de confirmación.
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="input-register-telefono" className="block text-xs font-mono text-[#bfa9dc]">
                    Teléfono / Celular / WhatsApp *
                  </label>
                  {isPhoneValid && (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 font-mono animate-in fade-in">
                      <CheckCircle2 size={12} />
                      Número verificado
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone
                    size={15}
                    className={`absolute left-3.5 top-3 transition-colors ${
                      showPhoneError
                        ? 'text-rose-400'
                        : isPhoneValid
                        ? 'text-emerald-400'
                        : 'text-[#bfa9dc]'
                    }`}
                  />
                  <input
                    id="input-register-telefono"
                    type="tel"
                    required
                    placeholder="+593 984 661 214 o 0984661214"
                    value={formData.telefono}
                    onChange={(e) => {
                      setFormData({ ...formData, telefono: e.target.value });
                      if (!touched.telefono && e.target.value.length > 0) {
                        setTouched((prev) => ({ ...prev, telefono: true }));
                      }
                    }}
                    onBlur={() => handleBlur('telefono')}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 text-white text-xs font-mono transition-all focus:outline-none ${
                      showPhoneError
                        ? 'border border-rose-500/80 bg-rose-500/[0.08] focus:border-rose-400 focus:ring-1 focus:ring-rose-500/40'
                        : isPhoneValid
                        ? 'border border-emerald-500/60 bg-emerald-500/[0.05] focus:border-emerald-400'
                        : 'border border-white/10 focus:border-[#1ea1c2]'
                    }`}
                    aria-invalid={showPhoneError}
                    aria-describedby={showPhoneError ? 'telefono-error' : undefined}
                  />
                  {showPhoneError && (
                    <AlertCircle size={15} className="absolute right-3.5 top-3 text-rose-400 pointer-events-none animate-in fade-in" />
                  )}
                  {isPhoneValid && (
                    <Check size={15} className="absolute right-3.5 top-3 text-emerald-400 pointer-events-none animate-in fade-in" />
                  )}
                </div>
                {showPhoneError ? (
                  <div id="telefono-error" className="flex items-center gap-1.5 mt-1.5 text-[11.5px] text-rose-300 animate-in fade-in duration-150" role="alert">
                    <AlertCircle size={13} className="shrink-0 text-rose-400" />
                    <span>{phoneError}</span>
                  </div>
                ) : (
                  <span className="text-[10.5px] text-[#bfa9dc]/70 mt-1 block">
                    Admite formato nacional (09...) o internacional (+593...).
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#bfa9dc] mb-1.5">
                  Cargo o Área en la Planta
                </label>
                <div className="relative">
                  <Briefcase size={15} className="absolute left-3.5 top-3 text-[#bfa9dc]" />
                  <input
                    type="text"
                    placeholder="Ej. Gerente de Operaciones / Jefe de Planta"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#1ea1c2] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#bfa9dc] mb-1.5">
                  Servicio de Mayor Interés *
                </label>
                <div className="relative">
                  <Layers size={15} className="absolute left-3.5 top-3 text-[#bfa9dc]" />
                  <select
                    value={formData.servicioInteres}
                    onChange={(e) => setFormData({ ...formData, servicioInteres: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#1c0a37] border border-white/10 text-white text-xs focus:border-[#1ea1c2] focus:outline-none transition-colors"
                  >
                    <option value="Diagnóstico Inicial">Diagnóstico Inicial de Procesos Productivos ($30)</option>
                    <option value="Planificación PCP">Planificación y Control de Producción (PCP)</option>
                    <option value="Tiempos y Costos">Estudio de Tiempos, Movimientos y Costeo</option>
                    <option value="Auditoría Interna y Pre-Auditoría">Auditoría Interna y Pre-Auditoría de Certificación ($440)</option>
                    <option value="ISO 9001">ISO 9001:2026 (Gestión de la Calidad)</option>
                    <option value="ISO 14001">ISO 14001:2026 (Gestión Ambiental)</option>
                    <option value="ISO 45001">ISO 45001:2018 (Seguridad y Salud SST)</option>
                    <option value="Paquete Trinorma">Paquete Trinorma Integrado (ISO 9001:2026 + 14001:2026 + 45001)</option>
                    <option value="App Producción - Compra ($4.300)">App de Planificación y Control de Producción (Compra de App: USD $4.300)</option>
                    <option value="App Producción - Licencia ($92/mes)">App de Planificación y Control de Producción (Licencia Mensual: USD $92/mes por 3 usuarios)</option>
                    <option value="Asesoría Inversión Financiera">Asesoría en Inversión en Mercados Financieros ($280 - Pago Único)</option>
                    <option value="Nipponflex">Sesión de Bienestar Laboral Nipponflex</option>
                  </select>
                </div>
                <div className="mt-1.5 text-[11px] text-emerald-300 font-mono flex items-start gap-1">
                  <Sparkles size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Condición de Pago: Si contrata cualquier ítem del catálogo, el valor del Diagnóstico Inicial no se cobrará ($0.00).</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#bfa9dc] mb-1.5">
                Detalles del Requerimiento o Consulta
              </label>
              <textarea
                rows={3}
                placeholder="Indique brevemente el número de operarios, líneas productivas, o fecha prevista para su auditoría..."
                value={formData.mensaje}
                onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#1ea1c2] focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Banner de Validación en Tiempo Real */}
            {(showEmailError || showPhoneError) ? (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-rose-300">Envío bloqueado hasta corregir los datos:</p>
                  <ul className="list-disc list-inside text-[11.5px] text-rose-200/90 space-y-0.5">
                    {showEmailError && <li>{emailError}</li>}
                    {showPhoneError && <li>{phoneError}</li>}
                  </ul>
                </div>
              </div>
            ) : isEmailValid && isPhoneValid && formData.nombre.trim() && formData.empresa.trim() ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span className="text-[11.5px]">
                  Correo y teléfono validados en tiempo real. Listo para enviar al Webhook y guardar en Google Sheets.
                </span>
              </div>
            ) : null}

            {/* Submit & Reset Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                id="btn-modal-reset-lead"
                onClick={resetForm}
                disabled={loading || isSent}
                className="order-2 sm:order-1 px-5 py-3 rounded-full text-xs font-semibold text-[#bfa9dc] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={14} />
                <span>Encerar y Limpiar</span>
              </button>

              <button
                id="btn-modal-submit-lead"
                type="submit"
                disabled={loading || isSent || Boolean(showEmailError || showPhoneError)}
                className={`order-1 sm:order-2 flex-1 py-3.5 rounded-full font-bold text-xs text-white shadow-xl flex items-center justify-center gap-2 transition-all ${
                  isSent
                    ? 'bg-emerald-600 shadow-emerald-500/25 cursor-not-allowed pointer-events-none opacity-95 scale-[0.99]'
                    : Boolean(showEmailError || showPhoneError)
                    ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
                    : 'bg-gradient-to-r from-[#b80068] via-[#4e0477] to-[#3a0ca3] hover:opacity-95 shadow-[#b80068]/20 cursor-pointer active:scale-95 disabled:opacity-50'
                }`}
              >
                {isSent ? (
                  <span className="flex items-center gap-2 animate-in zoom-in-95 duration-150">
                    <CheckCircle2 size={16} className="text-white" />
                    <span className="text-white font-extrabold tracking-wide uppercase">Enviado</span>
                  </span>
                ) : loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Conectando y enviando...</span>
                  </span>
                ) : (
                  <>
                    <Send size={15} />
                    <span>
                      {Boolean(showEmailError || showPhoneError)
                        ? 'Corrija los campos antes de enviar'
                        : 'Registrar Solicitud & Enviar Consulta'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
