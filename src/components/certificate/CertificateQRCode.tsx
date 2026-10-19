import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, CheckCircle2, Copy, FileText, Calendar, Package } from 'lucide-react';
import { Certificate } from '../../types';

interface CertificateQRCodeProps {
  certificate: Certificate;
  size?: number;
  showCaption?: boolean;
  showDetailsBadge?: boolean;
  className?: string;
  onDataUrlGenerated?: (dataUrl: string) => void;
}

export const CertificateQRCode: React.FC<CertificateQRCodeProps> = ({
  certificate,
  size = 100,
  showCaption = true,
  showDetailsBadge = false,
  className = '',
  onDataUrlGenerated,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate QR Code containing Invoice Number, Date, Product Details, and Verification Link
  const buildQRPayload = (): string => {
    const origin = certificate.gemstoneOrigin || 'Sri Lanka';
    const verifyUrl = `${window.location.origin}/?verify_cert=${encodeURIComponent(
      certificate.certificateNumber
    )}`;

    return [
      `💎 GEMOLOGICAL AUTHENTICITY CERTIFICATE`,
      `Certificate No: ${certificate.certificateNumber}`,
      `Invoice No: ${certificate.invoiceNumber}`,
      `Date: ${certificate.date}`,
      `Product: ${certificate.jewelryName} (${certificate.itemCode})`,
      `Gem Variety: ${certificate.gemstoneType}`,
      `Weight: ${certificate.gemstoneCaratWeight} ct | Cut: ${certificate.gemstoneCut}`,
      `Color & Clarity: ${certificate.gemstoneColor} (${certificate.gemstoneClarity || 'Eye Clean'})`,
      `Geographical Origin: ${origin}`,
      `Precious Metal: ${certificate.goldPurity} (${certificate.grossWeightGrams}g)`,
      `Client: ${certificate.customerName}`,
      `Verify Online: ${verifyUrl}`,
    ].join('\n');
  };

  useEffect(() => {
    let isMounted = true;
    const payload = buildQRPayload();

    QRCode.toDataURL(payload, {
      width: Math.max(size * 2, 220), // 2x for sharp printing & high-DPI displays
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setQrUrl(url);
          if (onDataUrlGenerated) {
            onDataUrlGenerated(url);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to generate certificate QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [
    certificate.certificateNumber,
    certificate.invoiceNumber,
    certificate.date,
    certificate.jewelryName,
    certificate.itemCode,
    certificate.gemstoneType,
    certificate.gemstoneCaratWeight,
    certificate.gemstoneOrigin,
    certificate.id,
    size,
    onDataUrlGenerated,
  ]);

  const handleCopy = () => {
    const text = buildQRPayload();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div
        className="p-1.5 bg-white rounded-lg border border-amber-500/40 shadow-sm relative group cursor-pointer"
        onClick={handleCopy}
        title="Click to copy QR content: Invoice #, Date & Product Details"
      >
        {qrUrl ? (
          <img
            src={qrUrl}
            alt={`QR Code for Certificate ${certificate.certificateNumber}`}
            style={{ width: `${size}px`, height: `${size}px` }}
            className="block rounded object-contain"
          />
        ) : (
          <div
            style={{ width: `${size}px`, height: `${size}px` }}
            className="flex items-center justify-center bg-slate-100 text-slate-400 rounded"
          >
            <QrCode className="w-6 h-6 animate-pulse text-amber-500" />
          </div>
        )}

        {/* Copy overlay indicator on hover */}
        <div className="absolute inset-0 bg-slate-950/75 text-amber-300 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center rounded transition-opacity text-[10px] font-sans no-print p-1">
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-0.5" />
              <span className="text-emerald-300 font-bold text-[9px]">Copied Details!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-amber-400 mb-0.5" />
              <span className="text-[9px]">Copy QR Data</span>
            </>
          )}
        </div>
      </div>

      {showCaption && (
        <div className="mt-1 font-sans max-w-[190px]">
          <div className="text-[10px] font-bold text-amber-950 uppercase tracking-wider">
            Scan to Verify
          </div>
          <div className="text-[9px] font-mono text-slate-700 font-bold">
            NO: {certificate.certificateNumber}
          </div>

          {/* Embedded Invoice Number, Date, Product Details Badges */}
          <div className="mt-1 pt-1 border-t border-amber-200/60 text-[8.5px] leading-tight space-y-0.5 text-slate-600">
            <div className="flex items-center justify-center gap-1 font-mono">
              <span className="text-slate-500">Inv:</span>
              <span className="font-bold text-slate-800">{certificate.invoiceNumber}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-700">{certificate.date}</span>
            </div>
            <div className="font-medium text-slate-800 truncate" title={certificate.jewelryName}>
              {certificate.jewelryName}
            </div>
          </div>
        </div>
      )}

      {showDetailsBadge && (
        <div className="mt-1.5 p-1.5 bg-amber-500/10 border border-amber-500/30 rounded text-left text-[10px] font-sans text-slate-300 w-full max-w-[220px]">
          <div className="flex items-center gap-1 text-amber-400 font-bold text-[9px] uppercase">
            <Package className="w-3 h-3" /> QR Encoded Data
          </div>
          <div className="text-[9px] text-slate-400 font-mono mt-0.5 space-y-0.5">
            <div><strong className="text-slate-300">Inv:</strong> {certificate.invoiceNumber}</div>
            <div><strong className="text-slate-300">Date:</strong> {certificate.date}</div>
            <div className="truncate"><strong className="text-slate-300">Item:</strong> {certificate.jewelryName}</div>
          </div>
        </div>
      )}
    </div>
  );
};
