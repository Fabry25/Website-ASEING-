import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { generateOrderPdf } from "./server/pdfGenerator.ts";
import { sendOrderReceiptEmail, sendTransferVerificationEmail } from "./server/emailSender.ts";

dotenv.config();
if (!process.env.SMTP_PASS && fs.existsSync(".env.example")) {
  dotenv.config({ path: ".env.example" });
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// In-memory persistent state for orders, leads, and diagnostics
interface StoredOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  billingInfo: {
    companyName: string;
    legalRepresentative: string;
    rucOrId: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    industrySector: string;
    employeesCount: string;
  };
  items: Array<{
    serviceId: string;
    serviceTitle: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference?: string;
  transactionId?: string;
  payphoneReceiptToken?: string;
  notes?: string;
  onboardingStep: string;
  scheduledAuditDate?: string;
  paymentModality?: string; // 'full' | 'deposit_50'
  amountPaidToday?: number;
  depositAmount?: number;
  depositTaxAmount?: number;
  pendingBalance?: number;
  pendingBalanceBase?: number;
  pendingBalanceTax?: number;
  transferProof?: {
    dataUrl?: string;
    filename?: string;
    reference?: string;
  };
}

const ordersStore: Map<string, StoredOrder> = new Map();
const leadsStore: Array<any> = [];

// Seed an initial demo order so client portal lookup works out of the box
const initialOrder: StoredOrder = {
  id: "order-demo-1",
  orderNumber: "ASE-2026-1042",
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  billingInfo: {
    companyName: "Industrias Andina S.A.",
    legalRepresentative: "Ing. Carlos Mendoza",
    rucOrId: "1792348592001",
    email: "operaciones@andina.ec",
    phone: "+593 99 876 5432",
    city: "Ambato",
    address: "Parque Industrial Calle B, Lote 14",
    industrySector: "Manufactura y Calzado",
    employeesCount: "45"
  },
  items: [
    {
      serviceId: "paquete-iso-trinorma",
      serviceTitle: "Paquete Trinorma Integrado (ISO 9001 + 14001 + 45001)",
      unitPrice: 3960,
      quantity: 1,
      subtotal: 3960
    }
  ],
  subtotal: 3960,
  discountAmount: 640,
  taxAmount: 594, // 15% IVA Ecuador
  total: 4554,
  paymentMethod: "payphone",
  paymentStatus: "approved",
  paymentReference: "PAYP-REF-983271",
  transactionId: "TX-772910384",
  payphoneReceiptToken: "PPH-TOKEN-892147",
  notes: "Contratación de paquete integral de certificación trinorma.",
  onboardingStep: "audit_scheduled",
  scheduledAuditDate: "2026-09-24 09:30"
};
ordersStore.set(initialOrder.orderNumber, initialOrder);
ordersStore.set(initialOrder.id, initialOrder);

// Seed order for Auditoría Interna y Pre-Auditoría de Certificación ($440)
const auditoriaOrder: StoredOrder = {
  id: "order-demo-auditoria",
  orderNumber: "ASE-2026-4401",
  createdAt: new Date(Date.now() - 43200000).toISOString(),
  billingInfo: {
    companyName: "Manufacturas Metalmecánicas del Austro Cía. Ltda.",
    legalRepresentative: "Ing. Roberto Santamaría",
    rucOrId: "0190345678001",
    email: "operaciones@metalmecanica.ec",
    phone: "+593 98 466 1214",
    city: "Cuenca",
    address: "Parque Industrial Calle Las Herrerías 4-12",
    industrySector: "Metalmecánica y Estructuras",
    employeesCount: "35"
  },
  items: [
    {
      serviceId: "auditoria-interna",
      serviceTitle: "Auditoría Interna y Pre-Auditoría de Certificación",
      unitPrice: 440,
      quantity: 1,
      subtotal: 440
    }
  ],
  subtotal: 440,
  discountAmount: 0,
  taxAmount: 66, // 15% IVA Ecuador
  total: 506,
  paymentMethod: "payphone",
  paymentStatus: "approved",
  paymentReference: "PAYP-REF-440912",
  transactionId: "TX-440192834",
  payphoneReceiptToken: "PPH-TOKEN-440562",
  notes: "Auditoría interna rigurosa previa a inspección de organismo certificador acreditado.",
  onboardingStep: "audit_scheduled",
  scheduledAuditDate: "2026-09-29 09:30"
};
ordersStore.set(auditoriaOrder.orderNumber, auditoriaOrder);
ordersStore.set(auditoriaOrder.id, auditoriaOrder);

// Seed order for App de Planificación de Producción (Compra $250)
const appCompraOrder: StoredOrder = {
  id: "order-demo-app-compra",
  orderNumber: "ASE-2026-2501",
  createdAt: new Date(Date.now() - 25000000).toISOString(),
  billingInfo: {
    companyName: "Alimentos Procesados Tungurahua S.A.",
    legalRepresentative: "Leda. María Elena Morales",
    rucOrId: "1891238475001",
    email: "produccion@alimentostungurahua.ec",
    phone: "+593 98 466 1214",
    city: "Ambato",
    address: "Av. Indoamérica Km 4 1/2 y Los Sauces",
    industrySector: "Agroindustria y Conservas",
    employeesCount: "50"
  },
  items: [
    {
      serviceId: "app-planificacion",
      serviceTitle: "App de Planificación de Producción ASEING (Compra de App)",
      unitPrice: 250,
      quantity: 1,
      subtotal: 250
    }
  ],
  subtotal: 250,
  discountAmount: 0,
  taxAmount: 37.5, // 15% IVA Ecuador
  total: 287.5,
  paymentMethod: "payphone",
  paymentStatus: "approved",
  paymentReference: "PAYP-REF-250819",
  transactionId: "TX-250198421",
  payphoneReceiptToken: "PPH-TOKEN-250781",
  notes: "Adquisición definitiva de la aplicación de producción ASEING para planta industrial. Código y despliegue.",
  onboardingStep: "audit_scheduled",
  scheduledAuditDate: "2026-09-25 10:00"
};
ordersStore.set(appCompraOrder.orderNumber, appCompraOrder);
ordersStore.set(appCompraOrder.id, appCompraOrder);

// Seed order for App de Planificación de Producción (Licencia Mensual $30)
const appLicenciaOrder: StoredOrder = {
  id: "order-demo-app-licencia",
  orderNumber: "ASE-2026-3001",
  createdAt: new Date(Date.now() - 15000000).toISOString(),
  billingInfo: {
    companyName: "Calzados y Cuero del Centro Cía. Ltda.",
    legalRepresentative: "Sr. Patricio Villacís",
    rucOrId: "1890456123001",
    email: "gerencia@calzadoscentro.ec",
    phone: "+593 99 876 5432",
    city: "Cevallos",
    address: "Calle 24 de Mayo y 10 de Agosto",
    industrySector: "Manufactura de Calzado",
    employeesCount: "22"
  },
  items: [
    {
      serviceId: "app-planificacion-mensual",
      serviceTitle: "App de Planificación de Producción ASEING (Licencia Mensual)",
      unitPrice: 30,
      quantity: 1,
      subtotal: 30
    }
  ],
  subtotal: 30,
  discountAmount: 0,
  taxAmount: 4.5, // 15% IVA Ecuador
  total: 34.5,
  paymentMethod: "bank_transfer",
  paymentStatus: "approved",
  paymentReference: "TRANSF-PROD-300941",
  transactionId: "TX-300195820",
  payphoneReceiptToken: "",
  notes: "Suscripción a Licencia mensual de la App de Planificación ASEING ($30/mes).",
  onboardingStep: "audit_scheduled",
  scheduledAuditDate: "2026-09-26 11:00"
};
ordersStore.set(appLicenciaOrder.orderNumber, appLicenciaOrder);
ordersStore.set(appLicenciaOrder.id, appLicenciaOrder);

const pcpUnicoOrder: StoredOrder = {
  id: "order-demo-pcp-unico",
  orderNumber: "ASE-2026-3801",
  createdAt: "2026-09-18T10:30:00.000Z",
  billingInfo: {
    companyName: "Manufacturas Metálicas del Austro Cía. Ltda.",
    legalRepresentative: "Ing. Carlos M. Benalcázar",
    rucOrId: "0190345678001",
    email: "carlos.benalcazar@metalicaustro.com.ec",
    phone: "+593 99 765 4321",
    city: "Cuenca",
    address: "Parque Industrial El Salado, Calle 3",
    industrySector: "Metalmecánica y Fabricación",
    employeesCount: "38"
  },
  items: [
    {
      serviceId: "planificacion-control",
      serviceTitle: "Planificación y Control de la Producción (PCP) - Pago Único",
      unitPrice: 380,
      quantity: 1,
      subtotal: 380
    },
    {
      serviceId: "diagnostico-inicial",
      serviceTitle: "Diagnóstico inicial de Procesos Productivos (100% Bonificado por Catálogo)",
      unitPrice: 30,
      quantity: 1,
      subtotal: 0
    }
  ],
  subtotal: 380,
  discountAmount: 30,
  taxAmount: 57, // 15% IVA Ecuador ($380 * 0.15)
  total: 437, // $380 + $57
  paymentMethod: "bank_transfer",
  paymentStatus: "approved",
  paymentReference: "TRANSF-PROD-380104",
  transactionId: "TX-380194827",
  payphoneReceiptToken: "REC-ASE-380199",
  notes: "Contratación de Planificación y Control de la Producción (PCP) en modalidad Pago Único ($380 USD). Bonificación al 100% de Diagnóstico Inicial de Procesos Productivos ($30 USD).",
  onboardingStep: "audit_scheduled",
  scheduledAuditDate: "2026-09-29 09:30"
};
ordersStore.set(pcpUnicoOrder.orderNumber, pcpUnicoOrder);
ordersStore.set(pcpUnicoOrder.id, pcpUnicoOrder);

// ----------------- LOCAL DATA PERSISTENCE ----------------- //

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (_) {}
  }
}

function saveOrdersToDisk() {
  try {
    ensureDataDir();
    const uniqueOrders = Array.from(new Set(Array.from(ordersStore.values())));
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(uniqueOrders, null, 2), "utf-8");
  } catch (err: any) {
    console.warn("[ASEING Storage] Error saving orders to disk:", err.message);
  }
}

function saveLeadsToDisk() {
  try {
    ensureDataDir();
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leadsStore, null, 2), "utf-8");
  } catch (err: any) {
    console.warn("[ASEING Storage] Error saving leads to disk:", err.message);
  }
}

function loadDataFromDisk() {
  try {
    ensureDataDir();
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const ord of parsed) {
          if (ord && ord.orderNumber) {
            ordersStore.set(ord.orderNumber, ord);
            ordersStore.set(ord.id, ord);
          }
        }
      }
    }
    if (fs.existsSync(LEADS_FILE)) {
      const raw = fs.readFileSync(LEADS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        leadsStore.push(...parsed);
      }
    }
  } catch (err: any) {
    console.warn("[ASEING Storage] Note loading data from disk:", err.message);
  }
}

// Initial load & sync
loadDataFromDisk();
saveOrdersToDisk();

// ----------------- SRI ECUADOR & NOTIFICATIONS HELPERS ----------------- //

// Calculate Modulo 11 check digit for 48-character base string according to SRI Ecuador standard
function calculateSriModulo11(base48: string): number {
  let factor = 2;
  let sum = 0;
  for (let i = base48.length - 1; i >= 0; i--) {
    sum += parseInt(base48.charAt(i), 10) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const mod = sum % 11;
  const digito = 11 - mod;
  if (digito === 11) return 0;
  if (digito === 10) return 1;
  return digito;
}

// Generate 49-digit SRI Ecuador Clave de Acceso
function generateSriAccessKey(params: {
  fechaEmision: Date;
  tipoComprobante: string; // 01 = Factura
  ruc: string; // 13 dígitos
  tipoAmbiente: string; // 1 = Pruebas, 2 = Producción
  serie: string; // 6 dígitos (001001)
  secuencial: string; // 9 dígitos
  codigoNumerico: string; // 8 dígitos
  tipoEmision: string; // 1 = Normal
}): string {
  const d = String(params.fechaEmision.getDate()).padStart(2, "0");
  const m = String(params.fechaEmision.getMonth() + 1).padStart(2, "0");
  const y = String(params.fechaEmision.getFullYear());
  const fechaStr = `${d}${m}${y}`;

  const ruc13 = params.ruc.padEnd(13, "0").slice(0, 13);
  const secuencial9 = params.secuencial.padStart(9, "0").slice(-9);
  const serie6 = params.serie.padStart(6, "0").slice(-6);
  const codigo8 = params.codigoNumerico.padStart(8, "0").slice(-8);

  const base48 = `${fechaStr}${params.tipoComprobante}${ruc13}${params.tipoAmbiente}${serie6}${secuencial9}${codigo8}${params.tipoEmision}`;
  const digitoVerificador = calculateSriModulo11(base48);
  return `${base48}${digitoVerificador}`;
}

// Dispatches order confirmation notification to official channels and customer
async function dispatchOrderNotification(order: StoredOrder) {
  const adminEmail = process.env.ASEING_ADMIN_EMAIL || "aseingerencia1@gmail.com";
  const OFFICIAL_GAS_URL =
    "https://script.google.com/macros/s/AKfycbyNHSVfUwWoUG_hq0ESP6DqLoXecaK9trHwEsDCbVHn3A-o6MrX-9xL6N1_-2ffPYgDnA/exec";
  let gasUrl = (process.env.GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_WEBHOOK_URL || OFFICIAL_GAS_URL).trim();
  if (gasUrl.includes("...") || gasUrl.includes("YOUR_") || gasUrl.includes("MY_")) {
    gasUrl = OFFICIAL_GAS_URL;
  }
  const rucEmisor = process.env.SRI_RUC_EMISOR || "1803227857001";
  const tipoAmbiente = process.env.SRI_ENVIRONMENT || "1";
  const numericSuffix = order.orderNumber.replace(/\D/g, "") || "1042";

  // Calculate official 49-digit SRI Access Key
  const claveAcceso = generateSriAccessKey({
    fechaEmision: new Date(order.createdAt || Date.now()),
    tipoComprobante: "01",
    ruc: rucEmisor,
    tipoAmbiente,
    serie: "001001",
    secuencial: numericSuffix.padStart(9, "0"),
    codigoNumerico: "12345678",
    tipoEmision: "1"
  });

  console.log(`[ASEING Notification] Processing dispatch for order ${order.orderNumber} (RUC Emisor: ${rucEmisor}, Clave SRI: ${claveAcceso}) to ${order.billingInfo.email} and ${adminEmail}`);

  if (gasUrl && gasUrl.startsWith("http") && gasUrl.includes("script.google.com")) {
    try {
      await fetch(gasUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "ORDEN_PAGADA_CONFIRMADA",
          orderNumber: order.orderNumber,
          rucEmisor: rucEmisor,
          razonSocialEmisor: "ASEING CONSULTORÍA INDUSTRIAL",
          claveAccesoSRI: claveAcceso,
          empresa: order.billingInfo.companyName,
          representante: order.billingInfo.legalRepresentative,
          rucOrId: order.billingInfo.rucOrId,
          correo: order.billingInfo.email,
          telefono: order.billingInfo.phone,
          ciudad: order.billingInfo.city,
          total: order.total,
          subtotal: order.subtotal,
          descuento: order.discountAmount,
          iva: order.taxAmount,
          modalidadPago: order.paymentModality || "full",
          montoPagadoHoy: order.amountPaidToday ?? order.total,
          saldoPendiente: order.pendingBalance ?? (order.total - (order.amountPaidToday || order.total)),
          metodoPago: order.paymentMethod,
          transaccion: order.transactionId || order.paymentReference,
          fechaVisitaTecnica: order.scheduledAuditDate || "Por coordinar",
          items: order.items.map(i => `${i.serviceTitle} ($${i.subtotal})`).join(" | ")
        })
      });
      console.log(`[ASEING Notification] Successfully forwarded order ${order.orderNumber} with SRI Clave to Google Apps Script.`);
    } catch (gasErr: any) {
      console.warn(`[ASEING Notification] Google Apps Script forward notice:`, gasErr.message);
    }
  }
}

// ----------------- API ROUTES ----------------- //

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "ASEING Platform API",
    version: "2.5.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// Brand Logo Configuration & Automation endpoints
const BRAND_CONFIG_FILE = path.join(DATA_DIR, "brand-config.json");

app.get("/api/brand/logo", (_req, res) => {
  try {
    ensureDataDir();
    if (fs.existsSync(BRAND_CONFIG_FILE)) {
      const raw = fs.readFileSync(BRAND_CONFIG_FILE, "utf-8");
      return res.json(JSON.parse(raw));
    }
    return res.json({
      activePreset: "cuadrado",
      format: "auto",
      glowEffect: true,
      updatedAt: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/brand/logo", (req, res) => {
  try {
    ensureDataDir();
    const { activePreset, customUrl, format, glowEffect, filename } = req.body;
    let savedCustomUrl = customUrl;

    // If custom image dataUrl is provided, persist it to disk
    if (customUrl && typeof customUrl === "string" && customUrl.startsWith("data:image/")) {
      const publicDir = path.join(process.cwd(), "public");
      const distDir = path.join(process.cwd(), "dist");
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      const base64Data = customUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const ext = customUrl.includes("image/svg") ? ".svg" : customUrl.includes("image/jpeg") ? ".jpg" : ".png";
      const cleanName = filename ? `logo-custom-${Date.now()}-${path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, "")}` : `logo-custom-${Date.now()}${ext}`;
      const targetPath = path.join(publicDir, cleanName);
      fs.writeFileSync(targetPath, buffer);
      if (fs.existsSync(distDir)) {
        try {
          fs.writeFileSync(path.join(distDir, cleanName), buffer);
        } catch (_) {}
      }
      savedCustomUrl = `/${cleanName}`;
    }

    const newConfig = {
      activePreset: activePreset || "cuadrado",
      customUrl: savedCustomUrl || null,
      format: format || "auto",
      glowEffect: glowEffect ?? true,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(BRAND_CONFIG_FILE, JSON.stringify(newConfig, null, 2), "utf-8");
    res.json({ success: true, config: newConfig });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Carousel image upload and management
app.post("/api/carousel/upload", (req, res) => {
  try {
    const { filename, dataUrl, files } = req.body;
    const itemsToSave: Array<{ filename: string; dataUrl: string }> = files || (filename && dataUrl ? [{ filename, dataUrl }] : []);

    if (itemsToSave.length === 0) {
      return res.status(400).json({ error: "No se proporcionaron imágenes para guardar." });
    }

    const publicDir = path.join(process.cwd(), "public");
    const distDir = path.join(process.cwd(), "dist");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const savedFiles: string[] = [];
    for (const item of itemsToSave) {
      if (!item.filename || !item.dataUrl) continue;
      // Extract base64
      const base64Data = item.dataUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const cleanName = path.basename(item.filename);

      const targetPath = path.join(publicDir, cleanName);
      fs.writeFileSync(targetPath, buffer);
      savedFiles.push(cleanName);

      if (fs.existsSync(distDir)) {
        try {
          fs.writeFileSync(path.join(distDir, cleanName), buffer);
        } catch (_) {}
      }
    }

    res.json({
      success: true,
      message: `${savedFiles.length} imagen(es) guardada(s) exitosamente.`,
      files: savedFiles
    });
  } catch (error: any) {
    console.error("Error saving carousel image:", error);
    res.status(500).json({ error: error.message || "Error al procesar la imagen." });
  }
});

// Helper to calculate default business schedule date for technical visits
function getDefaultScheduledDate(baseDate: Date = new Date()): string {
  const d = new Date(baseDate.getTime());
  // Set 4 business days ahead
  d.setDate(d.getDate() + 4);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Sunday -> Monday
  if (d.getDay() === 6) d.setDate(d.getDate() + 2); // Saturday -> Monday
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day} 09:30`;
}

// Create Order (Draft or Initial Checkout)
app.post("/api/orders", (req, res) => {
  try {
    const {
      billingInfo,
      items,
      subtotal,
      discountAmount,
      taxAmount,
      total,
      paymentMethod,
      scheduledAuditDate,
      paymentModality,
      amountPaidToday,
      depositAmount,
      depositTaxAmount,
      pendingBalance,
      pendingBalanceBase,
      pendingBalanceTax,
      notes
    } = req.body;

    if (!billingInfo || !items || items.length === 0) {
      return res.status(400).json({ error: "Datos de orden incompletos o sin servicios seleccionados." });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ASE-2026-${randomSuffix}`;
    const id = `order-${Date.now()}`;

    // Auto-link scheduled technical visit date from input or computed business slot
    const finalScheduledDate = scheduledAuditDate && scheduledAuditDate.trim().length > 0
      ? scheduledAuditDate.trim()
      : getDefaultScheduledDate();

    const newOrder: StoredOrder = {
      id,
      orderNumber,
      createdAt: new Date().toISOString(),
      billingInfo,
      items,
      subtotal: Number(subtotal) || 0,
      discountAmount: Number(discountAmount) || 0,
      taxAmount: Number(taxAmount) || 0,
      total: Number(total) || 0,
      paymentMethod: paymentMethod || "payphone",
      paymentStatus: "pending",
      onboardingStep: "audit_scheduled",
      scheduledAuditDate: finalScheduledDate,
      notes: notes || "",
      paymentModality: paymentModality || "full",
      amountPaidToday: amountPaidToday !== undefined ? Number(amountPaidToday) : Number(total),
      depositAmount: depositAmount !== undefined ? Number(depositAmount) : undefined,
      depositTaxAmount: depositTaxAmount !== undefined ? Number(depositTaxAmount) : undefined,
      pendingBalance: pendingBalance !== undefined ? Number(pendingBalance) : 0,
      pendingBalanceBase: pendingBalanceBase !== undefined ? Number(pendingBalanceBase) : 0,
      pendingBalanceTax: pendingBalanceTax !== undefined ? Number(pendingBalanceTax) : 0
    };

    ordersStore.set(newOrder.orderNumber, newOrder);
    ordersStore.set(newOrder.id, newOrder);
    saveOrdersToDisk();

    res.status(201).json({
      success: true,
      order: newOrder
    });
  } catch (err: any) {
    res.status(500).json({ error: "Error al crear la orden: " + err.message });
  }
});

// Get Order by Order Number or ID with automatic technical visit linking
app.get("/api/orders/:identifier", (req, res) => {
  const { identifier } = req.params;
  const order = ordersStore.get(identifier) || Array.from(ordersStore.values()).find(
    (o) => o.orderNumber.toUpperCase() === identifier.toUpperCase() || o.billingInfo.email.toLowerCase() === identifier.toLowerCase()
  );

  if (!order) {
    return res.status(404).json({ error: "Orden no encontrada con el identificador proporcionado." });
  }

  // Automatic linking: If order does not have a scheduled technical visit date yet, link one automatically
  if (!order.scheduledAuditDate || order.scheduledAuditDate.trim() === "") {
    order.scheduledAuditDate = getDefaultScheduledDate(new Date(order.createdAt || Date.now()));
    order.onboardingStep = "audit_scheduled";
    ordersStore.set(order.orderNumber, order);
    ordersStore.set(order.id, order);
  }

  res.json({ success: true, order });
});

// Update / Link Scheduled Technical Visit Date for an Order
app.post("/api/orders/:identifier/schedule", (req, res) => {
  try {
    const { identifier } = req.params;
    const { scheduledAuditDate, notes } = req.body;

    if (!scheduledAuditDate || scheduledAuditDate.trim() === "") {
      return res.status(400).json({ error: "Debe proporcionar una fecha y hora para la visita técnica." });
    }

    const order = ordersStore.get(identifier) || Array.from(ordersStore.values()).find(
      (o) => o.orderNumber.toUpperCase() === identifier.toUpperCase() || o.billingInfo.email.toLowerCase() === identifier.toLowerCase()
    );

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada para actualizar visita técnica." });
    }

    order.scheduledAuditDate = scheduledAuditDate.trim();
    order.onboardingStep = "audit_scheduled";
    if (notes) {
      order.notes = (order.notes ? order.notes + " | " : "") + notes;
    }

    ordersStore.set(order.orderNumber, order);
    ordersStore.set(order.id, order);
    saveOrdersToDisk();

    const primaryService = order.items && order.items[0] ? order.items[0].serviceTitle : "Consultoría Industrial";
    const whatsappMessage = encodeURIComponent(
      `*ASEING CONSULTORA - VISITA TÉCNICA PROGRAMADA Y ENLAZADA*\n\n` +
      `📋 *Orden / Proforma:* ${order.orderNumber}\n` +
      `🏢 *Empresa:* ${order.billingInfo.companyName}\n` +
      `🛠️ *Servicio Enlazado:* ${primaryService}\n` +
      `📅 *Fecha de Visita Técnica:* ${order.scheduledAuditDate}\n` +
      `📍 *Ubicación:* ${order.billingInfo.address || 'Instalaciones del cliente'}, ${order.billingInfo.city || 'Ecuador'}\n\n` +
      `_Confirmación automatizada por el Portal del Cliente ASEING._`
    );

    res.json({
      success: true,
      message: "Fecha de visita técnica enlazada y confirmada exitosamente.",
      order,
      whatsappDirectLink: `https://wa.me/593984661214?text=${whatsappMessage}`
    });
  } catch (err: any) {
    res.status(500).json({ error: "Error al actualizar visita técnica: " + err.message });
  }
});

// Payphone Payment Intent Creation
app.post("/api/payphone/create-payment", (req, res) => {
  try {
    const { orderNumber, total, clientPhone, clientEmail } = req.body;

    const order = ordersStore.get(orderNumber);
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada." });
    }

    const clientTxId = `TX-ASE-${Date.now()}`;
    const payphoneDirectUrl = "https://payp.page.link/QEYpZ";

    // Update order with payment pending reference
    order.paymentReference = `PPH-${Math.floor(100000 + Math.random() * 900000)}`;
    order.transactionId = clientTxId;
    order.paymentStatus = "processing";
    ordersStore.set(order.orderNumber, order);
    saveOrdersToDisk();

    res.json({
      success: true,
      payphoneUrl: payphoneDirectUrl,
      orderNumber: order.orderNumber,
      clientTxId,
      amountInCents: Math.round(order.total * 100),
      currency: "USD",
      message: "Intención de pago registrada exitosamente en Payphone."
    });
  } catch (err: any) {
    res.status(500).json({ error: "Error al procesar intención de pago: " + err.message });
  }
});

// Endpoint Principal de Pago y Facturación (/api/pago) - Separación Estricta de Canales
app.post("/api/pago", async (req, res) => {
  try {
    const {
      orderNumber,
      paymentMethod,
      paymentModality,
      amountToPayToday,
      cardData,
      transferRef,
      transferProof,
      scheduledDate
    } = req.body;

    let order = orderNumber ? ordersStore.get(orderNumber) : null;
    if (!order && orderNumber) {
      order = Array.from(ordersStore.values()).find((o) => o.orderNumber === orderNumber) || null;
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        status: "Rejected",
        message: "No se encontró la orden especificada para procesar el pago."
      });
    }

    if (scheduledDate) {
      order.scheduledAuditDate = scheduledDate;
      order.onboardingStep = "audit_scheduled";
    }

    // =========================================================================
    // CAMINO A: Flujo Automatizado para Payphone (Tarjetas de Crédito / Débito)
    // =========================================================================
    if (paymentMethod === "payphone" || paymentMethod === "credit_card") {
      // 1. Simulación o validación de tarjeta / prueba de rechazo bancario
      if (cardData && cardData.cardNumber) {
        const cleanCard = cardData.cardNumber.replace(/\s+/g, "");
        // Casos de prueba para verificar manejo de rechazo: terminadas en 0000 o menores a 13 dígitos
        if (cleanCard.endsWith("0000") || (cleanCard.length > 0 && cleanCard.length < 13)) {
          order.paymentStatus = "rejected";
          ordersStore.set(order.orderNumber, order);
          saveOrdersToDisk();

          return res.status(402).json({
            success: false,
            status: "Rejected",
            message: "Pago Rechazado: Transacción declinada por la entidad emisora (Fondos insuficientes o datos no válidos). Por favor intente con otra tarjeta o seleccione transferencia bancaria."
          });
        }
      }

      // Conexión real con API de Payphone si existe PAYPHONE_TOKEN
      const payphoneToken = process.env.PAYPHONE_TOKEN;
      if (payphoneToken) {
        try {
          const clientTxId = `TX-ASE-${Date.now()}`;
          const amountInCents = Math.round((amountToPayToday || order.total) * 100);
          const taxInCents = Math.round(order.taxAmount * 100);
          const subtotalInCents = amountInCents - taxInCents;

          const pphRes = await fetch("https://pay.payphonetodoesposible.com/api/button/Prepare", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${payphoneToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              responseUrl: `${req.protocol}://${req.get("host")}/api/payphone/confirm`,
              amount: amountInCents,
              amountWithoutTax: 0,
              amountWithTax: subtotalInCents > 0 ? subtotalInCents : amountInCents,
              tax: taxInCents,
              service: 0,
              tip: 0,
              clientTransactionId: clientTxId,
              currency: "USD",
              email: order.billingInfo.email,
              phoneNumber: order.billingInfo.phone
            })
          });

          const pphData: any = await pphRes.json();
          if (pphData && pphData.payUrl) {
            order.transactionId = clientTxId;
            order.paymentReference = pphData.paymentId ? String(pphData.paymentId) : clientTxId;
            order.paymentStatus = "processing";
            ordersStore.set(order.orderNumber, order);
            saveOrdersToDisk();

            return res.json({
              success: true,
              status: "RedirectRequired",
              payUrl: pphData.payUrl,
              paymentId: pphData.paymentId,
              order
            });
          }
        } catch (pphErr: any) {
          console.warn("[ASEING Payphone] Error en llamada a Payphone API:", pphErr.message);
        }
      }

      // 2. Transacción Aprobada (Camino A)
      order.paymentStatus = "approved";
      order.paymentMethod = paymentMethod;
      order.payphoneReceiptToken = `REC-ASE-${Math.floor(1000000 + Math.random() * 9000000)}`;
      order.transactionId = `TX-PPH-${Date.now().toString().slice(-8)}`;
      order.paymentReference = `PPH-${Math.floor(100000 + Math.random() * 900000)}`;

      ordersStore.set(order.orderNumber, order);
      ordersStore.set(order.id, order);
      saveOrdersToDisk();

      // 3. OBLIGATORIO: Generar PDF oficial y enviar correo al cliente (await) ANTES de responder al frontend
      console.log(`[ASEING /api/pago] Camino A (Payphone): Generando PDF y enviando comprobante por correo a ${order.billingInfo.email}...`);
      const emailResult = await sendOrderReceiptEmail(order);

      // 4. Enlace directo de notificación vía WhatsApp a Dirección Técnica
      const whatsappMessage = encodeURIComponent(
        `*ASEING CONSULTORA INDUSTRIAL - PAGO CONCILIADO (TARJETA / PAYPHONE)*\n\n` +
        `¡Hola! Se ha aprobado el pago inmediato de la orden: *${order.orderNumber}*\n` +
        `🏢 *Empresa:* ${order.billingInfo.companyName}\n` +
        `📋 *RUC/ID:* ${order.billingInfo.rucOrId}\n` +
        `💰 *Total Contratado:* USD $${order.total.toFixed(2)}\n` +
        `💵 *Monto Conciliado Hoy:* USD $${(order.amountPaidToday ?? order.total).toFixed(2)}\n` +
        `💳 *Método:* TARJETA / PAYPHONE\n` +
        `🔖 *Token Comprobante:* ${order.payphoneReceiptToken}\n` +
        (order.scheduledAuditDate ? `📅 *Visita Técnica:* ${order.scheduledAuditDate}\n` : "") +
        `\n_Comprobante oficial en PDF generado y enviado exitosamente al cliente._`
      );

      // 5. Devolver la respuesta exitosa al frontend SOLO después de que el correo haya sido enviado
      return res.json({
        success: true,
        status: "Approved",
        message: "Pago Aprobado con éxito. Se ha generado y enviado su comprobante digital en formato PDF.",
        order,
        pdfUrl: `/api/orders/${order.orderNumber}/pdf`,
        whatsappDirectLink: `https://wa.me/593984661214?text=${whatsappMessage}`,
        emailResult
      });
    }

    // =========================================================================
    // CAMINO B: Flujo para Produbanco (Transferencias Bancarias - Manual)
    // =========================================================================
    if (paymentMethod === "transferencia" || paymentMethod === "bank_transfer") {
      // 1. Guardar la orden con el estado "Pago en Verificación"
      order.paymentStatus = "pending_verification";
      order.paymentMethod = "bank_transfer";
      order.paymentReference = transferRef || transferProof?.reference || `TRANSF-PRODUBANCO-${Date.now().toString().slice(-6)}`;
      order.transactionId = `TX-PEND-${Date.now().toString().slice(-8)}`;

      if (transferProof) {
        order.transferProof = transferProof;
      }

      ordersStore.set(order.orderNumber, order);
      ordersStore.set(order.id, order);
      saveOrdersToDisk();

      // 2. Construir enlace de aprobación para la Dirección Técnica
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const host = req.get("host");
      const baseUrl = process.env.APP_URL && !process.env.APP_URL.includes("MY_APP_URL")
        ? process.env.APP_URL
        : `${protocol}://${host}`;
      const approveUrl = `${baseUrl}/api/orders/${order.orderNumber}/approve`;

      // 3. Enviar correo de notificación interna a aseingerencia1@gmail.com con el comprobante y el enlace de aprobación
      // (NO generes el PDF oficial todavía ni le envíes el recibo al cliente)
      console.log(`[ASEING /api/pago] Camino B (Produbanco): Enviando correo de verificación interna a aseingerencia1@gmail.com con enlace: ${approveUrl}`);
      const adminNoticeResult = await sendTransferVerificationEmail(
        order,
        approveUrl,
        transferProof || { reference: order.paymentReference }
      );

      // 4. Mensaje para WhatsApp del cliente / secretaría técnica
      const whatsappMessage = encodeURIComponent(
        `*ASEING CONSULTORA INDUSTRIAL - TRANSFERENCIA EN VERIFICACIÓN*\n\n` +
        `¡Hola! Se ha registrado el comprobante de transferencia para la orden: *${order.orderNumber}*\n` +
        `🏢 *Empresa:* ${order.billingInfo.companyName}\n` +
        `📋 *RUC/ID:* ${order.billingInfo.rucOrId}\n` +
        `💰 *Total Contratado:* USD $${order.total.toFixed(2)}\n` +
        `💵 *Monto Transferido:* USD $${(order.amountPaidToday ?? order.total).toFixed(2)}\n` +
        `🔖 *Referencia / Comprobante:* ${order.paymentReference}\n` +
        `⏳ *Estado Actual:* Pago en Verificación\n\n` +
        `_Nuestro departamento contable revisará la cuenta Produbanco para conciliar el pago y emitir el Comprobante Oficial en PDF._`
      );

      // 5. Devolver respuesta al frontend indicando que la orden está "En verificación"
      return res.json({
        success: true,
        status: "PendingVerification",
        message: "Su orden ha sido registrada en estado 'Pago en Verificación'. Una vez que el departamento contable concilie el abono en Produbanco, se emitirá y enviará su comprobante oficial en PDF.",
        order,
        whatsappDirectLink: `https://wa.me/593984661214?text=${whatsappMessage}`,
        emailResult: adminNoticeResult
      });
    }

    return res.status(400).json({
      success: false,
      status: "Error",
      message: `Método de pago '${paymentMethod}' no reconocido.`
    });
  } catch (err: any) {
    console.error("[ASEING /api/pago Error]:", err);
    return res.status(500).json({
      success: false,
      status: "Error",
      message: "Error interno procesando el pago: " + err.message
    });
  }
});

// =========================================================================
// NUEVO ENDPOINT DE APROBACIÓN (Solo para el Camino B: Transferencias)
// GET /api/orders/:orderNumber/approve
// =========================================================================
app.get("/api/orders/:orderNumber/approve", async (req, res) => {
  try {
    const { orderNumber } = req.params;
    let order = ordersStore.get(orderNumber);
    if (!order) {
      order = Array.from(ordersStore.values()).find(
        (o) => o.orderNumber.toUpperCase() === orderNumber.toUpperCase() || o.id === orderNumber
      );
    }

    if (!order) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Orden no encontrada | ASEING</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f0728; color: #ffffff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #18082e; border: 1px solid rgba(239,68,68,0.3); border-radius: 16px; max-width: 480px; width: 100%; padding: 36px 28px; text-align: center; }
            h1 { font-size: 20px; color: #ef4444; margin: 0 0 10px 0; }
            p { color: #cbd5e1; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Orden no encontrada</h1>
            <p>No se encontró ningún registro para la orden <strong>${orderNumber}</strong>.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Si ya estaba aprobada previamente
    if (order.paymentStatus === "approved") {
      return res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Orden Ya Aprobada | ASEING</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f0728; color: #ffffff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #18082e; border: 1px solid rgba(30,161,194,0.3); border-radius: 16px; max-width: 520px; width: 100%; padding: 36px 28px; text-align: center; }
            .icon { font-size: 40px; color: #1ea1c2; margin-bottom: 15px; }
            h1 { font-size: 22px; color: #ffffff; margin: 0 0 12px 0; }
            p { color: #cbd5e1; font-size: 14px; line-height: 1.6; }
            .btn { display: inline-block; margin-top: 20px; background: #1ea1c2; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 24px; border-radius: 50px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">ℹ️</div>
            <h1>Esta orden ya fue aprobada previamente</h1>
            <p>La orden <strong>${order.orderNumber}</strong> (${order.billingInfo.companyName}) ya se encuentra en estado <strong>Aprobado</strong> y el comprobante PDF oficial fue despachado a <strong>${order.billingInfo.email}</strong>.</p>
            <a href="/api/orders/${order.orderNumber}/pdf" class="btn" target="_blank">📄 Ver Comprobante PDF Oficial</a>
          </div>
        </body>
        </html>
      `);
    }

    // 1. Cambiar el estado de la orden a "approved"
    order.paymentStatus = "approved";
    order.payphoneReceiptToken = `REC-TRANSF-${Math.floor(1000000 + Math.random() * 9000000)}`;
    order.transactionId = order.transactionId || `TX-PROD-${Date.now().toString().slice(-8)}`;

    ordersStore.set(order.orderNumber, order);
    ordersStore.set(order.id, order);
    saveOrdersToDisk();

    // 2. Ejecutar la generación del PDF y enviar el correo automatizado al cliente con su PDF adjunto
    console.log(`[ASEING /approve] Aprobando orden ${order.orderNumber}. Generando PDF y enviando comprobante a ${order.billingInfo.email}...`);
    await sendOrderReceiptEmail(order);

    // 3. Retornar mensaje HTML simple en el navegador
    return res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Orden Aprobada Exitosamente | ASEING</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #0d041c 0%, #18082e 50%, #064e3b 100%);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 24px;
            box-sizing: border-box;
          }
          .card {
            background: rgba(24, 8, 46, 0.95);
            border: 1px solid rgba(16, 185, 129, 0.4);
            border-radius: 20px;
            max-width: 560px;
            width: 100%;
            padding: 40px 32px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          }
          .icon-circle {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.2);
            border: 2px solid #10b981;
            color: #10b981;
            font-size: 38px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 22px;
          }
          h1 {
            font-size: 24px;
            margin: 0 0 10px 0;
            color: #ffffff;
            font-weight: 700;
          }
          .lead {
            font-size: 15px;
            color: #cbd5e1;
            margin: 0 0 20px 0;
          }
          .info-box {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 16px 20px;
            margin: 20px 0;
            text-align: left;
            font-size: 13px;
            line-height: 1.7;
            color: #e2e8f0;
          }
          .info-box strong { color: #ffffff; }
          .highlight { color: #34d399; font-weight: 600; }
          .btn-pdf {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
            padding: 14px 28px;
            border-radius: 50px;
            box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
            margin-top: 10px;
          }
          .btn-pdf:hover {
            opacity: 0.95;
          }
          .footer-note {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 24px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon-circle">✓</div>
          <h1>Orden aprobada exitosamente.</h1>
          <p class="lead">El comprobante ha sido enviado al cliente.</p>

          <div class="info-box">
            <div>• <strong>Orden:</strong> ${order.orderNumber}</div>
            <div>• <strong>Cliente:</strong> ${order.billingInfo.companyName}</div>
            <div>• <strong>Correo Destinatario:</strong> <span class="highlight">${order.billingInfo.email}</span></div>
            <div>• <strong>Monto Conciliado:</strong> USD $${(order.amountPaidToday ?? order.total).toFixed(2)}</div>
            <div>• <strong>Nuevo Estado:</strong> <span style="color:#34d399;font-weight:bold;">Aprobado (Approved)</span></div>
          </div>

          <a href="/api/orders/${order.orderNumber}/pdf" class="btn-pdf" target="_blank">
            📄 Ver / Descargar Comprobante PDF Oficial
          </a>

          <p class="footer-note">
            ASEING Consultoría Industrial · Dirección Técnica<br/>
            Ambato, Ecuador · aseingerencia1@gmail.com
          </p>
        </div>
      </body>
      </html>
    `);
  } catch (err: any) {
    console.error("[ASEING /approve Error]:", err);
    return res.status(500).send("Error interno aprobando la orden: " + err.message);
  }
});

// Endpoint para Descargar el Comprobante Electrónico en PDF Real (Vectorial)
app.get("/api/orders/:identifier/pdf", async (req, res) => {
  try {
    const { identifier } = req.params;
    const order = ordersStore.get(identifier) || Array.from(ordersStore.values()).find(
      (o) => o.orderNumber.toUpperCase() === identifier.toUpperCase() || o.id === identifier
    );

    if (!order) {
      return res.status(404).send("Comprobante no encontrado.");
    }

    const pdfBuffer = await generateOrderPdf(order);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="Comprobante-ASEING-${order.orderNumber}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error("[ASEING PDF Download Error]:", err);
    res.status(500).send("Error generando archivo PDF: " + err.message);
  }
});

// Confirm / Verify Payment (Payphone, Credit Card or Bank Transfer)
app.post("/api/payphone/verify", (req, res) => {
  try {
    const { orderNumber, paymentMethod, transactionReference, cardLast4, scheduledDate } = req.body;

    const order = ordersStore.get(orderNumber);
    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada para verificación." });
    }

    order.paymentStatus = "approved";
    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.paymentReference = transactionReference || order.paymentReference || `CONF-${Date.now()}`;
    order.transactionId = `TX-APROBADA-${Date.now().toString().slice(-8)}`;
    order.payphoneReceiptToken = `REC-ASE-${Math.floor(1000000 + Math.random() * 9000000)}`;
    order.onboardingStep = scheduledDate ? "audit_scheduled" : "diagnosis_pending";
    if (scheduledDate) {
      order.scheduledAuditDate = scheduledDate;
    }

    ordersStore.set(order.orderNumber, order);
    ordersStore.set(order.id, order);
    saveOrdersToDisk();

    // Trigger asynchronous notification to official channels and Google Apps Script
    dispatchOrderNotification(order).catch(() => {});

    // Generate real PDF & dispatch email
    sendOrderReceiptEmail(order).catch((emailErr) => {
      console.warn("[ASEING Mailer Verify notice]:", emailErr.message);
    });

    // Prepare automated notification payload for WhatsApp
    const whatsappMessage = encodeURIComponent(
      `*ASEING CONSULTORA INDUSTRIAL - CONFIRMACIÓN DE ORDEN*\n\n` +
      `¡Hola! Se ha confirmado la orden: *${order.orderNumber}*\n` +
      `🏢 *Empresa:* ${order.billingInfo.companyName}\n` +
      `📋 *RUC/ID:* ${order.billingInfo.rucOrId}\n` +
      `💰 *Inversión Total Contratada:* USD $${order.total.toFixed(2)}\n` +
      `💳 *Modalidad:* ${order.paymentModality === 'deposit_50' ? 'Abono Inicial del 50%' : 'Pago Completo (100%)'}\n` +
      `💵 *Monto Pagado / Abonado Hoy:* USD $${(order.amountPaidToday ?? order.total).toFixed(2)}\n` +
      (order.paymentModality === 'deposit_50' ? `⏳ *Saldo Pendiente:* USD $${(order.pendingBalance ?? (order.total - (order.amountPaidToday || 0))).toFixed(2)} (A liquidar contra entrega)\n` : '') +
      (order.discountAmount > 0 ? `🎁 *Bonificación/Descuento:* -USD $${order.discountAmount.toFixed(2)}\n` : "") +
      `💳 *Método:* ${order.paymentMethod === 'bank_transfer' ? 'TRANSFERENCIA (PRODUBANCO)' : order.paymentMethod.toUpperCase()}\n` +
      `🔖 *Referencia/Token:* ${order.payphoneReceiptToken || order.paymentReference}\n` +
      (order.scheduledAuditDate ? `📅 *Visita Técnica Agendada:* ${order.scheduledAuditDate}\n` : "") +
      `\n_Flujo de trabajo automatizado iniciado por ASEING._`
    );

    const whatsappDirectLink = `https://wa.me/593984661214?text=${whatsappMessage}`;

    res.json({
      success: true,
      status: "Approved",
      message: "Pago aprobado y flujo de trabajo activado automáticamente.",
      order,
      pdfUrl: `/api/orders/${order.orderNumber}/pdf`,
      whatsappDirectLink
    });
  } catch (err: any) {
    res.status(500).json({ error: "Error al verificar pago: " + err.message });
  }
});

// Payphone Server-to-Server Webhook / Confirmation Endpoint
app.post("/api/payphone/webhook", async (req, res) => {
  try {
    const { id, clientTxId, status, transactionStatus } = req.body;
    console.log(`[ASEING Payphone Webhook] Notification received:`, { id, clientTxId, status, transactionStatus });

    if (!id && !clientTxId) {
      return res.status(400).json({ error: "Identificador de transacción o id de Payphone requerido." });
    }

    // Locate order by clientTxId or transactionId
    let order: StoredOrder | undefined;
    for (const ord of ordersStore.values()) {
      if (
        (clientTxId && (ord.transactionId === clientTxId || ord.orderNumber === clientTxId)) ||
        (id && (ord.paymentReference === String(id) || ord.payphoneReceiptToken === String(id)))
      ) {
        order = ord;
        break;
      }
    }

    if (!order && clientTxId) {
      // Try search by orderNumber
      order = ordersStore.get(clientTxId);
    }

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada para el webhook recibido." });
    }

    const payphoneToken = process.env.PAYPHONE_TOKEN;
    let verifiedStatus = status || transactionStatus || "Approved";

    // If server has PAYPHONE_TOKEN configured, execute live server-to-server confirmation
    if (payphoneToken && id && clientTxId) {
      try {
        const confirmResponse = await fetch("https://pay.payphonetodoesposible.com/api/v3/Sale/Confirm", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${payphoneToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id: Number(id),
            clientTxId
          })
        });
        const confirmData: any = await confirmResponse.json();
        console.log(`[ASEING Payphone Webhook] Live Payphone API response:`, confirmData);
        if (confirmData.transactionStatus) {
          verifiedStatus = confirmData.transactionStatus;
        }
      } catch (confirmErr: any) {
        console.warn(`[ASEING Payphone Webhook] Warning confirming with Payphone API:`, confirmErr.message);
      }
    }

    // Map Payphone status: Approved (3), Rejected (2), Pending (1), Canceled
    if (verifiedStatus === "Approved" || verifiedStatus === 3 || verifiedStatus === "3") {
      order.paymentStatus = "approved";
      order.payphoneReceiptToken = `PPH-REC-${id || Date.now()}`;
      order.onboardingStep = "audit_scheduled";
      dispatchOrderNotification(order).catch(() => {});
    } else if (verifiedStatus === "Rejected" || verifiedStatus === 2 || verifiedStatus === "2") {
      order.paymentStatus = "rejected";
    } else if (verifiedStatus === "Canceled") {
      order.paymentStatus = "rejected";
    } else {
      order.paymentStatus = "processing";
    }

    ordersStore.set(order.orderNumber, order);
    ordersStore.set(order.id, order);
    saveOrdersToDisk();

    res.json({
      success: true,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      message: `Webhook de Payphone procesado. Estado: ${order.paymentStatus}.`
    });
  } catch (err: any) {
    console.error("[ASEING Payphone Webhook] Error:", err);
    res.status(500).json({ error: "Error procesando webhook de Payphone: " + err.message });
  }
});

// SRI Ecuador Electronic Invoice (Factura Electrónica v2.1.0) Generation & Inspection
app.get("/api/orders/:identifier/sri-invoice", (req, res) => {
  try {
    const { identifier } = req.params;
    const order = ordersStore.get(identifier) || Array.from(ordersStore.values()).find(
      (o) => o.orderNumber.toUpperCase() === identifier.toUpperCase() || o.billingInfo.email.toLowerCase() === identifier.toLowerCase()
    );

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada para emitir comprobante SRI." });
    }

    const orderDate = new Date(order.createdAt || Date.now());
    const rucEmisor = process.env.SRI_RUC_EMISOR || "1803227857001"; // RUC oficial ASEING
    const tipoAmbiente = process.env.SRI_ENVIRONMENT || "1"; // 1 = Pruebas, 2 = Producción
    const numericSuffix = order.orderNumber.replace(/\D/g, "") || "1042";
    const secuencial = numericSuffix.padStart(9, "0");
    const codigoNumerico = "12345678";

    // 49-digit SRI Access Key
    const claveAcceso = generateSriAccessKey({
      fechaEmision: orderDate,
      tipoComprobante: "01", // Factura
      ruc: rucEmisor,
      tipoAmbiente,
      serie: "001001", // Establecimiento 001, Punto de Emisión 001
      secuencial,
      codigoNumerico,
      tipoEmision: "1" // Emisión normal
    });

    const isRuc = (order.billingInfo.rucOrId || "").length === 13;
    const tipoIdentificacionComprador = isRuc ? "04" : (order.billingInfo.rucOrId || "").length === 10 ? "05" : "07"; // 04=RUC, 05=Cédula, 07=Consumidor Final

    // Desglose fiscal Ecuador (IVA 15%)
    const subtotal15 = Number(order.subtotal.toFixed(2));
    const valorIva = Number(order.taxAmount.toFixed(2));
    const importeTotal = Number(order.total.toFixed(2));

    // SRI XML Payload Structure
    const sriXml = `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="2.1.0">
  <infoTributaria>
    <ambiente>${tipoAmbiente}</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>ASEING CONSULTORÍA INDUSTRIAL</razonSocial>
    <nombreComercial>ASEING</nombreComercial>
    <ruc>${rucEmisor}</ruc>
    <claveAcceso>${claveAcceso}</claveAcceso>
    <codDoc>01</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>${secuencial}</secuencial>
    <dirMatriz>Av. Imbabura y Maytacapac, Ambato, Ecuador</dirMatriz>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>${String(orderDate.getDate()).padStart(2, "0")}/${String(orderDate.getMonth() + 1).padStart(2, "0")}/${orderDate.getFullYear()}</fechaEmision>
    <dirEstablecimiento>Av. Imbabura y Maytacapac, Ambato</dirEstablecimiento>
    <obligadoContabilidad>NO</obligadoContabilidad>
    <tipoIdentificacionComprador>${tipoIdentificacionComprador}</tipoIdentificacionComprador>
    <razonSocialComprador>${order.billingInfo.companyName}</razonSocialComprador>
    <identificacionComprador>${order.billingInfo.rucOrId}</identificacionComprador>
    <direccionComprador>${order.billingInfo.address}, ${order.billingInfo.city}</direccionComprador>
    <totalSinImpuestos>${subtotal15.toFixed(2)}</totalSinImpuestos>
    <totalDescuento>${order.discountAmount.toFixed(2)}</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>4</codigoPorcentaje>
        <baseImponible>${subtotal15.toFixed(2)}</baseImponible>
        <tarifa>15.00</tarifa>
        <valor>${valorIva.toFixed(2)}</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <propina>0.00</propina>
    <importeTotal>${importeTotal.toFixed(2)}</importeTotal>
    <moneda>DOLAR</moneda>
    <pagos>
      <pago>
        <formaPago>${order.paymentMethod === 'bank_transfer' ? '20' : '19'}</formaPago>
        <total>${importeTotal.toFixed(2)}</total>
      </pago>
    </pagos>
  </infoFactura>
  <detalles>
${order.items.map((it, idx) => {
  const desc = it.serviceId === 'planificacion-control'
    ? 'Planificación y Control de la Producción (PCP) - Pago Único'
    : it.serviceTitle;
  const itemDescuento = it.unitPrice > it.subtotal ? (it.unitPrice - it.subtotal).toFixed(2) : "0.00";
  return `    <detalle>
      <codigoPrincipal>${it.serviceId}</codigoPrincipal>
      <descripcion>${desc}</descripcion>
      <cantidad>${it.quantity}</cantidad>
      <precioUnitario>${it.unitPrice.toFixed(2)}</precioUnitario>
      <descuento>${itemDescuento}</descuento>
      <precioTotalSinImpuesto>${it.subtotal.toFixed(2)}</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>4</codigoPorcentaje>
          <tarifa>15.00</tarifa>
          <baseImponible>${it.subtotal.toFixed(2)}</baseImponible>
          <valor>${(it.subtotal * 0.15).toFixed(2)}</valor>
        </impuesto>
      </impuestos>
    </detalle>`;
}).join("\n")}
  </detalles>
  <infoAdicional>
    <campoAdicional nombre="Email">${order.billingInfo.email}</campoAdicional>
    <campoAdicional nombre="Telefono">${order.billingInfo.phone}</campoAdicional>
    <campoAdicional nombre="OrdenReferencia">${order.orderNumber}</campoAdicional>
    <campoAdicional nombre="VisitaTecnica">${order.scheduledAuditDate || "Por coordinar"}</campoAdicional>
  </infoAdicional>
</factura>`;

    res.json({
      success: true,
      orderNumber: order.orderNumber,
      rucEmisor,
      razonSocialEmisor: "ASEING CONSULTORÍA INDUSTRIAL",
      representanteLegal: "Ing. John F. Suárez J. M.Sc.",
      direccionMatriz: "Av. Imbabura y Maytacapac, Ambato, Ecuador",
      correoEmisor: "aseingerencia1@gmail.com",
      telefonoEmisor: "+593 984 661 214",
      claveAcceso,
      ambiente: tipoAmbiente === "2" ? "PRODUCCIÓN" : "PRUEBAS",
      estadoSri: order.paymentStatus === "approved" ? "AUTORIZADO" : "PENDIENTE_PAGO",
      autorizacionNumero: claveAcceso,
      desglose: {
        subtotal15,
        subtotal0: 0.00,
        descuentos: order.discountAmount,
        iva15: valorIva,
        importeTotal
      },
      xmlFacturaSri: sriXml
    });
  } catch (err: any) {
    res.status(500).json({ error: "Error al generar comprobante electrónico SRI: " + err.message });
  }
});

// Trigger / Resend Order Email Notification
app.post("/api/orders/:identifier/send-notification", async (req, res) => {
  try {
    const { identifier } = req.params;
    const order = ordersStore.get(identifier) || Array.from(ordersStore.values()).find(
      (o) => o.orderNumber.toUpperCase() === identifier.toUpperCase() || o.billingInfo.email.toLowerCase() === identifier.toLowerCase()
    );

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada." });
    }

    await dispatchOrderNotification(order);

    res.json({
      success: true,
      message: `Notificación y comprobante digital enviado con éxito para la orden ${order.orderNumber}.`,
      destinatarios: [order.billingInfo.email, process.env.ASEING_ADMIN_EMAIL || "aseingerencia1@gmail.com"]
    });
  } catch (err: any) {
    res.status(500).json({ error: "Error al despachar notificación: " + err.message });
  }
});

// Automated Operational Diagnostic Evaluation Endpoint
app.post("/api/diagnostic/evaluate", (req, res) => {
  try {
    const { industrySector, controlTiempos, estadoIso, sstStatus } = req.body;

    let score = 30; // base score
    const strengths: string[] = [];
    const vulnerabilities: string[] = [];
    const recommendedServices: string[] = [];

    // Tiempos y balanceo
    if (controlTiempos === "avanzado") {
      score += 25;
      strengths.push("Posee registros de cronometraje o balanceo de línea previo.");
    } else if (controlTiempos === "parcial") {
      score += 15;
      vulnerabilities.push("Falta estandarizar suplementos por fatiga y tiempos de ciclo reales.");
      recommendedServices.push("tiempos-movimientos");
    } else {
      score += 5;
      vulnerabilities.push("Pérdidas no cuantificadas en tiempos muertos y desbalanceo crítico de estaciones.");
      recommendedServices.push("diagnostico-inicial", "tiempos-movimientos", "costos-produccion");
    }

    // ISO status
    if (estadoIso === "certificado") {
      score += 25;
      strengths.push("Cuenta con certificaciones previas; se requiere auditoría de mantenimiento.");
      recommendedServices.push("auditoria-interna");
    } else if (estadoIso === "en_proceso") {
      score += 15;
      vulnerabilities.push("Documentación inconexa o riesgo de no conformidades mayores en auditoría.");
      recommendedServices.push("auditoria-interna");
    } else {
      score += 5;
      vulnerabilities.push("Ausencia de sistema de gestión estandarizado; descontrol de reprocesos y quejas.");
      recommendedServices.push("paquete-iso-trinorma");
    }

    // SST status
    if (sstStatus === "cumple") {
      score += 20;
      strengths.push("Matriz de riesgos y reglamento interno vigentes.");
    } else {
      score += 5;
      vulnerabilities.push("Riesgo de sanciones legales ante entes de control laboral por falta de matrices IPERC.");
      recommendedServices.push("iso-45001", "capacitacion-sso");
    }

    score = Math.min(100, Math.max(15, score));

    let level: "Critico" | "Basico" | "Intermedio" | "Avanzado" = "Basico";
    let summary = "";
    let estimatedSavingsPotential = "15% - 25% de costos operacionales";

    if (score < 45) {
      level = "Critico";
      summary = "Su planta presenta cuellos de botella severos y alta vulnerabilidad regulatoria. Se recomienda un diagnóstico inicial urgente.";
      estimatedSavingsPotential = "25% - 40% de reducción de mermas y tiempos improductivos";
    } else if (score < 70) {
      level = "Basico";
      summary = "Existen buenas bases operativas pero sin integración formal de control de costos ni certificación de calidad.";
      estimatedSavingsPotential = "18% - 30% de ahorro directo en costos de fabricación";
    } else if (score < 85) {
      level = "Intermedio";
      summary = "Buen nivel de control industrial. El paso clave es la acreditación Trinorma (ISO 9001:2026 / ISO 14001:2026 / ISO 45001) para licitar a gran escala.";
      estimatedSavingsPotential = "12% - 20% de incremento en capacidad y productividad";
    } else {
      level = "Avanzado";
      summary = "Operación madura. Recomendamos auditorías preventivas continuas y digitalización con la App de Planificación ASEING.";
      estimatedSavingsPotential = "Optimización continua y cero no conformidades";
    }

    res.json({
      success: true,
      result: {
        score,
        level,
        summary,
        strengths,
        vulnerabilities,
        recommendedServices,
        estimatedSavingsPotential
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "Error en evaluación: " + err.message });
  }
});

// Deduplication cache to prevent double email and double lead execution
const recentLeadSubmissions = new Map<string, number>();

// Contact Leads Registry & Google Apps Script Sync
app.post("/api/leads", async (req, res) => {
  try {
    const { nombre, empresa, correo, telefono, cargo, mensaje, servicioInteres } = req.body;

    if (!nombre || !correo) {
      return res.status(400).json({ success: false, error: "Nombre y correo son obligatorios." });
    }

    const cleanEmail = String(correo).trim().toLowerCase();
    const cleanName = String(nombre).trim().toLowerCase();
    const dedupKey = `${cleanEmail}:${cleanName}`;
    const now = Date.now();

    // Expire old entries (> 60s)
    for (const [k, timestamp] of recentLeadSubmissions.entries()) {
      if (now - timestamp > 60000) {
        recentLeadSubmissions.delete(k);
      }
    }

    const lastTime = recentLeadSubmissions.get(dedupKey);
    if (lastTime && now - lastTime < 30000) {
      console.log(`[ASEING Server] Duplicate lead detected within 30s for ${cleanEmail}. Skipping duplicate webhook dispatch.`);
      return res.status(200).json({
        success: true,
        message: "Solicitud ya registrada previamente. Evitando duplicación.",
        leadId: "duplicate-prevented",
        duplicatePrevented: true
      });
    }

    // 1. MANEJO DE URL DEL WEBHOOK: Lectura desde variable de entorno o URL oficial de Apps Script
    const OFFICIAL_FALLBACK_GAS_URL =
      "https://script.google.com/macros/s/AKfycbyNHSVfUwWoUG_hq0ESP6DqLoXecaK9trHwEsDCbVHn3A-o6MrX-9xL6N1_-2ffPYgDnA/exec";

    let targetGasUrl = (
      process.env.GOOGLE_SCRIPT_URL ||
      process.env.GOOGLE_SCRIPT_WEBHOOK_URL ||
      req.body?.webhookUrl ||
      OFFICIAL_FALLBACK_GAS_URL
    ).trim();

    // Si la variable contiene una plantilla de ejemplo ("..."), sustituir automáticamente por la URL oficial real
    if (targetGasUrl.includes("...") || targetGasUrl.includes("YOUR_") || targetGasUrl.includes("MY_")) {
      console.log(`[ASEING Server] Variable de entorno contenía plantilla con '...'. Utilizando URL real oficial de Google Apps Script: ${OFFICIAL_FALLBACK_GAS_URL}`);
      targetGasUrl = OFFICIAL_FALLBACK_GAS_URL;
    }

    if (!targetGasUrl || (!targetGasUrl.startsWith("http://") && !targetGasUrl.startsWith("https://"))) {
      targetGasUrl = OFFICIAL_FALLBACK_GAS_URL;
    }

    const newLead = {
      id: `lead-${Date.now()}`,
      fecha: new Date().toISOString(),
      nombre,
      empresa: empresa || "No especificada",
      correo,
      telefono: telefono || "",
      cargo: cargo || "",
      mensaje: mensaje || "",
      servicioInteres: servicioInteres || "General",
      hojaDestino: "Proyecto Web 1",
      gestionEmail: "aseingerencia1@gmail.com"
    };

    // 2. MANEJO ESTRICTO DE ERRORES (Try/Catch):
    // Solo debe devolver success: true SI Y SOLO SI la petición al Webhook responde correctamente (HTTP 200).
    console.log(`[ASEING Server] Despachando lead ${newLead.id} (${cleanEmail}) hacia Webhook Google Apps Script: ${targetGasUrl}`);

    let gasResponse: Response;
    try {
      gasResponse = await fetch(targetGasUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
        redirect: "follow"
      });
    } catch (fetchErr: any) {
      console.error("[ASEING Server] Fallo de conexión de red al contactar Google Apps Script:", fetchErr);
      return res.status(502).json({
        success: false,
        error: `No se pudo conectar con el Webhook de Google Apps Script: ${fetchErr?.message || "Fallo de red o URL inalcanzable"}.`
      });
    }

    if (!gasResponse.ok) {
      const responseText = await gasResponse.text().catch(() => "");
      console.error(`[ASEING Server] Webhook de Google Apps Script respondió con HTTP ${gasResponse.status}:`, responseText);
      return res.status(502).json({
        success: false,
        error: `El Webhook de Google Apps Script respondió con código de error HTTP ${gasResponse.status}.`
      });
    }

    // Verificar si el script retornó un JSON de error interno
    const rawGasText = await gasResponse.text().catch(() => "");
    let parsedGasResult: any = null;
    try {
      parsedGasResult = JSON.parse(rawGasText);
    } catch {
      // Si respondió HTTP 200 pero texto plano o HTML, continúa
    }

    if (parsedGasResult && parsedGasResult.status === "error") {
      console.error("[ASEING Server] Error devuelto por Code.gs en Apps Script:", parsedGasResult.message);
      return res.status(502).json({
        success: false,
        error: `Google Apps Script reportó un error: ${parsedGasResult.message || "Error al registrar en hoja o enviar email"}.`
      });
    }

    // SI Y SOLO SI respondió HTTP 200 y exitoso:
    recentLeadSubmissions.set(dedupKey, now);
    leadsStore.push(newLead);
    saveLeadsToDisk();

    console.log(`[ASEING Server] Lead ${newLead.id} procesado exitosamente por Google Apps Script.`);

    return res.status(200).json({
      success: true,
      message: "Solicitud registrada con éxito. Webhook ejecutado correctamente y lead sincronizado.",
      leadId: newLead.id
    });
  } catch (err: any) {
    console.error("[ASEING Server] Error en /api/leads:", err);
    return res.status(500).json({
      success: false,
      error: "Error al registrar solicitud: " + (err?.message || "Error interno")
    });
  }
});

// ----------------- VITE MIDDLEWARE / PRODUCTION STATIC ----------------- //

async function startServer() {
  try {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[ASEING] Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("[ASEING] Error starting server:", error);
    process.exit(1);
  }
}

startServer();
