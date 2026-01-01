import React, { createContext, useContext, useState, useCallback } from 'react';
import { InventoryItem, BillItem, ViewType, INPATIENT_CATEGORIES } from '@/types/billing';
import { useInventory } from '@/hooks/useInventory';

interface BillingContextType {
  inventory: Record<string, InventoryItem[]>;
  bill: BillItem[];
  addToBill: (item: BillItem) => void;
  removeFromBill: (index: number) => void;
  clearBill: () => void;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  outpatientCategories: string[];
  inpatientCategories: string[];
  currentCatOPIdx: number;
  setCurrentCatOPIdx: (idx: number) => void;
  currentCatIPIdx: number;
  setCurrentCatIPIdx: (idx: number) => void;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<InventoryItem, 'id'>) => Promise<number | null>;
  updateItem: (id: number, updates: Partial<InventoryItem>, oldCategory?: string) => Promise<boolean>;
  deleteItem: (id: number, category: string) => Promise<boolean>;
  bulkImport: (items: InventoryItem[]) => Promise<boolean>;
  exportData: () => InventoryItem[];
  seedFromJson: () => Promise<boolean>;
}

const BillingContext = createContext<BillingContextType | null>(null);

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    inventory,
    isLoading,
    isSyncing,
    addItem,
    updateItem,
    deleteItem,
    bulkImport,
    exportData,
    seedFromJson,
  } = useInventory();

  const [bill, setBill] = useState<BillItem[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [currentCatOPIdx, setCurrentCatOPIdx] = useState(0);
  const [currentCatIPIdx, setCurrentCatIPIdx] = useState(0);

  const inventoryCategories = Object.keys(inventory).sort();
  // Outpatient should still show category tiles even when inventory is empty (first-run/empty DB).
  const outpatientCategories = inventoryCategories.length > 0 ? inventoryCategories : INPATIENT_CATEGORIES;
  const inpatientCategories = INPATIENT_CATEGORIES;

  const addToBill = useCallback((item: BillItem) => {
    setBill(prev => [...prev, item]);
  }, []);

  const removeFromBill = useCallback((index: number) => {
    setBill(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearBill = useCallback(() => {
    setBill([]);
  }, []);

  return (
    <BillingContext.Provider
      value={{
        inventory,
        bill,
        addToBill,
        removeFromBill,
        clearBill,
        currentView,
        setCurrentView,
        outpatientCategories,
        inpatientCategories,
        currentCatOPIdx,
        setCurrentCatOPIdx,
        currentCatIPIdx,
        setCurrentCatIPIdx,
        isLoading,
        isSyncing,
        addItem,
        updateItem,
        deleteItem,
        bulkImport,
        exportData,
        seedFromJson,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};
