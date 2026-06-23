"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { User, Lock, ChevronLeft, Loader2 } from 'lucide-react';
import PageTitle from '@/components/page-title';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      router.push(data.home);
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-background relative">
      <PageTitle title="Login" />
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-[#7e55f6]">
        <ChevronLeft size={20} />
        <span className="font-medium">Back to Home</span>
      </Link>

      <Card className="w-full max-w-[450px] shadow-lg pt-12 pb-12 px-4 sm:px-8 rounded-xl">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl leading-[1] font-normal m-0">Academy Access</CardTitle>
          <p className="text-sm text-muted-foreground mt-3 m-0">
            Sign in with your credentials to continue
          </p>
        </CardHeader>

        <CardContent className="p-0">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium" htmlFor="username">Username</Label>
              <div className="relative flex items-center">
                <User className="absolute left-4 text-muted-foreground" size={20} />
                <Input
                  className="pl-12 text-base h-12 rounded-lg"
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium" htmlFor="password">Password</Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-muted-foreground" size={20} />
                <Input
                  className="pl-12 text-base h-12 rounded-lg"
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 -my-2">{error}</p>
            )}

            <div className="flex justify-end -my-2">
              <Link href="/forgot" className="text-sm text-muted-foreground hover:text-[#7e55f6] hover:underline hover:underline-offset-4 transition-colors">
                Forgot Credentials?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold mt-2 bg-[#7e55f6] hover:bg-[#6742d4] text-white shadow-md"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Log In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
