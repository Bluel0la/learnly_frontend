
import { Skeleton } from "@/components/ui/skeleton";

export default function FlashcardsPageSkeleton() {
  return (
    <div className="container px-3 md:px-4 py-4 md:py-6 lg:py-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-2xl md:text-3xl">🎓</span>
          <Skeleton className="h-6 md:h-8 w-32 md:w-40" />
          {/* Online status indicator */}
          <div className="ml-2 flex items-center px-2 py-1 rounded-full bg-gray-100">
            <Skeleton className="h-2 w-2 rounded-full mr-1" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        
        <Skeleton className="h-10 w-full sm:w-32 rounded-md" />
      </div>
      
      {/* Loading spinner area */}
      <div className="flex justify-center py-8 mb-8">
        <Skeleton className="h-6 w-6 md:h-8 md:w-8 rounded-full" />
      </div>
      
      {/* Deck cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-xl p-4 hover:shadow-lg transition-all duration-300">
            {/* Card header */}
            <div className="pb-2 px-0 pt-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg md:text-xl">🃏</span>
                <Skeleton className="h-4 md:h-5 w-3/4" />
              </div>
            </div>
            
            {/* Card content */}
            <div className="space-y-3 md:space-y-4 px-0 pb-0">
              <Skeleton className="h-3 md:h-4 w-full" />
              
              {/* Primary buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
              
              {/* Secondary actions */}
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        ))}
        
        {/* Empty state placeholder */}
        <div className="col-span-full border rounded-xl p-6 md:p-8 text-center">
          <div className="text-4xl md:text-6xl mb-4">📚</div>
          <Skeleton className="h-4 md:h-5 w-48 mx-auto mb-2" />
          <Skeleton className="h-3 md:h-4 w-64 mx-auto mb-4" />
          <Skeleton className="h-10 w-40 mx-auto rounded-md" />
        </div>
      </div>
    </div>
  );
}
