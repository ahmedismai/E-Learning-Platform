import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import api from "@/api/axios";
import accountService from "@/api/account";
import { Loader2, User, Mail, Shield, Camera, Save } from "lucide-react";

const Profile = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await accountService.getProfile();
        const data = response.data;
        setProfileData({
          fullName: data.fullName || "",
          email: data.email || "",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile details.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await accountService.updateProfile(profileData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        // Update local user state
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
           <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and account settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-sm h-fit">
          <CardHeader className="text-center pb-2">
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                <User className="w-16 h-16 text-slate-300" />
              </div>
              <button className="absolute bottom-1 right-1 p-2 rounded-full bg-primary text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <CardTitle>{profileData.fullName}</CardTitle>
            <CardDescription>{user?.role}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
               <Shield className="w-4 h-4 text-primary" />
               <span>Member since Jan 2026</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
               <Mail className="w-4 h-4 text-primary" />
               <span className="truncate">{profileData.email}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Update your public profile information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground">Email cannot be changed directly.</p>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6 bg-muted/10">
            <Button 
              className="ml-auto flex items-center gap-2 px-8" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
