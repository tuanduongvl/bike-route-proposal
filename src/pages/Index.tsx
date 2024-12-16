import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import BikeRouteList from "@/components/BikeRouteList";
import RouteComments from "@/components/RouteComments";
import "leaflet/dist/leaflet.css";

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

const Index = () => {
  const [routes, setRoutes] = useState<BikeRoute[]>(INITIAL_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<BikeRoute | null>(null);
  const [isOperator, setIsOperator] = useState(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Bike Route Proposals</h1>
          <Button
            onClick={() => setIsOperator(!isOperator)}
            variant={isOperator ? "destructive" : "default"}
          >
            {isOperator ? "Exit Operator Mode" : "Enter Operator Mode"}
          </Button>
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
            />
            {selectedRoute && (
              <RouteComments routeId={selectedRoute.id} routeName={selectedRoute.name} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;