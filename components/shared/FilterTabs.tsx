import { Button } from '@/components/ui/button';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterTabs({ options, value, onChange, className = '' }: FilterTabsProps) {
  return (
    <div className={`flex gap-2 overflow-x-auto pb-2 scrollbar-hide ${className}`}>
      {options.map((option) => (
        <Button
          key={option.value}
          onClick={() => onChange(option.value)}
          variant={value === option.value ? 'default' : 'outline'}
          className="whitespace-nowrap flex-shrink-0"
          size="sm"
        >
          {option.label}
          {option.count !== undefined && (
            <span className="ml-1.5 opacity-70">({option.count})</span>
          )}
        </Button>
      ))}
    </div>
  );
}

