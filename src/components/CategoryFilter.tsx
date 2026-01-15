import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Gamepad2, 
  Music, 
  Film, 
  Utensils, 
  Laptop,
  Sparkles,
  LayoutGrid
} from 'lucide-react';

const categories = [
  { name: 'All', icon: LayoutGrid },
  { name: 'Sports', icon: Trophy },
  { name: 'Gaming', icon: Gamepad2 },
  { name: 'Music', icon: Music },
  { name: 'Entertainment', icon: Film },
  { name: 'Food', icon: Utensils },
  { name: 'Anime', icon: Sparkles },
  { name: 'Technology', icon: Laptop },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selected === category.name;
        
        return (
          <Button
            key={category.name}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full gap-2 transition-all",
              isSelected && "shadow-lg shadow-primary/25"
            )}
            onClick={() => onSelect(category.name)}
          >
            <Icon className="h-4 w-4" />
            {category.name}
          </Button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
