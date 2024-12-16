export interface BikeRoute {
  id: string;
  coordinates: [number, number][];
  likes: number;
  dislikes: number;
  name: string;
  description: string;
}