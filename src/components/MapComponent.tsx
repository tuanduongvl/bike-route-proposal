import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, useMapEvents, Tooltip } from "react-leaflet";
import { BikeRoute } from "@/types/routes";
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  routes: BikeRoute[];
  selectedRoute: BikeRoute | null;
  isDrawing: boolean;
  onRouteComplete: (coordinates: [number, number][]) => void;
}

const RouteDrawer = ({ isDrawing, onRouteComplete }: {
  isDrawing: boolean;
  onRouteComplete: (coordinates: [number, number][]) => void;
}) => {
  const [points, setPoints] = useState<[number, number][]>([]);
  
  useMapEvents({
    click(e) {
      if (isDrawing) {
        const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
        const newPoints = [...points, newPoint];
        setPoints(newPoints);
        onRouteComplete(newPoints);
      }
    },
  });

  useEffect(() => {
    if (!isDrawing) {
      setPoints([]);
    }
  }, [isDrawing]);

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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        <RouteDrawer isDrawing={isDrawing} onRouteComplete={onRouteComplete} />
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            pathOptions={{
              color: selectedRoute?.id === route.id ? "#2F5233" : "#4F7942",
              weight: 4,
              opacity: 1,
              dashArray: [15, 10],
              lineCap: 'round'
            }}
          >
            <Tooltip sticky className="bg-white px-3 py-2 rounded shadow-lg border border-gray-200">
              <div className="font-medium text-gray-900">{route.name}</div>
              <div className="text-sm text-gray-600">
                👍 {route.likes} &nbsp; 👎 {route.dislikes}
              </div>
            </Tooltip>
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
};