import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/ui/sidebar";
import { MusicCard } from "@/components/music-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Review } from "@shared/schema";

interface Recommendation {
  recommendations: string[];
  explanation: string;
}

export default function DiscoverPage() {
  const { toast } = useToast();

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const { data: recommendations, isPending: isLoadingRecommendations } = useQuery<Recommendation>({
    queryKey: ["/api/recommendations"],
    enabled: !!reviews?.length,
  });

  const createReviewMutation = useMutation({
    mutationFn: async (review: Partial<Review>) => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });
      if (!res.ok) throw new Error("Failed to save review");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review saved",
        description: "Your rating has been saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mock album data - would come from MusicBrainz in production
  const mockAlbumData = {
    coverUrl: "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=400&h=400&fit=crop",
    artistName: "The Imaginary Band",
    genres: ["Alternative", "Indie Rock"],
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Discover New Music</h1>
            <p className="text-muted-foreground">
              Personalized recommendations based on your taste
            </p>
          </div>
        </div>

        {isLoadingRecommendations ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        ) : (
          <>
            {recommendations && (
              <Card className="mb-8 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Why You'll Love These</h2>
                  </div>
                  <p className="text-muted-foreground">{recommendations.explanation}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations?.recommendations.map((album, index) => (
                <MusicCard
                  key={index}
                  albumTitle={album}
                  artistName={mockAlbumData.artistName}
                  coverUrl={mockAlbumData.coverUrl}
                  genres={mockAlbumData.genres}
                  onClick={() => {
                    createReviewMutation.mutate({
                      albumId: album,
                      rating: 0, // Would show rating dialog in production
                      review: "", // Would show review dialog in production
                    });
                  }}
                />
              ))}
            </div>
          </>
        )}

        {!reviews?.length && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Rating Music</h3>
            <p className="text-muted-foreground mb-4">
              Rate some albums to get personalized recommendations
            </p>
            <Button asChild variant="secondary">
              <a href="/">Go Rate Some Music</a>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
