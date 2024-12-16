import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface RouteControlsProps {
  isOperator: boolean;
  onStartDrawing: () => void;
}

const RouteControls = ({ isOperator, onStartDrawing }: RouteControlsProps) => {
  if (!isOperator) return null;

  return (
    <div className="mb-4">
      <Button 
        onClick={onStartDrawing}
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add New Route
      </Button>
    </div>
  );
};

export default RouteControls;