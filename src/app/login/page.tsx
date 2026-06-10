import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { User, Lock } from 'lucide-react';

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-[var(--bg-color)]">
      <Card className="w-full max-w-[450px] bg-[var(--card-bg)] border-[var(--border-color)] shadow-[0_8px_16px_rgba(0,0,0,0.1)] pt-12 pb-12 px-4 sm:px-8 rounded-xl">
        <CardHeader className="text-center p-0 pb-8">
          <CardTitle className="heading-2 font-normal m-0 text-[var(--text-color)]">Academy Access</CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label className="text-[0.9rem] text-[var(--text-color)] font-medium" htmlFor="userid">User ID</Label>
              <div className="relative flex items-center">
                <User className="absolute left-4 text-[#888]" size={20} />
                <Input 
                  className="pl-12 bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-color)] text-base h-12 rounded-lg placeholder:text-[#888] focus-visible:ring-[var(--primary)]" 
                  type="text" 
                  id="userid" 
                  placeholder="Enter your User ID" 
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label className="text-[0.9rem] text-[var(--text-color)] font-medium" htmlFor="password">Password</Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-[#888]" size={20} />
                <Input 
                  className="pl-12 bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-color)] text-base h-12 rounded-lg placeholder:text-[#888] focus-visible:ring-[var(--primary)]" 
                  type="password" 
                  id="password" 
                  placeholder="Enter your password" 
                />
              </div>
            </div>
            
            <div className="flex justify-end -my-2">
              <Link href="#" className="text-[0.9rem] text-[var(--primary)] no-underline hover:text-[var(--primary-hover)] transition-colors">
                Forgot Password?
              </Link>
            </div>
            
            <Button type="button" className="w-full h-12 text-base font-semibold mt-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white border-none transition-all shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:translate-y-0 active:shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              Log In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
