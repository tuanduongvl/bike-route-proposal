import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Polyline, useMap, useMapEvents } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import BikeRouteList from "@/components/BikeRouteList";
import RouteComments from "@/components/RouteComments";
import "leaflet/dist/leaflet.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit, Plus } from "lucide-react";

interface BikeRoute {
  id: string;
  coordinates: [number, number][];
  likes: number;
  dislikes: number;
  name: string;
  description: string;
}

const INITIAL_ROUTES: BikeRoute[] = [
  {
    id: "1",
    coordinates: [
      [51.505, -0.09],
      [51.51, -0.1],
      [51.51, -0.12],
    ],
    likes: 5,
    dislikes: 2,
    name: "Central Park Connection",
    description: "New bike route connecting downtown to Central Park",
  },
];

// Component to handle route drawing
const RouteDrawer = ({ isDrawing, onRouteComplete }: { 
  isDrawing: boolean; 
  onRouteComplete: (coordinates: [number, number][]) => void 
}) => {
  const [points, setPoints] = useState<[number, number][]>([]);
  const map = useMapEvents({
    click(e) {
      if (isDrawing) {
        const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPoints(prev => [...prev, newPoint]);
      }
    },
  });

  useEffect(() => {
    if (!isDrawing && points.length > 0) {
      onRouteComplete(points);
      setPoints([]);
    }
  }, [isDrawing, points, onRouteComplete]);

  return points.length > 0 ? (
    <Polyline
      positions={points}
      dashArray={[10, 10]}
      color="#4F7942"
      weight={4}
      opacity={0.8}
    />
  ) : null;
};

const Index = () => {
  const [routes, setRoutes] = useState<BikeRoute[]>(INITIAL_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<BikeRoute | null>(null);
  const [isOperator, setIsOperator] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [editingRoute, setEditingRoute] = useState<BikeRoute | null>(null);
  const [newRouteName, setNewRouteName] = useState("");
  const [newRouteDescription, setNewRouteDescription] = useState("");
  const [tempCoordinates, setTempCoordinates] = useState<[number, number][]>([]);
  const { toast } = useToast();

  const handleVote = (routeId: string, isLike: boolean) => {
    setRoutes((prevRoutes) =>
      prevRoutes.map((route) => {
        if (route.id === routeId) {
          return {
            ...route,
            likes: isLike ? route.likes + 1 : route.likes,
            dislikes: !isLike ? route.dislikes + 1 : route.dislikes,
          };
        }
        return route;
      })
    );
    toast({
      title: "Vote recorded",
      description: "Thank you for your feedback!",
    });
  };

  const handleRouteComplete = useCallback((coordinates: [number, number][]) => {
    setTempCoordinates(coordinates);
    setShowRouteDialog(true);
    setIsDrawing(false);
  }, []);

  const handleSaveRoute = () => {
    if (editingRoute) {
      // Update existing route
      setRoutes(prevRoutes =>
        prevRoutes.map(route =>
          route.id === editingRoute.id
            ? {
                ...route,
                name: newRouteName,
                description: newRouteDescription,
                coordinates: tempCoordinates.length > 0 ? tempCoordinates : route.coordinates,
              }
            : route
        )
      );
      toast({
        title: "Route updated",
        description: "The bike route has been successfully updated.",
      });
    } else {
      // Create new route
      const newRoute: BikeRoute = {
        id: Date.now().toString(),
        coordinates: tempCoordinates,
        likes: 0,
        dislikes: 0,
        name: newRouteName,
        description: newRouteDescription,
      };
      setRoutes(prev => [...prev, newRoute]);
      toast({
        title: "Route created",
        description: "New bike route has been successfully created.",
      });
    }
    handleCloseDialog();
  };

  const handleDeleteRoute = (routeId: string) => {
    setRoutes(prev => prev.filter(route => route.id !== routeId));
    if (selectedRoute?.id === routeId) {
      setSelectedRoute(null);
    }
    toast({
      title: "Route deleted",
      description: "The bike route has been successfully deleted.",
    });
  };

  const handleEditRoute = (route: BikeRoute) => {
    setEditingRoute(route);
    setNewRouteName(route.name);
    setNewRouteDescription(route.description);
    setTempCoordinates([]);
    setShowRouteDialog(true);
  };

  const handleCloseDialog = () => {
    setShowRouteDialog(false);
    setEditingRoute(null);
    setNewRouteName("");
    setNewRouteDescription("");
    setTempCoordinates([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Bike Route Proposals</h1>
          <div className="flex gap-4">
            {isOperator && (
              <Button
                onClick={() => setIsDrawing(!isDrawing)}
                variant={isDrawing ? "destructive" : "default"}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isDrawing ? "Cancel Drawing" : "Draw New Route"}
              </Button>
            )}
            <Button
              onClick={() => setIsOperator(!isOperator)}
              variant={isOperator ? "destructive" : "default"}
            >
              {isOperator ? "Exit Operator Mode" : "Enter Operator Mode"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: "600px" }}>
              <MapContainer
                center={[51.505, -0.09]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RouteDrawer isDrawing={isDrawing} onRouteComplete={handleRouteComplete} />
                {routes.map((route) => (
                  <Polyline
                    key={route.id}
                    positions={route.coordinates}
                    dashArray={[10, 10]}
                    color={selectedRoute?.id === route.id ? "#2F5233" : "#4F7942"}
                    weight={4}
                    opacity={0.8}
                    eventHandlers={{
                      click: () => setSelectedRoute(route),
                    }}
                  />
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="space-y-8">
            <BikeRouteList
              routes={routes}
              selectedRoute={selectedRoute}
              onRouteSelect={setSelectedRoute}
              onVote={handleVote}
              isOperator={isOperator}
              onEdit={handleEditRoute}
              onDelete={handleDeleteRoute}
            />
            {selectedRoute && (
              <RouteComments routeId={selectedRoute.id} routeName={selectedRoute.name} />
            )}
          </div>
        </div>
      </div>

      <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
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
                onChange={(e) => setNewRouteName(e.target.value)}
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
                onChange={(e) => setNewRouteDescription(e.target.value)}
                placeholder="Enter route description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoute} disabled={!newRouteName}>
              {editingRoute ? 'Update Route' : 'Create Route'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;