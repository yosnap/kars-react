
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface FloatingFilterButtonProps {
  onClick: () => void;
}

const FloatingFilterButton = ({ onClick }: FloatingFilterButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 bg-primary hover:bg-secondary text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300"
      size="icon"
    >
      <Filter className="w-6 h-6" />
    </Button>
  );
};

export default FloatingFilterButton;
