# Instrucciones de Instalación: Google Apps Script + Google Sheets ("Proyecto Web 1")

Para conectar el formulario de **Registro y Consulta** de ASEING con tu cuenta de Google (`aseingerencia1@gmail.com`), sigue estos sencillos pasos:

---

### Paso 1: Crear el proyecto en Google Apps Script
1. Inicia sesión con la cuenta de Google: **`aseingerencia1@gmail.com`**.
2. Ingresa a: [https://script.google.com](https://script.google.com)
3. Haz clic en el botón **"Nuevo proyecto"** (arriba a la izquierda).
4. Cámbiale el título al proyecto (por ejemplo: `ASEING Webhook Registro y Consulta`).

---

### Paso 2: Pegar el código del script
1. Borra el código por defecto que aparece en el archivo `Código.gs` (o `Code.gs`).
2. Copia todo el contenido del archivo `google-apps-script/Code.gs` y pégalo allí.
3. Haz clic en el icono de **Guardar** (el disquete o `Ctrl + S`).

---

### Paso 3: Implementar como Aplicación Web (Paso Crucial)
1. En la esquina superior derecha, haz clic en el botón azul **"Implementar"** > **"Nueva implementación"**.
2. En el menú de la izquierda, junto a "Seleccionar tipo", haz clic en el icono de engranaje ⚙️ y elige **"Aplicación web"**.
3. Completa los 3 campos:
   - **Descripción**: `ASEING Formulario Web`
   - **Ejecutar como**: `Yo (aseingerencia1@gmail.com)`
   - **Quién tiene acceso**: **`Cualquier persona`** *(OJO: Debe decir "Cualquier persona" / "Anyone", para que el formulario web pueda enviar los datos sin requerir que el visitante inicie sesión).*
4. Haz clic en **"Implementar"**.
5. Google te solicitará **"Autorizar el acceso"**. 
   - Selecciona tu cuenta `aseingerencia1@gmail.com`.
   - Si aparece la pantalla "Google no ha verificado esta aplicación", haz clic en **"Configuración avanzada"** y luego en **"Ir a ASEING Webhook (no seguro)"**.
   - Haz clic en **"Permitir"**.

---

### ¿Cómo encontrar o crear la hoja de cálculo "Proyecto Web 1"?

Google Drive **no crea la hoja hasta que se ejecuta el script por primera vez**. Para que aparezca en tu cuenta de inmediato y puedas verla con tus propios ojos, tienes 2 opciones súper sencillas:

#### Opción 1: Ejecutar la prueba directa desde el editor de Google Apps Script (Recomendado)
1. En el editor de [script.google.com](https://script.google.com), en la barra superior junto al botón "Depurar", verás un desplegable con las funciones del código.
2. Selecciona la función: **`crearOVerificarHojaPrueba`**.
3. Haz clic en **"Ejecutar"** (Run ▶️).
4. El script creará la hoja en tu Google Drive, insertará una fila de prueba con encabezados oscuros profesionales, y en el panel de **Registro de ejecución** (abajo) te mostrará el **enlace directo de tu hoja** para que solo hagas clic y la abras.

#### Opción 2: Crearla manualmente en Google Sheets
1. Abre tu navegador con la cuenta `aseingerencia1@gmail.com` y entra a: [https://sheets.new](https://sheets.new)
2. En la esquina superior izquierda, cambia el nombre *"Hoja de cálculo sin título"* por exactamente:
   ```
   Proyecto Web 1
   ```
3. ¡Listo! El script detectará automáticamente esta hoja por su nombre cada vez que reciba un registro.

---

### Paso 4: Copiar la URL del Webhook
1. Al finalizar, Google te mostrará una ventana con la **URL de la aplicación web**. 
   Tendrá un formato similar a este:
   ```
   https://script.google.com/macros/s/AKfycbx..._tu_id_aqui.../exec
   ```
2. Copia esa URL.

---

### Paso 5: Activar la URL en la Web de ASEING
Puedes activarla de dos maneras (ambas son válidas):
- **Opción A (Desde la propia interfaz web):**
  Abre el modal **"Registro y Consulta"** en la web de ASEING, haz clic en el botón "Configurar Webhook" y pega tu URL de Google Apps Script. ¡Se guardará automáticamente en tu navegador!
- **Opción B (En las variables de entorno):**
  Añade en el archivo `.env` o en la configuración de la app:
  ```env
  VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/TU_ID_AQUI/exec
  ```

---

### ¿Qué hace automáticamente este script?
1. **Google Sheets:** Si la hoja **`Proyecto Web 1`** no existe en tu Google Drive, el script la crea de forma automática con columnas estilizadas:
   - *Fecha y Hora, Nombre Completo, Empresa, Correo Electrónico, Teléfono, Cargo, Servicio, Detalles y Estado.*
2. **Autorespuesta por Correo:** Con la función `MailApp.sendEmail()`, envía un correo con plantilla HTML profesional y enlace directo a WhatsApp al cliente que se registró.
3. **Notificación Interna:** Envía una alerta por correo a `aseingerencia1@gmail.com` avisando de cada nuevo prospecto recibido.
