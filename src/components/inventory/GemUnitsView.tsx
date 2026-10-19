import React, { useState, useEffect } from 'react';
import {
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
  ShoppingBag,
  Receipt,
  BookOpen,
  ArrowLeftRight,
  CheckCircle2,
} from 'lucide-react';
import { GemMeasurementUnit, AppSettings, User } from '../../types';
import { StorageService } from '../../services/storage';
import { useToast } from '../common/Toast';

interface GemUnitsViewProps {
  settings: AppSettings;
  currentUser?: User | null;
  onNavigate?: (page: string) => void;
  onRefreshAllData?: () => void;
}

export const GemUnitsView: React.FC<GemUnitsViewProps> = ({
  settings,
  currentUser,
  onNavigate,
  onRefreshAllData,
}) => {
  const { showToast } = useToast();
  const [units, setUnits] = useState<GemMeasurementUnit[]>(() => StorageService.getGemUnits());
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSymbol, setFormSymbol] = useState('');
  const [formConversion, setFormConversion] = useState<number>(1.0);
  const [formDecimalPlaces, setFormDecimalPlaces] = useState<number>(2);
  const [formDescription, setFormDescription] = useState('');

  // Live Unit Conversion & Valuation Calculator State
  const [calcInputWeight, setCalcInputWeight] = useState<number>(5.0);
  const [calcInputUnitId, setCalcInputUnitId] = useState<string>('unit-carat');
  const [calcPricePerUnit, setCalcPricePerUnit] = useState<number>(85000);

  const refreshUnits = () => {
    const list = StorageService.getGemUnits();
    setUnits(list);
    if (onRefreshAllData) onRefreshAllData();
  };

  useEffect(() => {
    refreshUnits();
  }, []);

  const handleStartAdd = () => {
    setEditingUnitId(null);
    setFormName('');
    setFormSymbol('');
    setFormConversion(1.0);
    setFormDecimalPlaces(2);
    setFormDescription('');
    setIsAddingNew(true);
  };

  const handleStartEdit = (u: GemMeasurementUnit) => {
    setIsAddingNew(false);
    setEditingUnitId(u.id);
    setFormName(u.name);
    setFormSymbol(u.symbol);
    setFormConversion(u.conversionFactorToCarats);
    setFormDecimalPlaces(u.decimalPlaces ?? 2);
    setFormDescription(u.description || '');
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingUnitId(null);
    setFormName('');
    setFormSymbol('');
    setFormConversion(1.0);
    setFormDecimalPlaces(2);
    setFormDescription('');
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formSymbol.trim()) {
      showToast('Please provide both unit name and symbol (e.g., Ratti, rt)', 'error');
      return;
    }

    if (formConversion <= 0) {
      showToast('Conversion factor to carats must be greater than 0', 'error');
      return;
    }

    const cleanSymbol = formSymbol.trim().toLowerCase();

    if (editingUnitId) {
      // Update
      const existing = units.find((u) => u.id === editingUnitId);
      const updated: GemMeasurementUnit = {
        id: editingUnitId,
        name: formName.trim(),
        symbol: cleanSymbol,
        conversionFactorToCarats: Number(formConversion),
        decimalPlaces: Number(formDecimalPlaces) || 2,
        description: formDescription.trim(),
        isStandard: existing?.isStandard || false,
        isActive: true,
      };

      StorageService.updateGemUnit(updated);
      showToast(`Updated measurement unit "${formName}"`, 'success');
    } else {
      // Add new
      const newUnit: GemMeasurementUnit = {
        id: `unit-${Date.now()}`,
        name: formName.trim(),
        symbol: cleanSymbol,
        conversionFactorToCarats: Number(formConversion),
        decimalPlaces: Number(formDecimalPlaces) || 2,
        description: formDescription.trim(),
        isStandard: false,
        isActive: true,
      };

      StorageService.addGemUnit(newUnit);
      showToast(`Added new gem measurement unit "${formName}" (${cleanSymbol})!`, 'success');
    }

    refreshUnits();
    handleCancelForm();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete gem measurement unit "${name}"?`)) {
      StorageService.deleteGemUnit(id);
      showToast(`Measurement unit "${name}" deleted.`, 'info');
      refreshUnits();
    }
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Reset gemstone measurement units to international and South Asian market standards (Carat, Ratti, Points, Grams)?'
      )
    ) {
      const resetList = StorageService.resetGemUnits();
      setUnits(resetList);
      showToast('Gem measurement units reset to defaults.', 'info');
      if (onRefreshAllData) onRefreshAllData();
    }
  };

  // Calculator calculations
  const selectedUnit = units.find((u) => u.id === calcInputUnitId) || units[0] || {
    id: 'unit-carat',
    name: 'Carat',
    symbol: 'ct',
    conversionFactorToCarats: 1.0,
    decimalPlaces: 2,
  };

  const totalCarats = calcInputWeight * selectedUnit.conversionFactorToCarats;
  const totalGrams = totalCarats * 0.2;
  const totalCents = totalCarats * 100;
  const totalMilligrams = totalGrams * 1000;
  const totalLotValue = calcInputWeight * calcPricePerUnit;
  const effectivePricePerCarat = totalCarats > 0 ? totalLotValue / totalCarats : 0;
  const effectivePricePerGram = totalGrams > 0 ? totalLotValue / totalGrams : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#171a26] via-[#111420] to-[#1a1426] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Gem className="w-3.5 h-3.5" />
              <span>Gem Trading &amp; Valuation Architecture</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Scale className="w-6 h-6 text-amber-400" />
              Gemstone Measurement Units &amp; Weight Standards
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Configure and manually add custom gem weight units (Carats, Ratti, Points, Grams, Chau, Tola).
              These units dynamically power <strong>Gem Buying Inward</strong> (Purchase Orders) and <strong>Gem Selling</strong> (POS Bills).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleStartAdd}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950/40 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Custom Unit</span>
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset to International & Ceylon Market Standards"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Standards</span>
            </button>
          </div>
        </div>

        {/* Quick Nav to Gem Buying and Gem Selling */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Quick Workspaces:</span>
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('invoice')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                <span>Go to Gem Selling (POS Billing)</span>
              </button>
              <button
                onClick={() => onNavigate('purchase_orders')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
                <span>Go to Gem Buying (Inward PO)</span>
              </button>
              <button
                onClick={() => onNavigate('inventory')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Gem className="w-3.5 h-3.5 text-amber-400" />
                <span>Gem Stock Inventory</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Manual Add / Edit Unit Form Panel */}
      {(isAddingNew || editingUnitId) && (
        <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-top-3 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {editingUnitId ? 'Edit Gem Measurement Unit' : 'Manually Add New Gem Measurement Unit'}
                </h3>
                <p className="text-xs text-slate-400">
                  Define custom weight conversions to international carats (ct) for real-world gem transactions.
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelForm}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveUnit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Unit Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Ratti"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Unit Symbol / Short Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rt, pt, g, chau"
                  value={formSymbol}
                  onChange={(e) => setFormSymbol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Carat Factor (1 Unit = X Carats) *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  min="0.0001"
                  value={formConversion}
                  onChange={(e) => setFormConversion(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Decimal Places
                </label>
                <select
                  value={formDecimalPlaces}
                  onChange={(e) => setFormDecimalPlaces(parseInt(e.target.value, 10) || 2)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                >
                  <option value={2}>2 Decimals (0.01)</option>
                  <option value={3}>3 Decimals (0.001)</option>
                  <option value={4}>4 Decimals (0.0001)</option>
                  <option value={1}>1 Decimal (0.1)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description / Market Usage Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Used primarily in Beruwala, Colombo, and Jaipur gemstone bazaars for Vedic astrological gems"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Quick helper conversion badge */}
            {formConversion > 0 && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-mono">
                  <Info className="w-4 h-4 text-amber-400" />
                  Calculated Standard: 1 {formSymbol || 'unit'} = <strong>{formConversion} ct</strong> ={' '}
                  <strong>{(formConversion * 0.2).toFixed(4)} grams</strong> ={' '}
                  <strong>{(formConversion * 100).toFixed(1)} cents</strong>
                </span>
                <span className="text-[11px] text-amber-400/90 font-medium">Ready to save</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{editingUnitId ? 'Update Unit' : 'Save New Unit'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Configured Units & Live Interactive Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Unit List & Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Configured Gem Measurement Units ({units.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Available in all dropdowns across purchase receipts, POS billing, and jewelry tags.
                </p>
              </div>
              <button
                onClick={handleStartAdd}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Unit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {units.map((u) => (
                <div
                  key={u.id}
                  className="p-4 bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 rounded-xl space-y-3 transition-all relative group shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{u.name}</span>
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {u.symbol}
                        </span>
                        {u.isStandard && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-400 border border-slate-700">
                            Standard
                          </span>
                        )}
                      </div>
                      {u.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{u.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                        title="Edit unit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!u.isStandard && (
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete unit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <div className="text-[10px] text-slate-500 uppercase">In Carats</div>
                      <div className="font-bold text-amber-400 mt-0.5">
                        {u.conversionFactorToCarats} ct
                      </div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <div className="text-[10px] text-slate-500 uppercase">In Grams</div>
                      <div className="font-bold text-emerald-400 mt-0.5">
                        {(u.conversionFactorToCarats * 0.2).toFixed(u.decimalPlaces || 3)} g
                      </div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <div className="text-[10px] text-slate-500 uppercase">In Cents/Pts</div>
                      <div className="font-bold text-sky-400 mt-0.5">
                        {(u.conversionFactorToCarats * 100).toFixed(1)} pt
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reference Knowledge Guide */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>International &amp; South Asian Gemmological Standards Reference</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="font-bold text-slate-200 block mb-1">1 Carat (ct)</span>
                Exactly 0.200 grams (200 milligrams). Divided into 100 points/cents. Standard unit of trade internationally.
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="font-bold text-slate-200 block mb-1">1 Ratti (rt)</span>
                Historically based on the Abrus precatorius seed. Modern standard market Ratti = 0.91 carats (approx. 0.182 grams). Widely used in South Asia for Jyotish gems.
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Gem Unit Conversion & Valuation Calculator */}
        <div className="space-y-4">
          <div className="bg-gradient-to-b from-[#161a29] to-[#0f121d] border border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-4 sticky top-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Unit Converter &amp; Pricing
                </h3>
                <p className="text-[11px] text-slate-400">
                  Instant calculation for gemstone lots &amp; rate conversions
                </p>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gem Weight Input
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={calcInputWeight}
                    onChange={(e) => setCalcInputWeight(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                  <select
                    value={calcInputUnitId}
                    onChange={(e) => setCalcInputUnitId(e.target.value)}
                    className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Price per {selectedUnit.name} ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={calcPricePerUnit}
                  onChange={(e) => setCalcPricePerUnit(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Conversion Result Cards */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                <span>Equivalent Weight Breakdown</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Total Carats</span>
                  <span className="text-base font-bold text-amber-400">
                    {totalCarats.toFixed(selectedUnit.decimalPlaces || 2)} ct
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Total Grams</span>
                  <span className="text-base font-bold text-emerald-400">
                    {totalGrams.toFixed(4)} g
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Points / Cents</span>
                  <span className="text-base font-bold text-sky-400">
                    {totalCents.toFixed(1)} pt
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Milligrams</span>
                  <span className="text-base font-bold text-purple-400">
                    {totalMilligrams.toFixed(1)} mg
                  </span>
                </div>
              </div>
            </div>

            {/* Total Valuation Card */}
            <div className="p-4 bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-slate-950 border-2 border-amber-500/60 rounded-xl space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-xs text-amber-200">
                <span className="font-semibold uppercase font-mono">Total Lot Valuation</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                  Auto Calc
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-white tracking-tight">
                {settings.currencySymbol} {Math.round(totalLotValue).toLocaleString()}
              </div>

              <div className="pt-2 border-t border-amber-500/20 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Effective per Carat:</span>
                  <strong className="text-amber-400">
                    {settings.currencySymbol} {Math.round(effectivePricePerCarat).toLocaleString()} / ct
                  </strong>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Effective per Gram:</span>
                  <span>
                    {settings.currencySymbol} {Math.round(effectivePricePerGram).toLocaleString()} / g
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
