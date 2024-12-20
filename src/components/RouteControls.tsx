import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";

interface RouteControlsProps {
  isOperator: boolean;
  isDrawing: boolean;
  onStartDrawing: () => void;
  onFinishDrawing: () => void;
}

const RouteControls = ({ 
  isOperator, 
  isDrawing, 
  onStartDrawing, 
  onFinishDrawing 
}: RouteControlsProps) => {
  if (!isOperator) return null;

  return (
    <div className="flex gap-2">
      {!isDrawing ? (
        <Button 
          onClick={onStartDrawing}
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Route
        </Button>
      ) : (
        <Button 
          onClick={onFinishDrawing}
          className="w-full flex items-center justify-center gap-2"
          variant="secondary"
        >
          <Check className="w-4 h-4" />
          Finish Drawing
        </Button>
      )}
    </div>
  );
};

export default RouteControls;