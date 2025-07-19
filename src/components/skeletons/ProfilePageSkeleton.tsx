
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePageSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-6 px-2 md:px-4">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4">
        <Skeleton className="h-8 sm:h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
      
      {/* Main Content Grid */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile card column - 1/3 width */}
        <div className="w-full md:w-1/3 order-2 md:order-1">
          {/* Profile card */}
          <div className="relative z-0 p-0 overflow-visible bg-white rounded-xl border shadow">
            <div className="py-8 px-5 flex flex-col items-center bg-gradient-to-b from-white/80 to-blue-50 rounded-xl">
              <Skeleton className="h-24 w-24 rounded-full mb-3" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-3 w-24 mb-5" />
              
              {/* Profile info section */}
              <div className="w-full space-y-2">
                <div className="flex justify-between items-center py-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex justify-between items-center py-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="flex justify-between items-center py-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Delete Account Button */}
          <div className="mt-4">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
        
        {/* Tabbed content - 2/3 width */}
        <div className="w-full md:w-2/3 order-1 md:order-2">
          {/* Tabs */}
          <div className="w-full flex overflow-x-auto rounded-lg bg-gray-100 border mb-2 sm:mb-4 gap-1 px-1 py-0">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
          
          {/* Tab content */}
          <div className="bg-white rounded-xl border shadow">
            <div className="p-6">
              <Skeleton className="h-6 w-40 mb-6" />
              
              {/* Stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
                <div className="p-4 border rounded-xl">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-8 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="p-4 border rounded-xl">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-12 mb-1" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <div className="p-4 border rounded-xl">
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-6 w-6 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              
              {/* Flashcard Statistics */}
              <div className="mt-6">
                <Skeleton className="h-5 w-36 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="p-4 border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🃏</span>
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-6 w-8 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="p-4 border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📚</span>
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-6 mb-1" />
                    <Skeleton className="h-3 w-18" />
                  </div>
                </div>
              </div>
              
              {/* Subject Progress */}
              <div className="mt-6">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <Skeleton className="h-4 w-20" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-2 w-24 rounded-full" />
                        <Skeleton className="h-4 w-8" />
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
