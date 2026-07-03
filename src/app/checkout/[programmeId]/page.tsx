import { notFound } from "next/navigation";
import connectToDatabase from "@/db/mongodb";
import Programme from "@/models/programmeModel";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

export default async function CheckoutPage({ params }: { params: Promise<{ programmeId: string }> }) {
  const { programmeId } = await params;

  await connectToDatabase();
  const programme = await Programme.findOne({ id: programmeId }).lean();

  if (!programme) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground mt-2">Complete your details to access this programme.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <CardDescription>Please enter your information to proceed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Payment processing is currently disabled.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  No payment required during this beta phase.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Section */}
          <div className="md:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium leading-none">{programme.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{programme.description}</p>
                </div>
                
                <div className="pt-4 border-t border-border flex justify-between items-center font-medium">
                  <span>Total</span>
                  <span>Free</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg">Access Now</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
