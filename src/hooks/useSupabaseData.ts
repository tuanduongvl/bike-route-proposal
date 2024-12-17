import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { BikeRoute } from '@/types/routes';
import { useVotes } from './useVotes';
import { useRoutes } from './useRoutes';

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