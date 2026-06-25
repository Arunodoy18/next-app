"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Mail, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setIsSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-background relative">
      <Link href="/login" className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-[#7e55f6]">
        <ChevronLeft size={20} />
        <span className="font-medium">Back to Login</span>
      </Link>

      <Card className="w-full max-w-[450px] shadow-lg pt-10 pb-10 px-6 sm:px-8 rounded-xl">
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <CheckCircle2 className="w-14 h-14 text-green-500 mb-4" />
            <CardTitle className="text-xl font-semibold m-0 mb-2">
              Check Your Email
            </CardTitle>
            <p className="text-muted-foreground text-center mb-6 text-sm">
              We have emailed a password reset link to your inbox. Please check your inbox and spam folder.
            </p>
            <Link href="/" className="w-full">
              <Button type="button" className="w-full h-10">
                Back to Home
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <CardHeader className="text-center pb-4 px-0">
              <CardTitle className="text-3xl leading-tight font-normal m-0">Reset Password</CardTitle>
              <CardDescription className="mt-1.5 text-sm">
                Enter your email and we&apos;ll send you the reset link.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium" htmlFor="email">Email Address</Label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 text-muted-foreground" size={20} />
                    <Input
                      className="pl-12 h-10"
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full mt-4 h-10">
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Send Reset Link'}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
