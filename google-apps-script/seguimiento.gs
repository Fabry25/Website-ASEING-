/**
 * ============================================================================
 * ASEING - Script de Seguimiento Automatizado (seguimiento.gs)
 * ============================================================================
 * Activador recomendado: Basado en tiempo (Time-driven) -> Cada 1 minuto.
 *
 * Flujo de Detección de Respuestas en Gmail:
 * 1. El script lee la hoja "Proyecto Web 1".
 * 2. Para cada fila con estado "Esperando respuesta":
 *    - Busca si existe un correo entrante NO LEÍDO del cliente:
 *      var hilos = GmailApp.search("from:" + correoCliente + " is:unread");
 * 3. Si NO encuentra hilos: No hace nada. La celda sigue en "Esperando respuesta".
 * 4. Si SÍ encuentra hilos (el cliente respondió):
 *    - Selecciona el borrador en Gmail.
 *    - Envía el correo con GmailApp.sendEmail.
 *    - Marca el hilo como leído con hilos[0].markRead() para evitar duplicados.
 *    - Actualiza la celda en Google Sheets a "Instrucciones Enviadas".
 */

function verificarRespuestasYEnviarSeguimiento() {
  var nombreHoja = "Proyecto Web 1";
  var sheet;

  // 1. Obtener la hoja de cálculo
  try {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombreHoja) || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  } catch (e) {
    var files = DriveApp.getFilesByName(nombreHoja);
    if (files.hasNext()) {
      var ss = SpreadsheetApp.open(files.next());
      sheet = ss.getSheetByName(nombreHoja) || ss.getActiveSheet();
    }
  }

  if (!sheet) {
    Logger.log("[ASEING] No se encontró la hoja: " + nombreHoja);
    return;
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;

  var colNombre = 1;         // Columna B: Nombre
  var colCorreo = 3;         // Columna D: Correo
  var colEstadoIndex = 8;    // Columna I (índice 8 en array, Columna 9 en Google Sheets)
  var colEstadoNumero = 9;   // Base 1 para getRange

  // Obtener borradores disponibles en la bandeja de Gmail
  var drafts = GmailApp.getDrafts();
  var borradorMensaje = drafts.length > 0 ? drafts[0].getMessage() : null;

  // 2. Recorrer los registros de la hoja
  for (var i = 1; i < data.length; i++) {
    var fila = data[i];
    var numeroFila = i + 1;

    var nombreCliente = (fila[colNombre] || "Estimado(a) Cliente").toString().trim();
    var correoCliente = (fila[colCorreo] || "").toString().trim().toLowerCase();
    var estado = (fila[colEstadoIndex] || "").toString().trim();

    // Solo procesar si el estado es estrictamente "Esperando respuesta"
    if (estado === "Esperando respuesta" && correoCliente.indexOf("@") !== -1) {
      
      // Buscar correos entrantes NO LEÍDOS provenientes de la dirección del cliente
      var hilos = GmailApp.search("from:" + correoCliente + " is:unread");

      // CASO 1: El cliente SÍ respondió (hay correos entrantes no leídos)
      if (hilos.length > 0) {
        Logger.log("[ASEING] ¡Respuesta detectada de " + correoCliente + " (Fila " + numeroFila + ")!");

        try {
          var asuntoEnvio = "ASEING | Instrucciones y Pasos a Seguir";
          var cuerpoHtml = "";

          if (borradorMensaje) {
            asuntoEnvio = borradorMensaje.getSubject() || asuntoEnvio;
            cuerpoHtml = borradorMensaje.getBody().replace(/\{\{nombre\}\}/gi, nombreCliente);
          } else {
            cuerpoHtml =
              "<div style=\"font-family: Arial, sans-serif; color: #2d3748; line-height: 1.6;\">" +
                "<p>Estimado(a) <strong>" + nombreCliente + "</strong>,</p>" +
                "<p>Gracias por su respuesta. Adjuntamos las instrucciones y pasos a seguir para su requerimiento técnico.</p>" +
                "<p>Atentamente,<br /><strong>Ing. John F. Suárez J. M.Sc.</strong><br />ASEING Consultoría Industrial</p>" +
              "</div>";
          }

          // Enviar el correo de seguimiento
          GmailApp.sendEmail(correoCliente, asuntoEnvio, "", {
            htmlBody: cuerpoHtml,
            name: "ASEING Consultoría Industrial"
          });

          // Marcar el hilo como leído para que no se vuelva a procesar en el siguiente minuto
          hilos[0].markRead();

          // Actualizar el estado en Google Sheets
          sheet.getRange(numeroFila, colEstadoNumero).setValue("Instrucciones Enviadas");
          SpreadsheetApp.flush();

          Logger.log("[ASEING] Fila " + numeroFila + ": Correo enviado con éxito y celda actualizada a 'Instrucciones Enviadas'.");

        } catch (err) {
          Logger.log("[ASEING] Error procesando respuesta de " + correoCliente + ": " + err.message);
        }

      } else {
        // CASO 2: NO se encontraron hilos no leídos.
        // No hace nada. La celda permanece como "Esperando respuesta" para el siguiente ciclo.
        Logger.log("[ASEING] Fila " + numeroFila + " (" + correoCliente + "): Sin respuesta aún. Permanece en 'Esperando respuesta'.");
      }
    }
  }
}
