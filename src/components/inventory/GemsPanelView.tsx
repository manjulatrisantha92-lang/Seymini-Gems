import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Gem,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit2,
  Trash2,
  Barcode,
  Printer,
  Sparkles,
  Scale,
  Receipt,
  FileText,
  Camera,
  Image as ImageIcon,
  ImageOff,
  Check,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  LayoutGrid,
  List,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Product,
  GemstoneType,
  AppSettings,
  User,
  GemMeasurementUnit,
} from '../../types';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { GemUnitManagerModal } from './GemUnitManagerModal';

interface GemsPanelViewProps {
  products: Product[];
  settings: AppSettings;
  currentUser?: User | null;
  onRefresh: () => void;
  onNavigate: (page: string) => void;
  onOpenBarcodeScanner?: () => void;
  onAddToCartForPOS?: (gemProduct: Product) => void;
  onOpenCertificate?: (gemProduct: Product) => void;
}

const CEYLON_GEMSTONE_VARIETIES: GemstoneType[] = [
  'Blue Sapphire (Ceylon)',
  'Padparadscha Sapphire',
  'Yellow Sapphire',
  'Star Sapphire',
  'Ruby',
  'Emerald',
  'Diamond',
  'Alexandrite',
  'Cat\'s Eye',
  'Tourmaline',
  'Spinel',
  'Aquamarine',
  'Garnet',
  'Topaz',
  'Amethyst',
  'Moonstone (Meetiyagoda)',
  'Zircon',
];

const GEM_SHAPES_CUTS = [
  'Oval Brilliant Cut',
  'Cushion Mixed Cut',
  'Emerald Cut / Octagon',
  'Round Brilliant Cut',
  'Pear / Teardrop Cut',
  'Heart Shape Cut',
  'Marquise Cut',
  'Cabochon (Smooth Polished)',
  'Trilliant Cut',
  'Baguette Cut',
  'Rough / Uncut Specimen',
];

const CEYLON_MINING_ORIGINS = [
  'Ratnapura (City of Gems), Sri Lanka',
  'Elahera, Sri Lanka',
  'Pelmadulla, Sri Lanka',
  'Meetiyagoda (Moonstone Mines), Sri Lanka',
  'Balangoda, Sri Lanka',
  'Okkampitiya, Sri Lanka',
  'Kataragama, Sri Lanka',
  'Nivithigala, Sri Lanka',
  'Madagascar',
  'Burma (Myanmar)',
  'Colombia (Muzo / Chivor)',
  'Mozambique',
];

const GEM_TREATMENTS = [
  'Natural Untreated / 100% Unheated',
  'Traditional Heat Only (Standard)',
  'Minor Clarity Enhancement (Oil)',
  'Beryllium Treated',
  'Diffusion Treated',
];

const GEM_CLARITIES = [
  'Loupe Clean (IF / Flawless)',
  'VVS1 (Eye Clean - High Gem Grade)',
  'VVS2 (Eye Clean)',
  'VS1 (Very Slightly Included)',
  'VS2 (Minor Inclusions Under 10x)',
  'SI (Slightly Included)',
  'Translucent / Silk Star Phenomenon',
];

// Curated high-resolution gemstone photo presets for fast testing & realistic showcases
const SAMPLE_GEM_PHOTOS = [
  {
    label: 'Royal Blue Sapphire (Ratnapura)',
    type: 'Blue Sapphire (Ceylon)' as GemstoneType,
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    color: 'Vivid Cornflower / Royal Blue',
  },
  {
    label: 'Padparadscha Sunset Sapphire',
    type: 'Padparadscha Sapphire' as GemstoneType,
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
    color: 'Lotus Blossom Pinkish-Orange',
  },
  {
    label: 'Pigeon Blood Ruby (Cabochon/Faceted)',
    type: 'Ruby' as GemstoneType,
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
    color: 'Pigeon Blood Deep Vivid Red',
  },
  {
    label: 'Golden Yellow Sapphire (Pelmadulla)',
    type: 'Yellow Sapphire' as GemstoneType,
    url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80',
    color: 'Canary Golden Yellow',
  },
  {
    label: 'Natural Emerald (Vivid Green)',
    type: 'Emerald' as GemstoneType,
    url: 'https://images.unsplash.com/photo-1611591475836-7c0a9e70d4bf?w=600&auto=format&fit=crop&q=80',
    color: 'Vivid Forest Emerald Green',
  },
  {
    label: 'Chrysoberyl Cat\'s Eye (Sharp Ray)',
    type: 'Cat\'s Eye' as GemstoneType,
    url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&auto=format&fit=crop&q=80',
    color: 'Honey Green with Silver Milk Ray',
  },
];

export const GemsPanelView: React.FC<GemsPanelViewProps> = ({
  products,
  settings,
  currentUser,
  onRefresh,
  onNavigate,
  onOpenBarcodeScanner,
  onAddToCartForPOS,
  onOpenCertificate,
}) => {
  const { showToast } = useToast();

  // View presentation state (Cards vs Table)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGemType, setSelectedGemType] = useState<string>('All');
  const [selectedCut, setSelectedCut] = useState<string>('All');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('All');
  const [selectedMediaFilter, setSelectedMediaFilter] = useState<'all' | 'with_image' | 'no_image'>('all');
  const [caratRange, setCaratRange] = useState<'all' | 'under_1' | '1_to_3' | '3_to_5' | 'over_5'>('all');

  // Gem Units state
  const [gemUnits, setGemUnits] = useState<GemMeasurementUnit[]>(() =>
    StorageService.getGemUnits()
  );
  const [isGemUnitsModalOpen, setIsGemUnitsModalOpen] = useState(false);

  // Modal States: Add / Edit Gemstone
  const [isAddGemModalOpen, setIsAddGemModalOpen] = useState(false);
  const [editingGem, setEditingGem] = useState<Product | null>(null);

  // Form Fields for Gem Entry ("its add imege")
  const [formName, setFormName] = useState('');
  const [formGemType, setFormGemType] = useState<GemstoneType>('Blue Sapphire (Ceylon)');
  const [formCut, setFormCut] = useState(GEM_SHAPES_CUTS[0]);
  const [formColor, setFormColor] = useState('Cornflower Vivid Royal Blue');
  const [formClarity, setFormClarity] = useState(GEM_CLARITIES[1]);
  const [formOrigin, setFormOrigin] = useState(CEYLON_MINING_ORIGINS[0]);
  const [formTreatment, setFormTreatment] = useState(GEM_TREATMENTS[0]);
  const [formItemCode, setFormItemCode] = useState('');
  const [formBarcode, setFormBarcode] = useState('');

  // Image Upload States
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImageFileName, setFormImageFileName] = useState('');
  const [imageOptionMode, setImageOptionMode] = useState<'upload' | 'preset' | 'none'>('upload');
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // Weight & Measurement Calculation
  const [formMeasurementUnit, setFormMeasurementUnit] = useState<string>('ct');
  const [formWeightInUnit, setFormWeightInUnit] = useState<number>(3.2);
  const [formCarats, setFormCarats] = useState<number>(3.2);
  const [formCostRatePerUnit, setFormCostRatePerUnit] = useState<number>(180000);
  const [formSellingRatePerUnit, setFormSellingRatePerUnit] = useState<number>(260000);
  const [formTotalCostLKR, setFormTotalCostLKR] = useState<number>(576000);
  const [formTotalSellingLKR, setFormTotalSellingLKR] = useState<number>(832000);

  // Vault and Assay details
  const [formCertAuthority, setFormCertAuthority] = useState('National Gem & Jewellery Authority (NGJA)');
  const [formCertNumber, setFormCertNumber] = useState('NGJA-LK-2026-');
  const [formDimensions, setFormDimensions] = useState('8.5 × 6.8 × 4.9 mm');
  const [formVaultLocation, setFormVaultLocation] = useState('Vault Tray B-02');
  const [formStockQuantity, setFormStockQuantity] = useState<number>(1);
  const [formNotes, setFormNotes] = useState('Natural unheated Ceylon gemstone with high lustre and fire.');

  // Print Tag & Delete Modals
  const [tagPrintGem, setTagPrintGem] = useState<Product | null>(null);
  const [gemToDelete, setGemToDelete] = useState<Product | null>(null);

  // Automatically recalculate Carats, Cost, and Selling Price when unit weight or rates change
  useEffect(() => {
    const activeUnitObj = gemUnits.find((u) => u.symbol === formMeasurementUnit) || {
      conversionFactorToCarats: 1.0,
    };
    const factor = activeUnitObj.conversionFactorToCarats || 1.0;
    const calculatedCarats = Number((formWeightInUnit * factor).toFixed(3));
    setFormCarats(calculatedCarats);

    const cost = Math.round(formWeightInUnit * (formCostRatePerUnit || 0));
    const selling = Math.round(formWeightInUnit * (formSellingRatePerUnit || 0));
    setFormTotalCostLKR(cost);
    setFormTotalSellingLKR(selling);
  }, [formWeightInUnit, formMeasurementUnit, formCostRatePerUnit, formSellingRatePerUnit, gemUnits]);

  // Extract all Gemstone records (Loose gemstones or products categorized as gemstones)
  const gemProducts = useMemo(() => {
    return products.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const isLoose = p.isLooseGem === true || cat.includes('loose gemstone') || cat.includes('gemstone');
      const hasGem = p.gemstoneType && p.gemstoneType !== 'None';
      return isLoose || hasGem;
    });
  }, [products]);

  // Filtered Gemstones list
  const filteredGems = useMemo(() => {
    return gemProducts.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        p.name.toLowerCase().includes(q) ||
        p.itemCode.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.gemstoneType.toLowerCase().includes(q) ||
        (p.gemstoneDetails?.cut && p.gemstoneDetails.cut.toLowerCase().includes(q)) ||
        (p.gemstoneDetails?.origin && p.gemstoneDetails.origin.toLowerCase().includes(q));

      const matchType = selectedGemType === 'All' || p.gemstoneType === selectedGemType;

      const matchCut =
        selectedCut === 'All' ||
        (p.gemstoneDetails?.cut && p.gemstoneDetails.cut.toLowerCase().includes(selectedCut.toLowerCase()));

      const matchOrigin =
        selectedOrigin === 'All' ||
        (p.gemstoneDetails?.origin && p.gemstoneDetails.origin.toLowerCase().includes(selectedOrigin.toLowerCase()));

      const matchMedia =
        selectedMediaFilter === 'all' ||
        (selectedMediaFilter === 'with_image' && Boolean(p.imageUrl)) ||
        (selectedMediaFilter === 'no_image' && !p.imageUrl);

      const carats = p.gemWeightCarats || p.gemstoneDetails?.carats || 0;
      let matchCarat = true;
      if (caratRange === 'under_1') matchCarat = carats > 0 && carats < 1;
      else if (caratRange === '1_to_3') matchCarat = carats >= 1 && carats <= 3;
      else if (caratRange === '3_to_5') matchCarat = carats > 3 && carats <= 5;
      else if (caratRange === 'over_5') matchCarat = carats > 5;

      return matchSearch && matchType && matchCut && matchOrigin && matchMedia && matchCarat;
    });
  }, [gemProducts, searchQuery, selectedGemType, selectedCut, selectedOrigin, selectedMediaFilter, caratRange]);

  // Key Totals
  const totalGemPieces = gemProducts.reduce((sum, p) => sum + (p.stockQuantity || 1), 0);
  const totalCaratsInStock = gemProducts.reduce((sum, p) => {
    const c = p.gemWeightCarats || p.gemstoneDetails?.carats || 0;
    return sum + c * (p.stockQuantity || 1);
  }, 0);
  const totalSellingValuationLKR = gemProducts.reduce((sum, p) => {
    return sum + (p.sellingPriceLKR || 0) * (p.stockQuantity || 1);
  }, 0);
  const totalCostValuationLKR = gemProducts.reduce((sum, p) => {
    return sum + (p.costPriceLKR || 0) * (p.stockQuantity || 1);
  }, 0);

  // Open Add Gem Form
  const handleOpenAddGem = () => {
    setEditingGem(null);
    const randNum = Math.floor(100 + Math.random() * 900);
    setFormItemCode(`GEM-SAP-${randNum}`);
    setFormBarcode(StorageService.generateNextBarcode());
    setFormGemType('Blue Sapphire (Ceylon)');
    setFormName('Natural Ceylon Royal Blue Sapphire (Cushion Cut)');
    setFormCut('Cushion Mixed Cut');
    setFormColor('Cornflower Vivid Royal Blue');
    setFormClarity(GEM_CLARITIES[1]);
    setFormOrigin(CEYLON_MINING_ORIGINS[0]);
    setFormTreatment(GEM_TREATMENTS[0]);
    setFormMeasurementUnit('ct');
    setFormWeightInUnit(3.45);
    setFormCostRatePerUnit(185000);
    setFormSellingRatePerUnit(275000);
    setFormStockQuantity(1);
    setFormCertAuthority('National Gem & Jewellery Authority (NGJA)');
    setFormCertNumber(`NGJA-LK-${randNum}`);
    setFormDimensions('8.8 × 7.2 × 5.1 mm');
    setFormVaultLocation('Vault Tray A-01');
    setFormNotes('Unheated vivid cornflower blue sapphire with superior brilliance and excellent eye clean transparency.');
    setFormImageUrl(SAMPLE_GEM_PHOTOS[0].url);
    setFormImageFileName('sample_royal_sapphire.jpg');
    setImageOptionMode('upload');
    setIsAddGemModalOpen(true);
  };

  // Open Edit Gem Form
  const handleOpenEditGem = (gem: Product) => {
    setEditingGem(gem);
    setFormName(gem.name);
    setFormItemCode(gem.itemCode);
    setFormBarcode(gem.barcode);
    setFormGemType(gem.gemstoneType || 'Blue Sapphire (Ceylon)');
    setFormCut(gem.gemstoneDetails?.cut || GEM_SHAPES_CUTS[0]);
    setFormColor(gem.gemstoneDetails?.color || 'Cornflower Vivid Blue');
    setFormClarity(gem.gemstoneDetails?.clarity || GEM_CLARITIES[1]);
    setFormOrigin(gem.gemstoneDetails?.origin || CEYLON_MINING_ORIGINS[0]);
    setFormTreatment(gem.gemstoneDetails?.treatment || GEM_TREATMENTS[0]);
    setFormMeasurementUnit(gem.measurementUnit || 'ct');
    const wt = gem.gemWeightInUnit || gem.gemWeightCarats || gem.gemstoneDetails?.carats || 1;
    setFormWeightInUnit(wt);
    const unitPrice = gem.pricePerUnitLKR || Math.round((gem.sellingPriceLKR || 0) / wt);
    const costPrice = Math.round((gem.costPriceLKR || 0) / wt);
    setFormCostRatePerUnit(costPrice || 150000);
    setFormSellingRatePerUnit(unitPrice || 220000);
    setFormStockQuantity(gem.stockQuantity || 1);
    setFormCertAuthority((gem.gemstoneDetails as any)?.certAuthority || 'National Gem & Jewellery Authority (NGJA)');
    setFormCertNumber((gem.gemstoneDetails as any)?.certNumber || '');
    setFormDimensions((gem.gemstoneDetails as any)?.dimensions || '');
    setFormVaultLocation((gem.gemstoneDetails as any)?.locationTray || 'Vault Tray A-01');
    setFormNotes(gem.notes || '');
    setFormImageUrl(gem.imageUrl || '');
    setFormImageFileName(gem.imageUrl ? 'attached_image.jpg' : '');
    setImageOptionMode(gem.imageUrl ? 'upload' : 'none');
    setIsAddGemModalOpen(true);
  };

  // Handle Image File Upload ("its add imege")
  const handleImageFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, or WebP).', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size exceeds 10MB limit. Please upload a compressed JPG.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setFormImageUrl(dataUrl);
      setFormImageFileName(file.name);
      setImageOptionMode('upload');
      showToast(`Gemstone image "${file.name}" attached successfully!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Select Sample Photo Preset
  const handleSelectPhotoPreset = (preset: typeof SAMPLE_GEM_PHOTOS[0]) => {
    setFormImageUrl(preset.url);
    setFormImageFileName(preset.label);
    setFormGemType(preset.type);
    setFormColor(preset.color);
    setFormName(`Natural Ceylon ${preset.label} (${formCut})`);
    showToast(`Applied preset: ${preset.label}`, 'info');
  };

  // Save Gemstone to Storage
  const handleSaveGemstone = (andAddNext = false) => {
    if (!formName.trim()) {
      showToast('Please enter a gemstone name or title.', 'error');
      return;
    }
    if (!formItemCode.trim()) {
      showToast('Please specify an item or lot code.', 'error');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const grossGrams = Number((formCarats * 0.2).toFixed(3));

    const gemData: Product = {
      id: editingGem ? editingGem.id : `prod-gem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      itemCode: formItemCode.trim(),
      barcode: formBarcode.trim() || StorageService.generateNextBarcode(),
      name: formName.trim(),
      category: 'Loose Gemstones',
      imageUrl: formImageUrl.trim(),
      gemstoneType: formGemType,
      gemstoneDetails: {
        carats: Number(formCarats),
        cut: formCut,
        color: formColor,
        clarity: formClarity,
        origin: formOrigin,
        treatment: formTreatment,
        ...({
          certAuthority: formCertAuthority,
          certNumber: formCertNumber,
          dimensions: formDimensions,
          locationTray: formVaultLocation,
        } as any),
      },
      measurementUnit: formMeasurementUnit,
      gemWeightInUnit: Number(formWeightInUnit),
      pricePerUnitLKR: Number(formSellingRatePerUnit),
      isLooseGem: true,
      goldPurity: 'None',
      grossWeightGrams: grossGrams,
      netGoldWeightGrams: 0,
      gemWeightCarats: Number(formCarats),
      costPriceLKR: Number(formTotalCostLKR),
      sellingPriceLKR: Number(formTotalSellingLKR),
      stockQuantity: Number(formStockQuantity),
      workshopStatus: 'in_store',
      status: Number(formStockQuantity) === 0 ? 'out_of_stock' : Number(formStockQuantity) <= 2 ? 'low_stock' : 'active',
      notes: formNotes.trim(),
      createdAt: editingGem ? editingGem.createdAt : today,
      updatedAt: today,
    };

    if (editingGem) {
      StorageService.updateProduct(gemData);
      showToast(`Gemstone "${gemData.name}" updated successfully!`, 'success');
      setIsAddGemModalOpen(false);
    } else {
      StorageService.addProduct(gemData);
      if (andAddNext) {
        showToast(`Gemstone "${gemData.name}" saved! Ready for next stone.`, 'success');
        // Reset form for next stone
        const nextNum = Math.floor(100 + Math.random() * 900);
        setFormItemCode(`GEM-SAP-${nextNum}`);
        setFormBarcode(StorageService.generateNextBarcode());
        setFormName('');
        setFormImageUrl('');
        setFormImageFileName('');
        setFormWeightInUnit(2.5);
      } else {
        showToast(`Gemstone "${gemData.name}" added to inventory!`, 'success');
        setIsAddGemModalOpen(false);
      }
    }

    onRefresh();
  };

  // Delete Gemstone
  const handleConfirmDeleteGem = () => {
    if (!gemToDelete) return;
    StorageService.deleteProduct(gemToDelete.id);
    showToast(`Gemstone "${gemToDelete.name}" removed from stock.`, 'info');
    setGemToDelete(null);
    onRefresh();
  };

  // Handle Quick Add to POS Invoice
  const handleQuickSell = (gem: Product) => {
    if (onAddToCartForPOS) {
      onAddToCartForPOS(gem);
      showToast(`"${gem.name}" sent to POS Billing Invoice!`, 'success');
      onNavigate('invoice');
    } else {
      onNavigate('invoice');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-[#121622] via-[#161a29] to-[#121622] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold font-mono tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Ceylon Gem Trading &amp; Vault Stock
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Ratnapura • Elahera • Colombo
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-100 font-serif tracking-tight flex items-center gap-2.5">
              <Gem className="w-7 h-7 text-amber-400 fill-amber-400/20" />
              <span>Gems Panel &amp; Stock Inward</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Add authentic Sri Lankan sapphires, rubies, and rare specimens with high-resolution gemstone photos, carat conversions, origin certificates, and barcode pricing tags.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Manage Units */}
            <button
              onClick={() => setIsGemUnitsModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-slate-700 hover:border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Calibrate custom gem measurement units (Carats, Ratti, Grams, Points)"
            >
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Gem Units ({gemUnits.length})</span>
            </button>

            {/* Go to POS Invoice */}
            <button
              onClick={() => onNavigate('invoice')}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Open POS sales counter"
            >
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>POS Billing</span>
            </button>

            {/* + ADD GEMSTONE (High Contrast Primary CTA) */}
            <button
              onClick={handleOpenAddGem}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <Camera className="w-4 h-4 stroke-[2]" />
              <span>Add Gemstone (With Image)</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
              Gemstones in Vault
            </span>
            <div className="text-xl font-extrabold text-white font-mono mt-0.5">
              {totalGemPieces} <span className="text-xs font-normal text-slate-400">stones</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
              Total Carats Weight
            </span>
            <div className="text-xl font-extrabold text-amber-300 font-mono mt-0.5">
              {totalCaratsInStock.toFixed(2)} <span className="text-xs font-normal text-slate-400">ct</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
              Cost Valuation (Inward)
            </span>
            <div className="text-xl font-extrabold text-slate-200 font-mono mt-0.5">
              Rs. {totalCostValuationLKR.toLocaleString()}
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
              Retail Asking Value
            </span>
            <div className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
              Rs. {totalSellingValuationLKR.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search gemstone variety, item code, barcode, cut, or origin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {/* View Toggle: Visual Showcase vs Assay Table */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 self-end md:self-auto">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Showcase Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Assay Ledger</span>
            </button>
          </div>
        </div>

        {/* Filter Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          {/* Variety */}
          <div>
            <label className="text-[10px] text-slate-400 font-mono block mb-1">Variety</label>
            <select
              value={selectedGemType}
              onChange={(e) => setSelectedGemType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Varieties ({gemProducts.length})</option>
              {CEYLON_GEMSTONE_VARIETIES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Cut / Shape */}
          <div>
            <label className="text-[10px] text-slate-400 font-mono block mb-1">Cut / Shape</label>
            <select
              value={selectedCut}
              onChange={(e) => setSelectedCut(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Cuts / Shapes</option>
              {GEM_SHAPES_CUTS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Carat Range */}
          <div>
            <label className="text-[10px] text-slate-400 font-mono block mb-1">Carat Weight</label>
            <select
              value={caratRange}
              onChange={(e) => setCaratRange(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Weight Ranges</option>
              <option value="under_1">Small (&lt; 1.00 ct)</option>
              <option value="1_to_3">Medium (1.00 - 3.00 ct)</option>
              <option value="3_to_5">Large (3.00 - 5.00 ct)</option>
              <option value="over_5">Important Gem (&gt; 5.00 ct)</option>
            </select>
          </div>

          {/* Media / Image Filter */}
          <div>
            <label className="text-[10px] text-slate-400 font-mono block mb-1">Photo Attachment</label>
            <select
              value={selectedMediaFilter}
              onChange={(e) => setSelectedMediaFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Gemstones</option>
              <option value="with_image">With High-Res Photo</option>
              <option value="no_image">Missing Photo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Showcase / Ledger */}
      {filteredGems.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-slate-900/60 rounded-2xl border border-dashed border-slate-800 space-y-3">
          <Gem className="w-12 h-12 mx-auto text-amber-400/50" />
          <h3 className="text-base font-bold text-slate-300">No Gemstones Matched</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search query, variety, or carat filter, or click below to add a new Ceylon gemstone with photo.
          </p>
          <button
            onClick={handleOpenAddGem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Gemstone</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Visual Gemstone Showcase Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGems.map((gem) => {
            const carats = gem.gemWeightCarats || gem.gemstoneDetails?.carats || 0;
            const pricePerCt = gem.pricePerUnitLKR || (carats > 0 ? Math.round(gem.sellingPriceLKR / carats) : 0);

            return (
              <div
                key={gem.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-lg hover:shadow-amber-950/20 transition-all flex flex-col group"
              >
                {/* Gemstone Image Banner */}
                <div className="relative h-48 bg-slate-950 overflow-hidden flex items-center justify-center">
                  {gem.imageUrl ? (
                    <img
                      src={gem.imageUrl}
                      alt={gem.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-950 flex flex-col items-center justify-center text-slate-600 gap-2 p-4 text-center">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Gem className="w-6 h-6 text-amber-400/70" />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">No Image Uploaded</span>
                      <button
                        onClick={() => handleOpenEditGem(gem)}
                        className="text-[10px] text-amber-400 underline hover:text-amber-300 font-semibold cursor-pointer"
                      >
                        + Add Image
                      </button>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950/90 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                      {gem.gemstoneType}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950/90 text-slate-200 border border-slate-700 text-[10px] font-bold font-mono shadow-md">
                      {carats} ct
                    </span>
                  </div>

                  {/* Treatment Badge */}
                  {gem.gemstoneDetails?.treatment && (
                    <div className="absolute bottom-2 left-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-[9px] font-semibold text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                        {gem.gemstoneDetails.treatment.includes('Untreated') ? 'Natural Untreated' : 'Heated'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                      <span className="text-amber-400 font-semibold">{gem.itemCode}</span>
                      <span>{gem.gemstoneDetails?.origin ? gem.gemstoneDetails.origin.split(',')[0] : 'Ceylon'}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {gem.name}
                    </h3>

                    {/* Specifications */}
                    <div className="mt-2 space-y-1 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Cut / Shape:</span>
                        <strong className="text-slate-200 font-medium">{gem.gemstoneDetails?.cut || 'Mixed Cut'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Color:</span>
                        <span className="text-slate-300 font-medium truncate max-w-[140px] text-right">
                          {gem.gemstoneDetails?.color || 'Vivid'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate / ct:</span>
                        <span className="font-mono text-amber-400">
                          Rs. {pricePerCt.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Retail Price</div>
                      <div className="text-sm font-extrabold text-amber-400 font-mono">
                        Rs. {gem.sellingPriceLKR.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Add to POS */}
                      <button
                        onClick={() => handleQuickSell(gem)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Sell in POS Invoice"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>

                      {/* Print Tag */}
                      <button
                        onClick={() => setTagPrintGem(gem)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Print Gemstone Tag"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEditGem(gem)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Gemstone & Image"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setGemToDelete(gem)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Delete Gemstone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Assay Table */
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-[11px] uppercase font-mono text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Gem Photo &amp; Name</th>
                  <th className="py-3 px-3">Item Code</th>
                  <th className="py-3 px-3">Variety</th>
                  <th className="py-3 px-3">Cut &amp; Color</th>
                  <th className="py-3 px-3 text-right">Weight (ct / g)</th>
                  <th className="py-3 px-3 text-right">Cost (LKR)</th>
                  <th className="py-3 px-3 text-right">Selling (LKR)</th>
                  <th className="py-3 px-3 text-center">Stock</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredGems.map((gem) => {
                  const carats = gem.gemWeightCarats || gem.gemstoneDetails?.carats || 0;
                  return (
                    <tr key={gem.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {gem.imageUrl ? (
                            <img
                              src={gem.imageUrl}
                              alt={gem.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover border border-amber-500/30 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                              <Gem className="w-5 h-5 text-amber-400/50" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-slate-100 block truncate max-w-xs">{gem.name}</span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {gem.gemstoneDetails?.origin || 'Ceylon'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-amber-300">
                        {gem.itemCode}
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">
                          {gem.gemstoneType}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-[11px] text-slate-200">{gem.gemstoneDetails?.cut || 'Mixed Cut'}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {gem.gemstoneDetails?.color || 'Vivid'}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-100">
                        <div>{carats} ct</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {(carats * 0.2).toFixed(2)} g
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        Rs. {gem.costPriceLKR.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                        Rs. {gem.sellingPriceLKR.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {gem.stockQuantity} in vault
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleQuickSell(gem)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                            title="Sell in POS Invoice"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTagPrintGem(gem)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                            title="Print Barcode Tag"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditGem(gem)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                            title="Edit Gemstone"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setGemToDelete(gem)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            title="Delete Gemstone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT GEMSTONE (WITH IMAGE UPLOAD PANEL)
         ======================================================== */}
      {isAddGemModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddGemModalOpen(false)}
          title={editingGem ? 'Edit Gemstone' : 'Add New Gemstone Inward'}
          subtitle="Record Ceylon gemstone assay, upload high-res image, and calibrate carat rates"
          maxWidth="2xl"
        >
          <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
            {/* SECTION 1: GEMSTONE IMAGE UPLOADER ("its add imege") */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Gemstone Image Attachment</span>
                </label>
                {formImageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormImageUrl('');
                      setFormImageFileName('');
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              {/* Live Image Preview & Dropzone */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Preview Box */}
                <div className="sm:col-span-5 h-44 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden flex items-center justify-center relative shadow-inner">
                  {formImageUrl ? (
                    <>
                      <img
                        src={formImageUrl}
                        alt="Gem Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-1 rounded bg-slate-950/80 backdrop-blur-sm text-[10px] text-slate-300 truncate font-mono">
                        {formImageFileName || 'Uploaded Gemstone Image'}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600 gap-2 p-3 text-center">
                      <ImageOff className="w-8 h-8 text-slate-600" />
                      <span className="text-[11px] text-slate-500">No Image Selected</span>
                    </div>
                  )}
                </div>

                {/* Upload & Preset Options */}
                <div className="sm:col-span-7 space-y-3">
                  {/* Local File Browser */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={() => setIsDraggingImage(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleImageFileUpload(file);
                    }}
                    className={`p-3.5 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer ${
                      isDraggingImage
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-slate-700 hover:border-amber-500/50 bg-slate-900/60'
                    }`}
                    onClick={() => imageFileInputRef.current?.click()}
                  >
                    <Upload className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-200">
                      Click to Browse or Drag Image Here
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Supports JPG, PNG, WebP up to 10MB
                    </p>
                    <input
                      ref={imageFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFileUpload(file);
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Or Enter Direct Image URL */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-mono">Or paste direct image URL</label>
                    <input
                      type="url"
                      placeholder="https://.../gemstone.jpg"
                      value={formImageUrl}
                      onChange={(e) => {
                        setFormImageUrl(e.target.value);
                        setFormImageFileName('Direct Web URL');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Sample Photo Presets */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  1-Click Authentic Sri Lankan Gemstone Photos:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {SAMPLE_GEM_PHOTOS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectPhotoPreset(preset)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-12 object-cover rounded mb-1"
                      />
                      <span className="text-[9px] font-semibold text-slate-300 block truncate group-hover:text-amber-300">
                        {preset.type.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 2: IDENTITY & CLASSIFICATION */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Gem className="w-4 h-4 text-amber-400" />
                <span>Gemstone Identification &amp; Codes</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Gemstone Variety */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Gemstone Variety *</label>
                  <select
                    value={formGemType}
                    onChange={(e) => {
                      const newType = e.target.value as GemstoneType;
                      setFormGemType(newType);
                      if (!formName || formName.includes('Natural Ceylon')) {
                        setFormName(`Natural Ceylon ${newType} (${formCut})`);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {CEYLON_GEMSTONE_VARIETIES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Item / Lot Code */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Item / Lot Code *</label>
                  <input
                    type="text"
                    value={formItemCode}
                    onChange={(e) => setFormItemCode(e.target.value)}
                    placeholder="e.g. GEM-SAP-101"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Barcode */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Barcode</label>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="e.g. 89010010045"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Gemstone Title / Display Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Natural Ceylon Royal Blue Sapphire (Cushion Mixed Cut)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* SECTION 3: WEIGHT, MEASUREMENT UNITS & RATE CONVERSIONS */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>Weight, Units &amp; Valuation</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsGemUnitsModalOpen(true)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
                >
                  + Manage Units
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Measurement Unit */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Measurement Unit</label>
                  <select
                    value={formMeasurementUnit}
                    onChange={(e) => setFormMeasurementUnit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-amber-300 font-bold font-mono focus:outline-none focus:border-amber-500"
                  >
                    {gemUnits.map((u) => (
                      <option key={u.id} value={u.symbol}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weight in Unit */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Weight in {formMeasurementUnit} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formWeightInUnit}
                    onChange={(e) => setFormWeightInUnit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Calculated Carats */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Equivalent Carats (ct)</label>
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-amber-300 font-mono font-bold">
                    {formCarats} ct
                  </div>
                </div>

                {/* Calculated Grams */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Gross Grams (g)</label>
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 font-mono font-bold">
                    {(formCarats * 0.2).toFixed(3)} g
                  </div>
                </div>
              </div>

              {/* Rates & Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Cost Rate / {formMeasurementUnit} (LKR)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={formCostRatePerUnit}
                    onChange={(e) => setFormCostRatePerUnit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Total Cost Price (LKR)
                  </label>
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 font-mono font-bold">
                    Rs. {formTotalCostLKR.toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Retail Rate / {formMeasurementUnit} (LKR)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={formSellingRatePerUnit}
                    onChange={(e) => setFormSellingRatePerUnit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Total Selling Price (LKR) *
                  </label>
                  <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-2 text-xs text-amber-400 font-mono font-extrabold">
                    Rs. {formTotalSellingLKR.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: 4CS GEMOLOGICAL SPECS & ORIGIN */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Gemological 4Cs, Origin &amp; Lab Assay</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Cut / Shape */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Cut / Shape</label>
                  <select
                    value={formCut}
                    onChange={(e) => {
                      setFormCut(e.target.value);
                      if (formName.includes('(')) {
                        setFormName(`Natural Ceylon ${formGemType} (${e.target.value})`);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {GEM_SHAPES_CUTS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Color Grade</label>
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    placeholder="e.g. Vivid Cornflower Royal Blue"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Clarity */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Clarity</label>
                  <select
                    value={formClarity}
                    onChange={(e) => setFormClarity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {GEM_CLARITIES.map((cl) => (
                      <option key={cl} value={cl}>{cl}</option>
                    ))}
                  </select>
                </div>

                {/* Origin */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Mining Origin</label>
                  <select
                    value={formOrigin}
                    onChange={(e) => setFormOrigin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {CEYLON_MINING_ORIGINS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                {/* Treatment */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Treatment Status</label>
                  <select
                    value={formTreatment}
                    onChange={(e) => setFormTreatment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {GEM_TREATMENTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Dimensions */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Dimensions (L × W × D)</label>
                  <input
                    type="text"
                    value={formDimensions}
                    onChange={(e) => setFormDimensions(e.target.value)}
                    placeholder="e.g. 8.5 × 6.8 × 4.9 mm"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Lab Certification & Vault location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Certificate Authority</label>
                  <input
                    type="text"
                    value={formCertAuthority}
                    onChange={(e) => setFormCertAuthority(e.target.value)}
                    placeholder="e.g. NGJA Sri Lanka / GIA"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Lab Report No</label>
                  <input
                    type="text"
                    value={formCertNumber}
                    onChange={(e) => setFormCertNumber(e.target.value)}
                    placeholder="e.g. NGJA-LK-89410"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Vault Tray / Safe Location</label>
                  <input
                    type="text"
                    value={formVaultLocation}
                    onChange={(e) => setFormVaultLocation(e.target.value)}
                    placeholder="e.g. Vault Tray A-04"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Assay &amp; Gemological Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Notes on brilliance, pleochroism, silk inclusions, provenance, or customer reservation..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddGemModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {!editingGem && (
                  <button
                    type="button"
                    onClick={() => handleSaveGemstone(true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Save &amp; Add Another
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveGemstone(false)}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{editingGem ? 'Update Gemstone' : 'Save Gemstone'}</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Gem Unit Manager Modal */}
      <GemUnitManagerModal
        isOpen={isGemUnitsModalOpen}
        onClose={() => setIsGemUnitsModalOpen(false)}
        onUnitsUpdated={(updated) => {
          setGemUnits(updated);
        }}
      />

      {/* Barcode / Jewelry Price Tag Print Modal */}
      {tagPrintGem && (
        <Modal
          isOpen={true}
          onClose={() => setTagPrintGem(null)}
          title="Print Gemstone Box / Price Tag"
          subtitle="Ceylon boutique gemstone display tag with barcode and assay summary"
          maxWidth="sm"
        >
          <div className="space-y-4 text-center">
            <div className="p-4 bg-white text-slate-900 rounded-xl border border-slate-300 shadow-inner inline-block mx-auto text-left w-64 font-sans">
              <div className="border-b border-dashed border-slate-400 pb-2 mb-2 text-center">
                <div className="font-bold text-xs uppercase tracking-wider">{settings.companyName}</div>
                <div className="text-[10px] text-slate-600">Colombo • Ratnapura, Sri Lanka</div>
              </div>

              {/* Tag Gem Thumbnail */}
              {tagPrintGem.imageUrl && (
                <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden border border-slate-300">
                  <img
                    src={tagPrintGem.imageUrl}
                    alt={tagPrintGem.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900 truncate">{tagPrintGem.name}</div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Code: <strong>{tagPrintGem.itemCode}</strong></span>
                  <span>{tagPrintGem.gemstoneType}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Weight: <strong>{tagPrintGem.gemWeightCarats || tagPrintGem.gemstoneDetails?.carats} ct</strong></span>
                  <span>{tagPrintGem.gemstoneDetails?.origin ? tagPrintGem.gemstoneDetails.origin.split(',')[0] : 'Ceylon'}</span>
                </div>
                <div className="pt-1 text-center font-mono font-bold text-sm text-slate-950 border-t border-slate-300 mt-1">
                  Rs. {tagPrintGem.sellingPriceLKR.toLocaleString()}
                </div>
              </div>

              {/* Barcode Graphic */}
              <div className="mt-3 text-center">
                <div className="font-mono tracking-widest text-[9px] text-slate-700 mb-0.5">
                  ||| | |||| | || ||| || ||||
                </div>
                <div className="font-mono text-[10px] text-slate-800 tracking-wider">
                  {tagPrintGem.barcode}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                Print Tag
              </button>
              <button
                type="button"
                onClick={() => setTagPrintGem(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {gemToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setGemToDelete(null)}
          title="Remove Gemstone"
          subtitle="Confirm permanent gemstone deletion from stock vault"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-950/30 border border-rose-800/60 rounded-xl flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-rose-200">
                  Are you sure you want to delete this gemstone?
                </p>
                <p className="text-slate-200 font-semibold">{gemToDelete.name}</p>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <span>Code: <strong className="text-amber-300">{gemToDelete.itemCode}</strong></span>
                  <span>•</span>
                  <span>Weight: {gemToDelete.gemWeightCarats || gemToDelete.gemstoneDetails?.carats} ct</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              This gemstone and its valuation records will be permanently removed from your catalog and inventory lists immediately.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setGemToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteGem}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-950/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Gemstone</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
