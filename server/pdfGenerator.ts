import PDFDocument from 'pdfkit';

export interface OrderItemPdf {
  serviceId: string;
  serviceTitle: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderDataPdf {
  orderNumber: string;
  createdAt: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentModality?: string;
  payphoneReceiptToken?: string;
  paymentReference?: string;
  transactionId?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  amountPaidToday?: number;
  pendingBalance?: number;
  scheduledAuditDate?: string;
  billingInfo: {
    companyName: string;
    legalRepresentative?: string;
    rucOrId: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  items: OrderItemPdf[];
}

/**
 * Generates a clean, professional vector PDF voucher in memory as a Buffer.
 */
export function generateOrderPdf(order: OrderDataPdf): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Comprobante-${order.orderNumber}`,
          Author: 'ASEING Consultoría Industrial',
          Subject: 'Comprobante Electrónico de Contratación',
          Creator: 'ASEING Plataforma Digital'
        }
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // 1. Header Banner Background
      const primaryColor = '#18082e';
      const accentCyan = '#1ea1c2';
      const accentMagenta = '#b80068';
      const lightBg = '#f8fafc';
      const textColor = '#1e293b';
      const mutedColor = '#64748b';

      doc.rect(40, 40, 515, 68).fill(primaryColor);

      // Brand Title & Tagline
      doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold')
        .text('ASEING INGENIERÍA & GESTIÓN INDUSTRIAL', 55, 52);

      doc.fillColor(accentCyan).fontSize(9).font('Helvetica')
        .text('Consultoría de Procesos Productivos • Trinorma ISO 9001:2026 / ISO 14001:2026 / ISO 45001 • RUC: 1803227857001', 55, 73);

      doc.fillColor('#e2e8f0').fontSize(8)
        .text('Av. Imbabura y Maytacapac, Ambato, Ecuador | (+593) 984 661 214 | aseingerencia1@gmail.com', 55, 87);

      // 2. Receipt Title Box
      let y = 120;
      doc.rect(40, y, 515, 42).fill(lightBg).strokeColor('#e2e8f0').stroke();

      const modalityText = order.paymentModality === 'deposit_50'
        ? 'COMPROBANTE ELECTRÓNICO DE ABONO INICIAL (50%)'
        : 'COMPROBANTE ELECTRÓNICO DE PAGO COMPLETO (100%)';

      doc.fillColor(accentMagenta).fontSize(11).font('Helvetica-Bold')
        .text(modalityText, 55, y + 10);

      doc.fillColor(mutedColor).fontSize(8.5).font('Helvetica')
        .text(`Orden Nº: ${order.orderNumber}  |  Fecha: ${new Date(order.createdAt).toLocaleString('es-EC')}  |  Token Pasarela: ${order.payphoneReceiptToken || order.paymentReference || 'CONF-OK'}`, 55, y + 26);

      // Payment Status Badge
      const statusText = order.paymentStatus === 'approved' ? 'PAGO APROBADO & CONCILIADO' : 'TRANSFERENCIA REGISTRADA';
      doc.rect(400, y + 8, 145, 20).fill('#ecfdf5');
      doc.fillColor('#065f46').fontSize(8).font('Helvetica-Bold')
        .text(statusText, 405, y + 14, { width: 135, align: 'center' });

      // 3. Client & Billing Information Section
      y = 175;
      doc.rect(40, y, 515, 68).fill('#ffffff').strokeColor('#cbd5e1').stroke();

      doc.fillColor(primaryColor).fontSize(9.5).font('Helvetica-Bold')
        .text('DATOS DEL CLIENTE / CONTRATANTE', 55, y + 8);

      doc.fillColor(textColor).fontSize(8.5).font('Helvetica');
      doc.text(`Razón Social / Empresa: ${order.billingInfo.companyName}`, 55, y + 24);
      doc.text(`RUC / Cédula: ${order.billingInfo.rucOrId}`, 55, y + 38);
      doc.text(`Email Registrado: ${order.billingInfo.email}`, 55, y + 52);

      const contactName = order.billingInfo.legalRepresentative || order.billingInfo.companyName;
      doc.text(`Contacto / Representante: ${contactName}`, 310, y + 24);
      doc.text(`Teléfono: ${order.billingInfo.phone}`, 310, y + 38);
      doc.text(`Ciudad / Dirección: ${order.billingInfo.city} - ${order.billingInfo.address}`, 310, y + 52);

      // 4. Services Table Header
      y = 255;
      doc.rect(40, y, 515, 22).fill(primaryColor);
      doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
      doc.text('Descripción del Servicio Técnico Especializado', 50, y + 7, { width: 310 });
      doc.text('Cant.', 370, y + 7, { width: 35, align: 'center' });
      doc.text('Precio Unit.', 415, y + 7, { width: 60, align: 'right' });
      doc.text('Subtotal', 485, y + 7, { width: 60, align: 'right' });

      // Table Rows
      y += 22;
      doc.font('Helvetica').fontSize(8).fillColor(textColor);

      order.items.forEach((item, index) => {
        const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
        doc.rect(40, y, 515, 24).fill(rowBg).strokeColor('#f1f5f9').stroke();

        const unitP = Number(item.unitPrice ?? (item as any).basePrice ?? ((item.subtotal || 0) / (item.quantity || 1))) || 0;
        const sub = Number(item.subtotal ?? (unitP * (item.quantity || 1))) || 0;

        doc.fillColor(textColor)
          .text(item.serviceTitle, 50, y + 7, { width: 310, ellipsis: true })
          .text(String(item.quantity || 1), 370, y + 7, { width: 35, align: 'center' })
          .text(`$${unitP.toFixed(2)}`, 415, y + 7, { width: 60, align: 'right' })
          .text(`$${sub.toFixed(2)}`, 485, y + 7, { width: 60, align: 'right' });

        y += 24;
      });

      // 5. Totals & Financial Breakdown
      y += 10;
      const totalsX = 330;
      doc.rect(totalsX, y, 225, 115).fill('#f8fafc').strokeColor('#cbd5e1').stroke();

      let ty = y + 8;
      doc.fontSize(8.5).font('Helvetica');

      const safeSubtotal = Number(order.subtotal ?? 0);
      const safeDiscount = Number(order.discountAmount ?? 0);
      const safeTax = Number(order.taxAmount ?? 0);
      const safeTotal = Number(order.total ?? 0);

      // Subtotal
      doc.fillColor(mutedColor).text('Subtotal Servicios:', totalsX + 12, ty);
      doc.fillColor(textColor).text(`USD $${safeSubtotal.toFixed(2)}`, totalsX + 110, ty, { width: 95, align: 'right' });

      // Discount if any
      if (safeDiscount > 0) {
        ty += 16;
        doc.fillColor('#059669').text('Descuento / Bonificación:', totalsX + 12, ty);
        doc.text(`- USD $${safeDiscount.toFixed(2)}`, totalsX + 110, ty, { width: 95, align: 'right' });
      }

      // IVA 15%
      ty += 16;
      doc.fillColor(mutedColor).text('IVA (15% Ecuador):', totalsX + 12, ty);
      doc.fillColor(textColor).text(`USD $${safeTax.toFixed(2)}`, totalsX + 110, ty, { width: 95, align: 'right' });

      // Total 100%
      ty += 18;
      doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryColor);
      doc.text('Inversión Total (100%):', totalsX + 12, ty);
      doc.text(`USD $${safeTotal.toFixed(2)}`, totalsX + 110, ty, { width: 95, align: 'right' });

      // Amount paid today & pending
      ty += 18;
      const paidToday = Number(order.amountPaidToday ?? safeTotal);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#059669');
      doc.text('TOTAL PAGADO HOY:', totalsX + 12, ty);
      doc.text(`USD $${paidToday.toFixed(2)}`, totalsX + 110, ty, { width: 95, align: 'right' });

      if (order.paymentModality === 'deposit_50') {
        ty += 16;
        const pending = Number(order.pendingBalance ?? (safeTotal - paidToday));
        doc.font('Helvetica').fontSize(8).fillColor('#d97706');
        doc.text('Saldo Pendiente (Entrega):', totalsX + 12, ty);
        doc.text(`USD $${pending.toFixed(2)}`, totalsX + 110, ty, { width: 95, align: 'right' });
      }

      // Left box: Payment details & Schedule
      doc.rect(40, y, 275, 115).fill('#ffffff').strokeColor('#cbd5e1').stroke();
      doc.fillColor(primaryColor).fontSize(8.5).font('Helvetica-Bold')
        .text('DETALLE DE PAGO Y AGENDA TÉCNICA', 50, y + 8);

      doc.fillColor(textColor).font('Helvetica').fontSize(8);
      const methodLabel = order.paymentMethod === 'bank_transfer'
        ? 'Transferencia Bancaria (Produbanco)'
        : order.paymentMethod === 'payphone'
        ? 'Pasarela Payphone (Visa / Mastercard)'
        : 'Tarjeta de Crédito / Débito';

      doc.text(`• Método de Pago: ${methodLabel}`, 50, y + 24);
      doc.text(`• Transacción / Token: ${order.payphoneReceiptToken || order.paymentReference || 'N/A'}`, 50, y + 38);
      doc.text(`• Fecha de Auditoría / Visita: ${order.scheduledAuditDate || 'Por coordinar con Dirección Técnica'}`, 50, y + 52);
      doc.text(`• Auditor Responsable: Ing. John F. Suárez J. M.Sc.`, 50, y + 66);
      doc.text(`• Modalidad: ${order.paymentModality === 'deposit_50' ? 'Abono 50% inicial' : 'Cancelación 100%'}`, 50, y + 80);
      doc.text(`• Estado: Conciliado para inicio de cronograma`, 50, y + 94);

      // 6. Security Seal & Legal Notes
      const footerY = y + 130;
      doc.rect(40, footerY, 515, 74).fill('#f1f5f9');

      doc.fillColor('#334155').fontSize(7.5).font('Helvetica-Bold')
        .text('CERTIFICACIÓN Y VALIDEZ ELECTRÓNICA:', 50, footerY + 8);

      doc.font('Helvetica').fontSize(7).fillColor(mutedColor)
        .text(
          'Este comprobante digital ha sido emitido y conciliado mediante la plataforma tecnológica de ASEING Consultoría Industrial en conformidad con el Código de Comercio y la Ley de Comercio Electrónico de la República del Ecuador. Para consultas tributarias o emisión de factura electrónica SRI correspondiente, contacte a gerencia: aseingerencia1@gmail.com o vía WhatsApp oficial (+593) 984 661 214.',
          50,
          footerY + 20,
          { width: 495, lineGap: 1.5 }
        );

      doc.fillColor(accentMagenta).fontSize(7).font('Helvetica-Bold')
        .text('ASEING INGENIERÍA • AMBATO, ECUADOR • COBERTURA NACIONAL', 50, footerY + 46, { width: 495, align: 'center' });

      doc.fillColor('#475569').fontSize(6.8).font('Helvetica')
        .text('©ASEING Consultores. Asesoría Industrial y Gestión de Negocios. - TODOS LOS DERECHOS RESERVADOS', 50, footerY + 58, { width: 495, align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
