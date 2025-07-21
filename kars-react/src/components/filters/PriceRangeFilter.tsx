
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PriceRangeFilterProps {
  priceRange: number[];
  onPriceRangeChange: (value: number[]) => void;
}

const PriceRangeFilter = ({ priceRange, onPriceRangeChange }: PriceRangeFilterProps) => {
  return (
    <div>
      <Label className="text-sm font-medium">
        Precio: {priceRange[0].toLocaleString()}€ - {priceRange[1].toLocaleString()}€
      </Label>
      <div className="px-2 mt-2">
        <Slider
          value={priceRange}
          onValueChange={onPriceRangeChange}
          max={100000}
          min={1000}
          step={1000}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default PriceRangeFilter;
