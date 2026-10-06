import nodemailer from 'nodemailer';
import { generateOrderPdf, type OrderDataPdf } from './pdfGenerator.ts';

export interface EmailSendResult {
  success: boolean;
  message: string;
  emailSent: boolean;
  pdfGenerated: boolean;
  recipients: string[];
}

/**
 * Sends order receipt and confirmation email with the real generated PDF attached.
 */
export async function sendOrderReceiptEmail(order: OrderDataPdf): Promise<EmailSendResult> {
  const adminEmail = process.env.ASEING_ADMIN_EMAIL || 'aseingerencia1@gmail.com';
  const clientEmail = order.billingInfo.email;
  const recipients = [clientEmail, adminEmail];

  try {
    // 1. Generate real PDF buffer in memory
    const pdfBuffer = await generateOrderPdf(order);
    const pdfFilename = `Comprobante-ASEING-${order.orderNumber}.pdf`;

    let emailSent = false;

    // 2. Check if SMTP configuration is provided
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER || 'aseingerencia1@gmail.com';
    const rawPass = process.env.SMTP_PASS || '';
    const smtpPass = rawPass.replace(/\s+/g, ''); // Limpiar espacios de la contraseña de aplicación de Google

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const isGmail = smtpHost.includes('gmail');
        const transporter = nodemailer.createTransport(
          isGmail
            ? {
                service: 'gmail',
                auth: {
                  user: smtpUser,
                  pass: smtpPass
                }
              }
            : {
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                  user: smtpUser,
                  pass: smtpPass
                }
              }
        );

        const subject = `📋 ASEING | Confirmación de Pago y Comprobante Digital - Orden ${order.orderNumber}`;
        const modalityLabel = order.paymentModality === 'deposit_50' ? 'Abono Inicial del 50%' : 'Pago Completo (100%)';
        const paidToday = (order.amountPaidToday ?? order.total).toFixed(2);

        const htmlBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #18082e 0%, #3a0ca3 50%, #b80068 100%); padding: 25px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px;">ASEING INGENIERÍA</h1>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #1ea1c2;">Comprobante Electrónico de Contratación</p>
            </div>
            <div style="padding: 24px; color: #334155; line-height: 1.6;">
              <h2 style="font-size: 17px; color: #18082e; margin-top: 0;">Estimado(a) ${order.billingInfo.companyName},</h2>
              <p>Su transacción ha sido <strong>verificada y aprobada con éxito</strong>. Adjunto a este correo encontrará su <strong>Comprobante Electrónico Digital (PDF)</strong> oficial con el desglose tributario de ley y código de autorización.</p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #1ea1c2; padding: 14px 18px; margin: 18px 0; border-radius: 6px;">
                <p style="margin: 3px 0;"><strong>• Orden Nº:</strong> ${order.orderNumber}</p>
                <p style="margin: 3px 0;"><strong>• Modalidad:</strong> ${modalityLabel}</p>
                <p style="margin: 3px 0;"><strong>• Monto Conciliado Hoy:</strong> USD $${paidToday}</p>
                <p style="margin: 3px 0;"><strong>• Referencia/Token:</strong> ${order.payphoneReceiptToken || order.paymentReference || 'CONF-OK'}</p>
                <p style="margin: 3px 0;"><strong>• Visita Técnica Agendada:</strong> ${order.scheduledAuditDate || 'Por coordinar con Dirección Técnica'}</p>
              </div>

              <p style="font-size: 13px;">Nuestro equipo de ingenieros consultores se encuentra preparando la hoja de ruta y la documentación técnica correspondiente.</p>
              <p style="font-size: 12px; color: #64748b; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                <strong>Dirección Técnica:</strong> Ing. John F. Suárez J. M.Sc.<br />
                Ambato, Ecuador • WhatsApp: +593 984 661 214 • aseingerencia1@gmail.com
              </p>
              <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-top: 20px; margin-bottom: 0;">
                ©ASEING Consultores. Asesoría Industrial y Gestión de Negocios. - TODOS LOS DERECHOS RESERVADOS
              </p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"ASEING Consultoría Industrial" <${smtpUser}>`,
          to: clientEmail,
          bcc: adminEmail,
          subject,
          html: htmlBody,
          attachments: [
            {
              filename: pdfFilename,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        });

        emailSent = true;
        console.log(`[ASEING Mailer] Email with PDF sent successfully to ${clientEmail}`);
      } catch (smtpErr: any) {
        console.warn(`[ASEING Mailer] SMTP sending notice:`, smtpErr.message);
      }
    }

    // 3. Forward to Google Apps Script Webhook with PDF base64 if configured
    const gasUrl = process.env.GOOGLE_SCRIPT_WEBHOOK_URL;
    if (gasUrl && gasUrl.startsWith('http')) {
      try {
        await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'ORDEN_CON_COMPROBANTE_PDF',
            orderNumber: order.orderNumber,
            empresa: order.billingInfo.companyName,
            correo: order.billingInfo.email,
            telefono: order.billingInfo.phone,
            total: order.total,
            montoPagadoHoy: order.amountPaidToday ?? order.total,
            pdfBase64: pdfBuffer.toString('base64'),
            pdfFilename
          })
        });
        console.log(`[ASEING Mailer] Order PDF forwarded to Google Apps Script.`);
      } catch (gasErr: any) {
        console.warn(`[ASEING Mailer] Google Apps Script notice:`, gasErr.message);
      }
    }

    return {
      success: true,
      message: emailSent
        ? `Comprobante PDF generado y enviado a ${clientEmail}`
        : `Comprobante PDF generado exitosamente para la orden ${order.orderNumber}.`,
      emailSent,
      pdfGenerated: true,
      recipients
    };
  } catch (error: any) {
    console.error(`[ASEING Mailer] Error generating or sending receipt PDF:`, error);
    return {
      success: false,
      message: error.message,
      emailSent: false,
      pdfGenerated: false,
      recipients
    };
  }
}

export interface TransferProofInfo {
  dataUrl?: string; // base64 data url from client upload
  filename?: string;
  reference?: string;
}

/**
 * Sends internal notification email to aseingerencia1@gmail.com with approval link and transfer voucher.
 */
export async function sendTransferVerificationEmail(
  order: OrderDataPdf,
  approveUrl: string,
  transferProof?: TransferProofInfo
): Promise<EmailSendResult> {
  const adminEmail = process.env.ASEING_ADMIN_EMAIL || 'aseingerencia1@gmail.com';
  try {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER || 'aseingerencia1@gmail.com';
    const rawPass = process.env.SMTP_PASS || '';
    const smtpPass = rawPass.replace(/\s+/g, '');

    let emailSent = false;
    const paidToday = (order.amountPaidToday ?? order.total).toFixed(2);
    const modalityLabel = order.paymentModality === 'deposit_50' ? 'Abono Inicial del 50%' : 'Pago Completo (100%)';

    const attachments: Array<{ filename: string; content: Buffer | string; contentType?: string }> = [];
    let inlineImageHtml = '';

    if (transferProof?.dataUrl && transferProof.dataUrl.includes(',')) {
      const parts = transferProof.dataUrl.split(',');
      const meta = parts[0];
      const base64Data = parts[1];
      const mimeMatch = meta.match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      const fileExt = mimeType.split('/')[1] || 'png';
      const proofFilename = transferProof.filename || `Comprobante-Transferencia-${order.orderNumber}.${fileExt}`;

      attachments.push({
        filename: proofFilename,
        content: Buffer.from(base64Data, 'base64'),
        contentType: mimeType
      });

      if (mimeType.startsWith('image/')) {
        inlineImageHtml = `
          <div style="margin: 18px 0; padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 13px; color: #1e293b;">Captura del Comprobante Adjuntado por el Cliente:</p>
            <img src="${transferProof.dataUrl}" alt="Comprobante Transferencia" style="max-width: 100%; max-height: 480px; object-fit: contain; border-radius: 6px; border: 1px solid #cbd5e1;" />
          </div>
        `;
      } else {
        inlineImageHtml = `
          <div style="margin: 18px 0; padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p style="margin: 0; font-size: 13px; color: #1e293b;">📎 Archivo adjunto: <strong>${proofFilename}</strong> (Revisar adjuntos de este correo).</p>
          </div>
        `;
      }
    }

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const isGmail = smtpHost.includes('gmail');
        const transporter = nodemailer.createTransport(
          isGmail
            ? {
                service: 'gmail',
                auth: { user: smtpUser, pass: smtpPass }
              }
            : {
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: { user: smtpUser, pass: smtpPass }
              }
        );

        const subject = `🔔 [ACCIÓN REQUERIDA] Nueva Transferencia Produbanco - Orden ${order.orderNumber} ($${paidToday} USD)`;

        const htmlBody = `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #18082e 0%, #1e0338 50%, #059669 100%); padding: 25px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px;">ASEING INGENIERÍA</h1>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #34d399;">Notificación Interna: Transferencia Bancaria en Verificación</p>
            </div>
            <div style="padding: 24px; color: #334155; line-height: 1.6;">
              <h2 style="font-size: 17px; color: #18082e; margin-top: 0;">Estimada Dirección Técnica / Administración,</h2>
              <p>El cliente ha registrado una transferencia bancaria y la orden ha quedado guardada en estado: <strong style="color: #d97706; background-color: #fef3c7; padding: 2px 8px; border-radius: 4px;">Pago en Verificación</strong>.</p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #059669; padding: 14px 18px; margin: 18px 0; border-radius: 6px;">
                <p style="margin: 4px 0;"><strong>• Nro. de Orden:</strong> <span style="font-weight: bold; color: #18082e;">${order.orderNumber}</span></p>
                <p style="margin: 4px 0;"><strong>• Empresa / Razón Social:</strong> ${order.billingInfo.companyName}</p>
                <p style="margin: 4px 0;"><strong>• RUC / Cédula:</strong> ${order.billingInfo.rucOrId}</p>
                <p style="margin: 4px 0;"><strong>• Contacto:</strong> ${order.billingInfo.legalRepresentative || order.billingInfo.companyName}</p>
                <p style="margin: 4px 0;"><strong>• Teléfono / WhatsApp:</strong> ${order.billingInfo.phone}</p>
                <p style="margin: 4px 0;"><strong>• Correo del Cliente:</strong> ${order.billingInfo.email}</p>
                <p style="margin: 4px 0;"><strong>• Modalidad:</strong> ${modalityLabel}</p>
                <p style="margin: 4px 0;"><strong>• Monto a Verificar:</strong> <span style="font-size: 17px; color: #059669; font-weight: bold;">USD $${paidToday}</span></p>
                <p style="margin: 4px 0;"><strong>• Total Contratado:</strong> USD $${order.total.toFixed(2)}</p>
                <p style="margin: 4px 0;"><strong>• Nro. Comprobante / Referencia:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${order.paymentReference || transferProof?.reference || 'No especificado'}</code></p>
                <p style="margin: 4px 0;"><strong>• Visita Técnica Solicitada:</strong> ${order.scheduledAuditDate || 'Por coordinar'}</p>
              </div>

              ${inlineImageHtml}

              <div style="text-align: center; margin: 30px 0; padding: 22px; background-color: #ecfdf5; border-radius: 10px; border: 2px dashed #10b981;">
                <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: bold; color: #065f46;">
                  Paso 1: Verifique el ingreso en la cuenta Produbanco.<br/>
                  Paso 2: Haga clic en el botón para aprobar y despachar el PDF al cliente:
                </p>
                <a href="${approveUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 14px 28px; border-radius: 50px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);">
                  ✓ APROBAR ORDEN Y ENVIAR COMPROBANTE AL CLIENTE
                </a>
                <p style="margin: 12px 0 0 0; font-size: 11px; color: #64748b;">
                  Enlace directo: <a href="${approveUrl}" style="color: #059669; word-break: break-all;">${approveUrl}</a>
                </p>
              </div>

              <p style="font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                Al hacer clic, el sistema cambiará el estado a <strong>approved</strong>, generará el comprobante oficial en PDF y lo enviará automáticamente a <strong>${order.billingInfo.email}</strong>.
              </p>
              <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-top: 20px; margin-bottom: 0;">
                ©ASEING Consultores. Asesoría Industrial y Gestión de Negocios. - TODOS LOS DERECHOS RESERVADOS
              </p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Sistema de Pagos ASEING" <${smtpUser}>`,
          to: adminEmail,
          subject,
          html: htmlBody,
          attachments
        });

        emailSent = true;
        console.log(`[ASEING Mailer] Internal transfer verification email sent to ${adminEmail}`);
      } catch (smtpErr: any) {
        console.warn(`[ASEING Mailer] Warning sending internal transfer verification:`, smtpErr.message);
      }
    }

    return {
      success: true,
      message: `Notificación interna de verificación enviada a ${adminEmail}`,
      emailSent,
      pdfGenerated: false,
      recipients: [adminEmail]
    };
  } catch (error: any) {
    console.error(`[ASEING Mailer] Error sending transfer verification email:`, error);
    return {
      success: false,
      message: error.message,
      emailSent: false,
      pdfGenerated: false,
      recipients: [adminEmail]
    };
  }
}
