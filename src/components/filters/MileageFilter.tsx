
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface MileageFilterProps {
  mileageMax: number[];
  onMileageMaxChange: (value: number[]) => void;
}

const MileageFilter = ({ mileageMax, onMileageMaxChange }: MileageFilterProps) => {
  return (
    <div>
      <Label className="text-sm font-medium">
        Kilometraje máximo: {mileageMax[0].toLocaleString()} km
      </Label>
      <div className="px-2 mt-2">
        <Slider
          value={mileageMax}
          onValueChange={onMileageMaxChange}
          max={300000}
          min={0}
          step={5000}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default MileageFilter;
