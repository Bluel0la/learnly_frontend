
import { Skeleton } from "@/components/ui/skeleton";

export default function ResourcesPageSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      {/* Page header */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
      
      {/* Search card */}
      <div className="border rounded-xl p-6 mb-8">
        <div className="relative">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
      
      {/* Filter tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-18 rounded-full" />
          <Skeleton className="h-8 w-22 rounded-full" />
        </div>
      </div>
      
      {/* Documents grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-xl p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3 mb-3" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty state */}
      <div className="text-center py-12 border rounded-xl">
        <div className="text-6xl mb-4">📄</div>
        <Skeleton className="h-6 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-72 mx-auto mb-6" />
        <Skeleton className="h-10 w-40 mx-auto rounded-md" />
      </div>
    </div>
  );
}
