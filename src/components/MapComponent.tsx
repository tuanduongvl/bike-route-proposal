import { useState, useEffect } from 'react';
import { MapContainer, Polyline, useMap, useMapEvents } from "react-leaflet";
import { BikeRoute } from "@/types/routes";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.gridlayer.googlemutant';

interface MapComponentProps {
  routes: BikeRoute[];
  selectedRoute: BikeRoute | null;
  isDrawing: boolean;
  onRouteComplete: (coordinates: [number, number][]) => void;
}

const GoogleLayer = () => {
  const map = useMap();

  useEffect(() => {
    console.log("Initializing Google Maps layer");
    // @ts-ignore - the types for gridLayer.googleMutant are not available
    const roads = L.gridLayer.googleMutant({
      type: 'roadmap',
      styles: [
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [
            { lightness: 100 },
            { visibility: "simplified" }
          ]
        },
        {
          featureType: "road",
          elementType: "labels",
          stylers: [
            { visibility: "off" }
          ]
        },
        {
          featureType: "poi",
          stylers: [
            { visibility: "off" }
          ]
        }
      ]
    });
    
    roads.addTo(map);
    
    return () => {
      map.removeLayer(roads);
    };
  }, [map]);

  return null;
};

const RouteDrawer = ({ isDrawing, onRouteComplete }: {
  isDrawing: boolean;
  onRouteComplete: (coordinates: [number, number][]) => void;
}) => {
  const [points, setPoints] = useState<[number, number][]>([]);
  
  useMapEvents({
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
      pathOptions={{
        color: "#4F7942",
        weight: 4,
        opacity: 0.8,
        dashArray: [10, 10]
      }}
    />
  ) : null;
};

export const MapComponent = ({ routes, selectedRoute, isDrawing, onRouteComplete }: MapComponentProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: "600px" }}>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <GoogleLayer />
        <RouteDrawer isDrawing={isDrawing} onRouteComplete={onRouteComplete} />
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            pathOptions={{
              color: selectedRoute?.id === route.id ? "#2F5233" : "#4F7942",
              weight: 4,
              opacity: 0.8,
              dashArray: [10, 10]
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
};