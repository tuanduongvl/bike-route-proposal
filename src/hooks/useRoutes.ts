import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { BikeRoute } from '@/types/routes';

export const useRoutes = () => {
  const queryClient = useQueryClient();

  const addRoute = useMutation({
    mutationFn: async (route: Omit<BikeRoute, 'id' | 'likes' | 'dislikes'>) => {
      console.log('Adding new route to Supabase:', route);
      const { data, error } = await supabase
        .from('routes')
        .insert([{ 
          name: route.name,
          description: route.description,
          coordinates: route.coordinates,
          likes: 0, 
          dislikes: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding route:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });

  const updateRoute = useMutation({
    mutationFn: async (route: BikeRoute) => {
      console.log('Updating route in Supabase:', route);
      const { data, error } = await supabase
        .from('routes')
        .update(route)
        .eq('id', route.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating route:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });

  const deleteRoute = useMutation({
    mutationFn: async (routeId: string) => {
      console.log('Deleting route from Supabase:', routeId);
      
      // Delete associated votes
      const { error: votesError } = await supabase
        .from('votes')
        .delete()
        .eq('route_id', routeId);

      if (votesError) {
        console.error('Error deleting associated votes:', votesError);
        throw votesError;
      }

      // Delete associated comments
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('route_id', routeId);

      if (commentsError) {
        console.error('Error deleting associated comments:', commentsError);
        throw commentsError;
      }

      // Delete the route
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId);

      if (error) {
        console.error('Error deleting route:', error);
        throw error;
      }

      return routeId;
    },
    onSuccess: (deletedRouteId) => {
      console.log('Route successfully deleted:', deletedRouteId);
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });

  return {
    addRoute,
    updateRoute,
    deleteRoute
  };
};