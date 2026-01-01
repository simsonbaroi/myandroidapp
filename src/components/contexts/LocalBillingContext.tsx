import React, { createContext, useContext, useState, useCallback } from 'react';
import { InventoryItem, BillItem, ViewType, INPATIENT_CATEGORIES } from '@/types/billing';
import { useLocalInventory } from '@/hooks/useLocalInventory';

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
  addItem: (item: Omit<InventoryItem, 'id'>) => number | null;
  updateItem: (id: number, updates: Partial<InventoryItem>, oldCategory?: string) => boolean;
  deleteItem: (id: number, category: string) => boolean;
  bulkImport: (items: InventoryItem[]) => boolean;
  exportData: () => InventoryItem[];
  seedFromJson: () => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const LocalBillingContext = createContext<BillingContextType | null>(null);

export const useLocalBilling = () => {
  const context = useContext(LocalBillingContext);
  if (!context) {
    throw new Error('useLocalBilling must be used within a LocalBillingProvider');
  }
  return context;
};

export const LocalBillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    refetch,
  } = useLocalInventory();

  // Refresh data function for pull-to-refresh
  const refreshData = useCallback(async () => {
    refetch();
  }, [refetch]);

  const [bill, setBill] = useState<BillItem[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [currentCatOPIdx, setCurrentCatOPIdx] = useState(0);
  const [currentCatIPIdx, setCurrentCatIPIdx] = useState(0);

  const inventoryCategories = Object.keys(inventory).sort();
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
    <LocalBillingContext.Provider
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
        refreshData,
      }}
    >
      {children}
    </LocalBillingContext.Provider>
  );
};
