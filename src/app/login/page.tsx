import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { User, Lock, ChevronLeft } from 'lucide-react';

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 bg-background relative">
      <Link href="/" className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 text-muted-foreground hover:text-[#7e55f6] transition-colors">
        <ChevronLeft size={20} />
        <span className="font-medium">Back to Home</span>
      </Link>
      
      <Card className="w-full max-w-[450px] shadow-lg pt-12 pb-12 px-4 sm:px-8 rounded-xl">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl leading-[1] font-normal m-0">Academy Access</CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium" htmlFor="userid">User ID</Label>
              <div className="relative flex items-center">
                <User className="absolute left-4 text-muted-foreground" size={20} />
                <Input 
                  className="pl-12 text-base h-12 rounded-lg" 
                  type="text" 
                  id="userid" 
                  placeholder="Enter your User ID" 
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
                />
              </div>
            </div>
            
            <div className="flex justify-end -my-2">
              <Link href="#" className="text-sm text-muted-foreground hover:text-[#7e55f6] hover:underline hover:underline-offset-4 transition-colors">
                Forgot Password?
              </Link>
            </div>
            
            <Button type="button" className="w-full h-12 text-base font-semibold mt-2 bg-[#7e55f6] hover:bg-[#6742d4] text-white border-none transition-all shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:translate-y-0 active:shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              Log In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
