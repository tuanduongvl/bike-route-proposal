import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface Comment {
  id: string;
  text: string;
  timestamp: Date;
  routeId: string;
}

interface RouteCommentsProps {
  routeId: string;
  routeName: string;
}

// Create a global store for comments to simulate persistence
const globalComments: Comment[] = [];

const RouteComments = ({ routeId, routeName }: RouteCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  // Load route-specific comments
  useEffect(() => {
    const routeComments = globalComments.filter(comment => comment.routeId === routeId);
    setComments(routeComments);
  }, [routeId]);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      timestamp: new Date(),
      routeId: routeId
    };

    // Add to global store
    globalComments.push(comment);
    // Update local state
    setComments(prev => [comment, ...prev]);
    setNewComment("");
    toast({
      title: "Comment added",
      description: "Your comment has been posted successfully.",
    });
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
        <Button onClick={handleSubmitComment} className="w-full">
          Post Comment
        </Button>
      </Card>

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-4">
            <p className="text-gray-700 mb-2">{comment.text}</p>
            <p className="text-sm text-gray-500">
              {comment.timestamp.toLocaleDateString()} {comment.timestamp.toLocaleTimeString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Export the function to get comments count for a specific route
export const getCommentsCount = (routeId: string): number => {
  return globalComments.filter(comment => comment.routeId === routeId).length;
};

export default RouteComments;