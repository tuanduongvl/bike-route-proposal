import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useComments } from "@/hooks/useComments";
import { supabase } from "@/integrations/supabase/client";

interface RouteCommentsProps {
  routeId: string;
  routeName: string;
}

export const getCommentsCount = async (routeId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact' })
    .eq('route_id', routeId);

  if (error) throw error;
  return count || 0;
};

const RouteComments = ({ routeId, routeName }: RouteCommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const { comments, addComment } = useComments(routeId);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment.mutateAsync({ text: newComment });
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Comments for {routeName}</h2>
      <Card className="p-4">
        <Textarea
          placeholder="Share your thoughts about this route..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-4"
        />
        <Button 
          onClick={handleSubmitComment}
          className="w-full"
          disabled={addComment.isPending}
        >
          {addComment.isPending ? "Posting..." : "Post Comment"}
        </Button>
      </Card>

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-4">
            <p className="text-gray-700 mb-2">{comment.text}</p>
            <p className="text-sm text-gray-500">
              {new Date(comment.created_at).toLocaleDateString()}{" "}
              {new Date(comment.created_at).toLocaleTimeString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RouteComments;
