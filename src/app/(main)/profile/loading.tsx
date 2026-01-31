import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-6 w-32 mx-auto mt-4" />
            <Skeleton className="h-4 w-48 mx-auto mt-2" />
            <Skeleton className="h-5 w-20 mx-auto mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full mt-6" />
          </CardContent>
        </Card>

        {/* Activity */}
        <div className="lg:col-span-2">
          <Skeleton className="h-10 w-96 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-24 mt-2" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-2 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
