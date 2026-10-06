export type PaymentMethod = 'payphone' | 'credit_card' | 'bank_transfer';

export type PaymentStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'verified';

export interface ServiceItem {
  id: string;
  category: 'produccion' | 'costos' | 'iso' | 'sst' | 'digital' | 'inversion' | 'bienestar';
  title: string;
  shortDesc: string;
  fullDesc: string;
  modalidad: 'Único' | 'Pago Único' | 'Mensual' | 'Proyecto' | 'Por grupo' | 'Licencia mensual';
  price: number;
  popular?: boolean;
  savingsBadge?: string;
  paymentCondition?: string;
  iconName: string;
  deliverables: string[];
  estimatedDays: string;
  requiresPlantAudit?: boolean;
  qrCodeImage?: string;
}

export interface IsoPackage {
  id: string;
  title: string;
  standards: string[];
  description: string;
  discountPercentage: number;
  originalPrice: number;
  finalPrice: number;
  steps: {
    number: string;
    name: string;
    desc: string;
  }[];
}

export interface ClientBillingInfo {
  companyName: string;
  legalRepresentative: string;
  rucOrId: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  industrySector: string;
  employeesCount: string;
}

export interface OrderItem {
  serviceId: string;
  serviceTitle: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export type PaymentModality = 'full' | 'deposit_50';

export interface Order {
  id: string;
  orderNumber: string; // e.g. ASE-2026-8492
  createdAt: string;
  billingInfo: ClientBillingInfo;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number; // IVA 15% (Ecuador)
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  transactionId?: string;
  payphoneReceiptToken?: string;
  notes?: string;
  onboardingStep: 'payment_confirmed' | 'diagnosis_pending' | 'audit_scheduled' | 'consultant_assigned';
  scheduledAuditDate?: string;
  // Modalidad de pago & liquidación
  paymentModality?: PaymentModality; // 'full' | 'deposit_50'
  amountPaidToday?: number; // Monto efectivamente abonado/pagado hoy (con IVA)
  depositAmount?: number; // Monto base del abono
  depositTaxAmount?: number; // IVA 15% correspondiente al abono pagado hoy
  pendingBalance?: number; // Saldo pendiente total a liquidar contra entrega/finalización
  pendingBalanceBase?: number; // Base pendiente (50% de servicios sujetos a abono)
  pendingBalanceTax?: number; // IVA 15% correspondiente al saldo pendiente
}

export interface DiagnosticAnswer {
  questionId: string;
  selectedOptionIndex: number;
}

export interface DiagnosticResult {
  score: number; // 0 to 100
  level: 'Critico' | 'Basico' | 'Intermedio' | 'Avanzado';
  summary: string;
  strengths: string[];
  vulnerabilities: string[];
  recommendedServices: string[]; // service IDs
  estimatedSavingsPotential: string;
}
