import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, Music2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function EventsPage() {
  const { user } = useAuth();
  const [location, setLocation] = useState(user?.location || "");

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events", location],
    enabled: !!location,
  });

  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger refetch by updating location
    setLocation(location);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Live Events Near You</h1>
          <form onSubmit={handleLocationSearch} className="flex gap-4 max-w-lg">
            <Input
              placeholder="Enter location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-primary/5 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                      <div className="flex items-center text-muted-foreground">
                        <Music2 className="w-4 h-4 mr-1" />
                        <span>{event.artistName}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{format(new Date(event.date), "PPP 'at' p")}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="secondary">
                    Get Tickets
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {events?.length === 0 && (
          <div className="text-center py-12">
            <Music2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
            <p className="text-muted-foreground">
              Try searching for a different location or check back later
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
