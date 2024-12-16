export interface BikeRoute {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number][];
  likes: number;
  dislikes: number;
}