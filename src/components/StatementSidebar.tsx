import { X, CheckCircle2 } from 'lucide-react';
import { BillItem } from '@/types/billing';
import { useLocalBilling } from '@/contexts/LocalBillingContext';
import { toast } from 'sonner';

interface StatementSidebarProps {
  title: string;
  prefix: 'op' | 'ip';
}

export const StatementSidebar = ({ title, prefix }: StatementSidebarProps) => {
  const { bill, removeFromBill, clearBill } = useLocalBilling();

  const total = bill.reduce((sum, item) => sum + item.subtotal, 0);
  const categories = [...new Set(bill.map((item) => item.category))].sort();

  const handleFinalize = () => {
    if (bill.length === 0) {
      toast.error('Statement is empty');
      return;
    }
    
    if (confirm(`Commit statement? Total: ৳ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`)) {
      clearBill();
      toast.success('Committed to server');
    }
  };

  return (
    <aside className="bg-card border border-border rounded-2xl p-6 lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] flex flex-col shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black uppercase tracking-wide text-foreground">
          {title}
        </h3>
        <button
          onClick={clearBill}
          className="text-muted-foreground text-xs font-black tracking-wider cursor-pointer transition-all border border-border px-3 py-1 rounded-md hover:text-primary-foreground hover:bg-accent-red hover:border-accent-red"
        >
          RESET
        </button>
      </div>

      <div className="bg-input border border-border rounded-xl p-4 mb-6 border-l-4 border-l-primary">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wide">
              Patient
            </span>
            <span className="text-xs text-foreground font-extrabold">
              #{prefix.toUpperCase()}-2025
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wide">
              Location
            </span>
            <span className="text-xs text-foreground font-extrabold">
              {prefix === 'op' ? 'BLOCK B' : 'WARD A'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {bill.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground opacity-60 font-semibold text-sm">
            STATEMENT EMPTY
          </div>
        ) : (
          categories.map((cat) => {
            const items = bill.filter((item) => item.category === cat);
            return (
              <div key={cat} className="mb-4">
                <div className="text-xs font-extrabold text-primary mb-2">{cat}</div>
                {items.map((item, idx) => {
                  const billIndex = bill.indexOf(item);
                  return (
                    <div
                      key={`${item.name}-${idx}`}
                      className="flex justify-between items-center py-1.5 text-sm gap-3"
                    >
                      <span className="flex-1 font-bold text-foreground truncate">
                        {item.name}{' '}
                        <span className="text-xs opacity-50 font-normal">x{item.qty}</span>
                      </span>
                      <span className="font-mono font-bold text-primary">
                        ৳ {item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <X
                        className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-accent-red transition-colors"
                        onClick={() => removeFromBill(billIndex)}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex justify-between items-center mb-6">
          <span className="font-extrabold text-lg uppercase text-foreground">TOTAL</span>
          <span className="font-mono font-bold text-2xl text-primary">
            ৳ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <button
          onClick={handleFinalize}
          className="w-full bg-primary text-primary-foreground font-black rounded-xl py-4 text-sm transition-all duration-200 hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 uppercase tracking-wide flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          COMMIT
        </button>
      </div>
    </aside>
  );
};
