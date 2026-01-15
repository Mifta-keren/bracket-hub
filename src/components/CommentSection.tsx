import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useComments, useAddComment, useDeleteComment, Comment } from '@/hooks/useBrackets';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface CommentSectionProps {
  bracketId: string;
}

const CommentSection = ({ bracketId }: CommentSectionProps) => {
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useComments(bracketId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addComment.mutate(
      { bracketId, content: newComment },
      { onSuccess: () => setNewComment('') }
    );
  };

  const handleDelete = (commentId: string) => {
    deleteComment.mutate({ commentId, bracketId });
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none bg-background/50"
            />
            <Button 
              type="submit" 
              disabled={addComment.isPending || !newComment.trim()}
              className="rounded-full"
            >
              <Send className="mr-2 h-4 w-4" />
              Post Comment
            </Button>
          </form>
        ) : (
          <div className="text-center py-4 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-2">Sign in to leave a comment</p>
            <Link to="/auth">
              <Button variant="outline" size="sm" className="rounded-full">
                Sign In
              </Button>
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.id}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onDelete: (id: string) => void;
}

const CommentItem = ({ comment, currentUserId, onDelete }: CommentItemProps) => {
  const isOwner = currentUserId === comment.user_id;
  const username = comment.profiles?.username || 'Anonymous';

  return (
    <div className="flex gap-3 p-4 rounded-lg bg-muted/30">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{username}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-foreground/90">{comment.content}</p>
      </div>
    </div>
  );
};

export default CommentSection;
