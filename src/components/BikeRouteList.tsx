import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface BikeRoute {
  id: string;
  name: string;
  description: string;
  likes: number;
  dislikes: number;
}

interface BikeRouteListProps {
  routes: BikeRoute[];
  selectedRoute: BikeRoute | null;
  onRouteSelect: (route: BikeRoute) => void;
  onVote: (routeId: string, isLike: boolean) => void;
}

const BikeRouteList = ({ routes, selectedRoute, onRouteSelect, onVote }: BikeRouteListProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Proposed Routes</h2>
      {routes.map((route) => (
        <Card
          key={route.id}
          className={`p-4 cursor-pointer transition-all ${
            selectedRoute?.id === route.id ? "ring-2 ring-green-600" : ""
          }`}
          onClick={() => onRouteSelect(route)}
        >
          <h3 className="text-lg font-semibold mb-2">{route.name}</h3>
          <p className="text-gray-600 mb-4">{route.description}</p>
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onVote(route.id, true);
                }}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                {route.likes}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onVote(route.id, false);
                }}
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                {route.dislikes}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default BikeRouteList;