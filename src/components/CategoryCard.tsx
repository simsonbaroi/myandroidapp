import { cn } from '@/lib/utils';

interface CategoryCardProps {
  name: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

export const CategoryCard = ({ name, count, isActive, onClick }: CategoryCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border p-4 rounded-2xl cursor-pointer transition-all duration-200 shadow-md",
        "hover:transform hover:-translate-y-1 hover:border-primary hover:bg-surface-light hover:shadow-lg",
        isActive && "bg-primary/10 border-primary border-b-[3px]"
      )}
    >
      <span className="block font-extrabold text-card-foreground text-sm tracking-tight">
        {name}
      </span>
      <span className="block text-xs text-muted-foreground font-semibold mt-2 uppercase">
        {count} ITEMS
      </span>
    </div>
  );
};
