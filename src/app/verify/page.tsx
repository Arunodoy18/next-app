"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeNameSchema, type ChangeNameInput } from "@/schema/settingsSchema";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [policyDialog, setPolicyDialog] = useState<"privacy" | "cookie" | "tos" | null>(null);
  const [countdown, setCountdown] = useState(3);

  const { isLoading: checkingToken, isError, data: tokenData } = useQuery({
    queryKey: ["verify-token", token],
    queryFn: async () => {
      const res = await fetch(`/api/auth/verify?token=${token}`);
      if (!res.ok) throw new Error("Invalid token");
      return res.json() as Promise<{ valid: boolean; name: string }>;
    },
    enabled: !!token,
    retry: false,
  });

  const form = useForm<ChangeNameInput>({
    resolver: zodResolver(changeNameSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (tokenData?.name) form.setValue("name", tokenData.name);
  }, [tokenData?.name, form]);

  const verifyMutation = useMutation<{ home: string }, Error, string>({
    mutationFn: async (name) => {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name }),
      });
      if (!res.ok) throw new Error("Failed to verify");
      return res.json();
    },
    onSuccess: () => {},
    onError: () => {
      toast.error("Invalid or expired verification link");
    },
  });

  useEffect(() => {
    if (!verifyMutation.isSuccess) return;
    const t = setTimeout(() => {
      if (countdown <= 1) router.push(verifyMutation.data!.home);
      else setCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [verifyMutation.isSuccess, verifyMutation.data, countdown, router]);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-background">
        <Card className="w-full max-w-[450px] shadow-lg pt-8 pb-8 px-6 sm:px-8 rounded-xl">
          <CardHeader className="pb-4 px-0">
            <XCircle size={40} className="text-red-500 mb-2" />
            <CardTitle className="text-2xl leading-tight font-normal m-0">Invalid Link</CardTitle>
            <p className="text-sm text-muted-foreground mt-1.5 m-0">This verification link is missing or invalid</p>
          </CardHeader>
          <CardContent className="p-0">
            <Button onClick={() => router.push("/login")} className="w-full h-10">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkingToken) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-background">
        <Card className="w-full max-w-[450px] shadow-lg pt-8 pb-8 px-6 sm:px-8 rounded-xl">
          <CardHeader className="pb-4 px-0">
            <Loader2 size={40} className="animate-spin text-[#7e55f6] mb-2" />
            <CardTitle className="text-2xl leading-tight font-normal m-0">Checking Your Invitation</CardTitle>
            <p className="text-sm text-muted-foreground mt-1.5 m-0">
              We&apos;re verifying your invitation link. This takes a moment.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-background">
        <Card className="w-full max-w-[450px] shadow-lg pt-8 pb-8 px-6 sm:px-8 rounded-xl">
          <CardHeader className="pb-4 px-0">
            <XCircle size={40} className="text-red-500 mb-2" />
            <CardTitle className="text-2xl leading-tight font-normal m-0">Invalid or Expired Link</CardTitle>
            <p className="text-sm text-muted-foreground mt-1.5 m-0">This verification link is no longer valid</p>
          </CardHeader>
          <CardContent className="p-0">
            <Button onClick={() => router.push("/login")} className="w-full h-10">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifyMutation.isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-background">
        <Card className="w-full max-w-[450px] shadow-lg pt-8 pb-8 px-6 sm:px-8 rounded-xl">
          <CardHeader className="pb-4 px-0">
            <CheckCircle2 size={40} className="text-green-500 mb-2" />
            <CardTitle className="text-2xl leading-tight font-normal m-0">Account Ready</CardTitle>
            <p className="text-sm text-muted-foreground mt-1.5 m-0">Your account has been set up successfully.</p>
          </CardHeader>
          <CardContent className="p-0">
            <Button className="w-full h-10 gap-2" onClick={() => router.push(verifyMutation.data!.home)}>
              Continue ({countdown}s) <ArrowRight size={15} />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-background">
      <Card className="w-full max-w-[450px] shadow-lg pt-8 pb-8 px-6 sm:px-8 rounded-xl">
        <CardHeader className="pb-4 px-0">
          <CardTitle className="text-3xl leading-tight font-normal m-0">Set Up Your Account</CardTitle>
          <p className="text-sm text-muted-foreground mt-1.5 m-0">
            Confirm your name to finish setting up your account.
          </p>
        </CardHeader>

        <CardContent className="p-0">
          <form
              onSubmit={form.handleSubmit((data) => verifyMutation.mutate(data.name))}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="name"
                  className="h-10"
                  placeholder="Enter your full name"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <span className="text-xs text-red-500">{form.formState.errors.name.message}</span>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <Checkbox
                  checked={acceptedPolicy}
                  onCheckedChange={(checked) => setAcceptedPolicy(checked as boolean)}
                />
                <span className="text-xs text-muted-foreground">
                  I agree to the{" "}
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPolicyDialog("privacy"); }} className="text-foreground font-medium hover:underline underline-offset-4 cursor-pointer inline">Privacy Policy</button>
                  {", "}
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPolicyDialog("cookie"); }} className="text-foreground font-medium hover:underline underline-offset-4 cursor-pointer inline">Cookie Policy</button>
                  {", and "}
                  <button type="button" onClick={(e) => { e.stopPropagation(); setPolicyDialog("tos"); }} className="text-foreground font-medium hover:underline underline-offset-4 cursor-pointer inline">Terms of Service</button>
                </span>
              </label>

              <Button
                type="submit"
                className="w-full mt-4 h-10"
                disabled={verifyMutation.isPending || !acceptedPolicy}
              >
                {verifyMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : "Complete Setup"}
              </Button>
            </form>
        </CardContent>

      </Card>

      <Dialog open={policyDialog !== null} onOpenChange={(open) => !open && setPolicyDialog(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {policyDialog === "privacy" ? "Privacy Policy" : policyDialog === "cookie" ? "Cookie Policy" : "Terms of Service"}
            </DialogTitle>
            <DialogDescription>
              {policyDialog === "tos" ? "Last Updated: 27.06.2026" : "Last Updated: 10.10.2024"}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-4 mt-2">
            {policyDialog === "tos" ? (
              <>
                <p>Welcome to The Blackmont Academy!</p>
                <p>These terms and conditions outline the rules and regulations for the use of The Blackmont Academy&apos;s Website, located at theblackmontacademy.com.</p>

                <h3 className="text-foreground font-semibold text-sm">1. Terms</h3>
                <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use The Blackmont Academy if you do not agree to take all of the terms and conditions stated on this page.</p>

                <h3 className="text-foreground font-semibold text-sm">2. License</h3>
                <p>Unless otherwise stated, The Blackmont Academy and/or its licensors own the intellectual property rights for all material on The Blackmont Academy. All intellectual property rights are reserved. You may access this from The Blackmont Academy for your own personal use subjected to restrictions set in these terms and conditions.</p>

                <h3 className="text-foreground font-semibold text-sm">3. User Responsibilities</h3>
                <p>You must not:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Republish material from The Blackmont Academy</li>
                  <li>Sell, rent or sub-license material from The Blackmont Academy</li>
                  <li>Reproduce, duplicate or copy material from The Blackmont Academy</li>
                  <li>Redistribute content from The Blackmont Academy</li>
                </ul>

                <h3 className="text-foreground font-semibold text-sm">4. Modifications</h3>
                <p>The Blackmont Academy reserves the right to revise these terms at any time as it sees fit, and by using this Website you are expected to review these terms on a regular basis.</p>

                <h3 className="text-foreground font-semibold text-sm">Contact Us</h3>
                <p>If you have any questions about these Terms of Service, please contact us at contact@theblackmontacademy.com</p>
              </>
            ) : policyDialog === "privacy" ? (
              <>
                <p>Welcome to The Blackmont Academy!</p>
                <p>This Privacy Policy explains how The Blackmont Academy (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, maintains, and discloses information gathered from users (each, a &quot;User&quot;) of our website and any associated services.</p>

                <h3 className="text-foreground font-semibold text-sm">Information We Collect</h3>

                <h4 className="text-foreground font-medium text-sm">Personal Identification Information</h4>
                <p>We may collect personal identification information from Users in various ways, including but not limited to when Users visit our site, fill out a form, subscribe to our newsletter, or engage in other activities or services we offer. Users may be asked for their name, email address, phone number, and other relevant information.</p>

                <h4 className="text-foreground font-medium text-sm">Non-personal Identification Information</h4>
                <p>We may also collect non-personal identification information about Users whenever they interact with our site. Non-personal identification information may include the browser name, the type of computer, and technical information about Users&apos; means of connection to our site.</p>

                <h3 className="text-foreground font-semibold text-sm">How We Use Collected Information</h3>
                <p>The Blackmont Academy may collect and use Users&apos; personal information for the following purposes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong className="text-foreground">To improve customer service:</strong> Information you provide helps us respond to your customer service requests and support needs more efficiently.</li>
                  <li><strong className="text-foreground">To personalize user experience:</strong> We may use information in the aggregate to understand how our Users as a group use the services and resources provided on our site.</li>
                  <li><strong className="text-foreground">To improve our site:</strong> We continually strive to improve our website offerings based on the information and feedback we receive from you.</li>
                  <li><strong className="text-foreground">To send periodic emails:</strong> We may use the email address to respond to inquiries, questions, and/or other requests.</li>
                </ul>

                <h3 className="text-foreground font-semibold text-sm">How We Protect Your Information</h3>
                <p>We adopt appropriate data collection, storage, and processing practices, as well as security measures, to protect against unauthorized access, alteration, disclosure, or destruction of your personal information, username, password, transaction information, and data stored on our site.</p>

                <h3 className="text-foreground font-semibold text-sm">Sharing Your Personal Information</h3>
                <p>We do not sell, trade, or rent Users&apos; personal identification information to others.</p>

                <h3 className="text-foreground font-semibold text-sm">Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please contact us at contact@theblackmontacademy.com</p>
              </>
            ) : (
              <>
                <p>Welcome to The Blackmont Academy. This Cookie Policy explains how we use cookies and similar technologies on our website. By using our website, you consent to the use of cookies as described in this policy.</p>

                <h3 className="text-foreground font-semibold text-sm">What are Cookies?</h3>
                <p>Cookies are small text files placed on your device when you visit a website. They help make the website function effectively, provide a better user experience, and analyze website performance.</p>

                <h3 className="text-foreground font-semibold text-sm">Types of Cookies We Use</h3>

                <h4 className="text-foreground font-medium text-sm">Essential Cookies</h4>
                <p>These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website. The website cannot function properly without these cookies.</p>

                <h4 className="text-foreground font-medium text-sm">Analytical Cookies</h4>
                <p>We use analytical cookies to understand how visitors interact with our website. These cookies help us analyze and improve the performance of our site. We may use Google Analytics or similar tools for this purpose.</p>

                <h4 className="text-foreground font-medium text-sm">Marketing Cookies</h4>
                <p>Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user.</p>

                <h3 className="text-foreground font-semibold text-sm">How to Manage Cookies</h3>
                <p>You can control and/or delete cookies as you wish. Most browsers allow you to manage cookies through their settings. However, if you choose to disable or delete certain cookies, the functionality of our website may be impaired.</p>

                <h3 className="text-foreground font-semibold text-sm">Third-Party Cookies</h3>
                <p>We may use third-party services that may also place cookies on your device. These third-party services are governed by their own privacy policies.</p>

                <h3 className="text-foreground font-semibold text-sm">Contact Us</h3>
                <p>If you have any questions about this Cookie Policy, please contact us at contact@theblackmontacademy.com</p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center px-4"><Card className="w-full max-w-lg"><CardHeader className="flex items-center justify-center py-12"><Loader2 className="animate-spin" size={24} /></CardHeader></Card></div>}>
      <VerifyPageContent />
    </Suspense>
  );
}
