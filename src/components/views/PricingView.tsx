import { useState } from 'react';
import { Search, Plus, Download, Upload, Database, RefreshCw, Loader2, Lock } from 'lucide-react';
import { useLocalBilling } from '@/contexts/LocalBillingContext';
import { useLocalAuthContext } from '@/contexts/LocalAuthContext';
import { InventoryItem } from '@/types/billing';
import { ItemEntry } from '@/components/ItemEntry';
import { toast } from 'sonner';
import { validatePrice, validateItemName, validateInventoryImport } from '@/lib/validation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const PricingView = () => {
  const { 
    inventory, 
    outpatientCategories, 
    inpatientCategories, 
    isSyncing,
    addItem,
    updateItem,
    deleteItem,
    bulkImport,
    exportData,
    seedFromJson,
  } = useLocalBilling();
  const { canEdit, isAdmin } = useLocalAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formType, setFormType] = useState('Medicine');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const allCategories = [...new Set([...outpatientCategories, ...inpatientCategories])].sort();

  // Flatten inventory for display
  const allItems: InventoryItem[] = [];
  Object.entries(inventory).forEach(([cat, items]) => {
    items.forEach((item) => {
      if (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        allItems.push({ ...item, category: cat });
      }
    });
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory(allCategories[0] || 'Medicine');
    setFormPrice('');
    setFormType('Medicine');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category || 'Medicine');
    setFormPrice(String(item.price).replace(/[^\d.]/g, ''));
    setFormType(item.type || 'Medicine');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const errors: Record<string, string> = {};
    
    // Validate name
    const nameResult = validateItemName(formName);
    if (!nameResult.valid) {
      errors.name = nameResult.error || 'Invalid name';
    }
    
    // Validate price
    const priceResult = validatePrice(formPrice);
    if (!priceResult.valid) {
      errors.price = priceResult.error || 'Invalid price';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix validation errors');
      return;
    }

    const validatedPrice = priceResult.value || 0;

    if (editingItem) {
      // Update existing item in database
      const oldCat = editingItem.category || '';
      await updateItem(editingItem.id, {
        name: nameResult.value || formName.trim(),
        category: formCategory,
        price: validatedPrice,
        type: formType,
      }, oldCat);
    } else {
      // Add new item to database
      await addItem({
        name: nameResult.value || formName.trim(),
        price: validatedPrice,
        type: formType,
        category: formCategory,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm(`Delete "${item.name}" from ${item.category || 'N/A'}?`)) return;
    await deleteItem(item.id, item.category || '');
  };

  const handleExport = () => {
    const data = exportData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mch_db_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Database exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rawData = JSON.parse(event.target?.result as string);
        
        // Validate imported data structure
        const validationResult = validateInventoryImport(rawData);
        if (!validationResult.valid) {
          toast.error(validationResult.error || 'Invalid data format');
          return;
        }

        if (!confirm('This will REPLACE your current database. Continue?')) return;

        const data = validationResult.data!;
        // Map validated data to InventoryItem format
        const items = data.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          type: item.type,
          category: item.category,
        }));
        await bulkImport(items);
      } catch {
        toast.error('Failed to import: Invalid JSON format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSeedFromJson = async () => {
    if (!confirm('This will SEED the database from med.json file. Continue?')) return;
    await seedFromJson();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <Database className="w-10 h-10 text-accent-blue" />
          <div>
            <h2 className="text-3xl font-extrabold text-foreground">Price List</h2>
            <span className="text-xl font-normal text-muted-foreground">Database Management</span>
          </div>
        </div>

        <div className="flex gap-2 w-full">
          {canEdit() && (
            <button
              onClick={openAddModal}
              disabled={isSyncing}
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 px-2 flex flex-col items-center justify-center gap-1 font-bold text-[10px] sm:text-xs uppercase transition-all hover:opacity-90 shadow-md disabled:opacity-50"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              ADD NEW
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={isSyncing}
            className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 px-2 flex flex-col items-center justify-center gap-1 font-bold text-[10px] sm:text-xs uppercase transition-all hover:opacity-90 shadow-md disabled:opacity-50"
          >
            <Download className="w-5 h-5 sm:w-6 sm:h-6" />
            EXPORT
          </button>
          {canEdit() && (
            <label className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 px-2 flex flex-col items-center justify-center gap-1 font-bold text-[10px] sm:text-xs uppercase cursor-pointer transition-all hover:opacity-90 shadow-md">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
              IMPORT
              <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={isSyncing} />
            </label>
          )}
          {allItems.length === 0 && canEdit() && (
            <button
              onClick={handleSeedFromJson}
              disabled={isSyncing}
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 px-2 flex flex-col items-center justify-center gap-1 font-bold text-[10px] sm:text-xs uppercase transition-all hover:opacity-90 shadow-md disabled:opacity-50"
            >
              {isSyncing ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />}
              SEED DATA
            </button>
          )}
          {!canEdit() && (
            <div className="flex-1 flex items-center justify-center gap-2 text-muted-foreground bg-muted/50 rounded-xl py-3 px-2">
              <Lock className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs font-bold uppercase">View Only</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-input border border-border rounded-2xl px-5 py-4 flex items-center gap-4 mb-8 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-card">
        <Search className="w-5 h-5 text-primary opacity-80" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search price list..."
          className="bg-transparent border-none text-foreground w-full outline-none text-lg font-semibold placeholder:text-muted-foreground placeholder:font-medium"
        />
      </div>

      <div className="flex flex-col gap-3">
        {allItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground opacity-60 font-semibold">
            No records found
          </div>
        ) : (
          allItems.map((item) => (
            <ItemEntry
              key={`${item.category}-${item.id}`}
              item={item}
              category={item.category || ''}
              onClick={() => {}}
              showActions={canEdit()}
              onEdit={canEdit() ? () => openEditModal(item) : undefined}
              onDelete={isAdmin() ? () => handleDelete(item) : undefined}
            />
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-primary font-extrabold uppercase tracking-wide">
              {editingItem ? 'EDIT DATABASE RECORD' : 'ADD NEW DATABASE RECORD'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            <div>
              <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">
                Item Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  setFormErrors(prev => ({ ...prev, name: '' }));
                }}
                className={`bg-input border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light ${formErrors.name ? 'border-destructive' : 'border-border'}`}
                placeholder="Enter item name"
                maxLength={200}
              />
              {formErrors.name && <span className="text-xs text-destructive mt-1">{formErrors.name}</span>}
            </div>

            <div>
              <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">
                Price (৳)
              </label>
              <input
                type="number"
                value={formPrice}
                onChange={(e) => {
                  setFormPrice(e.target.value);
                  setFormErrors(prev => ({ ...prev, price: '' }));
                }}
                min="0"
                max="10000000"
                step="0.01"
                className={`bg-input border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light ${formErrors.price ? 'border-destructive' : 'border-border'}`}
                placeholder="0.00"
              />
              {formErrors.price && <span className="text-xs text-destructive mt-1">{formErrors.price}</span>}
            </div>

            <div>
              <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">
                Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light"
              >
                <option value="Medicine">Medicine</option>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Injection">Injection</option>
                <option value="Syrup">Syrup</option>
                <option value="Test">Test</option>
                <option value="Procedure">Procedure</option>
                <option value="Fee">Fee</option>
                <option value="Fluid">Fluid</option>
                <option value="Service">Service</option>
              </select>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-primary text-primary-foreground font-extrabold rounded-xl py-4 text-sm transition-all duration-200 hover:bg-primary/90 uppercase tracking-wide mt-2"
            >
              {editingItem ? 'UPDATE RECORD' : 'ADD RECORD'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
