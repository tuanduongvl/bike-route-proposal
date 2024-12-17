import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { BikeRoute } from '@/types/routes';

// Separate vote-related functionality
const useVotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ routeId, isLike }: { routeId: string; isLike: boolean }) => {
      console.log('Anonymous voting on route:', { routeId, isLike });
      
      // For anonymous voting, we'll just update the route's likes/dislikes directly
      const { data: currentRoute } = await supabase
        .from('routes')
        .select('likes, dislikes')
        .eq('id', routeId)
        .single();

      if (!currentRoute) {
        throw new Error('Route not found');
      }

      const { error: updateError } = await supabase
        .from('routes')
        .update({ 
          likes: isLike ? (currentRoute.likes + 1) : currentRoute.likes,
          dislikes: !isLike ? (currentRoute.dislikes + 1) : currentRoute.dislikes
        })
        .eq('id', routeId);

      if (updateError) {
        console.error('Error updating route votes:', updateError);
        throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};

// Separate route management functionality
const useRoutes = () => {
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
    onError: (error) => {
      console.error('Failed to delete route:', error);
    },
  });

  return {
    addRoute,
    updateRoute,
    deleteRoute
  };
};

export const useSupabaseData = () => {
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      console.log('Fetching routes from Supabase');
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching routes:', error);
        throw error;
      }
      return data as BikeRoute[];
    },
  });

  const routeOperations = useRoutes();
  const voteOnRoute = useVotes();

  return {
    routes,
    isLoadingRoutes,
    ...routeOperations,
    voteOnRoute,
  };
};