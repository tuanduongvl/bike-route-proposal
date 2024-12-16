export interface BikeRoute {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number][];
  likes: number;
  dislikes: number;
  created_at?: string;
  user_id?: string;
}