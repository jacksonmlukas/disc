import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Music, Calendar, Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { User, Artist, Album, Event } from "@shared/schema";
import { useLocation } from "wouter";

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Check if user is admin and redirect if not
  useEffect(() => {
    if (!authLoading && user && user.isAdmin !== true) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin area.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, authLoading, setLocation, toast]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    // Will be redirected by ProtectedRoute
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Authentication required. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="artists">
            <Music className="mr-2 h-4 w-4" />
            Artists
          </TabsTrigger>
          <TabsTrigger value="albums">
            <Music className="mr-2 h-4 w-4" />
            Albums
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="mr-2 h-4 w-4" />
            Events
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UsersPanel />
        </TabsContent>
        
        <TabsContent value="artists">
          <ArtistsPanel />
        </TabsContent>
        
        <TabsContent value="albums">
          <AlbumsPanel />
        </TabsContent>
        
        <TabsContent value="events">
          <EventsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsersPanel() {
  const { toast } = useToast();
  
  const { 
    data: users, 
    isLoading, 
    error 
  } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    throwOnError: false,
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number, isAdmin: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}`, { isAdmin });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User permissions updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load users</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Management</CardTitle>
        <CardDescription>Manage user accounts and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>List of all registered users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email || "—"}</TableCell>
                <TableCell>
                  {user.isAdmin ? (
                    <Badge variant="default" className="bg-green-600">Admin</Badge>
                  ) : (
                    <Badge variant="outline">User</Badge>
                  )}
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAdminMutation.mutate({ userId: user.id, isAdmin: !user.isAdmin })}
                    disabled={toggleAdminMutation.isPending}
                  >
                    {toggleAdminMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : user.isAdmin ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {user.isAdmin ? " Remove Admin" : " Make Admin"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ArtistsPanel() {
  const { toast } = useToast();
  
  const { 
    data: artists, 
    isLoading, 
    error 
  } = useQuery<Artist[]>({
    queryKey: ["/api/admin/artists"],
    throwOnError: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load artists</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Artists Management</CardTitle>
          <CardDescription>Manage music artists in the system</CardDescription>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Artist
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>List of all artists</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Genres</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artists && artists.map((artist) => (
              <TableRow key={artist.id}>
                <TableCell>{artist.id}</TableCell>
                <TableCell className="font-medium">{artist.name}</TableCell>
                <TableCell>
                  {artist.genres && artist.genres.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {artist.genres.map((genre, i) => (
                        <Badge key={i} variant="secondary">{genre}</Badge>
                      ))}
                    </div>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AlbumsPanel() {
  const { toast } = useToast();
  
  const { 
    data: albums, 
    isLoading, 
    error 
  } = useQuery<Album[]>({
    queryKey: ["/api/admin/albums"],
    throwOnError: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load albums</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Albums Management</CardTitle>
          <CardDescription>Manage music albums in the system</CardDescription>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Album
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>List of all albums</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cover</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {albums && albums.map((album) => (
              <TableRow key={album.id}>
                <TableCell>{album.id}</TableCell>
                <TableCell>
                  {album.coverUrl ? (
                    <img 
                      src={album.coverUrl} 
                      alt={album.title} 
                      className="w-12 h-12 object-cover rounded-md" 
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                      <Music className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{album.title}</TableCell>
                <TableCell>{album.artistId}</TableCell>
                <TableCell>
                  {album.releaseDate ? new Date(album.releaseDate as Date).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function EventsPanel() {
  const { toast } = useToast();
  
  const { 
    data: events, 
    isLoading, 
    error 
  } = useQuery<Event[]>({
    queryKey: ["/api/admin/events"],
    throwOnError: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load events</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Events Management</CardTitle>
          <CardDescription>Manage music events in the system</CardDescription>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>List of all events</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events && events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.id}</TableCell>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{event.artistName}</TableCell>
                <TableCell>{event.venue}</TableCell>
                <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}