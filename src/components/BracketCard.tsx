import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Download, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserLoves, useToggleLove, Bracket } from '@/hooks/useBrackets';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BracketCardProps {
  bracket: Bracket;
}

const BracketCard = ({ bracket }: BracketCardProps) => {
  const { user } = useAuth();
  const { data: userLoves = [] } = useUserLoves();
  const toggleLove = useToggleLove();
  
  const isLoved = userLoves.includes(bracket.id);

  const handleLove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({ title: 'Please sign in to love brackets', variant: 'destructive' });
      return;
    }
    
    toggleLove.mutate({ bracketId: bracket.id, isLoved });
  };

  return (
    <Link to={`/bracket/${bracket.id}`}>
      <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={bracket.image_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400'}
            alt={bracket.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
            {bracket.category}
          </Badge>
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur">
              <Users className="mr-1 h-3 w-3" />
              {bracket.participants} slots
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {bracket.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {bracket.description}
          </p>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5 px-2",
                  isLoved && "text-red-500 hover:text-red-600"
                )}
                onClick={handleLove}
              >
                <Heart className={cn("h-4 w-4", isLoved && "fill-current")} />
                <span>{bracket.loves_count}</span>
              </Button>
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Download className="h-4 w-4" />
                <span>{bracket.downloads_count}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BracketCard;
