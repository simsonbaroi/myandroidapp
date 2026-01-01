import { X, Pill } from 'lucide-react';
import { BillItem } from '@/types/billing';

interface MedicineTagsProps {
  bill: BillItem[];
  onRemove: (name: string) => void;
}

export const MedicineTags = ({ bill, onRemove }: MedicineTagsProps) => {
  const meds = bill.filter(
    (item) => item.category === 'Medicine' || item.category === 'Discharge Medicine'
  );

  if (meds.length === 0) return null;

  return (
    <div className="bg-surface-light border border-border rounded-2xl p-4 min-h-14 flex flex-wrap gap-2 mb-6 items-center shadow-md animate-fade-in">
      <div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
        <Pill className="w-4 h-4 text-primary" />
        ACTIVE MEDS:
      </div>
      
      <div className="flex flex-wrap gap-2 ml-3">
        {meds.map((med, idx) => (
          <span
            key={`${med.name}-${idx}`}
            className="bg-input border border-primary rounded-lg px-3 py-1.5 text-xs font-bold text-primary flex items-center gap-2 shadow-sm"
          >
            {med.name}
            <X
              className="w-3 h-3 cursor-pointer text-muted-foreground hover:text-accent-red transition-colors"
              onClick={() => onRemove(med.name)}
            />
          </span>
        ))}
      </div>
    </div>
  );
};
