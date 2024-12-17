import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, useMapEvents, Tooltip } from "react-leaflet";
import { BikeRoute } from "@/types/routes";
import { getCommentsCount } from "@/components/RouteComments";
import 'leaflet/dist/leaflet.css';

// Define an array of colors for routes
const routeColors = [
  '#9b87f5', // Primary Purple
  '#0EA5E9', // Ocean Blue
  '#F97316', // Bright Orange
  '#D946EF', // Magenta Pink
  '#8B5CF6', // Vivid Purple
  '#33C3F0', // Sky Blue
  '#1EAEDB', // Bright Blue
  '#0FA0CE', // Bright Blue
];

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

const RouteTooltip = ({ route }: { route: BikeRoute }) => {
  const [commentsCount, setCommentsCount] = useState<number>(0);

  useEffect(() => {
    const fetchCommentsCount = async () => {
      try {
        const count = await getCommentsCount(route.id);
        setCommentsCount(count);
      } catch (error) {
        console.error('Error fetching comments count:', error);
      }
    };

    fetchCommentsCount();
  }, [route.id]);

  return (
    <Tooltip sticky className="bg-white px-3 py-2 rounded shadow-lg border border-gray-200">
      <div className="font-medium text-gray-900">{route.name}</div>
      <div className="text-sm text-gray-600">
        👍 {route.likes} &nbsp; 👎 {route.dislikes}
      </div>
      <div className="text-sm text-gray-600 mt-1">
        💬 {commentsCount} comments
      </div>
    </Tooltip>
  );
};

export const MapComponent = ({ routes, selectedRoute, isDrawing, onRouteComplete }: MapComponentProps) => {
  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[37.5985, -122.3872]} // Millbrae, CA coordinates
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          className="map-tiles"
        />
        <RouteDrawer isDrawing={isDrawing} onRouteComplete={onRouteComplete} />
        {routes.map((route, index) => (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            pathOptions={{
              color: selectedRoute?.id === route.id 
                ? "#33C3F0" 
                : routeColors[index % routeColors.length],
              weight: 4,
              opacity: 1,
              dashArray: [15, 10],
              lineCap: 'round'
            }}
          >
            <RouteTooltip route={route} />
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
};
