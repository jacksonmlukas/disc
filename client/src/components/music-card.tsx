import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface MusicCardProps {
  albumTitle: string;
  artistName: string;
  coverUrl: string;
  rating?: number;
  genres?: string[];
  onClick?: () => void;
}

export function MusicCard({
  albumTitle,
  artistName,
  coverUrl,
  rating,
  genres = [],
  onClick,
}: MusicCardProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <img
          src={coverUrl}
          alt={`${albumTitle} by ${artistName}`}
          className="w-full h-48 object-cover"
        />
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{albumTitle}</h3>
        <p className="text-muted-foreground mb-2">{artistName}</p>
        {rating && (
          <div className="flex items-center mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? "fill-primary text-primary" : "text-muted"
                }`}
              />
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1">
          {genres.map((genre) => (
            <Badge key={genre} variant="secondary">
              {genre}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
