import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { BikeRoute } from '@/types/routes';

export const useSupabaseData = () => {
  const queryClient = useQueryClient();

  // Fetch all routes
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

  // Add new route
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
          dislikes: 0,
          user_id: (await supabase.auth.getUser()).data.user?.id
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

  // Update route
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

  // Delete route
  const deleteRoute = useMutation({
    mutationFn: async (routeId: string) => {
      console.log('Deleting route from Supabase:', routeId);
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId);

      if (error) {
        console.error('Error deleting route:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });

  // Vote on route
  const voteOnRoute = useMutation({
    mutationFn: async ({ routeId, isLike }: { routeId: string; isLike: boolean }) => {
      console.log('Voting on route:', { routeId, isLike });
      const { data: existingVote, error: fetchError } = await supabase
        .from('votes')
        .select()
        .eq('route_id', routeId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing vote:', fetchError);
        throw fetchError;
      }

      if (existingVote) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id);

        if (error) {
          console.error('Error deleting existing vote:', error);
          throw error;
        }
      }

      const { error: voteError } = await supabase
        .from('votes')
        .insert([{
          route_id: routeId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          is_like: isLike,
        }]);

      if (voteError) {
        console.error('Error inserting vote:', voteError);
        throw voteError;
      }

      // Update route likes/dislikes count
      const { data: voteCounts } = await supabase
        .from('votes')
        .select('is_like', { count: 'exact' })
        .eq('route_id', routeId);

      const likes = voteCounts?.filter(v => v.is_like).length || 0;
      const dislikes = voteCounts?.filter(v => !v.is_like).length || 0;

      const { error: updateError } = await supabase
        .from('routes')
        .update({ likes, dislikes })
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

  return {
    routes,
    isLoadingRoutes,
    addRoute,
    updateRoute,
    deleteRoute,
    voteOnRoute,
  };
};