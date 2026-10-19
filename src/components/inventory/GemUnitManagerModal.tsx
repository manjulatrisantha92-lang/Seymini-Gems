import React, { useState, useEffect } from 'react';
import {
  X,
  Scale,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  Calculator,
  Info,
  Layers,
  ArrowRight,
  Gem,
} from 'lucide-react';
import { GemMeasurementUnit } from '../../types';
import { StorageService } from '../../services/storage';
import { useToast } from '../common/Toast';

interface GemUnitManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnitsUpdated?: (units: GemMeasurementUnit[]) => void;
}

export const GemUnitManagerModal: React.FC<GemUnitManagerModalProps> = ({
  isOpen,
  onClose,
  onUnitsUpdated,
}) => {
  const { showToast } = useToast();
  const [units, setUnits] = useState<GemMeasurementUnit[]>(() => StorageService.getGemUnits());
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  // Form states for adding/editing
  const [formName, setFormName] = useState('');
  const [formSymbol, setFormSymbol] = useState('');
  const [formConversion, setFormConversion] = useState<number>(1.0);
  const [formDecimalPlaces, setFormDecimalPlaces] = useState<number>(2);
  const [formDescription, setFormDescription] = useState('');

  // Live Unit Conversion Calculator State
  const [calcInputWeight, setCalcInputWeight] = useState<number>(5.0);
  const [calcInputUnitId, setCalcInputUnitId] = useState<string>('unit-carat');
  const [calcPricePerUnit, setCalcPricePerUnit] = useState<number>(75000);

  useEffect(() => {
    if (isOpen) {
      const stored = StorageService.getGemUnits();
      setUnits(stored);
      if (stored.length > 0 && !stored.some((u) => u.id === calcInputUnitId)) {
        setCalcInputUnitId(stored[0].id);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResetForm = () => {
    setFormName('');
    setFormSymbol('');
    setFormConversion(1.0);
    setFormDecimalPlaces(2);
    setFormDescription('');
    setIsAddingNew(false);
    setEditingUnitId(null);
  };

  const handleStartEdit = (unit: GemMeasurementUnit) => {
    setEditingUnitId(unit.id);
    setFormName(unit.name);
    setFormSymbol(unit.symbol);
    setFormConversion(unit.conversionFactorToCarats);
    setFormDecimalPlaces(unit.decimalPlaces ?? 2);
    setFormDescription(unit.description || '');
    setIsAddingNew(true);
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formName.trim();
    const trimmedSymbol = formSymbol.trim();

    if (!trimmedName || !trimmedSymbol) {
      showToast('Please enter both unit name and symbol.', 'error');
      return;
    }
    if (formConversion <= 0) {
      showToast('Conversion factor must be greater than 0.', 'error');
      return;
    }

    if (editingUnitId) {
      const existing = units.find((u) => u.id === editingUnitId);
      if (existing) {
        const updated: GemMeasurementUnit = {
          ...existing,
          name: trimmedName,
          symbol: trimmedSymbol,
          conversionFactorToCarats: formConversion,
          decimalPlaces: Number(formDecimalPlaces) || 2,
          description: formDescription.trim(),
        };
        StorageService.updateGemUnit(updated);
        showToast(`Gem unit "${trimmedName} (${trimmedSymbol})" updated successfully!`, 'success');
      }
    } else {
      // Adding new unit
      const created = StorageService.addGemUnit({
        name: trimmedName,
        symbol: trimmedSymbol,
        conversionFactorToCarats: formConversion,
        decimalPlaces: Number(formDecimalPlaces) || 2,
        description: formDescription.trim(),
        isStandard: false,
        isActive: true,
      });
      showToast(`New gem measurement unit "${created.name} (${created.symbol})" added!`, 'success');
    }

    const updatedUnits = StorageService.getGemUnits();
    setUnits(updatedUnits);
    if (onUnitsUpdated) onUnitsUpdated(updatedUnits);
    handleResetForm();
  };

  const handleDeleteUnit = (unit: GemMeasurementUnit) => {
    if (unit.isStandard) {
      showToast('Standard gem units (Carat, Ratti, Gram) cannot be deleted as they are core standards.', 'error');
      return;
    }
    if (confirm(`Are you sure you want to delete gem unit "${unit.name} (${unit.symbol})"?`)) {
      StorageService.deleteGemUnit(unit.id);
      const updated = StorageService.getGemUnits();
      setUnits(updated);
      if (onUnitsUpdated) onUnitsUpdated(updated);
      showToast(`Gem unit "${unit.name}" removed.`, 'info');
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all gem measurement units back to official gem trade standards?')) {
      const reset = StorageService.resetGemUnits();
      setUnits(reset);
      if (onUnitsUpdated) onUnitsUpdated(reset);
      showToast('Gem measurement units restored to standards.', 'info');
    }
  };

  // Calculator calculations
  const selectedCalcUnit = units.find((u) => u.id === calcInputUnitId) || units[0] || {
    conversionFactorToCarats: 1.0,
    symbol: 'ct',
    name: 'Carat',
  };
  const totalCarats = (Number(calcInputWeight) || 0) * (selectedCalcUnit.conversionFactorToCarats || 1.0);
  const totalGrams = totalCarats / 5.0; // 1 gram = 5 carats
  const totalCents = totalCarats * 100; // 1 carat = 100 points/cents
  const totalRatti = totalCarats / 0.91; // 1 ratti ≈ 0.91 carats
  const totalValuation = (Number(calcInputWeight) || 0) * (Number(calcPricePerUnit) || 0);
  const pricePerCarat = totalCarats > 0 ? totalValuation / totalCarats : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0d121f] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 font-serif">
                  Gemstone Measurement Units & Weight Standards
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full uppercase tracking-wider">
                  Gem Trade Core
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manually add, calibrate, and manage gem measurement units for buying and selling gemstones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">
                Active Units in System: <span className="text-amber-400 font-bold">{units.length}</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-400">Supports Carat, Ratti, Grams, Points & Custom Units</span>
            </div>
            <div className="flex items-center gap-2">
              {!isAddingNew && (
                <button
                  type="button"
                  onClick={() => {
                    handleResetForm();
                    setIsAddingNew(true);
                  }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Gem Unit
                </button>
              )}
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Restore default standard units"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Defaults
              </button>
            </div>
          </div>

          {/* Add / Edit Form Panel */}
          {isAddingNew && (
            <form
              onSubmit={handleSaveUnit}
              className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <h4 className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {editingUnitId ? 'Edit Gem Measurement Unit' : 'Manually Add Gem Measurement Unit'}
                </h4>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Unit Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ratti, Grain, Chaw"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Symbol / Abbreviation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rt, gr, chaw"
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-mono font-bold placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Carat Equivalent (1 unit = ? ct) *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    required
                    placeholder="e.g. 0.91 or 5.0"
                    value={formConversion}
                    onChange={(e) => setFormConversion(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono font-semibold placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Decimal Precision (Places)
                  </label>
                  <select
                    value={formDecimalPlaces}
                    onChange={(e) => setFormDecimalPlaces(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value={0}>0 Decimals (Whole stones/pcs)</option>
                    <option value={1}>1 Decimal (e.g. 5.5 pt)</option>
                    <option value={2}>2 Decimals (Standard - e.g. 3.45 ct)</option>
                    <option value={3}>3 Decimals (High precision - e.g. 1.250 g)</option>
                    <option value={4}>4 Decimals (Micro analytical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Trade Usage & Gem Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Traditional Sri Lankan & Ratnapura gem bazaar weight unit"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Conversion Preview Help */}
              {formConversion > 0 && (
                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 flex flex-wrap items-center gap-4">
                  <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Conversion Calibration:
                  </span>
                  <span>
                    1 {formSymbol || 'unit'} ={' '}
                    <strong className="text-white">{formConversion} carats</strong>
                  </span>
                  <span>
                    ={' '}
                    <strong className="text-emerald-400">
                      {(formConversion / 5).toFixed(4)} grams
                    </strong>
                  </span>
                  <span>
                    ={' '}
                    <strong className="text-cyan-400">
                      {(formConversion * 100).toFixed(1)} points/cents
                    </strong>
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingUnitId ? 'Update Gem Unit' : 'Save Unit to System'}
                </button>
              </div>
            </form>
          )}

          {/* Units Table / Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Configured Gem Units & Standards
            </h4>

            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/50">
              <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
                <thead className="bg-[#090d15] text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Unit Name</th>
                    <th className="px-3 py-3 text-center">Symbol</th>
                    <th className="px-4 py-3">Carat Equivalent</th>
                    <th className="px-4 py-3">Gram Equivalent</th>
                    <th className="px-4 py-3 hidden md:table-cell">Usage & Notes</th>
                    <th className="px-3 py-3 text-center">Type</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {units.map((unit) => {
                    const gramsEquiv = (unit.conversionFactorToCarats / 5.0).toFixed(4);
                    return (
                      <tr key={unit.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100">{unit.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="px-2 py-0.5 font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded text-xs">
                            {unit.symbol}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-200">
                          1 {unit.symbol} = <span className="text-amber-400 font-bold">{unit.conversionFactorToCarats} ct</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">
                          ≈ {gramsEquiv} g
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-[11px] hidden md:table-cell max-w-xs truncate">
                          {unit.description || '—'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {unit.isStandard ? (
                            <span className="px-2 py-0.5 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full font-semibold">
                              Standard
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-semibold">
                              Custom Unit
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(unit)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Edit unit conversion"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {!unit.isStandard && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUnit(unit)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                title="Delete custom unit"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Gemstone Weight & Price Converter Tool */}
          <div className="bg-gradient-to-br from-slate-900 to-[#0a0f1d] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Live Gemstone Rate & Weight Converter
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                Instantly compute gemstone lot weight, total cost, and effective rate per carat
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Weight Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={calcInputWeight}
                  onChange={(e) => setCalcInputWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Measurement Unit
                </label>
                <select
                  value={calcInputUnitId}
                  onChange={(e) => setCalcInputUnitId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-semibold"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Rate / Price per {selectedCalcUnit.symbol} (Rs.)
                </label>
                <input
                  type="number"
                  step="500"
                  min="0"
                  value={calcPricePerUnit}
                  onChange={(e) => setCalcPricePerUnit(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-emerald-400"
                />
              </div>
            </div>

            {/* Calculations Output Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Carats (ct)</span>
                <span className="text-sm sm:text-base font-bold font-mono text-amber-300">
                  {totalCarats.toFixed(2)} ct
                </span>
              </div>
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Grams (g)</span>
                <span className="text-sm sm:text-base font-bold font-mono text-slate-200">
                  {totalGrams.toFixed(3)} g
                </span>
              </div>
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Ratti (rt)</span>
                <span className="text-sm sm:text-base font-bold font-mono text-cyan-300">
                  {totalRatti.toFixed(2)} rt
                </span>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <span className="block text-[10px] text-amber-300 uppercase font-semibold">Total Gem Valuation</span>
                <span className="text-sm sm:text-base font-bold font-mono text-emerald-400">
                  Rs. {totalValuation.toLocaleString('en-LK', { maximumFractionDigits: 0 })}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  ≈ Rs. {pricePerCarat.toLocaleString('en-LK', { maximumFractionDigits: 0 })} / ct
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#090d15] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Units are synchronized across Gem Buying (Purchases), Gem Selling (POS), and Stock Inventory.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
