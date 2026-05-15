import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import accountService from "@/api/account";
import { Loader2, Lock, ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !userId) {
        toast({
          variant: "destructive",
          title: "Invalid Link",
          description: "The password reset link is invalid or expired.",
        });
        navigate("/login");
        return;
      }

      try {
        await accountService.confirmResetPassword(userId, token);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Invalid or Expired Link",
          description: "This password reset link is no longer valid.",
        });
        navigate("/login");
      }
    };

    verifyToken();
  }, [token, userId, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Passwords do not match.",
      });
    }

    setIsLoading(true);
    try {
      await accountService.newPassword({
        userId: userId,
        token: token,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      });

      toast({
        title: "Success",
        description: "Your password has been reset successfully.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: error.response?.data || "Could not reset password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Set New Password
          </CardTitle>
          <p className="text-muted-foreground text-center">
            Enter your new password below.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              Update Password
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" asChild className="w-full">
            <Link to="/login" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
