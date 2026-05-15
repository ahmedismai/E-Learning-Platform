import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Passwords do not match",
      });
    }

    setIsLoading(true);
    try {
      await register(fullName, email, password, confirmPassword);

      toast({
        title: "Registration successful!",
        description: "Please check your email to confirm your account.",
      });

      navigate("/confirm-email", { state: { email } });
    } catch (error) {
      console.error("Registration Error:", error.response?.data);
      
      // Handle ModelState errors from ASP.NET
      let errorMsg = "Something went wrong";
      if (typeof error.response?.data === 'object') {
        const errors = error.response.data;
        errorMsg = Object.values(errors).flat().join(". ");
      } else if (typeof error.response?.data === 'string') {
        errorMsg = error.response.data;
      }

      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMsg,
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
            Create an account
          </CardTitle>
          <p className="text-muted-foreground text-center">
            Join LearnHub to start your journey
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-center w-full text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Login
            </Link>
          </p>
          <p className="text-sm text-center w-full text-muted-foreground">
            Have a confirmation code?{" "}
            <Link
              to="/confirm-email"
              className="text-primary hover:underline font-medium"
            >
              Confirm Email
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
