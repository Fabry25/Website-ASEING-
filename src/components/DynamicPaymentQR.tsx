import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Maximize2, X, Check, Smartphone, Sparkles, ExternalLink } from 'lucide-react';

interface DynamicPaymentQRProps {
  method: 'produbanco' | 'payphone';
  totalAmount: number;
  orderRef?: string;
  clientName?: string;
  accountNumber?: string;
  beneficiaryName?: string;
  idNumber?: string;
  bankName?: string;
  payphoneUrl?: string;
}

export const DynamicPaymentQR: React.FC<DynamicPaymentQRProps> = ({
  method,
  totalAmount,
  orderRef = 'ASEING-ORD-' + Date.now().toString().slice(-4),
  clientName = 'Cliente ASEING',
  accountNumber = '18005352236',
  beneficiaryName = 'Suárez John F',
  idNumber = '1803227857',
  bankName = 'Produbanco',
  payphoneUrl = 'https://payp.page.link/QEYpZ'
}) => {
  const [activeTab, setActiveTab] = useState<'official' | 'dynamic'>('official');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate dynamic QR code data URL whenever parameters change
  useEffect(() => {
    let payload = '';

    if (method === 'produbanco') {
      if (activeTab === 'dynamic') {
        // Standard banking format recognized by mobile banking and QR scanner apps
        payload = [
          `BANCO:${bankName}`,
          `TIPO:AHORROS`,
          `CUENTA:${accountNumber}`,
          `BENEFICIARIO:${beneficiaryName}`,
          `CI:${idNumber}`,
          `VALOR:${totalAmount.toFixed(2)}`,
          `MONEDA:USD`,
          `REF:${orderRef}`,
          `EMPRESA:ASEING INGENIERIA`
        ].join('\n');
      } else {
        // Direct Produbanco mobile transfer payload
        payload = `BANCO:PRODUBANCO|TIPO:AHORROS|CUENTA:${accountNumber}|BENEFICIARIO:${beneficiaryName}|CI:${idNumber}|CONCEPTO:SERVICIOS ASEING`;
      }
    } else {
      // Payphone direct payment link
      payload = payphoneUrl;
    }

    QRCode.toDataURL(payload, {
      width: 480,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: method === 'produbanco' ? '#053621' : '#1a0533',
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR:', err));
  }, [method, activeTab, totalAmount, orderRef, accountNumber, beneficiaryName, idNumber, bankName, payphoneUrl]);

  // Download QR code image
  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = method === 'produbanco' && activeTab === 'official' 
      ? '/images/qr/produbanco-qr-official.png' 
      : (qrDataUrl || '/images/qr/payphone-qr-official.png');
    link.download = `QR-Pago-${method === 'produbanco' ? 'Produbanco' : 'Payphone'}-${orderRef}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPayphoneLink = () => {
    navigator.clipboard.writeText(payphoneUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3.5">
      {/* Header with Title and Badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${method === 'produbanco' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#ff5a00]/20 text-[#ff5a00]'}`}>
            <QrCode size={18} />
          </div>
          <div>
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>{method === 'produbanco' ? 'QR de Pago Produbanco Móvil' : 'QR de Cobro Payphone'}</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/10 text-white">
                {method === 'produbanco' ? 'Banca Móvil' : 'App Payphone'}
              </span>
            </div>
            <p className="text-[10px] text-[#bfa9dc]">
              {method === 'produbanco' 
                ? 'Escanee desde su App Produbanco o cámara para transferir sin digitar números' 
                : 'Escanee para abonar con tarjeta de crédito/débito nacional o internacional'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#bfa9dc] hover:text-white transition-colors cursor-pointer"
          title="Ampliar QR para escanear"
        >
          <Maximize2 size={15} />
        </button>
      </div>

      {/* Tabs for Produbanco (Official Produbanco App QR vs Dynamic Amount QR) */}
      {method === 'produbanco' && (
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('official')}
            className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'official'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'text-[#bfa9dc] hover:text-white'
            }`}
          >
            QR Oficial Produbanco
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dynamic')}
            className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
              activeTab === 'dynamic'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'text-[#bfa9dc] hover:text-white'
            }`}
          >
            <Sparkles size={12} className="text-amber-300" />
            <span>QR Dinámico (${totalAmount.toFixed(2)})</span>
          </button>
        </div>
      )}

      {/* QR Code Presentation Container */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 p-3.5 rounded-xl border border-white/10">
        {/* The QR Image / Canvas with Brand Embellishment */}
        <div className="relative group cursor-pointer flex-none" onClick={() => setIsModalOpen(true)}>
          {method === 'produbanco' && activeTab === 'official' ? (
            <div className="w-40 h-40 rounded-xl overflow-hidden bg-[#053621] p-1.5 shadow-lg border border-emerald-500/30 flex items-center justify-center relative">
              <img
                src="/images/qr/produbanco-qr-official.png"
                alt="QR Oficial Produbanco"
                className="w-full h-full object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-[11px] font-semibold gap-1">
                <Maximize2 size={14} /> Ampliar
              </div>
            </div>
          ) : (
            <div className="w-40 h-40 rounded-xl overflow-hidden bg-white p-2 shadow-lg border border-white/20 flex items-center justify-center relative">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR ${method === 'produbanco' ? 'Produbanco' : 'Payphone'}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="animate-pulse w-full h-full bg-gray-200 rounded" />
              )}
              {/* Optional center logo badge for dynamic Produbanco */}
              {method === 'produbanco' && activeTab === 'dynamic' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-white shadow-md border border-emerald-500 flex items-center justify-center">
                    <span className="text-[10px] font-black text-[#007934]">★</span>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-[11px] font-semibold gap-1">
                <Maximize2 size={14} /> Ampliar
              </div>
            </div>
          )}
        </div>

        {/* Instructions and Quick Data Summary */}
        <div className="flex-1 space-y-2 text-xs w-full">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
            <span className="text-[#bfa9dc]">Valor a transferir:</span>
            <span className="font-bold font-mono text-emerald-400 text-sm">
              USD ${totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="text-[11px] text-[#bfa9dc] leading-relaxed space-y-1">
            {method === 'produbanco' ? (
              activeTab === 'official' ? (
                <>
                  <div className="flex items-start gap-1.5 text-white">
                    <Smartphone size={13} className="text-emerald-400 mt-0.5 flex-none" />
                    <span>Abra su <strong>App Produbanco</strong> en su teléfono.</span>
                  </div>
                  <div className="pl-4 text-[10px] text-[#bfa9dc]">
                    Vaya a <strong>"Pagar con QR"</strong> o <strong>"Transferencias"</strong> y apunte la cámara al código. Se autocompletará la <strong>Cta. Ahorros terminada en 36</strong> de <strong>Suárez John F</strong>.
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-1.5 text-white">
                    <Sparkles size={13} className="text-amber-400 mt-0.5 flex-none" />
                    <span>QR Dinámico con monto exacto <strong>USD ${totalAmount.toFixed(2)}</strong>.</span>
                  </div>
                  <div className="pl-4 text-[10px] text-[#bfa9dc]">
                    Codifica los datos bancarios y el valor exacto de su comprobante de pago o abono para evitar errores manuales de digitación.
                  </div>
                </>
              )
            ) : (
              <>
                <div className="flex items-start gap-1.5 text-white">
                  <Smartphone size={13} className="text-[#ff5a00] mt-0.5 flex-none" />
                  <span>Abra su <strong>App Payphone</strong> o la cámara de su celular.</span>
                </div>
                <div className="pl-4 text-[10px] text-[#bfa9dc]">
                  Escanee para acceder a la pasarela directa y pagar con cualquier tarjeta o saldo Payphone en segundos.
                </div>
              </>
            )}
          </div>

          {/* Action Buttons: Download & Enlarge */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span>Descargar QR</span>
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#bfa9dc] hover:text-white text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Maximize2 size={13} />
              <span>Ampliar pantalla</span>
            </button>

            {method === 'payphone' && (
              <button
                type="button"
                onClick={handleCopyPayphoneLink}
                className="px-2.5 py-1.5 rounded-lg bg-[#ff5a00]/20 hover:bg-[#ff5a00]/30 text-[#ff5a00] text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
              >
                {copiedLink ? <Check size={13} className="text-white" /> : <ExternalLink size={13} />}
                <span>{copiedLink ? 'Enlace copiado' : 'Copiar enlace'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Fullscreen QR Scanning */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-sm w-full bg-[#120524] border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {method === 'produbanco' ? 'Produbanco • Pago Rápido' : 'Payphone • Pasarela'}
              </span>
              <h3 className="text-lg font-bold text-white pt-1">
                {method === 'produbanco' ? 'Escanee para Transferir' : 'Escanee para Pagar con Payphone'}
              </h3>
              <p className="text-xs text-[#bfa9dc]">
                Alinee la cámara de su celular o app bancaria con el código
              </p>
            </div>

            {/* High Contrast QR Box for Phone Camera Sensors */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl mx-auto">
              <img
                src={
                  method === 'produbanco' && activeTab === 'official'
                    ? '/images/qr/produbanco-qr-official.png'
                    : (qrDataUrl || '/images/qr/payphone-qr-official.png')
                }
                alt="QR Ampliado"
                className="w-64 h-64 object-contain rounded-lg"
              />
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono space-y-1">
              <div className="text-[#bfa9dc]">Monto total a pagar:</div>
              <div className="text-xl font-bold text-emerald-400">USD ${totalAmount.toFixed(2)}</div>
              {method === 'produbanco' && (
                <div className="text-[11px] text-[#f3effa] pt-1 border-t border-white/10">
                  Produbanco • Cta. Ahorros: <strong>18005352236</strong>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownloadQR}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download size={14} />
                <span>Guardar en galería</span>
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DynamicPaymentQR;
