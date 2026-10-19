import React, { useState, useEffect } from 'react';
import { Share2, Send, Copy, Check, MessageSquare, Phone, X, Award, ExternalLink } from 'lucide-react';
import { Certificate, AppSettings } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { safeOpenExternal, formatWhatsAppNumber } from '../../utils/navigation';

interface CertificateWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
  settings: AppSettings;
}

export const CertificateWhatsAppModal: React.FC<CertificateWhatsAppModalProps> = ({
  isOpen,
  onClose,
  certificate,
  settings,
}) => {
  const { showToast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (certificate) {
      setPhoneNumber(certificate.customerPhone || '');
    }
  }, [certificate]);

  if (!isOpen || !certificate) return null;

  const companyName = settings.companyName || 'WCS GEMS & FINE JEWELRY';
  const companyAddress =
    settings.companyAddress || 'No. 148, Galle Road, Colombo 03 / Main Street, Ratnapura';
  const hotline = settings.telephone || '+94 11 257 8899 / +94 45 222 4110';
  const origin = certificate.gemstoneOrigin || 'Sri Lanka';
  const verifyUrl = `${window.location.origin}/?verify_cert=${encodeURIComponent(
    certificate.certificateNumber
  )}`;

  // Formatted official WhatsApp message
  const generateWhatsAppMessage = (): string => {
    return (
      `💎 *CERTIFICATE OF GEMOLOGICAL AUTHENTICITY*\n` +
      `*${companyName.toUpperCase()}*\n` +
      `🏛️ National Gem & Jewellery Authority Regulated Showroom\n` +
      `📍 ${companyAddress}\n` +
      `📞 Hotline: ${hotline}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📜 *Certificate No:* ${certificate.certificateNumber}\n` +
      `📅 *Date of Issue:* ${certificate.date}\n` +
      `👤 *Valued Client:* ${certificate.customerName}\n` +
      `🧾 *Invoice Reference:* ${certificate.invoiceNumber}\n` +
      `🔬 *Laboratory / Reg Reference:* ${certificate.laboratoryVerificationNo || 'NGJA-LK-AUTHENTIC'}\n\n` +
      `💍 *ITEM SPECIFICATIONS*\n` +
      `• *Jewelry / Article:* ${certificate.jewelryName}\n` +
      `• *Gemstone Variety:* ${certificate.gemstoneType}\n` +
      `• *Carat Weight:* ${certificate.gemstoneCaratWeight} ct\n` +
      `• *Cut & Shape:* ${certificate.gemstoneCut}\n` +
      `• *Color Grade:* ${certificate.gemstoneColor}\n` +
      `• *Clarity:* ${certificate.gemstoneClarity || 'Eye Clean'}\n` +
      `• *Geographical Origin:* ${origin}\n` +
      `• *Precious Metal:* ${certificate.goldPurity}\n` +
      `• *Gross Weight:* ${certificate.grossWeightGrams}g (Net Gold: ${certificate.netGoldWeightGrams}g)\n` +
      `• *Appraised Valuation:* Rs. ${Number(certificate.appraisedValueLKR || 0).toLocaleString()}\n\n` +
      `📝 *GEMOLOGICAL TECHNICAL COMMENTS*\n` +
      `${certificate.remarks || 'Tested via Raman spectrometer and optical microscopy. No indications of thermal or chemical enhancement (Natural Unheated).'}\n\n` +
      (certificate.includeGemologistSignature !== false && certificate.gemologistSignatureName
        ? `👨‍🔬 *Authorized Certified Gemologist:*\n_${certificate.gemologistSignatureName}_\n${certificate.gemologistTitle || 'Fellow Gemmological Association (FGA)'}\n\n`
        : '') +
      `🔍 *DIGITAL QR CODE VERIFICATION LINK:*\n` +
      `${verifyUrl}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_This document certifies the authenticity and natural origin of the described gemstone and fine precious metal mount under Sri Lankan gemological standards._`
    );
  };

  const handleSendWhatsApp = () => {
    const text = generateWhatsAppMessage();
    const formattedPhone = formatWhatsAppNumber(phoneNumber);
    const waUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    safeOpenExternal(waUrl);
    showToast(
      formattedPhone
        ? `Opening WhatsApp to send certificate to +${formattedPhone}...`
        : 'Opening WhatsApp to choose recipient...',
      'info'
    );
    onClose();
  };

  const handleCopyText = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Certificate text copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`WhatsApp Send — ${certificate.certificateNumber}`}
      subtitle="Instantly send verified gemological certificate details and digital verification link to customer"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Recipient Phone Field */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            Customer WhatsApp Number
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 077 123 4567 or +94 77 123 4567"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
            />
            {phoneNumber && (
              <span className="self-center text-[11px] text-slate-400 font-mono px-2 py-1 bg-slate-800 rounded">
                Standard: +{formatWhatsAppNumber(phoneNumber)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Recipient will receive the full certificate specifications, gemological comments, and verifiable link.
          </p>
        </div>

        {/* Message Preview Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              WhatsApp Message Preview
            </label>
            <button
              onClick={handleCopyText}
              className="text-xs font-semibold text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed border-l-4 border-l-emerald-500">
            {generateWhatsAppMessage()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Text
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              Send to WhatsApp
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
