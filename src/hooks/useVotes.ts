import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useVotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ routeId, isLike }: { routeId: string; isLike: boolean }) => {
      console.log('Attempting to vote on route:', { routeId, isLike });
      
      // Get or create session ID for anonymous voting
      const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);
      console.log('Using session ID:', sessionId);

      // Check for existing vote with proper headers
      const { data: existingVote, error: voteCheckError } = await supabase
        .from('votes')
        .select('*')
        .eq('route_id', routeId)
        .eq('session_id', sessionId)
        .single();

      if (voteCheckError && voteCheckError.code !== 'PGRST116') {
        console.error('Error checking existing vote:', voteCheckError);
        throw voteCheckError;
      }

      if (existingVote) {
        console.log('Updating existing vote:', existingVote.id);
        const { error: updateError } = await supabase
          .from('votes')
          .update({ is_like: isLike })
          .eq('id', existingVote.id);

        if (updateError) {
          console.error('Error updating vote:', updateError);
          throw updateError;
        }
      } else {
        console.log('Creating new vote');
        const { error: insertError } = await supabase
          .from('votes')
          .insert([{ 
            route_id: routeId,
            session_id: sessionId,
            is_like: isLike
          }]);

        if (insertError) {
          console.error('Error inserting vote:', insertError);
          throw insertError;
        }
      }

      // Update route likes/dislikes counts
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('is_like')
        .eq('route_id', routeId);

      if (votesError) {
        console.error('Error fetching votes:', votesError);
        throw votesError;
      }

      const likes = votes?.filter(vote => vote.is_like).length || 0;
      const dislikes = votes?.filter(vote => !vote.is_like).length || 0;

      console.log('Updating route counts:', { likes, dislikes });

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