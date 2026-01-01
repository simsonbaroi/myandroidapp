import { useState } from 'react';
import { Search, UserCircle } from 'lucide-react';
import { useLocalBilling } from '@/contexts/LocalBillingContext';
import { InventoryItem, BillItem } from '@/types/billing';
import { CategoryCard } from '@/components/CategoryCard';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { ItemEntry } from '@/components/ItemEntry';
import { DosagePanel } from '@/components/DosagePanel';
import { MedicineTags } from '@/components/MedicineTags';
import { StatementSidebar } from '@/components/StatementSidebar';

export const InpatientView = () => {
  const {
    inventory,
    inpatientCategories,
    currentCatIPIdx,
    setCurrentCatIPIdx,
    bill,
    addToBill,
    removeFromBill,
  } = useLocalBilling();

  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [patientName, setPatientName] = useState('');

  const currentCategory = inpatientCategories[currentCatIPIdx] || '';
  const items = (inventory[currentCategory] || []).filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategorySelect = (idx: number) => {
    setCurrentCatIPIdx(idx);
    setViewMode('carousel');
    setSelectedItem(null);
  };

  const handlePrev = () => {
    setCurrentCatIPIdx((currentCatIPIdx - 1 + inpatientCategories.length) % inpatientCategories.length);
  };

  const handleNext = () => {
    setCurrentCatIPIdx((currentCatIPIdx + 1) % inpatientCategories.length);
  };

  const handleAddToBill = (item: InventoryItem, qty: number, subtotal: number) => {
    const billItem: BillItem = { ...item, qty, subtotal };
    addToBill(billItem);
  };

  const handleRemoveMedicine = (name: string) => {
    const idx = bill.findIndex((item) => item.name === name);
    if (idx > -1) {
      removeFromBill(idx);
    }
  };

  const showMedicineTags = currentCategory === 'Medicine' || currentCategory === 'Discharge Medicine';

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-foreground">
          INPATIENT <span className="font-light text-muted-foreground">CARE</span>
        </h2>
      </div>

      {/* Mobile: Show content first, then statement */}
      <div className="lg:hidden">
        {/* Admission Card */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-md">
          <h5 className="text-xs font-black text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
            <UserCircle className="w-4 h-4" />
            ADMISSION
          </h5>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Patient Name (Required)"
            className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {inpatientCategories.map((cat, idx) => (
              <CategoryCard
                key={cat}
                name={cat}
                count={inventory[cat]?.length || 0}
                isActive={currentCatIPIdx === idx}
                onClick={() => handleCategorySelect(idx)}
              />
            ))}
          </div>
        ) : (
          <>
            <CategoryCarousel
              categoryName={currentCategory}
              itemCount={items.length}
              onPrev={handlePrev}
              onNext={handleNext}
              onGridView={() => setViewMode('grid')}
            />

            {selectedItem && (
              <DosagePanel
                item={selectedItem}
                category={currentCategory}
                onClose={() => setSelectedItem(null)}
                onAddToBill={handleAddToBill}
              />
            )}

            {showMedicineTags && (
              <MedicineTags bill={bill} onRemove={handleRemoveMedicine} />
            )}

            <div className="bg-input border border-border rounded-2xl px-5 py-4 flex items-center gap-4 mb-6 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-card">
              <Search className="w-5 h-5 text-primary opacity-80" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search service codes..."
                className="bg-transparent border-none text-foreground w-full outline-none text-base font-semibold placeholder:text-muted-foreground placeholder:font-medium"
              />
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground opacity-60 font-semibold">
                  NO MATCHES
                </div>
              ) : (
                items.map((item) => (
                  <ItemEntry
                    key={item.id}
                    item={item}
                    category={currentCategory}
                    onClick={() => setSelectedItem(item)}
                  />
                ))
              )}
            </div>
          </>
        )}

        <StatementSidebar title="Record" prefix="ip" />
      </div>

      {/* Desktop: Side by side layout */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_380px] gap-8">
        <div>
          {/* Admission Card */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-md">
            <h5 className="text-xs font-black text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              ADMISSION
            </h5>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Patient Name (Required)"
              className="bg-input border border-border text-foreground px-4 py-3 rounded-lg w-full outline-none font-semibold text-sm transition-all focus:border-primary focus:bg-surface-light focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
            />
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              {inpatientCategories.map((cat, idx) => (
                <CategoryCard
                  key={cat}
                  name={cat}
                  count={inventory[cat]?.length || 0}
                  isActive={currentCatIPIdx === idx}
                  onClick={() => handleCategorySelect(idx)}
                />
              ))}
            </div>
          ) : (
            <CategoryCarousel
              categoryName={currentCategory}
              itemCount={items.length}
              onPrev={handlePrev}
              onNext={handleNext}
              onGridView={() => setViewMode('grid')}
            />
          )}

          {selectedItem && (
            <DosagePanel
              item={selectedItem}
              category={currentCategory}
              onClose={() => setSelectedItem(null)}
              onAddToBill={handleAddToBill}
            />
          )}

          {showMedicineTags && viewMode === 'carousel' && (
            <MedicineTags bill={bill} onRemove={handleRemoveMedicine} />
          )}

          {viewMode === 'carousel' && (
            <>
              <div className="bg-input border border-border rounded-2xl px-5 py-4 flex items-center gap-4 mb-6 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-card">
                <Search className="w-5 h-5 text-primary opacity-80" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search service codes..."
                  className="bg-transparent border-none text-foreground w-full outline-none text-base font-semibold placeholder:text-muted-foreground placeholder:font-medium"
                />
              </div>

              <div className="flex flex-col gap-3">
                {items.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground opacity-60 font-semibold">
                    NO MATCHES
                  </div>
                ) : (
                  items.map((item) => (
                    <ItemEntry
                      key={item.id}
                      item={item}
                      category={currentCategory}
                      onClick={() => setSelectedItem(item)}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <StatementSidebar title="Record" prefix="ip" />
      </div>
    </div>
  );
};
