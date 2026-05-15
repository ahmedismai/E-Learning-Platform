import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import accountService from "@/api/account";
import { useAuth } from "@/contexts/AuthContext";

const ConfirmEmail = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const token = searchParams.get("token");
    const queryEmail = searchParams.get("email");
    const stateEmail = location.state?.email;
    if (token) {
      setCode(token);
    }
    if (queryEmail) {
      setEmail(queryEmail);
    } else if (stateEmail) {
      setEmail(stateEmail);
    }
  }, [searchParams, location.state]);

  useEffect(() => {
    const token = searchParams.get("token");
    const queryEmail = searchParams.get("email");
    const userId = searchParams.get("userId");
    
    if (token && userId && email && code) {
      handleConfirm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, email, code]);

  async function handleConfirm(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const token = searchParams.get("token") || code;
    const userId = searchParams.get("userId");

    if (!userId || !token) {
      return toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please use the confirmation link sent to your email.",
      });
    }
    setIsLoading(true);
    try {
      await accountService.confirmEmail(userId, token);
      
      toast({ title: "Email confirmed successfully! You can now login." });
      navigate("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Confirmation failed",
        description:
          error.response?.data || "An error occurred during verification.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleResend = async () => {
    if (!email) {
      return toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email to resend the code.",
      });
    }
    setIsResending(true);
    try {
      await accountService.resendConfirmEmail(email);
      toast({ title: "Confirmation email has been resent." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to resend",
        description:
          error.response?.data?.message || "Could not resend confirmation email.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Confirm Your Email
          </CardTitle>
          <p className="text-muted-foreground text-center">
            Enter your email and the code sent to your inbox.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConfirm} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Confirmation Token"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Confirm Email"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">Didn't receive a code?</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? "Resending..." : "Resend Confirmation Email"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmail;
