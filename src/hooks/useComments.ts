import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Comment {
  id: string;
  route_id: string;
  text: string;
  created_at: string;
  session_id?: string;
}

export const useComments = (routeId: string) => {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['comments', routeId],
    queryFn: async () => {
      console.log('Fetching comments for route:', routeId);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('route_id', routeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }
      return data as Comment[];
    },
    enabled: !!routeId,
  });

  const addComment = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      console.log('Adding comment:', { routeId, text });
      
      // Use session ID for anonymous comments
      const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);

      const { data, error } = await supabase
        .from('comments')
        .insert([{
          route_id: routeId,
          text,
          session_id: sessionId
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', routeId] });
    },
  });

  return {
    comments,
    isLoadingComments,
    addComment,
  };
};

export const getCommentsCount = async (routeId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact' })
    .eq('route_id', routeId);

  if (error) throw error;
  return count || 0;
};