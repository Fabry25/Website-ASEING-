import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  QrCode,
  Building2,
  Lock,
  CheckCircle2,
  Printer,
  ExternalLink,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileText,
  Copy,
  Check,
  Trash2,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Plus,
  Shield,
  Mail,
  Send,
  FileCode,
  Download,
  XCircle,
  Upload,
  Clock,
  Zap,
  CheckCheck
} from 'lucide-react';
import { ServiceItem, Order, PaymentMethod, PaymentModality } from '../types';
import { SERVICES_CATALOG, BANK_TRANSFER_DETAILS, PAYPHONE_CONFIG, FAQ_ITEMS } from '../data/servicesData';
import { DynamicPaymentQR } from './DynamicPaymentQR';

// Códigos oficiales de provincias según el SRI del Ecuador (01 a 24, más 30 exterior)
export const ECUADOR_PROVINCES: Record<string, string> = {
  '01': 'Azuay',
  '02': 'Bolívar',
  '03': 'Cañar',
  '04': 'Carchi',
  '05': 'Cotopaxi',
  '06': 'Chimborazo',
  '07': 'El Oro',
  '08': 'Esmeraldas',
  '09': 'Guayas',
  '10': 'Imbabura',
  '11': 'Loja',
  '12': 'Los Ríos',
  '13': 'Manabí',
  '14': 'Morona Santiago',
  '15': 'Napo',
  '16': 'Pastaza',
  '17': 'Pichincha',
  '18': 'Tungurahua',
  '19': 'Zamora Chinchipe',
  '20': 'Galápagos',
  '21': 'Sucumbíos',
  '22': 'Orellana',
  '23': 'Santo Domingo de los Tsáchilas',
  '24': 'Santa Elena',
  '30': 'Ecuatorianos en el Exterior'
};

export interface SriIdValidationResult {
  isValid: boolean;
  type: 'cédula' | 'ruc_natural' | 'ruc_privada' | 'ruc_publica' | 'invalido';
  label: string;
  province?: string;
  errorMessage?: string;
  successMessage?: string;
}

// Algoritmo Estricto de Verificación Tributaria SRI Ecuador (Cédula y RUC con Módulo 10 y Módulo 11)
export const validateSriEcuadorId = (value: string): SriIdValidationResult => {
  const clean = (value || '').trim();
  if (!clean) {
    return {
      isValid: false,
      type: 'invalido',
      label: 'Pendiente',
      errorMessage: 'El RUC o Cédula es obligatorio para la emisión electrónica del SRI.'
    };
  }

  if (!/^\d+$/.test(clean)) {
    return {
      isValid: false,
      type: 'invalido',
      label: 'No Numérico',
      errorMessage: 'Debe contener exclusivamente números (no se permiten letras ni signos).'
    };
  }

  if (clean.length !== 10 && clean.length !== 13) {
    return {
      isValid: false,
      type: 'invalido',
      label: `${clean.length}/10 o 13 dígitos`,
      errorMessage: `Tiene ${clean.length} dígitos. Debe tener exactamente 10 dígitos (Cédula) o 13 dígitos (RUC).`
    };
  }

  const provCode = clean.substring(0, 2);
  const provNum = parseInt(provCode, 10);
  const province = ECUADOR_PROVINCES[provCode];
  if (!province && provNum !== 30 && (provNum < 1 || provNum > 24)) {
    return {
      isValid: false,
      type: 'invalido',
      label: 'Provincia Inválida',
      errorMessage: `El código de provincia '${provCode}' no corresponde a una provincia ecuatoriana válida (01 a 24).`
    };
  }

  const digits = clean.split('').map(Number);
  const thirdDigit = digits[2];

  // 1. Cédula de Identidad Ecuatoriana (10 dígitos)
  if (clean.length === 10) {
    if (thirdDigit >= 6) {
      return {
        isValid: false,
        type: 'invalido',
        label: 'Cédula Inválida',
        errorMessage: 'El 3er dígito de la cédula ecuatoriana debe ser menor a 6 (0 a 5).'
      };
    }
    const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let p = digits[i] * coef[i];
      if (p >= 10) p -= 9;
      sum += p;
    }
    const verifier = (10 - (sum % 10)) % 10;
    if (verifier !== digits[9]) {
      return {
        isValid: false,
        type: 'invalido',
        label: 'Dígito Incorrecto',
        errorMessage: 'Dígito verificador incorrecto según el algoritmo oficial Módulo 10 del SRI.'
      };
    }

    return {
      isValid: true,
      type: 'cédula',
      province: province || `Provincia ${provCode}`,
      label: `Cédula Válida (${province || provCode})`,
      successMessage: `✓ Cédula ecuatoriana válida (${province || provCode}) · Módulo 10 SRI verificado`
    };
  }

  // 2. RUC (13 dígitos)
  if (clean.length === 13) {
    // 2.1 Persona Natural (3er dígito < 6)
    if (thirdDigit < 6) {
      const establishment = clean.substring(10, 13);
      if (establishment === '000') {
        return {
          isValid: false,
          type: 'invalido',
          label: 'Establecimiento Inválido',
          errorMessage: 'Los últimos 3 dígitos del RUC no pueden ser 000 (normalmente 001).'
        };
      }
      // Valida los primeros 10 dígitos como cédula
      const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        let p = digits[i] * coef[i];
        if (p >= 10) p -= 9;
        sum += p;
      }
      const verifier = (10 - (sum % 10)) % 10;
      if (verifier !== digits[9]) {
        return {
          isValid: false,
          type: 'invalido',
          label: 'RUC Natural Inválido',
          errorMessage: 'Los primeros 10 dígitos no superan la validación Módulo 10 de Persona Natural.'
        };
      }

      return {
        isValid: true,
        type: 'ruc_natural',
        province: province || `Provincia ${provCode}`,
        label: `RUC Natural (${province || provCode})`,
        successMessage: `✓ RUC Persona Natural válido (${province || provCode}) · Establecimiento ${establishment}`
      };
    }

    // 2.2 Sociedad Privada / Extranjera (3er dígito === 9)
    if (thirdDigit === 9) {
      const establishment = clean.substring(10, 13);
      if (establishment === '000') {
        return {
          isValid: false,
          type: 'invalido',
          label: 'Establecimiento Inválido',
          errorMessage: 'El establecimiento del RUC Privado no puede ser 000.'
        };
      }
      const coef = [4, 3, 2, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += digits[i] * coef[i];
      }
      const remainder = sum % 11;
      const verifier = remainder === 0 ? 0 : 11 - remainder;
      if (verifier !== digits[9]) {
        return {
          isValid: false,
          type: 'invalido',
          label: 'RUC Privado Inválido',
          errorMessage: 'Dígito verificador incorrecto según Módulo 11 de Sociedad Privada del SRI.'
        };
      }

      return {
        isValid: true,
        type: 'ruc_privada',
        province: province || `Provincia ${provCode}`,
        label: `RUC Sociedad Privada (${province || provCode})`,
        successMessage: `✓ RUC Sociedad Privada válido (${province || provCode}) · Verificado con Módulo 11 del SRI`
      };
    }

    // 2.3 Entidad Pública (3er dígito === 6)
    if (thirdDigit === 6) {
      const establishment = clean.substring(9, 13);
      if (establishment === '0000') {
        return {
          isValid: false,
          type: 'invalido',
          label: 'Establecimiento Inválido',
          errorMessage: 'El establecimiento del RUC Público no puede ser 0000.'
        };
      }
      const coef = [3, 2, 7, 6, 5, 4, 3, 2];
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += digits[i] * coef[i];
      }
      const remainder = sum % 11;
      const verifier = remainder === 0 ? 0 : 11 - remainder;
      if (verifier !== digits[8]) {
        return {
          isValid: false,
          type: 'invalido',
          label: 'RUC Público Inválido',
          errorMessage: 'Dígito verificador incorrecto según Módulo 11 de Entidad Pública del SRI.'
        };
      }

      return {
        isValid: true,
        type: 'ruc_publica',
        province: province || `Provincia ${provCode}`,
        label: `RUC Entidad Pública (${province || provCode})`,
        successMessage: `✓ RUC Entidad Pública válido (${province || provCode}) · Verificado SRI`
      };
    }

    return {
      isValid: false,
      type: 'invalido',
      label: 'RUC No Reconocido',
      errorMessage: 'El tercer dígito del RUC debe ser 0-5 (Natural), 6 (Pública) o 9 (Privada).'
    };
  }

  return {
    isValid: false,
    type: 'invalido',
    label: 'Inválido',
    errorMessage: 'Identificación no válida según la normativa del SRI Ecuador.'
  };
};

export interface FieldAudit {
  isValid: boolean;
  message?: string;
  successMessage?: string;
  tag?: string;
}

export interface SriAuditResult {
  isValid: boolean;
  validCount: number;
  totalRequired: number;
  scorePercentage: number;
  fields: {
    companyName: FieldAudit;
    rucOrId: FieldAudit;
    email: FieldAudit;
    phone: FieldAudit;
    address: FieldAudit;
  };
}

// Motor Automático de Auditoría SRI: Ejecutado en tiempo real en cada cambio de datos
export const auditBillingSri = (billing: {
  companyName: string;
  rucOrId: string;
  email: string;
  phone: string;
  address: string;
}): SriAuditResult => {
  const fields: SriAuditResult['fields'] = {
    companyName: { isValid: false },
    rucOrId: { isValid: false },
    email: { isValid: false },
    phone: { isValid: false },
    address: { isValid: false }
  };

  // 1. Razón Social / Nombre
  const cleanCompany = (billing.companyName || '').trim();
  if (!cleanCompany) {
    fields.companyName = {
      isValid: false,
      message: 'Obligatorio: Ingrese la Razón Social o Nombre fiscal para la emisión electrónica.'
    };
  } else if (cleanCompany.length < 3) {
    fields.companyName = {
      isValid: false,
      message: 'Debe contener al menos 3 caracteres.'
    };
  } else {
    fields.companyName = {
      isValid: true,
      successMessage: '✓ Razón Social válida para emisión tributaria ante el SRI'
    };
  }

  // 2. RUC o Cédula
  const rucValidation = validateSriEcuadorId(billing.rucOrId);
  if (rucValidation.isValid) {
    fields.rucOrId = {
      isValid: true,
      successMessage: rucValidation.successMessage,
      tag: rucValidation.label
    };
  } else {
    fields.rucOrId = {
      isValid: false,
      message: rucValidation.errorMessage || 'RUC o Cédula no cumple con la normativa SRI.',
      tag: rucValidation.label
    };
  }

  // 3. Correo Electrónico
  const cleanEmail = (billing.email || '').trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!cleanEmail) {
    fields.email = {
      isValid: false,
      message: 'Obligatorio: Correo donde el SRI y ASEING entregarán los archivos XML y PDF autorizados.'
    };
  } else if (!emailRegex.test(cleanEmail)) {
    fields.email = {
      isValid: false,
      message: 'Formato de correo electrónico inválido (ejemplo: facturacion@empresa.com).'
    };
  } else {
    fields.email = {
      isValid: true,
      successMessage: '✓ Formato válido para recepción de comprobantes electrónicos del SRI'
    };
  }

  // 4. Teléfono / Celular
  const cleanPhone = (billing.phone || '').trim();
  if (!cleanPhone) {
    fields.phone = {
      isValid: false,
      message: 'Obligatorio: Ingrese el número telefónico para notificación tributaria y técnica.'
    };
  } else if (!/^\d+$/.test(cleanPhone)) {
    fields.phone = {
      isValid: false,
      message: 'El teléfono debe contener únicamente dígitos numéricos.'
    };
  } else if (cleanPhone.length < 9 || cleanPhone.length > 10) {
    fields.phone = {
      isValid: false,
      message: `Tiene ${cleanPhone.length} dígitos. Debe tener 9 dígitos (convencional) o 10 dígitos (celular ej: 0991234567).`
    };
  } else {
    fields.phone = {
      isValid: true,
      successMessage: '✓ Número telefónico numérico válido para contacto y facturación'
    };
  }

  // 5. Dirección Matriz
  const cleanAddress = (billing.address || '').trim();
  if (!cleanAddress) {
    fields.address = {
      isValid: false,
      message: 'Obligatorio: Ingrese la dirección matriz requerida en los comprobantes fiscales del SRI.'
    };
  } else if (cleanAddress.length < 4) {
    fields.address = {
      isValid: false,
      message: 'Ingrese una dirección más descriptiva (mínimo 4 caracteres).'
    };
  } else {
    fields.address = {
      isValid: true,
      successMessage: '✓ Dirección matriz registrada conforme a la ficha técnica del SRI'
    };
  }

  const validCount = Object.values(fields).filter((f) => f.isValid).length;
  const totalRequired = 5;
  const scorePercentage = Math.round((validCount / totalRequired) * 100);

  return {
    isValid: validCount === totalRequired,
    validCount,
    totalRequired,
    scorePercentage,
    fields
  };
};

interface PricingCheckoutProps {
  selectedServices: ServiceItem[];
  onToggleService: (service: ServiceItem) => void;
  onClearCart: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const PricingCheckout: React.FC<PricingCheckoutProps> = ({
  selectedServices,
  onToggleService,
  onClearCart,
  onOrderCompleted
}) => {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'billing' | 'payment' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payphone');
  const [paymentModality, setPaymentModality] = useState<PaymentModality>('full');

  // Initial state definitions for clean resets
  const initialBilling = {
    companyName: '',
    legalRepresentative: '',
    rucOrId: '',
    email: '',
    phone: '',
    city: 'Ambato',
    address: '',
    industrySector: 'Manufactura',
    employeesCount: '15-50'
  };

  const initialCardData = {
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  };

  // Billing form state
  const [billing, setBilling] = useState(initialBilling);

  // Real-time tracking of interacted fields for active visual feedback
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [sriAuditMessage, setSriAuditMessage] = useState<{ text: string; isSuccess: boolean } | null>(null);

  // AUTOMATIC & REACTIVE SRI AUDIT ENGINE: Evaluated continuously on every keystroke
  const sriAudit = useMemo(() => auditBillingSri(billing), [billing]);

  // Credit card inputs for card gateway
  const [cardData, setCardData] = useState(initialCardData);

  // Bank transfer slip reference & copy feedback
  const [transferRef, setTransferRef] = useState('');
  const [transferFile, setTransferFile] = useState<{ dataUrl: string; filename: string } | null>(null);
  const [copiedBankInfo, setCopiedBankInfo] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Safe input handler with real-time formatting & instant validation updates
  const handleFieldChange = (field: keyof typeof billing, value: string) => {
    let cleanVal = value;
    if (field === 'rucOrId') {
      // Strictly numeric, max 13 digits
      cleanVal = value.replace(/\D/g, '').slice(0, 13);
    } else if (field === 'phone') {
      // Strictly numeric, max 10 digits
      cleanVal = value.replace(/\D/g, '').slice(0, 10);
    }

    setBilling((prev) => ({ ...prev, [field]: cleanVal }));
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Reset complete form state to blank fields for the next customer
  const resetFormState = () => {
    setBilling(initialBilling);
    setCardData(initialCardData);
    setTransferRef('');
    setTransferFile(null);
    setTouchedFields({});
    setSriAuditMessage(null);
    setHasAttemptedSubmit(false);
  };

  // Ejecución Manual o Forzada del Comando de Validación Estricta SRI
  const handleExecuteSriCommand = () => {
    setHasAttemptedSubmit(true);
    setTouchedFields({
      companyName: true,
      rucOrId: true,
      email: true,
      phone: true,
      address: true
    });
    if (sriAudit.isValid) {
      setSriAuditMessage({
        text: '✓ Comando SRI Ejecutado con Éxito: El 100% de los datos cumplen estrictamente con la Normativa Técnica y Tributaria del SRI Ecuador.',
        isSuccess: true
      });
    } else {
      setSriAuditMessage({
        text: `⚠️ Comando SRI Ejecutado: Se auditaron los campos obligatorios (${sriAudit.validCount} de 5 cumplidos). Corrija los campos marcados en rojo.`,
        isSuccess: false
      });
    }
  };

  // Proceed from Step 2 to Step 3 with strict validation gate
  const handleProceedToPayment = () => {
    setHasAttemptedSubmit(true);
    setTouchedFields({
      companyName: true,
      rucOrId: true,
      email: true,
      phone: true,
      address: true
    });
    if (!sriAudit.isValid) {
      setSriAuditMessage({
        text: 'Por favor complete y corrija los campos requeridos por el SRI antes de continuar a la pasarela de pago.',
        isSuccess: false
      });
      return;
    }
    setCheckoutStep('payment');
  };

  const handleVoucherFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setPaymentError('El archivo del comprobante no debe superar los 8MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setTransferFile({
        dataUrl: reader.result as string,
        filename: file.name
      });
      setPaymentError(null);
    };
    reader.readAsDataURL(file);
  };

  // Copy individual bank field
  const handleCopyField = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Copy all bank account info
  const handleCopyAccount = () => {
    const fullBankText = [
      `DATOS DE TRANSFERENCIA BANCARIA - ASEING:`,
      `Banco: ${BANK_TRANSFER_DETAILS.bankName}`,
      `Tipo: ${BANK_TRANSFER_DETAILS.accountType}`,
      `Número de Cuenta: ${BANK_TRANSFER_DETAILS.accountNumber}`,
      `Beneficiario: ${BANK_TRANSFER_DETAILS.beneficiaryName}`,
      `${BANK_TRANSFER_DETAILS.idType || 'C.I.'}: ${BANK_TRANSFER_DETAILS.idNumber || BANK_TRANSFER_DETAILS.ruc}`
    ].join('\n');

    navigator.clipboard.writeText(fullBankText);
    setCopiedBankInfo(true);
    setTimeout(() => setCopiedBankInfo(false), 2500);
  };

  // Scheduled date for onboarding
  const [auditDate, setAuditDate] = useState('2026-09-22');
  const [auditTime, setAuditTime] = useState('09:30');

  // Processing and Payment Feedback state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string>('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [whatsappShareLink, setWhatsappShareLink] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  const handleResendInvoiceEmail = async (orderNumber: string) => {
    setIsSendingEmail(true);
    setEmailNotice(null);
    try {
      const res = await fetch(`/api/orders/${orderNumber}/send-notification`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setEmailNotice(`✓ Comprobante digital de orden y registro enviado con éxito a ${confirmedOrder?.billingInfo.email} y aseingerencia1@gmail.com`);
      } else {
        setEmailNotice(data.error || 'Error al enviar correo.');
      }
    } catch (err) {
      setEmailNotice('Error de conexión al enviar correo.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Calculations
  const rawSubtotal = selectedServices.reduce((acc, s) => acc + s.price, 0);

  // Automated Condition: If any other service from the catalog is selected,
  // "Diagnóstico inicial de Procesos Productivos" is waived (100% free / $0.00).
  const hasDiagnostico = selectedServices.some((s) => s.id === 'diagnostico-inicial');
  const otherServicesCount = selectedServices.filter((s) => s.id !== 'diagnostico-inicial').length;
  const isDiagnosticWaived = hasDiagnostico && otherServicesCount > 0;
  const diagnosticDiscount = isDiagnosticWaived ? 30 : 0;

  // Automated 18% discount rule if trinorma or all 3 ISOs are in cart
  const hasIso9001 = selectedServices.some((s) => s.id === 'iso-9001');
  const hasIso14001 = selectedServices.some((s) => s.id === 'iso-14001');
  const hasIso45001 = selectedServices.some((s) => s.id === 'iso-45001');
  const hasTrinormaBundle = selectedServices.some((s) => s.id === 'paquete-iso-trinorma');

  let isoDiscountAmount = 0;
  if (hasTrinormaBundle) {
    isoDiscountAmount = 640;
  } else if (hasIso9001 && hasIso14001 && hasIso45001) {
    isoDiscountAmount = 640; // Equivalent to bundled discount
  }

  const discountAmount = diagnosticDiscount + isoDiscountAmount;
  const subtotal = Math.max(0, rawSubtotal - discountAmount);
  const taxAmount = Number((subtotal * 0.15).toFixed(2)); // Ecuador 15% IVA
  const grandTotal = Number((subtotal + taxAmount).toFixed(2));

  // PAYMENT MODALITY RULES (Abono 50% vs Pago Completo 100%)
  // Exclusion Rule: "Diagnóstico inicial" ($30 USD) is excluded from deposit if it is the only item in cart.
  const isOnlyDiagnostico = selectedServices.length > 0 && selectedServices.every((s) => s.id === 'diagnostico-inicial');
  const canChooseDeposit = selectedServices.length > 0 && !isOnlyDiagnostico;
  const activeModality: PaymentModality = canChooseDeposit ? paymentModality : 'full';

  // Base calculation for 50% deposit:
  // Non-deposit items (e.g. Diagnóstico Inicial if charged and not waived)
  const nonDepositBase = selectedServices
    .filter((s) => s.id === 'diagnostico-inicial' && !isDiagnosticWaived)
    .reduce((acc, s) => acc + s.price, 0);

  // Applicable base for 50% deposit:
  const applicableDepositBase = Math.max(0, subtotal - nonDepositBase);

  // Initial deposit base (50% of applicable + 100% of non-deposit items):
  const depositBase = Number(((applicableDepositBase * 0.5) + nonDepositBase).toFixed(2));
  const depositTaxAmount = Number((depositBase * 0.15).toFixed(2));
  const depositGrandTotal = Number((depositBase + depositTaxAmount).toFixed(2));

  // Pending balance (50% of applicable base + its 15% IVA):
  const pendingBalanceBase = Number((applicableDepositBase * 0.5).toFixed(2));
  const pendingBalanceTax = Number((pendingBalanceBase * 0.15).toFixed(2));
  const pendingBalanceTotal = Math.max(0, Number((grandTotal - depositGrandTotal).toFixed(2)));

  // Current amount to pay today and pending balance based on activeModality:
  const amountToPayToday = activeModality === 'deposit_50' ? depositGrandTotal : grandTotal;
  const pendingBalance = activeModality === 'deposit_50' ? pendingBalanceTotal : 0;

  // Handle final checkout submit with real Payphone / Banking validation
  const handleProcessPayment = async () => {
    if (selectedServices.length === 0) return;

    // Validación estricta SRI Ecuador antes de procesar el pago
    if (!sriAudit.isValid) {
      setHasAttemptedSubmit(true);
      setTouchedFields({
        companyName: true,
        rucOrId: true,
        email: true,
        phone: true,
        address: true
      });
      setCheckoutStep('billing');
      setPaymentError('Por favor complete y corrija los datos obligatorios requeridos por el SRI antes de procesar el pago.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // 1. Create order on backend
      const orderPayload = {
        billingInfo: billing,
        items: selectedServices.map((s) => ({
          serviceId: s.id,
          serviceTitle:
            s.id === 'diagnostico-inicial' && isDiagnosticWaived
              ? `${s.title} (100% Bonificado por Catálogo)`
              : s.id === 'planificacion-control'
              ? `${s.title} - Pago Único`
              : s.title,
          unitPrice: s.price,
          quantity: 1,
          subtotal: s.id === 'diagnostico-inicial' && isDiagnosticWaived ? 0 : s.price
        })),
        subtotal,
        discountAmount,
        taxAmount,
        total: grandTotal,
        paymentMethod,
        paymentModality: activeModality,
        amountPaidToday: amountToPayToday,
        depositAmount: activeModality === 'deposit_50' ? depositBase : undefined,
        depositTaxAmount: activeModality === 'deposit_50' ? depositTaxAmount : undefined,
        pendingBalance,
        pendingBalanceBase: activeModality === 'deposit_50' ? pendingBalanceBase : 0,
        pendingBalanceTax: activeModality === 'deposit_50' ? pendingBalanceTax : 0,
        scheduledAuditDate: `${auditDate} ${auditTime}`,
        notes: isDiagnosticWaived
          ? 'Condición de pago aplicada: Si contrata los servicios de cualquier ítem especificado y seleccionado en catálogo no se cobrará el valor de Diagnóstico inicial de Procesos Productivos ($0.00).'
          : ''
      };

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const orderData = await orderRes.json();
      const currentOrder: Order = orderData.order;

      // 2. Comunicarse con /api/pago y esperar la validación bancaria real
      const payRes = await fetch('/api/pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: currentOrder.orderNumber,
          paymentMethod,
          paymentModality: activeModality,
          amountToPayToday,
          cardData,
          transferRef: transferRef || (paymentMethod === 'bank_transfer' ? '' : `TX-PAYP-${Date.now().toString().slice(-6)}`),
          transferProof: transferFile
            ? {
                dataUrl: transferFile.dataUrl,
                filename: transferFile.filename,
                reference: transferRef
              }
            : (transferRef ? { reference: transferRef } : undefined),
          scheduledDate: `${auditDate} ${auditTime}`
        })
      });

      const payData = await payRes.json();

      // Validación: Si el banco rechaza el pago
      if (!payRes.ok || payData.status === 'Rejected' || !payData.success) {
        setPaymentError(
          payData.message ||
          'Pago Rechazado por el banco emisor. Por favor revise el número de tarjeta, fondos disponibles o intente con otra tarjeta o transferencia.'
        );
        return;
      }

      // Si Payphone requiere redirección externa
      if (payData.status === 'RedirectRequired' && payData.payUrl) {
        window.location.href = payData.payUrl;
        return;
      }

      // Transacción Aprobada o Guardada en Verificación:
      if (payData.order) {
        setConfirmedOrder(payData.order);
        setPdfDownloadUrl(payData.pdfUrl || (payData.status === 'Approved' ? `/api/orders/${payData.order.orderNumber}/pdf` : null));
        setWhatsappShareLink(payData.whatsappDirectLink);

        if (payData.status === 'PendingVerification') {
          setEmailNotice(
            `Su orden ha quedado guardada en estado 'Pago en Verificación'. Nuestro equipo contable validará el abono en Produbanco y emitirá su comprobante oficial en PDF a ${payData.order.billingInfo.email}.`
          );
        } else {
          setEmailNotice(`Comprobante electrónico oficial (PDF) generado y enviado a ${payData.order.billingInfo.email}`);
        }

        onOrderCompleted(payData.order);
        setCheckoutStep('success');

        // Limpieza del Formulario (Reset de Estado) para que el próximo cliente encuentre el formulario en blanco
        resetFormState();
      }
    } catch (err: any) {
      setPaymentError(
        'Error de comunicación con el servicio de pagos: ' +
        (err.message || 'Por favor intente nuevamente en unos minutos.')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="precios" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1ea1c2]/10 border border-[#1ea1c2]/30 text-xs font-mono text-[#1ea1c2] mb-3">
          <CreditCard size={14} />
          <span>COTIZADOR INTELIGENTE & PASARELA DE PAGOS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Carta de Precios & Pasarela Automatizada
        </h2>
        <p className="text-base text-[#bfa9dc] mt-2">
          Seleccione los servicios requeridos para calcular su presupuesto con descuentos automáticos, generar factura proforma legal y pagar de forma segura vía Payphone, tarjeta o transferencia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Price Table & Cart Selection */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#17072e] overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-[#1ea1c2]">
                Catálogo Oficial de Servicios (Valores en USD)
              </span>
              <span className="text-xs text-[#bfa9dc]">Clic para agregar / quitar</span>
            </div>

            <div className="divide-y divide-white/5">
              {SERVICES_CATALOG.map((item) => {
                const isSelected = selectedServices.some((s) => s.id === item.id);

                return (
                  <div
                    key={item.id}
                    id={`service-row-${item.id}`}
                    onClick={() => onToggleService(item)}
                    className={`p-4 sm:px-6 flex items-center justify-between gap-4 cursor-pointer transition-all duration-300 ${
                      isSelected ? 'bg-[#220d3f]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 flex-none border transition-all ${
                          isSelected ? 'bg-[#1ea1c2] border-[#1ea1c2]' : 'border-white/20 bg-white/5'
                        }`}
                      >
                        {isSelected && <Check size={13} className="text-white" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-2 flex-wrap">
                          <span>{item.title}</span>
                          {item.savingsBadge && item.savingsBadge !== item.modalidad && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#b80068] text-white">
                              {item.savingsBadge}
                            </span>
                          )}
                          {item.id === 'diagnostico-inicial' && otherServicesCount > 0 && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              ✓ Condición Activa ($0.00)
                            </span>
                          )}
                        </div>
                        {item.shortDesc && (
                          <p className="text-xs text-[#bfa9dc] mt-1 leading-relaxed">
                            {item.shortDesc}
                          </p>
                        )}
                        <div className="text-xs text-[#bfa9dc] mt-1 flex items-center gap-2 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                            item.modalidad === 'Pago Único' || item.modalidad === 'Único'
                              ? 'bg-[#1ea1c2]/20 text-[#1ea1c2] border border-[#1ea1c2]/30 font-bold'
                              : 'bg-white/5 text-[#bfa9dc]'
                          }`}>
                            {item.id === 'app-planificacion-mensual' ? 'Licencia Mensual · 3 usuarios' : item.modalidad}
                          </span>
                          {item.estimatedDays && (
                            <span className="text-[11px] text-[#bfa9dc]/70">⏱ {item.estimatedDays}</span>
                          )}
                        </div>
                        {item.paymentCondition && (
                          <div className="mt-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-100/90 leading-snug">
                            <strong className="text-emerald-400 font-mono">Condición de pago: </strong>
                            {item.paymentCondition}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-none">
                      {item.id === 'diagnostico-inicial' && otherServicesCount > 0 ? (
                        <div>
                          <div className="text-sm sm:text-base font-bold font-mono text-emerald-400">
                            USD $0.00
                          </div>
                          <div className="text-[10px] line-through text-[#bfa9dc]/60 font-mono">
                            USD $30
                          </div>
                          <span className="text-[9px] font-mono text-emerald-400 font-bold block">
                            Bonificado 100%
                          </span>
                        </div>
                      ) : item.id === 'app-planificacion' ? (
                        <div>
                          <div className="text-sm sm:text-base font-bold font-mono text-white">
                            USD $4.300
                          </div>
                          <span className="text-[10px] font-mono text-[#bfa9dc] block">
                            (Pago Único)
                          </span>
                        </div>
                      ) : item.id === 'app-planificacion-mensual' ? (
                        <div>
                          <div className="text-sm sm:text-base font-bold font-mono text-white">
                            USD $92
                          </div>
                          <span className="text-[10px] font-mono text-[#1ea1c2] block">
                            / mes por (3 usuarios)
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm sm:text-base font-bold font-mono text-white">
                          USD ${item.price}
                        </div>
                      )}
                      <span className="text-[10px] font-mono text-[#1ea1c2]">
                        {isSelected ? 'Seleccionado' : '+ Agregar'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legal notes */}
          <div className="text-xs text-[#bfa9dc] space-y-1">
            <p>• Los precios corresponden a tarifas industriales referenciales para medianas empresas en Ecuador.</p>
            <p>• Los pagos son procesados de forma encriptada bajo estándares PCI-DSS de Payphone y banca ecuatoriana.</p>
          </div>
        </div>

        {/* Right 5 Columns: Dynamic Configurator & Checkout Flow */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-3xl p-6 sm:p-7 bg-[#1c0a37] border border-white/15 shadow-2xl space-y-6">
            {/* Header of Checkout Box */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1ea1c2]" />
                <h3 className="text-base font-bold text-white">Resumen de Contratación</h3>
              </div>
              {selectedServices.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs text-[#bfa9dc] hover:text-[#b80068] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Limpiar</span>
                </button>
              )}
            </div>

            {/* Stepper Tabs Bar: Resumen de Contratación */}
            {selectedServices.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/[0.04] rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className={`py-2 px-1 text-center rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                    checkoutStep === 'cart'
                      ? 'bg-gradient-to-r from-[#1ea1c2]/30 to-[#3a0ca3]/40 text-white border border-[#1ea1c2]/50 shadow-sm'
                      : 'text-[#bfa9dc] hover:text-white'
                  }`}
                >
                  1. Servicios
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('billing')}
                  className={`py-2 px-1 text-center rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    checkoutStep === 'billing'
                      ? 'bg-gradient-to-r from-[#1ea1c2]/30 to-[#3a0ca3]/40 text-white border border-[#1ea1c2]/50 shadow-sm'
                      : 'text-[#bfa9dc] hover:text-white'
                  }`}
                >
                  <span>2. Facturación SRI</span>
                  {sriAudit.isValid ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="100% Validado SRI" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Pendiente Validación SRI" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (sriAudit.isValid) {
                      setCheckoutStep('payment');
                    } else {
                      handleExecuteSriCommand();
                      setCheckoutStep('billing');
                    }
                  }}
                  className={`py-2 px-1 text-center rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                    checkoutStep === 'payment'
                      ? 'bg-gradient-to-r from-[#1ea1c2]/30 to-[#3a0ca3]/40 text-white border border-[#1ea1c2]/50 shadow-sm'
                      : 'text-[#bfa9dc] hover:text-white'
                  }`}
                >
                  3. Pasarela
                </button>
              </div>
            )}

            {/* STEP 1: CART REVIEW */}
            {checkoutStep === 'cart' && (
              <div className="space-y-4">
                {selectedServices.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-[#bfa9dc]">
                      <CreditCard size={24} />
                    </div>
                    <p className="text-xs text-[#bfa9dc]">
                      No tiene servicios seleccionados en el cotizador. Seleccione uno o más servicios de la tabla para calcular el total.
                    </p>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const diag = SERVICES_CATALOG.find((s) => s.id === 'diagnostico-inicial');
                          if (diag) onToggleService(diag);
                        }}
                        className="px-4 py-2 rounded-full bg-[#1ea1c2]/20 border border-[#1ea1c2]/40 text-[#1ea1c2] text-xs font-bold hover:bg-[#1ea1c2]/30 cursor-pointer"
                      >
                        + Agregar Diagnóstico Inicial ($30)
                      </button>
                      <p className="text-[10px] text-[#bfa9dc] font-mono">
                        💡 Si añade cualquier otro servicio del catálogo, el diagnóstico queda 100% bonificado ($0.00).
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Selected items list */}
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {selectedServices.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div className="truncate max-w-[190px]">
                            <span className="text-white font-medium">
                              {item.title}
                            </span>
                            {item.id === 'diagnostico-inicial' && isDiagnosticWaived ? (
                              <span className="block text-[10px] font-mono text-emerald-400 font-semibold">
                                Condición: 100% Bonificado
                              </span>
                            ) : (
                              <span className={`block text-[10px] font-mono ${
                                item.modalidad === 'Pago Único' || item.modalidad === 'Único'
                                  ? 'text-[#1ea1c2] font-semibold'
                                  : 'text-[#bfa9dc]'
                              }`}>
                                {item.id === 'app-planificacion-mensual' ? 'Licencia Mensual · 3 usuarios' : item.modalidad}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {item.id === 'diagnostico-inicial' && isDiagnosticWaived ? (
                              <div className="text-right">
                                <span className="font-mono text-emerald-400 font-bold">USD $0.00</span>
                                <span className="text-[10px] line-through text-[#bfa9dc]/60 ml-1.5 font-mono">
                                  $30
                                </span>
                              </div>
                            ) : item.id === 'app-planificacion' ? (
                              <span className="font-mono text-white font-bold">USD $4.300</span>
                            ) : (
                              <span className="font-mono text-white font-bold">USD ${item.price}</span>
                            )}
                            <button
                              type="button"
                              onClick={() => onToggleService(item)}
                              className="text-white/40 hover:text-rose-400 p-0.5 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Incentive prompt: If user has other services but not diagnostic */}
                    {otherServicesCount > 0 && !hasDiagnostico && (
                      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/15 to-[#1ea1c2]/15 border border-emerald-500/30 text-xs text-white space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                          <Sparkles size={14} className="text-emerald-400 flex-none" />
                          <span>¡Beneficio de Catálogo Disponible!</span>
                        </div>
                        <p className="text-[11px] text-[#f3effa] leading-tight">
                          Por haber seleccionado servicios del catálogo, el <strong>Diagnóstico inicial de Procesos Productivos</strong> no tendrá costo ($0.00).
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const diag = SERVICES_CATALOG.find((s) => s.id === 'diagnostico-inicial');
                            if (diag) onToggleService(diag);
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0c2715] font-bold text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>Incluir Diagnóstico Inicial Bonificado ($0.00)</span>
                        </button>
                      </div>
                    )}

                    {/* Diagnostic Waived Notification */}
                    {isDiagnosticWaived && (
                      <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-start justify-between gap-2 text-xs text-white">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                            <Sparkles size={14} className="text-emerald-400 flex-none" />
                            <span>Condición de Pago Aplicada:</span>
                          </div>
                          <p className="text-[11px] text-emerald-100/90 leading-tight">
                            Diagnóstico inicial de Procesos Productivos no se cobra (100% bonificado) por contratar servicios del catálogo.
                          </p>
                        </div>
                        <span className="font-mono font-bold text-emerald-300 flex-none">- USD $30.00</span>
                      </div>
                    )}

                    {/* Trinorma Bundle Discount Notification if applied */}
                    {isoDiscountAmount > 0 && (
                      <div className="p-3 rounded-xl bg-[#b80068]/20 border border-[#b80068]/50 flex items-center justify-between text-xs text-white">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Sparkles size={14} className="text-pink-300" />
                          Descuento Paquete Trinorma (18% OFF):
                        </span>
                        <span className="font-mono font-bold text-pink-300">- USD ${isoDiscountAmount}</span>
                      </div>
                    )}

                    {/* Selector Interactivo de Modalidad de Pago (Abono 50% vs Pago Completo) */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
                          <CreditCard size={14} className="text-[#1ea1c2]" />
                          Modalidad de Contratación:
                        </span>
                        {activeModality === 'deposit_50' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                            Abono 50% Activo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#1ea1c2]/20 text-[#1ea1c2] text-[10px] font-mono font-bold border border-[#1ea1c2]/30">
                            Pago Completo 100%
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Opción A: Pago Completo */}
                        <button
                          type="button"
                          onClick={() => setPaymentModality('full')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            activeModality === 'full'
                              ? 'bg-gradient-to-br from-[#1ea1c2]/20 to-[#3a0ca3]/30 border-[#1ea1c2] shadow-md shadow-[#1ea1c2]/10 ring-1 ring-[#1ea1c2]'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-[#bfa9dc]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold ${activeModality === 'full' ? 'text-white' : 'text-[#bfa9dc]'}`}>
                              Pago Completo (100%)
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${activeModality === 'full' ? 'border-[#1ea1c2] bg-[#1ea1c2]' : 'border-white/30'}`}>
                              {activeModality === 'full' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <div className="text-[11px] font-mono text-[#bfa9dc]">
                            Total con IVA: <span className="font-bold text-white">USD ${grandTotal.toFixed(2)}</span>
                          </div>
                          <div className="text-[10px] text-[#bfa9dc] mt-0.5">
                            Liquidación total inmediata del servicio.
                          </div>
                        </button>

                        {/* Opción B: Abono Inicial 50% */}
                        <button
                          type="button"
                          disabled={!canChooseDeposit}
                          onClick={() => canChooseDeposit && setPaymentModality('deposit_50')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            !canChooseDeposit
                              ? 'opacity-40 cursor-not-allowed bg-white/[0.01] border-white/5'
                              : activeModality === 'deposit_50'
                              ? 'bg-gradient-to-br from-emerald-500/20 to-[#18082e] border-emerald-400 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-400 cursor-pointer'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-[#bfa9dc] cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold ${activeModality === 'deposit_50' ? 'text-emerald-300' : 'text-[#bfa9dc]'}`}>
                              Abono Inicial (50%)
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${activeModality === 'deposit_50' ? 'border-emerald-400 bg-emerald-500' : 'border-white/30'}`}>
                              {activeModality === 'deposit_50' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <div className="text-[11px] font-mono text-emerald-300">
                            Pagar hoy: <span className="font-bold text-white">USD ${depositGrandTotal.toFixed(2)}</span>
                          </div>
                          <div className="text-[10px] text-[#bfa9dc] mt-0.5">
                            Saldo 50% contra entrega de resultados.
                          </div>
                        </button>
                      </div>

                      {/* Exclusion Warning if Cart only has Diagnóstico Inicial */}
                      {isOnlyDiagnostico && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] flex items-center gap-1.5">
                          <AlertCircle size={14} className="flex-none text-amber-400" />
                          <span>
                            El <strong>Diagnóstico Inicial ($30 USD)</strong> es un valor accesible base no sujeto a fraccionamiento en abono. Se procesa al 100%.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Breakdown totals */}
                    <div className="space-y-1.5 pt-3 border-t border-white/10 text-xs font-mono">
                      <div className="flex justify-between text-[#bfa9dc]">
                        <span>Subtotal Servicios Base:</span>
                        <span>USD ${rawSubtotal.toFixed(2)}</span>
                      </div>
                      {isDiagnosticWaived && (
                        <div className="flex justify-between text-emerald-400 font-sans">
                          <span>Bonificación Diagnóstico (Condición Catálogo):</span>
                          <span className="font-mono">- USD $30.00</span>
                        </div>
                      )}
                      {isoDiscountAmount > 0 && (
                        <div className="flex justify-between text-pink-300 font-sans">
                          <span>Descuento Trinorma (18% OFF):</span>
                          <span className="font-mono">- USD ${isoDiscountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#bfa9dc]">
                        <span>Subtotal Aplicado:</span>
                        <span>USD ${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[#bfa9dc]">
                        <span>IVA (15% Ecuador):</span>
                        <span>USD ${taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-white pt-1 border-t border-white/5 font-semibold">
                        <span>Total del Servicio Contratado (100%):</span>
                        <span className="text-white font-bold">USD ${grandTotal.toFixed(2)}</span>
                      </div>

                      {activeModality === 'deposit_50' ? (
                        <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-[#1c0a37] to-[#1ea1c2]/15 border border-emerald-500/30 space-y-1.5 font-sans">
                          <div className="flex justify-between items-center text-emerald-300 font-bold text-sm">
                            <span>Abono Inicial a Pagar Hoy (50% + IVA):</span>
                            <span className="font-mono text-emerald-400 text-lg font-black">
                              USD ${depositGrandTotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-amber-300 font-semibold text-xs border-t border-white/10 pt-1.5">
                            <span>Saldo Pendiente (Contra Entrega / Finalización):</span>
                            <span className="font-mono text-amber-200 font-bold">
                              USD ${pendingBalanceTotal.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#bfa9dc] italic pt-0.5">
                            * El saldo restante del 50% se liquidará previa entrega de informes finales o cierre del servicio.
                          </p>
                        </div>
                      ) : (
                        <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10 font-sans">
                          <span>Total a Pagar Hoy:</span>
                          <span className="font-mono text-[#1ea1c2] text-xl font-extrabold">
                            USD ${grandTotal.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* SRI Billing Validation Card directly in Resumen de Contratación */}
                    <div
                      className={`p-3.5 rounded-2xl border transition-all ${
                        sriAudit.isValid
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-white/[0.03] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck size={16} className={sriAudit.isValid ? 'text-emerald-400' : 'text-[#1ea1c2]'} />
                          <span className="text-xs font-bold text-white">Validación Facturación SRI Ecuador</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            sriAudit.isValid
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {sriAudit.isValid ? '✓ 100% Cumplido' : `${sriAudit.validCount}/5 Requisitos`}
                        </span>
                      </div>

                      {sriAudit.isValid ? (
                        <div className="text-xs text-emerald-200/90 space-y-1.5">
                          <p className="font-semibold text-white truncate">🏢 {billing.companyName}</p>
                          <p className="font-mono text-[11px] text-emerald-300">
                            RUC/ID: <strong>{billing.rucOrId}</strong> · Email: <strong>{billing.email}</strong>
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-emerald-400 font-mono">✓ Aprobado para Comprobante Electrónico</span>
                            <button
                              type="button"
                              onClick={() => setCheckoutStep('billing')}
                              className="text-[11px] text-[#1ea1c2] hover:underline cursor-pointer"
                            >
                              Modificar datos
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[11px] text-[#bfa9dc] leading-tight">
                            Para emitir su comprobante oficial ante el SRI, debe ingresar y validar su Razón Social, RUC/Cédula, Email, Teléfono y Dirección Matriz.
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                sriAudit.fields.companyName.isValid
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              Razón Social: {sriAudit.fields.companyName.isValid ? '✓' : 'Pendiente'}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                sriAudit.fields.rucOrId.isValid
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              RUC/Cédula: {sriAudit.fields.rucOrId.isValid ? '✓' : 'Pendiente'}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                sriAudit.fields.email.isValid
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              Email SRI: {sriAudit.fields.email.isValid ? '✓' : 'Pendiente'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCheckoutStep('billing')}
                            className="w-full py-2 px-3 rounded-xl bg-[#1ea1c2]/15 border border-[#1ea1c2]/30 hover:bg-[#1ea1c2]/25 text-[#1ea1c2] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>Ingresar y Validar Datos de Facturación SRI →</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Next step button */}
                    <button
                      id="btn-proceed-billing"
                      type="button"
                      onClick={() => setCheckoutStep('billing')}
                      className="w-full py-3.5 rounded-full font-bold text-xs text-white bg-gradient-to-r from-[#b80068] via-[#4e0477] to-[#3a0ca3] hover:opacity-95 shadow-xl shadow-[#b80068]/30 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>
                        {activeModality === 'deposit_50'
                          ? `Continuar con Abono Inicial (USD $${depositGrandTotal.toFixed(2)})`
                          : `Continuar con Datos de Facturación (USD $${grandTotal.toFixed(2)})`}
                      </span>
                      <ArrowRight size={14} />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* STEP 2: BILLING & COMPANY DETAILS (VALIDACIÓN ESTRICTA SRI ECUADOR) */}
            {checkoutStep === 'billing' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#1ea1c2] font-semibold">
                    Paso 2 de 3 · Facturación Electrónica SRI
                  </span>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="text-xs text-[#bfa9dc] hover:text-white cursor-pointer"
                  >
                    ← Modificar servicios
                  </button>
                </div>

                {/* COMANDO DE VALIDACIÓN ESTRICTA (NORMATIVA SRI ECUADOR) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#1b083b] to-[#120524] border border-[#1ea1c2]/30 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#1ea1c2]/20 border border-[#1ea1c2]/40 flex items-center justify-center text-[#1ea1c2]">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">
                          Comando de Validación Estricta
                        </h4>
                        <span className="text-[10px] text-[#bfa9dc] font-mono">
                          Normativa SRI Ecuador (Ficha Técnica RUC/Cédula)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>AUTOMÁTICO & ACTIVO</span>
                    </div>
                  </div>

                  {/* Progress bar of audit compliance */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#bfa9dc]">Cumplimiento Normativo SRI:</span>
                      <span className={sriAudit.isValid ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {sriAudit.scorePercentage}% ({sriAudit.validCount} de 5 Requisitos Validados)
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          sriAudit.isValid
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-[#1ea1c2] via-amber-400 to-emerald-400'
                        }`}
                        style={{ width: `${sriAudit.scorePercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Command action button */}
                  <button
                    type="button"
                    onClick={handleExecuteSriCommand}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#1ea1c2]/20 via-[#3a0ca3]/30 to-[#b80068]/20 hover:from-[#1ea1c2]/30 hover:to-[#b80068]/30 border border-[#1ea1c2]/40 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Zap size={14} className="text-[#1ea1c2]" />
                    <span>Ejecutar Auditoría SRI Ahora</span>
                  </button>

                  {/* Execution Message Feedback */}
                  {sriAuditMessage && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-mono border animate-in fade-in ${
                        sriAuditMessage.isSuccess
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
                      }`}
                    >
                      {sriAuditMessage.text}
                    </div>
                  )}
                </div>

                {/* Billing inputs with ACTIVE visual feedback (Green on valid, Red on invalid) */}
                <div className="space-y-3">
                  {/* 1. Nombre / Razón Social */}
                  {(() => {
                    const isTouched = touchedFields.companyName || hasAttemptedSubmit || Boolean(billing.companyName);
                    const isValid = sriAudit.fields.companyName.isValid;
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-mono text-[#bfa9dc]">
                            Nombre / Razón Social *
                          </label>
                          {isTouched && isValid && (
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={12} /> Válido SRI
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="Ej: Industrias XYZ S.A."
                            value={billing.companyName}
                            onChange={(e) => handleFieldChange('companyName', e.target.value)}
                            onBlur={() => setTouchedFields((prev) => ({ ...prev, companyName: true }))}
                            className={`w-full px-3.5 py-2.5 pr-9 rounded-xl border text-white text-xs focus:outline-none transition-colors ${
                              isTouched
                                ? isValid
                                  ? 'border-emerald-500/80 bg-emerald-500/5 focus:border-emerald-400'
                                  : 'border-rose-500/80 bg-rose-500/5 focus:border-rose-400'
                                : 'border-white/10 bg-white/5 focus:border-[#1ea1c2]'
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            {isTouched && (isValid ? (
                              <CheckCircle2 size={15} className="text-emerald-400" />
                            ) : (
                              <AlertCircle size={15} className="text-rose-400" />
                            ))}
                          </div>
                        </div>
                        {isTouched && (!isValid ? (
                          <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 animate-in fade-in font-mono">
                            <AlertCircle size={12} className="shrink-0" />
                            <span>{sriAudit.fields.companyName.message}</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-emerald-400/90 mt-1 flex items-center gap-1 font-mono">
                            <Check size={11} className="shrink-0" />
                            <span>{sriAudit.fields.companyName.successMessage}</span>
                          </p>
                        ))}
                      </div>
                    );
                  })()}

                  {/* 2. RUC / Cédula y Ciudad */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* RUC / Cédula */}
                    {(() => {
                      const isTouched = touchedFields.rucOrId || hasAttemptedSubmit || Boolean(billing.rucOrId);
                      const isValid = sriAudit.fields.rucOrId.isValid;
                      return (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-mono text-[#bfa9dc]">
                              RUC / Cédula *
                            </label>
                            <span className="text-[10px] font-mono text-[#bfa9dc]">
                              {billing.rucOrId.length}/13
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="tel"
                              inputMode="numeric"
                              maxLength={13}
                              required
                              placeholder="Ej: 1712345678001"
                              value={billing.rucOrId}
                              onChange={(e) => handleFieldChange('rucOrId', e.target.value)}
                              onBlur={() => setTouchedFields((prev) => ({ ...prev, rucOrId: true }))}
                              className={`w-full px-3.5 py-2.5 pr-9 rounded-xl border text-white text-xs focus:outline-none font-mono transition-colors ${
                                isTouched
                                  ? isValid
                                    ? 'border-emerald-500/80 bg-emerald-500/5 focus:border-emerald-400'
                                    : 'border-rose-500/80 bg-rose-500/5 focus:border-rose-400'
                                  : 'border-white/10 bg-white/5 focus:border-[#1ea1c2]'
                              }`}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              {isTouched && (isValid ? (
                                <CheckCircle2 size={15} className="text-emerald-400" />
                              ) : (
                                <AlertCircle size={15} className="text-rose-400" />
                              ))}
                            </div>
                          </div>
                          {isTouched && (!isValid ? (
                            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 animate-in fade-in font-mono">
                              <AlertCircle size={12} className="shrink-0" />
                              <span>{sriAudit.fields.rucOrId.message}</span>
                            </p>
                          ) : (
                            <p className="text-[10px] text-emerald-400/90 mt-1 flex items-center gap-1 font-mono">
                              <Check size={11} className="shrink-0" />
                              <span>{sriAudit.fields.rucOrId.successMessage}</span>
                            </p>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Ciudad */}
                    <div>
                      <label className="block text-[11px] font-mono text-[#bfa9dc] mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Ambato"
                        value={billing.city}
                        onChange={(e) => handleFieldChange('city', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#1ea1c2] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 3. Correo Electrónico y Teléfono / Celular */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Correo Electrónico */}
                    {(() => {
                      const isTouched = touchedFields.email || hasAttemptedSubmit || Boolean(billing.email);
                      const isValid = sriAudit.fields.email.isValid;
                      return (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-mono text-[#bfa9dc]">
                              Correo Electrónico *
                            </label>
                            {isTouched && isValid && (
                              <span className="text-[10px] font-mono text-emerald-400">✓ Válido SRI</span>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              placeholder="Ej: contabilidad@empresa.com"
                              value={billing.email}
                              onChange={(e) => handleFieldChange('email', e.target.value)}
                              onBlur={() => setTouchedFields((prev) => ({ ...prev, email: true }))}
                              className={`w-full px-3.5 py-2.5 pr-9 rounded-xl border text-white text-xs focus:outline-none transition-colors ${
                                isTouched
                                  ? isValid
                                    ? 'border-emerald-500/80 bg-emerald-500/5 focus:border-emerald-400'
                                    : 'border-rose-500/80 bg-rose-500/5 focus:border-rose-400'
                                  : 'border-white/10 bg-white/5 focus:border-[#1ea1c2]'
                              }`}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              {isTouched && (isValid ? (
                                <CheckCircle2 size={15} className="text-emerald-400" />
                              ) : (
                                <AlertCircle size={15} className="text-rose-400" />
                              ))}
                            </div>
                          </div>
                          {isTouched && (!isValid ? (
                            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 animate-in fade-in font-mono">
                              <AlertCircle size={12} className="shrink-0" />
                              <span>{sriAudit.fields.email.message}</span>
                            </p>
                          ) : (
                            <p className="text-[10px] text-emerald-400/90 mt-1 flex items-center gap-1 font-mono">
                              <Check size={11} className="shrink-0" />
                              <span>{sriAudit.fields.email.successMessage}</span>
                            </p>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Teléfono / Celular */}
                    {(() => {
                      const isTouched = touchedFields.phone || hasAttemptedSubmit || Boolean(billing.phone);
                      const isValid = sriAudit.fields.phone.isValid;
                      return (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-mono text-[#bfa9dc]">
                              Teléfono / Celular *
                            </label>
                            <span className="text-[10px] font-mono text-[#bfa9dc]">
                              {billing.phone.length}/10
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="tel"
                              inputMode="numeric"
                              maxLength={10}
                              required
                              placeholder="Ej: 0991234567"
                              value={billing.phone}
                              onChange={(e) => handleFieldChange('phone', e.target.value)}
                              onBlur={() => setTouchedFields((prev) => ({ ...prev, phone: true }))}
                              className={`w-full px-3.5 py-2.5 pr-9 rounded-xl border text-white text-xs focus:outline-none font-mono transition-colors ${
                                isTouched
                                  ? isValid
                                    ? 'border-emerald-500/80 bg-emerald-500/5 focus:border-emerald-400'
                                    : 'border-rose-500/80 bg-rose-500/5 focus:border-rose-400'
                                  : 'border-white/10 bg-white/5 focus:border-[#1ea1c2]'
                              }`}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              {isTouched && (isValid ? (
                                <CheckCircle2 size={15} className="text-emerald-400" />
                              ) : (
                                <AlertCircle size={15} className="text-rose-400" />
                              ))}
                            </div>
                          </div>
                          {isTouched && (!isValid ? (
                            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 animate-in fade-in font-mono">
                              <AlertCircle size={12} className="shrink-0" />
                              <span>{sriAudit.fields.phone.message}</span>
                            </p>
                          ) : (
                            <p className="text-[10px] text-emerald-400/90 mt-1 flex items-center gap-1 font-mono">
                              <Check size={11} className="shrink-0" />
                              <span>{sriAudit.fields.phone.successMessage}</span>
                            </p>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* 4. Dirección Matriz */}
                  {(() => {
                    const isTouched = touchedFields.address || hasAttemptedSubmit || Boolean(billing.address);
                    const isValid = sriAudit.fields.address.isValid;
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-mono text-[#bfa9dc]">
                            Dirección Matriz *
                          </label>
                          {isTouched && isValid && (
                            <span className="text-[10px] font-mono text-emerald-400">✓ Registrada SRI</span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="Ej: Av. Principal y Secundaria, Quito"
                            value={billing.address}
                            onChange={(e) => handleFieldChange('address', e.target.value)}
                            onBlur={() => setTouchedFields((prev) => ({ ...prev, address: true }))}
                            className={`w-full px-3.5 py-2.5 pr-9 rounded-xl border text-white text-xs focus:outline-none transition-colors ${
                              isTouched
                                ? isValid
                                  ? 'border-emerald-500/80 bg-emerald-500/5 focus:border-emerald-400'
                                  : 'border-rose-500/80 bg-rose-500/5 focus:border-rose-400'
                                : 'border-white/10 bg-white/5 focus:border-[#1ea1c2]'
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            {isTouched && (isValid ? (
                              <CheckCircle2 size={15} className="text-emerald-400" />
                            ) : (
                              <AlertCircle size={15} className="text-rose-400" />
                            ))}
                          </div>
                        </div>
                        {isTouched && (!isValid ? (
                          <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 animate-in fade-in font-mono">
                            <AlertCircle size={12} className="shrink-0" />
                            <span>{sriAudit.fields.address.message}</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-emerald-400/90 mt-1 flex items-center gap-1 font-mono">
                            <Check size={11} className="shrink-0" />
                            <span>{sriAudit.fields.address.successMessage}</span>
                          </p>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <button
                  id="btn-proceed-payment"
                  type="button"
                  onClick={handleProceedToPayment}
                  className={`w-full py-3.5 rounded-full font-bold text-xs text-white flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    sriAudit.isValid
                      ? 'bg-gradient-to-r from-[#1ea1c2] to-[#3a0ca3] hover:opacity-95 shadow-xl shadow-[#1ea1c2]/20'
                      : 'bg-gradient-to-r from-amber-600 to-[#3a0ca3] hover:opacity-95 shadow-lg'
                  }`}
                >
                  <span>
                    {sriAudit.isValid
                      ? 'Continuar a Pasarela de Pago (Datos SRI Aprobados)'
                      : `Continuar a Pasarela (${sriAudit.validCount}/5 Validados SRI)`}
                  </span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* STEP 3: PAYMENT GATEWAY SELECTION & EXECUTION */}
            {checkoutStep === 'payment' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#1ea1c2] font-semibold">
                    Paso 3 de 3 · Pasarela de Pago
                  </span>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('billing')}
                    className="text-xs text-[#bfa9dc] hover:text-white cursor-pointer"
                  >
                    ← Editar datos SRI
                  </button>
                </div>

                {/* Verified SRI Billing Box */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      <span>Datos Fiscales Validados ante el SRI</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('billing')}
                      className="text-[11px] text-[#1ea1c2] hover:underline cursor-pointer"
                    >
                      Modificar
                    </button>
                  </div>
                  <div className="text-white font-medium truncate">
                    {billing.companyName}
                  </div>
                  <div className="flex flex-wrap gap-x-3 text-[11px] font-mono text-emerald-200/90">
                    <span>RUC/ID: <strong>{billing.rucOrId}</strong></span>
                    <span>Email: <strong>{billing.email}</strong></span>
                    <span>Tel: <strong>{billing.phone}</strong></span>
                  </div>
                  <div className="text-[11px] text-[#bfa9dc] truncate">
                    Dirección: {billing.address}, {billing.city}
                  </div>
                </div>

                {/* Error Banner: Pago Rechazado o Falla de Pasarela */}
                {paymentError && (
                  <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs space-y-2.5 animate-in fade-in">
                    <div className="flex items-center gap-2 text-rose-300 font-bold">
                      <XCircle size={18} className="text-rose-400 shrink-0" />
                      <span className="text-sm">Transacción No Aprobada · Pago Rechazado</span>
                    </div>
                    <p className="text-xs text-rose-100 leading-relaxed pl-6">
                      {paymentError}
                    </p>
                    <div className="pl-6 pt-1 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentError(null);
                          setPaymentMethod('credit_card');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-500/25 hover:bg-rose-500/35 text-white font-semibold text-xs border border-rose-500/40 transition-colors cursor-pointer"
                      >
                        Intentar con otra tarjeta
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentError(null);
                          setPaymentMethod('bank_transfer');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-200 font-semibold text-xs border border-emerald-500/40 transition-colors cursor-pointer"
                      >
                        Pagar con Transferencia Bancaria
                      </button>
                    </div>
                  </div>
                )}

                {/* Gateway Tab Selectors */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('payphone')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'payphone'
                        ? 'bg-[#1ea1c2]/20 border-[#1ea1c2] text-white'
                        : 'bg-white/5 border-white/10 text-[#bfa9dc] hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs">Payphone</div>
                    <div className="text-[10px] text-[#1ea1c2]">Express Link</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'credit_card'
                        ? 'bg-[#b80068]/20 border-[#b80068] text-white'
                        : 'bg-white/5 border-white/10 text-[#bfa9dc] hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs">Tarjeta</div>
                    <div className="text-[10px] text-pink-300">Visa / MC</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-[#25d366]/20 border-[#25d366] text-white'
                        : 'bg-white/5 border-white/10 text-[#bfa9dc] hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs">Transferencia</div>
                    <div className="text-[10px] text-emerald-400">Produbanco</div>
                  </button>
                </div>

                {/* Method 1: Payphone Direct Automated Gateway */}
                {paymentMethod === 'payphone' && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Botón de Pago Payphone</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                        Conexión Segura
                      </span>
                    </div>

                    <p className="text-[#bfa9dc]">
                      Haga clic en el enlace oficial de Payphone para abonar con su tarjeta registrada o app Payphone. Al terminar, pulse "Confirmar y Activar Flujo" para generar su comprobante.
                    </p>

                    <div className="p-3 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-between">
                      <span className="text-[#bfa9dc] font-mono">
                        {activeModality === 'deposit_50' ? 'Abono autorizado a pagar hoy:' : 'Total autorizado:'}
                      </span>
                      <span className="font-bold font-mono text-emerald-400 text-sm">USD ${amountToPayToday.toFixed(2)}</span>
                    </div>

                    {/* Payphone QR Quick Scan */}
                    <DynamicPaymentQR
                      method="payphone"
                      totalAmount={amountToPayToday}
                      payphoneUrl={PAYPHONE_CONFIG.directPaymentUrl}
                    />

                    <a
                      href={PAYPHONE_CONFIG.directPaymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#1ea1c2] to-[#3a0ca3] hover:opacity-95 flex items-center justify-center gap-2 shadow-md"
                    >
                      <span>Abrir Pasarela Payphone Oficial</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                {/* Method 2: Credit / Debit Card Interactive Simulator */}
                {paymentMethod === 'credit_card' && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Tarjeta de Crédito / Débito</span>
                      <div className="flex gap-1 text-[10px] font-mono text-[#bfa9dc]">
                        <span>VISA</span> • <span>MASTERCARD</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#bfa9dc] mb-1">Nombre en la tarjeta</label>
                      <input
                        type="text"
                        placeholder="CARLOS MENDOZA"
                        value={cardData.cardHolder}
                        onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-[#b80068] focus:outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#bfa9dc] mb-1">Número de tarjeta</label>
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="4000 1234 5678 9010"
                        value={cardData.cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                          setCardData({ ...cardData, cardNumber: val });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-[#b80068] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-mono text-[#bfa9dc] mb-1">Expira (MM/AA)</label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="08/28"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-[#b80068] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-[#bfa9dc] mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="•••"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-[#b80068] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Method 3: Direct Bank Transfer (Confidential & Protected) */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3.5 text-xs">
                    {/* Header with Verified Account Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        <span className="font-bold text-white">Datos de Transferencia Bancaria</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono flex items-center gap-1">
                        <Lock size={10} /> Cuenta Verificada
                      </span>
                    </div>

                    {/* Bank Transfer Instructions Notice */}
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-[#e0f7eb] leading-relaxed space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                          <Check size={13} className="text-emerald-400" />
                          <span>Instrucciones de Transferencia Directa</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="px-2.5 py-1 rounded-lg bg-[#25d366]/20 border border-[#25d366]/40 hover:bg-[#25d366]/30 text-emerald-300 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedBankInfo ? <Check size={11} className="text-white" /> : <Copy size={11} />}
                          <span className="font-semibold">{copiedBankInfo ? '¡Copiado!' : 'Copiar todo'}</span>
                        </button>
                      </div>
                      <p className="text-[#bfa9dc] text-[10px] leading-normal">
                        Transfiera el valor exacto desde la banca móvil o web de Produbanco (o mediante transferencia interbancaria SPI). Puede copiar cada dato con un clic o escanear el código QR adjunto.
                      </p>
                    </div>

                    {/* Bank Transfer Details Table */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] space-y-2 text-[#f3effa]">
                      {/* Banco */}
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-[#bfa9dc]">Banco:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{BANK_TRANSFER_DETAILS.bankName}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyField(BANK_TRANSFER_DETAILS.bankName, 'banco')}
                            className="p-1 rounded hover:bg-white/10 text-[#bfa9dc] hover:text-white transition-colors"
                            title="Copiar Banco"
                          >
                            {copiedField === 'banco' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </div>

                      {/* Tipo de Cuenta */}
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-[#bfa9dc]">Tipo de Cuenta:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-300">{BANK_TRANSFER_DETAILS.accountType}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyField(BANK_TRANSFER_DETAILS.accountType, 'tipo')}
                            className="p-1 rounded hover:bg-white/10 text-[#bfa9dc] hover:text-white transition-colors"
                            title="Copiar Tipo de Cuenta"
                          >
                            {copiedField === 'tipo' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </div>

                      {/* Número de Cuenta */}
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-[#bfa9dc]">Número de Cuenta:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white tracking-wider">
                            {BANK_TRANSFER_DETAILS.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyField(BANK_TRANSFER_DETAILS.accountNumber, 'cuenta')}
                            className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-sans flex items-center gap-1 transition-all cursor-pointer"
                            title="Copiar Número de Cuenta"
                          >
                            {copiedField === 'cuenta' ? <Check size={11} /> : <Copy size={11} />}
                            <span>{copiedField === 'cuenta' ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Beneficiario */}
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-[#bfa9dc]">Beneficiario:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            {BANK_TRANSFER_DETAILS.beneficiaryName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyField(BANK_TRANSFER_DETAILS.beneficiaryName, 'beneficiario')}
                            className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-sans flex items-center gap-1 transition-all cursor-pointer"
                            title="Copiar Beneficiario"
                          >
                            {copiedField === 'beneficiario' ? <Check size={11} /> : <Copy size={11} />}
                            <span>{copiedField === 'beneficiario' ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>

                      {/* RUC Emisor Oficial (13 dígitos para empresas y transferencias interbancarias) */}
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-[#bfa9dc]">R.U.C. (13 dígitos):</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white tracking-wider font-mono">
                            {BANK_TRANSFER_DETAILS.ruc || '1803227857001'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyField(BANK_TRANSFER_DETAILS.ruc || '1803227857001', 'ruc')}
                            className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-sans flex items-center gap-1 transition-all cursor-pointer"
                            title="Copiar R.U.C."
                          >
                            {copiedField === 'ruc' ? <Check size={11} /> : <Copy size={11} />}
                            <span>{copiedField === 'ruc' ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Cédula de Identidad (C.I.) */}
                      <div className="flex items-center justify-between py-1">
                        <span className="text-[#bfa9dc]">C.I. (Cédula 10 dígitos):</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white tracking-wider font-mono">
                            {BANK_TRANSFER_DETAILS.idNumber || '1803227857'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyField(BANK_TRANSFER_DETAILS.idNumber || '1803227857', 'ci')}
                            className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-sans flex items-center gap-1 transition-all cursor-pointer"
                            title="Copiar C.I."
                          >
                            {copiedField === 'ci' ? <Check size={11} /> : <Copy size={11} />}
                            <span>{copiedField === 'ci' ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic & Official Produbanco QR Code */}
                    <DynamicPaymentQR
                      method="produbanco"
                      totalAmount={amountToPayToday}
                      accountNumber={BANK_TRANSFER_DETAILS.accountNumber}
                      beneficiaryName={BANK_TRANSFER_DETAILS.beneficiaryName}
                      idNumber={BANK_TRANSFER_DETAILS.idNumber || BANK_TRANSFER_DETAILS.ruc}
                      bankName={BANK_TRANSFER_DETAILS.bankName}
                      orderRef={'ASEING-PROD-' + Date.now().toString().slice(-4)}
                    />

                    <div>
                      <label className="block text-[11px] font-mono text-[#bfa9dc] mb-1">
                        Número de Comprobante / Transacción *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. 18005352 o Nro. de transferencia Produbanco / SPI"
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-[#25d366] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#bfa9dc] mb-1">
                        Adjuntar Comprobante / Captura de Transferencia (JPG, PNG o PDF)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          id="transfer-voucher-input"
                          accept="image/*,application/pdf"
                          onChange={handleVoucherFileUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="transfer-voucher-input"
                          className="flex-1 cursor-pointer py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white font-mono text-xs flex items-center justify-center gap-2 transition-colors truncate"
                        >
                          <Upload size={14} className="text-[#1ea1c2] shrink-0" />
                          <span className="truncate">
                            {transferFile ? transferFile.filename : 'Seleccionar archivo o imagen de comprobante...'}
                          </span>
                        </label>
                        {transferFile && (
                          <button
                            type="button"
                            onClick={() => setTransferFile(null)}
                            className="px-2.5 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-mono transition-colors"
                            title="Quitar comprobante"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-[#bfa9dc]/70 mt-1">
                        Se adjuntará automáticamente al correo de verificación para agilizar la conciliación.
                      </p>
                    </div>
                  </div>
                )}

                {/* Onboarding Schedule Date Selection */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <label className="block text-[11px] font-mono text-[#1ea1c2] font-semibold">
                    📅 Agendar Primera Visita Técnica / Sesión de Onboarding:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="date"
                      value={auditDate}
                      onChange={(e) => setAuditDate(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-mono"
                    />
                    <select
                      value={auditTime}
                      onChange={(e) => setAuditTime(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#1c0a37] border border-white/10 text-white text-xs font-mono"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="11:30">11:30 AM</option>
                      <option value="14:30">02:30 PM</option>
                      <option value="16:00">04:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Resumen del Monto a Liquidar Hoy */}
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between items-center text-[#bfa9dc]">
                    <span>Modalidad Seleccionada:</span>
                    <span className="font-bold text-white">
                      {activeModality === 'deposit_50' ? 'Abono Inicial del 50%' : 'Pago Completo 100%'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400 font-bold">
                    <span>Monto a Cancelar Hoy:</span>
                    <span className="text-base font-black">USD ${amountToPayToday.toFixed(2)}</span>
                  </div>
                  {activeModality === 'deposit_50' && (
                    <div className="flex justify-between items-center text-amber-300 font-semibold border-t border-white/10 pt-1 text-[11px]">
                      <span>Saldo Pendiente (Contra Entrega):</span>
                      <span>USD ${pendingBalanceTotal.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Final Process Button */}
                <button
                  id="btn-confirm-payment-workflow"
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProcessPayment}
                  className="w-full py-4 rounded-full font-bold text-xs text-white bg-gradient-to-r from-[#25d366] via-[#1ea1c2] to-[#b80068] hover:opacity-95 shadow-xl shadow-[#25d366]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verificando y Activando Flujo Automatizado...</span>
                    </span>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>
                        {activeModality === 'deposit_50'
                          ? `Confirmar Abono Inicial de USD $${depositGrandTotal.toFixed(2)} y Generar Comprobante`
                          : `Confirmar Pago de USD $${grandTotal.toFixed(2)} y Generar Comprobante`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* STEP 4: SUCCESS & AUTOMATED ONBOARDING / RECEIPT */}
            {checkoutStep === 'success' && confirmedOrder && (
              <div id="printable-receipt" className="space-y-5 animate-in zoom-in-95 duration-300">
                <div className="text-center space-y-2 pb-4 border-b border-white/10">
                  <div
                    className={`w-12 h-12 rounded-full border flex items-center justify-center mx-auto ${
                      confirmedOrder.paymentStatus === 'pending_verification'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-[#25d366]/20 border-[#25d366]/40 text-[#25d366]'
                    }`}
                  >
                    {confirmedOrder.paymentStatus === 'pending_verification' ? (
                      <Clock size={28} />
                    ) : (
                      <CheckCircle2 size={28} />
                    )}
                  </div>
                  <span
                    className={`text-xs font-mono uppercase tracking-widest font-bold ${
                      confirmedOrder.paymentStatus === 'pending_verification'
                        ? 'text-amber-400'
                        : 'text-[#25d366]'
                    }`}
                  >
                    {confirmedOrder.paymentStatus === 'pending_verification'
                      ? 'TRANSFERENCIA REGISTRADA · PAGO EN VERIFICACIÓN'
                      : confirmedOrder.paymentModality === 'deposit_50'
                      ? 'ABONO INICIAL CONFIRMADO & PROCESO INICIADO'
                      : 'PAGO CONFIRMADO & PROCESO INICIADO'}
                  </span>
                  <h4 className="text-lg font-bold text-white">Orden: {confirmedOrder.orderNumber}</h4>
                  <p className="text-xs text-[#bfa9dc]">
                    {confirmedOrder.paymentStatus === 'pending_verification'
                      ? 'Hemos registrado los datos de su transferencia. Su comprobante oficial en PDF será generado y enviado en cuanto nuestro departamento contable concilie el abono en Produbanco.'
                      : confirmedOrder.paymentModality === 'deposit_50'
                      ? 'Comprobante Digital de Abono emitido. La visita técnica y consultoría han sido programadas.'
                      : 'Comprobante Digital de Pago emitido. La visita técnica y consultoría han sido programadas.'}
                  </p>
                </div>

                {/* Official Emitter Fiscal Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#18082e] via-[#2a0e4f] to-[#18082e] border border-white/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-mono text-[#1ea1c2] uppercase font-bold tracking-wider">
                      EMISOR AUTORIZADO ECUADOR
                    </div>
                    <div className="text-sm font-bold text-white">ASEING CONSULTORÍA INDUSTRIAL</div>
                    <div className="text-[11px] text-[#bfa9dc] mt-0.5">
                      R.U.C.: <strong className="text-white font-mono">1803227857001</strong> • Ambato, Ecuador
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                      ✓ CONTROL TRIBUTARIO ECUADOR
                    </span>
                    <div className="text-[10px] text-[#bfa9dc] mt-1">IVA 15% Vigente</div>
                  </div>
                </div>

                {/* Automated Digital Receipt & Notification Status */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1ea1c2]/15 via-[#18082e] to-[#25d366]/15 border border-[#1ea1c2]/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-[#1ea1c2]/20 text-[#1ea1c2] border border-[#1ea1c2]/30">
                        <FileCode size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase text-[#1ea1c2] font-bold">
                          COMPROBANTE ELECTRÓNICO DIGITAL
                        </div>
                        <div className="text-xs font-bold text-white">
                          Registro de Orden & Notificación Automática
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold ${
                        confirmedOrder.paymentStatus === 'pending_verification'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {confirmedOrder.paymentStatus === 'pending_verification' ? 'EN VERIFICACIÓN' : 'REGISTRADO'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-1.5 font-mono text-[11px]">
                    <div className="flex justify-between text-[#bfa9dc]">
                      <span>RUC Emisor:</span>
                      <strong className="text-white">1803227857001</strong>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between text-[#bfa9dc] gap-1">
                      <span>Envío por Correo:</span>
                      <strong className="text-emerald-400 truncate">
                        {confirmedOrder.billingInfo.email}
                      </strong>
                    </div>
                    <div className="pt-1 border-t border-white/10 text-[10px] text-[#bfa9dc]">
                      <span>Copia de respaldo en: </span>
                      <span className="text-white">aseingerencia1@gmail.com</span>
                    </div>
                  </div>

                  {/* Legal notice regarding SRI invoices */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] leading-relaxed">
                    <strong>Aviso Legal y Tributario:</strong> Este documento digital constituye el Comprobante Oficial de Registro y {confirmedOrder.paymentModality === 'deposit_50' ? 'Abono Inicial (50%)' : 'Pago Completo'} generado por la plataforma web de ASEING. La Factura Electrónica oficial autorizada por el SRI es expedida directamente por el personal contable autorizado de ASEING a través del portal oficial del SRI tras la liquidación del saldo correspondiente.
                  </div>

                  {/* Resend Email Button & Live Notification Feedback */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isSendingEmail}
                      onClick={() => handleResendInvoiceEmail(confirmedOrder.orderNumber)}
                      className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Send size={12} className={isSendingEmail ? 'animate-pulse text-[#1ea1c2]' : 'text-emerald-400'} />
                      <span>{isSendingEmail ? 'Enviando comprobante...' : 'Reenviar Comprobante a mi Correo'}</span>
                    </button>

                    <a
                      href={`/api/orders/${confirmedOrder.orderNumber}/sri-invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-[#1ea1c2]/20 hover:bg-[#1ea1c2]/30 text-[#1ea1c2] border border-[#1ea1c2]/30 font-mono text-[11px] flex items-center gap-1.5 transition-colors"
                    >
                      <FileText size={12} />
                      <span>Ver Formato XML SRI</span>
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

                {/* Printable Invoice / Receipt Card */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs space-y-3 font-mono">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-white uppercase">
                      {confirmedOrder.paymentModality === 'deposit_50'
                        ? 'COMPROBANTE DE ABONO INICIAL (50%)'
                        : 'COMPROBANTE DE PAGO COMPLETO (100%)'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                      {confirmedOrder.paymentModality === 'deposit_50' ? 'ABONO 50% REGISTRADO' : 'PAGO 100% REGISTRADO'}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#bfa9dc] text-[11px]">
                    <span>Fecha: {new Date(confirmedOrder.createdAt).toLocaleString('es-EC')}</span>
                    <span>Token: {confirmedOrder.payphoneReceiptToken}</span>
                  </div>

                  <div className="py-2 border-y border-white/5 space-y-1">
                    <div className="text-white"><strong>Cliente:</strong> {confirmedOrder.billingInfo.companyName}</div>
                    <div className="text-[#bfa9dc]"><strong>RUC/Cédula:</strong> {confirmedOrder.billingInfo.rucOrId}</div>
                    <div className="text-[#bfa9dc]"><strong>Email:</strong> {confirmedOrder.billingInfo.email}</div>
                  </div>

                  <div className="space-y-1.5 py-1">
                    {confirmedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-white">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>• {it.serviceTitle}</span>
                          {(it.serviceId === 'planificacion-control' || it.serviceTitle.toLowerCase().includes('planificación y control')) && (
                            <span className="px-1.5 py-0.2 rounded bg-[#1ea1c2]/20 text-[#1ea1c2] border border-[#1ea1c2]/30 text-[9px] font-mono font-bold">
                              Pago Único
                            </span>
                          )}
                        </div>
                        <span>USD ${it.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <div className="flex justify-between text-[#bfa9dc]">
                      <span>Subtotal Servicios:</span>
                      <span>USD ${confirmedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    {confirmedOrder.discountAmount > 0 && (
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[#25d366]">
                          <span>Descuento / Bonificación aplicada:</span>
                          <span>- USD ${confirmedOrder.discountAmount.toFixed(2)}</span>
                        </div>
                        {confirmedOrder.items.some((it) => it.serviceId === 'diagnostico-inicial') && (
                          <div className="text-[10px] text-emerald-400 font-sans">
                            ✓ Condición de catálogo aplicada: Diagnóstico inicial 100% bonificado ($0.00).
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between text-[#bfa9dc]">
                      <span>IVA 15%:</span>
                      <span>USD ${confirmedOrder.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-xs pt-1 border-t border-white/10">
                      <span>Inversión Total Contratada (100%):</span>
                      <span className="text-[#1ea1c2]">USD ${confirmedOrder.total.toFixed(2)}</span>
                    </div>

                    {confirmedOrder.paymentModality === 'deposit_50' ? (
                      <div className="pt-2 border-t border-white/10 space-y-1.5">
                        <div className="flex justify-between text-emerald-400 font-bold text-xs">
                          <span>Abono Inicial Pagado Hoy (50% + IVA):</span>
                          <span className="font-mono text-sm">
                            USD ${(confirmedOrder.amountPaidToday ?? (confirmedOrder.depositAmount ? confirmedOrder.depositAmount * 1.15 : confirmedOrder.total * 0.5)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-amber-300 font-bold text-xs">
                          <span>Saldo Pendiente (Contra Entrega / Cierre):</span>
                          <span className="font-mono text-sm">
                            USD ${(confirmedOrder.pendingBalance ?? (confirmedOrder.total - (confirmedOrder.amountPaidToday || (confirmedOrder.total * 0.5)))).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#bfa9dc] font-sans italic pt-0.5">
                          * El saldo pendiente del 50% será facturado y cancelado contra entrega de los informes finales.
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between text-emerald-400 font-bold text-sm pt-1 border-t border-white/10">
                        <span>Total Pagado Hoy (100%):</span>
                        <span className="font-mono">USD ${confirmedOrder.total.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Automated Next Steps */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1ea1c2]/10 to-[#b80068]/10 border border-[#1ea1c2]/30 space-y-2 text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#1ea1c2]" />
                    <span>Visita Técnica Agendada:</span>
                  </div>
                  <p className="text-[#f3effa]">
                    Fecha programada: <strong>{confirmedOrder.scheduledAuditDate || 'Por coordinar'}</strong>. Nuestro auditor líder asignado se presentará en sus instalaciones o sala de conferencias virtual.
                  </p>
                </div>

                {/* Action Buttons: Print & WhatsApp Notification */}
                <div className="space-y-2 pt-2">
                  {/* Botón Descargar Comprobante PDF Real (Oficial) o Aviso de Verificación */}
                  {confirmedOrder.paymentStatus === 'pending_verification' ? (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5 text-center">
                      <div className="font-bold flex items-center justify-center gap-1.5 text-amber-300">
                        <Clock size={15} />
                        <span>Comprobante Oficial en Proceso de Verificación</span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">
                        Su orden fue guardada en estado <strong>Pago en Verificación</strong>. Nuestro equipo contable validará el abono en Produbanco y activará la emisión de su Comprobante Oficial en PDF directamente a su correo registrado.
                      </p>
                    </div>
                  ) : (
                    <a
                      id="btn-download-pdf-real"
                      href={pdfDownloadUrl || `/api/orders/${confirmedOrder.orderNumber}/pdf`}
                      download={`Comprobante-ASEING-${confirmedOrder.orderNumber}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 rounded-full font-bold text-xs text-white bg-gradient-to-r from-[#1ea1c2] via-[#3a0ca3] to-[#b80068] hover:opacity-95 flex items-center justify-center gap-2 shadow-xl shadow-[#1ea1c2]/25 transition-all cursor-pointer"
                    >
                      <Download size={16} />
                      <span>
                        {confirmedOrder.paymentModality === 'deposit_50'
                          ? 'Descargar Comprobante de Abono Oficial (PDF)'
                          : 'Descargar Comprobante de Pago Oficial (PDF)'}
                      </span>
                    </a>
                  )}

                  {whatsappShareLink && (
                    <a
                      id="btn-whatsapp-order-confirm"
                      href={whatsappShareLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-full font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                    >
                      <span>Notificar por WhatsApp a Dirección Técnica</span>
                      <ExternalLink size={14} />
                    </a>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isSendingEmail}
                      onClick={() => handleResendInvoiceEmail(confirmedOrder.orderNumber)}
                      className="py-2.5 px-3 rounded-full font-semibold text-[11px] text-[#bfa9dc] bg-white/5 border border-white/10 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Mail size={13} className="text-[#1ea1c2]" />
                      <span>{isSendingEmail ? 'Enviando...' : 'Reenviar a mi Email'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="py-2.5 px-3 rounded-full font-semibold text-[11px] text-[#bfa9dc] bg-white/5 border border-white/10 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer size={13} />
                      <span>Imprimir Vista</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      resetFormState();
                      onClearCart();
                      setCheckoutStep('cart');
                    }}
                    className="w-full text-center py-2 text-xs text-[#bfa9dc] hover:underline cursor-pointer"
                  >
                    Realizar otra cotización o contratación
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Accordion (Desplegable) */}
      <div id="faq" className="mt-20 border-t border-white/10 [.day-mode_&]:border-black/10 pt-16">
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1ea1c2] [.day-mode_&]:text-[#0b6a82] font-semibold">
            PREGUNTAS FRECUENTES SOBRE PAGOS Y CONTRATACIÓN
          </span>
          <h3 className="text-2xl font-bold text-white [.day-mode_&]:text-[#1e0338] mt-1 transition-colors">
            Transparencia en Cada Proceso
          </h3>
          <p className="text-xs sm:text-sm text-[#bfa9dc] [.day-mode_&]:text-[#5a4b73] mt-1.5 transition-colors">
            Haga clic en cualquiera de las preguntas para desplegar la respuesta técnica correspondiente.
          </p>
        </div>

        <div className="space-y-3 max-w-4xl">
          {FAQ_ITEMS.map((faq, idx) => (
            <details
              key={idx}
              className="group rounded-2xl bg-white/[0.03] [.day-mode_&]:bg-white border border-white/10 [.day-mode_&]:border-purple-950/15 p-4 sm:p-5 transition-all duration-200 hover:border-[#1ea1c2]/40 [.day-mode_&]:hover:border-[#1ea1c2] open:bg-white/[0.05] [.day-mode_&]:open:bg-[#fbf9fe] open:border-[#1ea1c2]/50 shadow-sm [.day-mode_&]:shadow-[0_2px_8px_rgba(30,3,56,0.06)]"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none select-none text-white [.day-mode_&]:text-[#1e0338] font-semibold text-sm sm:text-base gap-4 transition-colors">
                <span className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1ea1c2] group-open:bg-[#b80068] transition-colors shrink-0" />
                  <span className="faq-question-text text-white [.day-mode_&]:text-[#1e0338] hover:text-[#1ea1c2] [.day-mode_&]:hover:text-[#0b6a82] transition-colors font-medium sm:font-semibold">
                    {faq.q}
                  </span>
                </span>
                <ChevronDown
                  size={18}
                  className="text-[#bfa9dc] [.day-mode_&]:text-[#5a4b73] transition-transform duration-300 group-open:rotate-180 shrink-0"
                />
              </summary>
              <div className="faq-answer mt-3.5 pt-3.5 border-t border-white/10 [.day-mode_&]:border-purple-950/10 text-xs sm:text-sm text-[#bfa9dc] [.day-mode_&]:text-[#321f47] leading-relaxed pl-5 animate-in fade-in duration-200 font-normal">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
