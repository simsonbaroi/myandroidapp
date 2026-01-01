import { InventoryItem } from '@/types/billing';

interface ItemEntryProps {
  item: InventoryItem;
  category: string;
  onClick: () => void;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ItemEntry = ({
  item,
  onClick,
  showActions,
  onEdit,
  onDelete,
}: ItemEntryProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-2xl px-5 py-4 flex justify-between items-center transition-all duration-200 cursor-pointer shadow-md hover:border-primary hover:bg-surface-light hover:-translate-y-0.5 hover:shadow-lg animate-fade-in"
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-base text-foreground">{item.name}</span>
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
          {item.type || 'Service'} {item.strength && `• ${item.strength}`}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="font-mono font-bold text-primary text-xl">
          <span className="text-base opacity-80 mr-1">৳</span>
          {typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
        </span>
        
        {showActions && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="text-accent-blue p-2 rounded-lg transition-all duration-200 hover:bg-accent-blue/10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="text-accent-red p-2 rounded-lg transition-all duration-200 hover:bg-accent-red/10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
