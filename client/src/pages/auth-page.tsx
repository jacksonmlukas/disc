import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Music4, AlertCircle, CheckCircle2 } from "lucide-react";
import { Redirect } from "wouter";
import { Separator } from "@/components/ui/separator";
import { SiSpotify } from "react-icons/si";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  
  // Get URL query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const error = searchParams.get("error");
  const success = searchParams.get("success");
  
  // Show toast notifications for OAuth-related messages
  useEffect(() => {
    if (error) {
      let errorMessage = "Authentication failed";
      
      // Map error codes to user-friendly messages
      switch (error) {
        case "spotify-auth-failed":
          errorMessage = "Spotify authentication failed. Please try again.";
          break;
        case "spotify-link-failed":
          errorMessage = "Failed to link your Spotify account. Please try again.";
          break;
        case "spotify-link-failed-no-user":
          errorMessage = "Session expired. Please log in and try again.";
          break;
        case "spotify-already-linked":
          errorMessage = "This Spotify account is already linked to another user.";
          break;
        default:
          errorMessage = "An error occurred during authentication. Please try again.";
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
    
    if (success) {
      let successMessage = "Authentication successful";
      
      // Map success codes to user-friendly messages
      switch (success) {
        case "spotify-linked":
          successMessage = "Your Spotify account has been linked successfully!";
          break;
        default:
          successMessage = "Authentication successful!";
      }
      
      toast({
        title: "Success",
        description: successMessage,
        variant: "default",
      });
    }
  }, [error, success, toast]);
  
  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      location: "",
    },
  });

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}>
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-6">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Remember me</FormLabel>
                            <FormDescription>
                              Keep me logged in on this device
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      Login
                    </Button>
                  </form>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-2 text-sm text-muted-foreground">
                        or continue with
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => window.location.href = "/api/auth/spotify"}
                  >
                    <SiSpotify className="text-[#1DB954]" size={18} />
                    <span>Continue with Spotify</span>
                  </Button>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))}>
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem className="mb-6">
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="City, Country" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      Register
                    </Button>
                  </form>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-2 text-sm text-muted-foreground">
                        or continue with
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => window.location.href = "/api/auth/spotify"}
                  >
                    <SiSpotify className="text-[#1DB954]" size={18} />
                    <span>Sign up with Spotify</span>
                  </Button>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="text-center">
          <Music4 className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Welcome to Disc</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Your personal music discovery platform. Rate albums, discover new music,
            and find live events near you.
          </p>
        </div>
      </div>
    </div>
  );
}
