import Link from "next/link";
import connectToDatabase from "@/db/mongodb";
import ProgrammeModel from "@/models/programmeModel";
import type { Programme } from "@/types/programmeDoc";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ProgrammesPage() {
  await connectToDatabase();
  const programmes = await ProgrammeModel.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Available Programmes</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Browse our catalog of expert-led programmes and unlock new skills to advance your career.
          </p>
        </div>

        {programmes.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No programmes available right now. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programmes.map((prog: Programme) => (
              <Card key={prog._id.toString()} className="flex flex-col">
                <CardHeader className="flex-1">
                  <CardTitle className="text-xl">{prog.name}</CardTitle>
                  <CardDescription className="line-clamp-4 mt-2">
                    {prog.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/checkout/${prog.programmeId}`}>
                      Access Now
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
