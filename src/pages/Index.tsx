import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import BikeRouteList from "@/components/BikeRouteList";
import RouteComments from "@/components/RouteComments";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MapComponent } from "@/components/MapComponent";
import RouteDialog from "@/components/RouteDialog";
import RouteControls from "@/components/RouteControls";
import { BikeRoute } from "@/types/routes";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import "leaflet/dist/leaflet.css";

const Index = () => {
  const [selectedRoute, setSelectedRoute] = useState<BikeRoute | null>(null);
  const [isOperator] = useState(true); // Changed this line to default to true
  const [isDrawing, setIsDrawing] = useState(false);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [editingRoute, setEditingRoute] = useState<BikeRoute | null>(null);
  const [newRouteName, setNewRouteName] = useState("");
  const [newRouteDescription, setNewRouteDescription] = useState("");
  const [tempCoordinates, setTempCoordinates] = useState<[number, number][]>([]);
  const { toast } = useToast();

  const {
    routes,
    isLoadingRoutes,
    addRoute,
    updateRoute,
    deleteRoute,
    voteOnRoute,
  } = useSupabaseData();

  const handleVote = async (routeId: string, isLike: boolean) => {
    try {
      await voteOnRoute.mutateAsync({ routeId, isLike });
      toast({
        title: "Vote recorded",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRouteComplete = useCallback((coordinates: [number, number][]) => {
    setTempCoordinates(coordinates);
    setShowRouteDialog(true);
    setIsDrawing(false);
  }, []);

  const handleSaveRoute = async () => {
    try {
      if (editingRoute) {
        await updateRoute.mutateAsync({
          ...editingRoute,
          name: newRouteName,
          description: newRouteDescription,
          coordinates: tempCoordinates.length > 0 ? tempCoordinates : editingRoute.coordinates,
        });
        toast({
          title: "Route updated",
          description: "The bike route has been successfully updated.",
        });
      } else {
        await addRoute.mutateAsync({
          name: newRouteName,
          description: newRouteDescription,
          coordinates: tempCoordinates,
        });
        toast({
          title: "Route created",
          description: "New bike route has been successfully created.",
        });
      }
      handleCloseDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save route. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    try {
      await deleteRoute.mutateAsync(routeId);
      if (selectedRoute?.id === routeId) {
        setSelectedRoute(null);
      }
      toast({
        title: "Route deleted",
        description: "The bike route has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete route. Please try again.",
        variant: "destructive",
      });
    }
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
    setTempCoordinates([]);
  };

  const handleFinishDrawing = () => {
    setIsDrawing(false);
  };

  const handleRouteSelect = (route: BikeRoute) => {
    setSelectedRoute(route);
  };

  if (isLoadingRoutes) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={75} minSize={30}>
            <MapComponent
              routes={routes}
              selectedRoute={selectedRoute}
              isDrawing={isDrawing}
              onRouteComplete={handleRouteComplete}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={25} minSize={20} className="bg-white p-4 overflow-y-auto">
            <div className="space-y-6">
              <RouteControls 
                isOperator={isOperator}
                isDrawing={isDrawing}
                onStartDrawing={handleStartDrawing}
                onFinishDrawing={handleFinishDrawing}
              />
              <BikeRouteList
                routes={routes}
                selectedRoute={selectedRoute}
                onRouteSelect={handleRouteSelect}
                onVote={handleVote}
                isOperator={isOperator}
                onEdit={handleEditRoute}
                onDelete={handleDeleteRoute}
              />
              {selectedRoute && (
                <RouteComments 
                  routeId={selectedRoute.id} 
                  routeName={selectedRoute.name} 
                />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
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