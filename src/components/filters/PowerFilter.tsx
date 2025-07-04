
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PowerFilterProps {
  powerRange: number[];
  onPowerRangeChange: (value: number[]) => void;
}

const PowerFilter = ({ powerRange, onPowerRangeChange }: PowerFilterProps) => {
  return (
    <div>
      <Label className="text-sm font-medium">
        Potència (CV): {powerRange[0]}CV - {powerRange[1]}CV
      </Label>
      <div className="px-2 mt-2">
        <Slider
          value={powerRange}
          onValueChange={onPowerRangeChange}
          max={800}
          min={0}
          step={10}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default PowerFilter;
