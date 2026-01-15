import { useParams, Link } from 'react-router-dom';
import { useBracket, useUserLoves, useToggleLove } from '@/hooks/useBrackets';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommentSection from '@/components/CommentSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Heart, 
  Download, 
  Users, 
  Printer,
  Share2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const BracketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: bracket, isLoading } = useBracket(id || '');
  const { data: userLoves = [] } = useUserLoves();
  const toggleLove = useToggleLove();
  
  const isLoved = bracket ? userLoves.includes(bracket.id) : false;

  const handleLove = () => {
    if (!user) {
      toast({ title: 'Please sign in to love brackets', variant: 'destructive' });
      return;
    }
    if (bracket) {
      toggleLove.mutate({ bracketId: bracket.id, isLoved });
    }
  };

  const handleDownload = () => {
    toast({ title: 'Download started!', description: 'Your bracket PDF is being prepared.' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: bracket?.title,
        text: bracket?.description || '',
        url: window.location.href
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!bracket) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Bracket not found</h1>
            <p className="text-muted-foreground mb-4">The bracket you're looking for doesn't exist.</p>
            <Link to="/">
              <Button>Go back home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to brackets
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative aspect-video overflow-hidden rounded-xl border border-border/50">
                <img
                  src={bracket.image_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800'}
                  alt={bracket.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground">
                  {bracket.category}
                </Badge>
              </div>

              <div>
                <h1 className="text-3xl font-bold mb-3">{bracket.title}</h1>
                <p className="text-muted-foreground text-lg">{bracket.description}</p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  <Users className="mr-2 h-4 w-4" />
                  {bracket.participants} Participants
                </Badge>
              </div>

              <CommentSection bracketId={bracket.id} />
            </div>

            <div className="space-y-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="lg"
                        className={cn(
                          "gap-2",
                          isLoved && "text-red-500 hover:text-red-600"
                        )}
                        onClick={handleLove}
                      >
                        <Heart className={cn("h-5 w-5", isLoved && "fill-current")} />
                        <span className="font-semibold">{bracket.loves_count}</span>
                      </Button>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Download className="h-5 w-5" />
                        <span className="font-semibold">{bracket.downloads_count}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      className="w-full rounded-full gap-2" 
                      size="lg"
                      onClick={handleDownload}
                    >
                      <Download className="h-5 w-5" />
                      Download PDF
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full rounded-full gap-2" 
                      size="lg"
                      onClick={handlePrint}
                    >
                      <Printer className="h-5 w-5" />
                      Print Bracket
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full rounded-full gap-2"
                      onClick={handleShare}
                    >
                      <Share2 className="h-5 w-5" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BracketDetail;
