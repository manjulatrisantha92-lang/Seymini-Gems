import React from 'react';
import { ShieldCheck, Gem, Award, CheckCircle, ExternalLink, X, Printer, Share2 } from 'lucide-react';
import { Certificate, AppSettings } from '../../types';
import { Modal } from '../common/Modal';

interface CertificateVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
  settings: AppSettings;
  onOpenPrint?: (cert: Certificate) => void;
  onOpenWhatsApp?: (cert: Certificate) => void;
}

export const CertificateVerificationModal: React.FC<CertificateVerificationModalProps> = ({
  isOpen,
  onClose,
  certificate,
  settings,
  onOpenPrint,
  onOpenWhatsApp,
}) => {
  if (!isOpen || !certificate) return null;

  const origin = certificate.gemstoneOrigin || 'Sri Lanka';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Digital Certificate Verification"
      subtitle="National Gem & Jewellery Authority Regulated Authentication Record"
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Verification Banner */}
        <div className="bg-emerald-950/50 border-2 border-emerald-500/60 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-sm tracking-wide uppercase">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Verified Authentic Certificate
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              This record is officially registered under Sri Lankan gemological registry standards.
            </p>
          </div>
        </div>

        {/* Certificate Card Summary */}
        <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-4 space-y-3 font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-mono tracking-wider">
                Official Certificate NO:
              </span>
              <div className="text-base font-bold text-slate-100 font-mono">
                {certificate.certificateNumber}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Date of Issue</span>
              <span className="text-xs font-semibold text-slate-200 font-mono">{certificate.date}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Client Name</span>
              <span className="font-bold text-slate-100">{certificate.customerName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Invoice Reference</span>
              <span className="font-mono text-slate-200">{certificate.invoiceNumber}</span>
            </div>
          </div>

          {/* Gem Specs */}
          <div className="p-3 bg-slate-900 rounded-lg space-y-2 border border-slate-800 text-xs">
            <div className="flex justify-between items-center text-slate-200">
              <span className="text-slate-400">Jewelry / Item:</span>
              <span className="font-bold text-amber-300 text-right">{certificate.jewelryName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-200">
              <span className="text-slate-400">Gem Species / Variety:</span>
              <span className="font-semibold text-slate-100">{certificate.gemstoneType}</span>
            </div>
            <div className="flex justify-between items-center text-slate-200">
              <span className="text-slate-400">Weight & Cut:</span>
              <span className="font-mono">{certificate.gemstoneCaratWeight} ct • {certificate.gemstoneCut}</span>
            </div>
            <div className="flex justify-between items-center text-slate-200">
              <span className="text-slate-400">Color Grade & Clarity:</span>
              <span>{certificate.gemstoneColor} ({certificate.gemstoneClarity || 'Eye Clean'})</span>
            </div>
            <div className="flex justify-between items-center text-slate-200">
              <span className="text-slate-400">Geographical Origin:</span>
              <span className="font-bold text-emerald-400">{origin}</span>
            </div>
            <div className="flex justify-between items-center text-slate-200">
              <span className="text-slate-400">Precious Metal:</span>
              <span>{certificate.goldPurity} ({certificate.grossWeightGrams}g)</span>
            </div>
            <div className="flex justify-between items-center text-slate-200 border-t border-slate-800 pt-1.5">
              <span className="text-slate-400">Appraised Valuation:</span>
              <span className="font-bold text-amber-300 font-mono">
                Rs. {Number(certificate.appraisedValueLKR || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Gemologist Signatory */}
          {certificate.includeGemologistSignature !== false && certificate.gemologistSignatureName && (
            <div className="p-2.5 bg-amber-950/30 border border-amber-500/20 rounded-lg flex items-center gap-2 text-xs">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-amber-300 uppercase block font-semibold">
                  Authorized Certified Gemologist
                </span>
                <span className="text-slate-200 font-serif italic">
                  {certificate.gemologistSignatureName}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {certificate.gemologistTitle || 'Fellow Gemmological Association (FGA)'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            {onOpenWhatsApp && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWhatsApp(certificate);
                }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp
              </button>
            )}
            {onOpenPrint && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPrint(certificate);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                Printout Certificate
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
