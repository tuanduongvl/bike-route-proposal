import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BikeRoute } from "@/types/routes";

interface RouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRoute: BikeRoute | null;
  newRouteName: string;
  newRouteDescription: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const RouteDialog = ({
  open,
  onOpenChange,
  editingRoute,
  newRouteName,
  newRouteDescription,
  onNameChange,
  onDescriptionChange,
  onSave,
  onClose,
}: RouteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingRoute ? 'Edit Route' : 'New Route'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="routeName" className="text-sm font-medium">
              Route Name
            </label>
            <Input
              id="routeName"
              value={newRouteName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter route name"
            />
          </div>
          <div>
            <label htmlFor="routeDescription" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="routeDescription"
              value={newRouteDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter route description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!newRouteName}>
            {editingRoute ? 'Update Route' : 'Create Route'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RouteDialog;