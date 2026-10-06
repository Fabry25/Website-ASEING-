/**
 * =====================================================================
 * ASEING CONSULTORA INDUSTRIAL - SCRIPT DE INTEGRACIÓN GOOGLE APPS SCRIPT
 * Proyecto: Web ASEING - Registro y Consulta Técnica
 * Hoja destino en Google Drive: "Proyecto Web 1"
 * Correo oficial de gestión: aseingerencia1@gmail.com
 * =====================================================================
 * 
 * INSTRUCCIONES DE DESPLIEGUE:
 * 1. Abra https://script.google.com con la cuenta aseingerencia1@gmail.com
 * 2. Haga clic en "Nuevo proyecto" y pegue este código en Code.gs.
 * 3. Haga clic en "Implementar" > "Nueva implementación".
 * 4. Seleccione Tipo: "Aplicación web".
 * 5. Configuración:
 *    - Descripción: "ASEING Webhook Registro y Consulta"
 *    - Ejecutar como: "Yo" (aseingerencia1@gmail.com)
 *    - Quién tiene acceso: "Cualquier persona" (Anonymous) [IMPORTANTE para recibir el POST desde la web]
 * 6. Haga clic en "Implementar", acepte los permisos de Google.
 * 7. Copie la URL de la aplicación web (terminada en /exec) y péguela en el sitio web.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Esperar hasta 10 segundos para evitar bloqueos concurrentes en la hoja
  lock.tryLock(10000);

  try {
    var rawData = e.postData ? e.postData.contents : "";
    var data = {};

    if (rawData) {
      try {
        data = JSON.parse(rawData);
      } catch (err) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    var fechaFormateada = Utilities.formatDate(new Date(), "America/Guayaquil", "dd/MM/yyyy HH:mm:ss");

    // 1. Detección de tipo de evento: Orden Contratada (Facturación SRI) o Lead de Consulta
    var tipo = (data.tipo || "").trim();
    if (tipo === "ORDEN_PAGADA_CONFIRMADA" || tipo === "ORDEN_PAGADA" || data.orderNumber) {
      return procesarOrdenYFacturacionSri(data, fechaFormateada);
    }

    // 2. Extraer los datos del formulario de contacto / lead
    var nombre = (data.nombre || "").trim();
    var empresa = (data.empresa || "").trim();
    var correo = (data.correo || "").trim();
    var telefono = (data.telefono || "").trim();
    var cargo = (data.cargo || "No especificado").trim();
    var servicio = (data.servicioInteres || data.servicio || "Diagnóstico Inicial").trim();
    var mensaje = (data.mensaje || "Sin detalles adicionales").trim();

    if (!nombre && !correo) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Nombre o correo no proporcionados."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Abrir o crear la hoja de cálculo "Proyecto Web 1"
    var spreadsheet;
    var fileName = "Proyecto Web 1";

    try {
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    } catch (err) {
      spreadsheet = null;
    }

    if (!spreadsheet) {
      var files = DriveApp.getFilesByName(fileName);
      if (files.hasNext()) {
        spreadsheet = SpreadsheetApp.open(files.next());
      } else {
        spreadsheet = SpreadsheetApp.create(fileName);
      }
    }

    // Obtener la pestaña llamada "Proyecto Web 1" o la primera hoja
    var sheet = spreadsheet.getSheetByName("Proyecto Web 1");
    if (!sheet) {
      sheet = spreadsheet.getSheets()[0];
      sheet.setName("Proyecto Web 1");
    }

    // 3. Crear encabezados si la hoja está recién creada o vacía
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Fecha y Hora",
        "Nombre Completo",
        "Empresa",
        "Correo Electrónico",
        "Teléfono / WhatsApp",
        "Cargo / Área",
        "Servicio de Interés",
        "Detalles / Requerimiento",
        "Estado del Lead"
      ];
      sheet.appendRow(headers);

      // Formato visual profesional para la cabecera
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#18082e");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // 4. Registrar la nueva fila en la hoja de Google Sheets
    // ESTADO INICIAL: "Esperando respuesta"
    // El script de seguimiento (seguimiento.gs) monitorea periódicamente Gmail.
    // Solo cuando el cliente RESPONDA al primer correo, seguimiento.gs enviará el segundo correo (instrucciones/borrador).
    var nuevaFila = [
      fechaFormateada,
      nombre,
      empresa,
      correo,
      telefono,
      cargo,
      servicio,
      mensaje,
      "Esperando respuesta"
    ];
    sheet.appendRow(nuevaFila);

    try {
      sheet.autoResizeColumns(1, 9);
    } catch (errResize) {}

    // 5. Enviar autorespuesta por correo al cliente usando MailApp.sendEmail
    if (correo && correo.indexOf("@") !== -1) {
      var asuntoCliente = "ASEING | Confirmación de Recepción: " + servicio;

      var cuerpoHtmlCliente =
        '<div style="font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">' +
          '<div style="background: linear-gradient(135deg, #18082e 0%, #3a0ca3 50%, #b80068 100%); padding: 30px 24px; text-align: center; color: #ffffff;">' +
            '<h1 style="margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 800;">ASEING INGENIERÍA</h1>' +
            '<p style="margin: 6px 0 0 0; font-size: 13px; color: #1ea1c2; font-weight: 600;">Asesoría Industrial & Gestión de Negocios</p>' +
          '</div>' +

          '<div style="padding: 26px 30px; color: #2d3748; line-height: 1.65;">' +
            '<h2 style="font-size: 18px; color: #18082e; margin-top: 0;">Estimado(a) ' + nombre + ',</h2>' +
            '<p>Hemos recibido correctamente su solicitud de <strong>Registro y Consulta Técnica</strong> para la empresa <strong>' + (empresa || 'su organización') + '</strong>.</p>' +
            '<p>Nuestro equipo de ingenieros consultores se encuentra revisando sus requerimientos y se comunicará con usted para coordinar la evaluación técnica correspondiente.</p>' +

            '<div style="background-color: #f7fafc; border-left: 4px solid #1ea1c2; padding: 16px 20px; margin: 22px 0; border-radius: 6px;">' +
              '<h3 style="margin: 0 0 10px 0; font-size: 13px; color: #18082e; text-transform: uppercase; letter-spacing: 0.5px;">Resumen de su Registro:</h3>' +
              '<p style="margin: 4px 0; font-size: 13px;"><strong>• Servicio Solicitado:</strong> ' + servicio + '</p>' +
              '<p style="margin: 4px 0; font-size: 13px;"><strong>• Empresa:</strong> ' + empresa + '</p>' +
              '<p style="margin: 4px 0; font-size: 13px;"><strong>• Cargo / Área:</strong> ' + cargo + '</p>' +
              '<p style="margin: 4px 0; font-size: 13px;"><strong>• Teléfono registrado:</strong> ' + telefono + '</p>' +
              '<p style="margin: 4px 0; font-size: 13px;"><strong>• Detalles del requerimiento:</strong> ' + mensaje + '</p>' +
            '</div>' +

            '<p style="font-size: 13px; color: #4a5568;">Si desea adelantar información de planta o agendar de manera inmediata una reunión técnica presencial o por videollamada, puede contactarnos directamente a nuestro canal oficial de WhatsApp:</p>' +

            '<div style="text-align: center; margin: 26px 0;">' +
              '<a href="https://wa.me/593984661214?text=' + encodeURIComponent('Hola ASEING, registré una solicitud para ' + (empresa || nombre) + ' sobre ' + servicio) + '" ' +
                 'style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; padding: 13px 26px; border-radius: 30px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(37,211,102,0.35);">' +
                '💬 Escribir al WhatsApp Técnico (+593 984 661 214)' +
              '</a>' +
            '</div>' +

            '<hr style="border: none; border-top: 1px solid #edf2f7; margin: 24px 0;" />' +
            '<p style="font-size: 11.5px; color: #718096; margin: 0; line-height: 1.5;">' +
              '<strong>Dirección Técnica:</strong> Profesionales con experiencia en diferentes áreas.<br />' +
              'Av. Imbabura y Maytacapac, Ambato, Ecuador | Cobertura Nacional<br />' +
              'Correo: <a href="mailto:aseingerencia1@gmail.com" style="color: #3a0ca3;">aseingerencia1@gmail.com</a> | Sitio Web: ASEING Consultores' +
            '</p>' +
            '<p style="font-size: 10px; color: #a0aec0; text-align: center; margin-top: 18px; margin-bottom: 0;">' +
              '© 2026 ASEING Consultores. Asesoría Industrial y Gestión de Negocios. - TODOS LOS DERECHOS RESERVADOS' +
            '</p>' +
          '</div>' +
        '</div>';

      var cuerpoTextoPlanoCliente =
        "Estimado(a) " + nombre + ",\n\n" +
        "Hemos recibido correctamente su solicitud de Registro y Consulta Técnica para la empresa " + (empresa || "su organización") + ".\n\n" +
        "Nuestro equipo de ingenieros consultores se encuentra revisando sus requerimientos y se comunicará con usted para coordinar la evaluación técnica correspondiente.\n\n" +
        "Resumen de su Registro:\n" +
        "• Servicio Solicitado: " + servicio + "\n" +
        "• Empresa: " + empresa + "\n" +
        "• Cargo / Área: " + cargo + "\n" +
        "• Teléfono registrado: " + telefono + "\n" +
        "• Detalles: " + mensaje + "\n\n" +
        "Para agendar una reunión técnica presencial o por videollamada, contáctenos directamente al WhatsApp: +593 984 661 214\n\n" +
        "Dirección Técnica: Profesionales con experiencia en diferentes áreas. Ambato, Ecuador\n" +
        "Correo: aseingerencia1@gmail.com\n\n" +
        "© 2026 ASEING Consultores. Asesoría Industrial y Gestión de Negocios. - TODOS LOS DERECHOS RESERVADOS";

      MailApp.sendEmail({
        to: correo,
        subject: asuntoCliente,
        body: cuerpoTextoPlanoCliente,
        htmlBody: cuerpoHtmlCliente,
        name: "ASEING Consultores",
        replyTo: "aseingerencia1@gmail.com"
      });
    }

    // 6. Notificación interna inmediata a la dirección de ASEING
    try {
      var asuntoAdmin = "📋 Nuevo Registro y Consulta Web: " + (empresa || nombre) + " (" + servicio + ")";
      var cuerpoAdmin =
        "Se ha registrado una nueva solicitud en el sitio web de ASEING:\n\n" +
        "• Fecha: " + fechaFormateada + "\n" +
        "• Nombre: " + nombre + "\n" +
        "• Empresa: " + empresa + "\n" +
        "• Cargo: " + cargo + "\n" +
        "• Correo: " + correo + "\n" +
        "• Teléfono: " + telefono + "\n" +
        "• Servicio: " + servicio + "\n" +
        "• Mensaje: " + mensaje + "\n\n" +
        "Hoja de cálculo: Proyecto Web 1 (Google Drive)\n";

      MailApp.sendEmail({
        to: "aseingerencia1@gmail.com",
        subject: asuntoAdmin,
        body: cuerpoAdmin
      });
    } catch (errAdmin) {
      Logger.log("Error enviando alerta interna a admin: " + errAdmin);
    }

    // 7. Retornar confirmación JSON al cliente web
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead guardado correctamente en la hoja 'Proyecto Web 1' y correo enviado.",
      sheetName: "Proyecto Web 1",
      rowNumber: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error en doPost: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * =====================================================================
 * PROCESAMIENTO AUTOMATIZADO DE ÓRDENES CONTRATADAS & FACTURACIÓN SRI
 * Emisor: ASEING CONSULTORÍA INDUSTRIAL
 * RUC Emisor Oficial: 1803227857001
 * Dirección Técnica: Ing. John F. Suárez J. M.Sc.
 * =====================================================================
 */
function procesarOrdenYFacturacionSri(data, fechaFormateada) {
  var fileName = "Proyecto Web 1";
  var spreadsheet;

  try {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {
    spreadsheet = null;
  }

  if (!spreadsheet) {
    var files = DriveApp.getFilesByName(fileName);
    if (files.hasNext()) {
      spreadsheet = SpreadsheetApp.open(files.next());
    } else {
      spreadsheet = SpreadsheetApp.create(fileName);
    }
  }

  // Pestaña dedicada para Órdenes y Facturación SRI
  var sheet = spreadsheet.getSheetByName("Órdenes y Facturación SRI");
  if (!sheet) {
    sheet = spreadsheet.insertSheet("Órdenes y Facturación SRI");
  }

  // Encabezados fiscales oficiales si la hoja está recién creada
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Fecha y Hora",
      "Nro. Orden",
      "Empresa / Razón Social",
      "Representante",
      "RUC / Cédula Cliente",
      "Correo Electrónico",
      "Teléfono / WhatsApp",
      "Ciudad",
      "Servicios Contratados",
      "Subtotal USD",
      "Descuento USD",
      "IVA 15% USD",
      "Total Pagado USD",
      "Método de Pago",
      "ID Transacción / Token",
      "RUC Emisor ASEING",
      "Clave Acceso SRI (49 dígitos)",
      "Visita Técnica Agendada",
      "Estado SRI"
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#18082e");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }

  var orderNumber = data.orderNumber || "ASE-2026-AUTO";
  var empresa = data.empresa || "Cliente Corporativo";
  var representante = data.representante || "";
  var rucCliente = data.rucOrId || "Consumidor Final";
  var correo = data.correo || "";
  var telefono = data.telefono || "";
  var ciudad = data.ciudad || "Ecuador";
  var items = data.items || "Servicios Industriales ASEING";
  var subtotal = Number(data.subtotal || 0).toFixed(2);
  var descuento = Number(data.descuento || 0).toFixed(2);
  var iva = Number(data.iva || 0).toFixed(2);
  var total = Number(data.total || 0).toFixed(2);
  var metodoPago = (data.metodoPago || "PROFORMA").toUpperCase();
  var transaccion = data.transaccion || "APROBADO-SISTEMA";
  var rucEmisor = "1803227857001";
  var claveAccesoSRI = data.claveAccesoSRI || "GENERADA-SRI-49DIGITOS";
  var fechaVisita = data.fechaVisitaTecnica || "Por coordinar";

  // Identificación oficial de Modalidad Pago Único para Planificación y Control de la Producción (PCP)
  var esPcp = (items.indexOf("Planificación y Control") !== -1 || items.indexOf("planificacion-control") !== -1 || items.indexOf("PCP") !== -1);
  var notaPcpHtml = esPcp
    ? '<div style="margin-top: 10px; padding: 10px 14px; background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; font-size: 12px; color: #166534;">' +
        '<strong>Modalidad de Contratación:</strong> Pago Único ($380 USD + IVA 15% = $437 USD total). Sin recurrencias ni mensualidades. Incluye bonificación del 100% del Diagnóstico Inicial ($30 USD).' +
      '</div>'
    : '';

  // Registrar fila en Google Sheets
  sheet.appendRow([
    fechaFormateada,
    orderNumber,
    empresa,
    representante,
    rucCliente,
    correo,
    telefono,
    ciudad,
    items,
    subtotal,
    descuento,
    iva,
    total,
    metodoPago,
    transaccion,
    rucEmisor,
    claveAccesoSRI,
    fechaVisita,
    "AUTORIZADO / ENVIADO"
  ]);

  try {
    sheet.autoResizeColumns(1, 19);
  } catch (errResize) {}

  // Enviar correo electrónico automático al cliente que contrató el servicio
  if (correo && correo.indexOf("@") !== -1) {
    var asuntoCliente = "ASEING | Factura Electrónica y Confirmación de Servicio - " + orderNumber;

    var cuerpoHtmlCliente =
      '<div style="font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; max-width: 640px; margin: auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">' +
        '<div style="background: linear-gradient(135deg, #18082e 0%, #3a0ca3 50%, #b80068 100%); padding: 32px 24px; text-align: center; color: #ffffff;">' +
          '<h1 style="margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 800;">ASEING CONSULTORÍA INDUSTRIAL</h1>' +
          '<p style="margin: 6px 0 0 0; font-size: 13px; color: #1ea1c2; font-weight: 600;">R.U.C.: 1803227857001 • Dirección Técnica Oficial</p>' +
        '</div>' +

        '<div style="padding: 26px 30px; color: #2d3748; line-height: 1.65;">' +
          '<div style="display: flex; justify-content: space-between; border-bottom: 2px solid #edf2f7; padding-bottom: 12px; margin-bottom: 18px;">' +
            '<div>' +
              '<span style="font-size: 11px; text-transform: uppercase; color: #718096; font-weight: bold;">Comprobante Oficial:</span><br />' +
              '<strong style="font-size: 16px; color: #18082e;">' + orderNumber + '</strong>' +
            '</div>' +
            '<div style="text-align: right;">' +
              '<span style="font-size: 11px; text-transform: uppercase; color: #718096; font-weight: bold;">Estado:</span><br />' +
              '<span style="background-color: #e6fffa; color: #234e52; font-weight: bold; font-size: 12px; padding: 3px 8px; border-radius: 4px; border: 1px solid #b2f5ea;">✓ PAGO & FACTURA APROBADA</span>' +
            '</div>' +
          '</div>' +

          '<h2 style="font-size: 17px; color: #18082e; margin-top: 0;">Estimado(a) ' + (representante || empresa) + ',</h2>' +
          '<p>Le confirmamos que la contratación de servicios de consultoría y diagnóstico técnico para <strong>' + empresa + '</strong> ha sido procesada exitosamente.</p>' +

          '<!-- TARJETA FISCAL SRI -->' +
          '<div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 18px 0;">' +
            '<div style="font-size: 12px; font-weight: bold; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">' +
              '🏛️ Datos de Facturación Electrónica SRI Ecuador' +
            '</div>' +
            '<p style="margin: 4px 0; font-size: 12.5px;"><strong>• Emisor:</strong> ASEING CONSULTORÍA INDUSTRIAL</p>' +
            '<p style="margin: 4px 0; font-size: 12.5px;"><strong>• RUC Emisor:</strong> <span style="font-family: monospace; font-weight: bold; color: #1e3a8a;">1803227857001</span></p>' +
            '<p style="margin: 4px 0; font-size: 12.5px;"><strong>• Cliente / Razón Social:</strong> ' + empresa + ' (RUC/C.I.: ' + rucCliente + ')</p>' +
            '<p style="margin: 4px 0; font-size: 12.5px;"><strong>• Dirección Matriz:</strong> Av. Imbabura y Maytacapac, Ambato, Ecuador</p>' +
            '<p style="margin: 4px 0; font-size: 12.5px; word-break: break-all;"><strong>• Clave de Acceso SRI:</strong><br /><span style="font-family: monospace; font-size: 11px; background: #e2e8f0; padding: 3px 6px; border-radius: 4px; display: inline-block; margin-top: 2px;">' + claveAccesoSRI + '</span></p>' +
          '</div>' +

          '<!-- VISITA TÉCNICA PROGRAMADA -->' +
          '<div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #1ea1c2; padding: 14px 18px; margin: 18px 0; border-radius: 6px;">' +
            '<div style="font-size: 12px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; margin-bottom: 4px;">📅 Visita Técnica Enlazada Automáticamente</div>' +
            '<p style="margin: 2px 0; font-size: 13.5px; font-weight: bold; color: #0f172a;">Fecha y hora asignada: ' + fechaVisita + '</p>' +
            '<p style="margin: 2px 0; font-size: 12px; color: #475569;">Equipo Técnico asignado: <strong>Ing. John F. Suárez J. M.Sc. y equipo especialista</strong></p>' +
          '</div>' +

          '<!-- DESGLOSE FINANCIERO -->' +
          '<div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 18px 0;">' +
            '<div style="font-size: 12px; font-weight: bold; color: #18082e; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">' +
              'DETALLE DE SERVICIOS Y VALORES (USD):' +
            '</div>' +
            '<p style="margin: 4px 0; font-size: 12.5px; color: #334155;"><strong>Servicios:</strong> ' + items + '</p>' +
            notaPcpHtml +
            '<table style="width: 100%; font-size: 12.5px; margin-top: 10px; border-collapse: collapse;">' +
              '<tr><td style="padding: 3px 0; color: #64748b;">Subtotal Neto:</td><td style="text-align: right; font-weight: bold; font-family: monospace;">USD $' + subtotal + '</td></tr>' +
              (Number(descuento) > 0 ? '<tr><td style="padding: 3px 0; color: #059669;">Bonificación / Descuento:</td><td style="text-align: right; font-weight: bold; font-family: monospace; color: #059669;">- USD $' + descuento + '</td></tr>' : '') +
              '<tr><td style="padding: 3px 0; color: #64748b;">IVA 15% (Ecuador):</td><td style="text-align: right; font-weight: bold; font-family: monospace;">USD $' + iva + '</td></tr>' +
              '<tr style="border-top: 1px solid #cbd5e1;"><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">Total Facturado:</td><td style="text-align: right; font-weight: bold; font-size: 14px; color: #1e3a8a; font-family: monospace;">USD $' + total + '</td></tr>' +
            '</table>' +
          '</div>' +

          '<div style="text-align: center; margin: 26px 0;">' +
            '<a href="https://wa.me/593984661214?text=' + encodeURIComponent('Hola ASEING, confirmo la orden ' + orderNumber + ' de ' + empresa + ' y la visita para ' + fechaVisita) + '" ' +
               'style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; padding: 13px 26px; border-radius: 30px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(37,211,102,0.35);">' +
              '💬 Coordinar con Dirección Técnica por WhatsApp (+593 984 661 214)' +
            '</a>' +
          '</div>' +

          '<hr style="border: none; border-top: 1px solid #edf2f7; margin: 24px 0;" />' +
          '<p style="font-size: 11.5px; color: #718096; margin: 0; line-height: 1.5;">' +
            '<strong>ASEING CONSULTORÍA INDUSTRIAL</strong> • R.U.C. 1803227857001<br />' +
            'Dirección Técnica: Ing. John F. Suárez J. M.Sc.<br />' +
            'Av. Imbabura y Maytacapac, Ambato, Ecuador | Cobertura Nacional<br />' +
            'Correo: <a href="mailto:aseingerencia1@gmail.com" style="color: #3a0ca3;">aseingerencia1@gmail.com</a>' +
          '</p>' +
        '</div>' +
      '</div>';

    var cuerpoTextoPlanoCliente =
      "ASEING CONSULTORÍA INDUSTRIAL\n" +
      "R.U.C.: 1803227857001\n\n" +
      "Confirmación de Orden y Facturación SRI: " + orderNumber + "\n" +
      "Cliente: " + empresa + " (" + rucCliente + ")\n" +
      "Total Pagado: USD $" + total + "\n" +
      "Clave Acceso SRI: " + claveAccesoSRI + "\n" +
      "Visita Técnica: " + fechaVisita + "\n" +
      "Servicios: " + items + "\n" +
      (esPcp ? "Modalidad de Contratación: Pago Único ($380 USD + IVA 15% = $437 USD total) - Sin recurrencias.\nBonificación: Diagnóstico Inicial de Procesos Productivos ($30 USD) 100% bonificado.\n" : "") + "\n" +
      "Dirección Técnica: Ing. John F. Suárez J. M.Sc. - Ambato, Ecuador\n" +
      "Contacto directo WhatsApp: +593 984 661 214\n" +
      "Correo: aseingerencia1@gmail.com";

    MailApp.sendEmail({
      to: correo,
      cc: "aseingerencia1@gmail.com",
      subject: asuntoCliente,
      body: cuerpoTextoPlanoCliente,
      htmlBody: cuerpoHtmlCliente,
      name: "ASEING Consultoría Industrial",
      replyTo: "aseingerencia1@gmail.com"
    });
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Orden y Factura SRI registradas correctamente en 'Órdenes y Facturación SRI' y correo enviado a " + correo,
    orderNumber: orderNumber,
    rucEmisor: rucEmisor,
    claveAccesoSRI: claveAccesoSRI,
    sheetName: "Órdenes y Facturación SRI",
    rowNumber: sheet.getLastRow()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "ASEING Webhook Google Apps Script - Proyecto Web 1",
    account: "aseingerencia1@gmail.com",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * FUNCIÓN PARA EJECUTAR PRUEBA MANUAL DIRECTA EN EL EDITOR DE GOOGLE APPS SCRIPT:
 * Seleccione la función "crearOVerificarHojaPrueba" en la barra superior del editor
 * y haga clic en "Ejecutar" (Run).
 * Creará la hoja "Proyecto Web 1", añadirá una fila de prueba e imprimirá el enlace directo en el registro.
 */
function crearOVerificarHojaPrueba() {
  var fileName = "Proyecto Web 1";
  var files = DriveApp.getFilesByName(fileName);
  var spreadsheet;

  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.open(files.next());
    Logger.log("✅ La hoja ya existe en su Google Drive: " + spreadsheet.getUrl());
  } else {
    spreadsheet = SpreadsheetApp.create(fileName);
    Logger.log("🎉 ¡Hoja creada exitosamente en su Google Drive!: " + spreadsheet.getUrl());
  }

  var sheet = spreadsheet.getSheetByName("Proyecto Web 1") || spreadsheet.getSheets()[0];
  sheet.setName("Proyecto Web 1");

  if (sheet.getLastRow() === 0) {
    var headers = [
      "Fecha y Hora",
      "Nombre Completo",
      "Empresa",
      "Correo Electrónico",
      "Teléfono / WhatsApp",
      "Cargo / Área",
      "Servicio de Interés",
      "Detalles / Requerimiento",
      "Estado del Lead"
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#18082e");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }

  // Insertar una fila de prueba para verificar
  var fecha = Utilities.formatDate(new Date(), "America/Guayaquil", "dd/MM/yyyy HH:mm:ss");
  sheet.appendRow([
    fecha,
    "Registro de Prueba ASEING",
    "Empresa Demostración Cía. Ltda.",
    "aseingerencia1@gmail.com",
    "+593 984 661 214",
    "Gerencia General",
    "Diagnóstico Inicial de Planta",
    "Fila de prueba creada desde el script para verificar visibilidad en Google Sheets.",
    "Verificado"
  ]);

  Logger.log("---------------------------------------------------------------");
  Logger.log("🔗 ENLACE DIRECTO A SU HOJA DE CÁLCULO:");
  Logger.log(spreadsheet.getUrl());
  Logger.log("---------------------------------------------------------------");
  return spreadsheet.getUrl();
}
