import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { BikeRoute } from '@/types/routes';

// Separate vote-related functionality
const useVotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ routeId, isLike }: { routeId: string; isLike: boolean }) => {
      console.log('Voting on route:', { routeId, isLike });
      
      // First, check if the user has already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('route_id', routeId)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error: updateError } = await supabase
          .from('votes')
          .update({ is_like: isLike })
          .eq('id', existingVote.id);

        if (updateError) {
          console.error('Error updating vote:', updateError);
          throw updateError;
        }
      } else {
        // Create new vote
        const { error: insertError } = await supabase
          .from('votes')
          .insert([{ 
            route_id: routeId,
            is_like: isLike
          }]);

        if (insertError) {
          console.error('Error inserting vote:', insertError);
          throw insertError;
        }
      }

      // Update route likes/dislikes counts
      const { data: votes } = await supabase
        .from('votes')
        .select('is_like')
        .eq('route_id', routeId);

      const likes = votes?.filter(vote => vote.is_like).length || 0;
      const dislikes = votes?.filter(vote => !vote.is_like).length || 0;

      const { error: updateRouteError } = await supabase
        .from('routes')
        .update({ likes, dislikes })
        .eq('id', routeId);

      if (updateRouteError) {
        console.error('Error updating route counts:', updateRouteError);
        throw updateRouteError;
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