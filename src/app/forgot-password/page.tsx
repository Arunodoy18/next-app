"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-[var(--bg-color)]">
      <Card className="w-full max-w-[450px] bg-[var(--card-bg)] border-[var(--border-color)] shadow-[0_8px_16px_rgba(0,0,0,0.1)] pt-12 pb-12 px-4 sm:px-8 rounded-xl relative overflow-hidden">
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
            <CardTitle className="heading-3 font-normal m-0 mb-4 text-[var(--text-color)]">
              Check Your Email
            </CardTitle>
            <p className="text-[var(--text-muted)] text-center mb-8 px-4">
              We have sent a password reset link to your email address. Please check your inbox and spam folder.
            </p>
            <Link href="https://placeholder.com" className="w-full">
              <Button type="button" className="w-full h-12 text-base font-semibold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white border-none transition-all shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:translate-y-0 active:shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                Back to Home
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <CardHeader className="text-center p-0 pb-8">
              <CardTitle className="heading-2 font-normal m-0 text-[var(--text-color)]">Reset Password</CardTitle>
              <CardDescription className="text-[var(--text-muted)] mt-2">
                Enter your email and we'll send you a reset link.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                  <Label className="text-[0.9rem] text-[var(--text-color)] font-medium" htmlFor="email">Email Address</Label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 text-[#888]" size={20} />
                    <Input 
                      className="pl-12 bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-color)] text-base h-12 rounded-lg placeholder:text-[#888] focus-visible:ring-[var(--primary)]" 
                      type="email" 
                      id="email" 
                      placeholder="Enter your email" 
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full h-12 text-base font-semibold mt-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white border-none transition-all shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:translate-y-0 active:shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                  Send Reset Link
                </Button>
                
                <div className="text-center mt-2">
                  <Link href="/login" className="text-[0.9rem] text-[var(--text-muted)] no-underline hover:text-[var(--primary)] transition-colors">
                    Back to Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
