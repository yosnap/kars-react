
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface YearRangeFilterProps {
  yearRange: number[];
  onYearRangeChange: (value: number[]) => void;
}

const YearRangeFilter = ({ yearRange, onYearRangeChange }: YearRangeFilterProps) => {
  return (
    <div>
      <Label className="text-sm font-medium">
        Año: {yearRange[0]} - {yearRange[1]}
      </Label>
      <div className="px-2 mt-2">
        <Slider
          value={yearRange}
          onValueChange={onYearRangeChange}
          max={2024}
          min={2000}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default YearRangeFilter;
