import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import BikeRouteList from "@/components/BikeRouteList";
import RouteComments from "@/components/RouteComments";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MapComponent } from "@/components/MapComponent";
import RouteDialog from "@/components/RouteDialog";
import RouteControls from "@/components/RouteControls";
import { BikeRoute } from "@/types/routes";
import { supabase } from "@/lib/supabase";
import "leaflet/dist/leaflet.css";

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
  const [isDrawing, setIsDrawing] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [editingRoute, setEditingRoute] = useState<BikeRoute | null>(null);
  const [newRouteName, setNewRouteName] = useState("");
  const [newRouteDescription, setNewRouteDescription] = useState("");
  const [tempCoordinates, setTempCoordinates] = useState<[number, number][]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const checkOperator = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsOperator(!!session);
    };
    checkOperator();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsOperator(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setSelectedRoute(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RouteControls 
              isOperator={isOperator}
              onStartDrawing={handleStartDrawing}
            />
            <MapComponent
              routes={routes}
              selectedRoute={selectedRoute}
              isDrawing={isDrawing}
              onRouteComplete={handleRouteComplete}
            />
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
      <Footer />

      <RouteDialog
        open={showRouteDialog}
        onOpenChange={setShowRouteDialog}
        editingRoute={editingRoute}
        newRouteName={newRouteName}
        newRouteDescription={newRouteDescription}
        onNameChange={setNewRouteName}
        onDescriptionChange={setNewRouteDescription}
        onSave={handleSaveRoute}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default Index;