import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types/billing';
import { toast } from 'sonner';

interface DbInventoryItem {
  id: number;
  name: string;
  strength: string | null;
  price: number;
  type: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

export const useInventory = () => {
  const [inventory, setInventory] = useState<Record<string, InventoryItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch inventory from database
  const fetchInventory = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');

      if (error) throw error;

      const inv: Record<string, InventoryItem[]> = {};
      (data as DbInventoryItem[]).forEach((item) => {
        const cat = item.category || 'General';
        if (!inv[cat]) inv[cat] = [];
        inv[cat].push({
          id: item.id,
          name: item.name,
          strength: item.strength || undefined,
          price: Number(item.price),
          type: item.type || undefined,
          category: cat,
        });
      });

      setInventory(inv);
      return inv;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory from database');
      return {};
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add item to database
  const addItem = useCallback(async (item: Omit<InventoryItem, 'id'>) => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert({
          name: item.name,
          strength: item.strength || null,
          price: item.price,
          type: item.type || null,
          category: item.category || 'General',
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setInventory(prev => {
        const cat = item.category || 'General';
        const newInv = { ...prev };
        if (!newInv[cat]) newInv[cat] = [];
        newInv[cat].push({
          id: (data as DbInventoryItem).id,
          name: item.name,
          strength: item.strength,
          price: item.price,
          type: item.type,
          category: cat,
        });
        return newInv;
      });

      toast.success('Record added');
      return (data as DbInventoryItem).id;
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Update item in database
  const updateItem = useCallback(async (id: number, updates: Partial<InventoryItem>, oldCategory?: string) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          name: updates.name,
          strength: updates.strength || null,
          price: updates.price,
          type: updates.type || null,
          category: updates.category || 'General',
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setInventory(prev => {
        const newInv = { ...prev };
        const newCat = updates.category || 'General';

        // Remove from old category if changed
        if (oldCategory && oldCategory !== newCat && newInv[oldCategory]) {
          newInv[oldCategory] = newInv[oldCategory].filter(i => i.id !== id);
          if (newInv[oldCategory].length === 0) {
            delete newInv[oldCategory];
          }
        }

        // Add/update in new category
        if (!newInv[newCat]) newInv[newCat] = [];
        const existingIndex = newInv[newCat].findIndex(i => i.id === id);
        const updatedItem: InventoryItem = {
          id,
          name: updates.name || '',
          strength: updates.strength,
          price: updates.price || 0,
          type: updates.type,
          category: newCat,
        };

        if (existingIndex > -1) {
          newInv[newCat][existingIndex] = updatedItem;
        } else {
          newInv[newCat].push(updatedItem);
        }

        return newInv;
      });

      toast.success('Record updated');
      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Delete item from database
  const deleteItem = useCallback(async (id: number, category: string) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setInventory(prev => {
        const newInv = { ...prev };
        if (newInv[category]) {
          newInv[category] = newInv[category].filter(i => i.id !== id);
          if (newInv[category].length === 0) {
            delete newInv[category];
          }
        }
        return newInv;
      });

      toast.success('Record deleted');
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Bulk import - replaces all data
  const bulkImport = useCallback(async (items: InventoryItem[]) => {
    setIsSyncing(true);
    try {
      // Delete all existing items
      const { error: deleteError } = await supabase
        .from('inventory')
        .delete()
        .neq('id', 0); // Delete all

      if (deleteError) throw deleteError;

      // Insert all new items
      const insertData = items.map(item => ({
        name: item.name,
        strength: item.strength || null,
        price: item.price,
        type: item.type || null,
        category: item.category || 'General',
      }));

      const { error: insertError } = await supabase
        .from('inventory')
        .insert(insertData);

      if (insertError) throw insertError;

      // Refresh from database to get new IDs
      await fetchInventory();
      toast.success('Database imported successfully');
      return true;
    } catch (error) {
      console.error('Error bulk importing:', error);
      toast.error('Failed to import database');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [fetchInventory]);

  // Export all items as JSON
  const exportData = useCallback(() => {
    const allItems: InventoryItem[] = [];
    Object.entries(inventory).forEach(([cat, items]) => {
      items.forEach(item => {
        allItems.push({ ...item, category: cat });
      });
    });
    return allItems;
  }, [inventory]);

  // Seed from JSON file (for initial setup)
  const seedFromJson = useCallback(async () => {
    try {
      const res = await fetch('/med.json');
      if (res.ok) {
        const data: InventoryItem[] = await res.json();
        await bulkImport(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error seeding from JSON:', error);
      return false;
    }
  }, [bulkImport]);

  // Initial fetch
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    isLoading,
    isSyncing,
    addItem,
    updateItem,
    deleteItem,
    bulkImport,
    exportData,
    seedFromJson,
    refetch: fetchInventory,
  };
};
