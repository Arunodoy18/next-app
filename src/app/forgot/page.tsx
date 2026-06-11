"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Mail, CheckCircle2, ChevronLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-background relative">
      <Link href="/login" className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-[#7e55f6]">
        <ChevronLeft size={20} />
        <span className="font-medium">Back to Login</span>
      </Link>

      <Card className="w-full max-w-[450px] shadow-lg pt-12 pb-12 px-4 sm:px-8 rounded-xl">
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
            <CardTitle className="text-2xl font-normal m-0 mb-4">
              Check Your Email
            </CardTitle>
            <p className="text-muted-foreground text-center mb-8 px-4">
              We have emailed a password reset link to your inbox. Please check your inbox and spam folder.
            </p>
            <Link href="/" className="w-full">
              <Button type="button" className="w-full h-12 text-base font-semibold bg-[#7e55f6] hover:bg-[#6742d4] text-white shadow-md">
                Back to Home
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-4xl leading-[1] font-normal m-0">Reset Password</CardTitle>
              <CardDescription className="mt-2">
                Enter your email and we&apos;ll send you the reset link.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium" htmlFor="email">Email Address</Label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 text-muted-foreground" size={20} />
                    <Input
                      className="pl-12 text-base h-12 rounded-lg"
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base font-semibold mt-2 bg-[#7e55f6] hover:bg-[#6742d4] text-white shadow-md">
                  Send Reset Link
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
