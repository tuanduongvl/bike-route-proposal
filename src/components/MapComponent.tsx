import { MapContainer, TileLayer, Polyline, useMap, useMapEvents } from "react-leaflet";
import { BikeRoute } from "@/types/routes";

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
      dashArray={[10, 10]}
      color="#4F7942"
      weight={4}
      opacity={0.8}
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
            dashArray={[10, 10]}
            color={selectedRoute?.id === route.id ? "#2F5233" : "#4F7942"}
            weight={4}
            opacity={0.8}
          />
        ))}
      </MapContainer>
    </div>
  );
};