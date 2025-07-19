
import { Skeleton } from "@/components/ui/skeleton";

export default function QuizzesPageSkeleton() {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto py-4 lg:py-8 px-4">
        {/* Quiz Selection Section */}
        <div className="space-y-8">
          {/* Hero section with icon and title */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <Skeleton className="h-10 w-80 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
            
            {/* Feature cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border rounded-xl p-6 text-center shadow-sm">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-40 mx-auto" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Mode selection tabs */}
          <div className="flex justify-center">
            <div className="flex bg-white border rounded-lg p-1 gap-1 shadow-sm">
              <Skeleton className="h-12 w-40 rounded-md" />
              <Skeleton className="h-12 w-40 rounded-md" />
            </div>
          </div>
          
          {/* Quiz selector form */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <Skeleton className="h-7 w-48 mb-6" />
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </div>
          </div>
          
          {/* Performance Analytics Section */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-12">
            {/* Performance Tracking Card */}
            <div className="xl:col-span-1">
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-14" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-md mt-4" />
                </div>
              </div>
            </div>
            
            {/* Recent Activities */}
            <div className="xl:col-span-3">
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <Skeleton className="h-6 w-36 mb-4" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-12 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
