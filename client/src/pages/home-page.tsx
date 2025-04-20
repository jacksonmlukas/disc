import { useQuery } from "@tanstack/react-query";
import { Review } from "@shared/schema";
import { MusicCard } from "@/components/music-card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Layout } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user?.username}</h1>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/discover">Discover Music</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/events">Find Events</Link>
            </Button>
            {user?.isAdmin && (
              <Button asChild variant="outline">
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reviews?.map((review) => (
            <MusicCard
              key={review.id}
              albumTitle={review.albumId}
              artistName="Artist Name" // Would come from MusicBrainz
              coverUrl="https://via.placeholder.com/300"
              rating={review.rating}
              genres={["Rock", "Alternative"]} // Would come from MusicBrainz
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
