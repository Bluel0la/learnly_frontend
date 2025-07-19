
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPageSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* ChatMessages component skeleton */}
      <div className="flex-1 min-h-0">
        <div className="h-full flex flex-col">
          {/* Hero section skeleton */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md space-y-6">
              <div className="flex justify-center">
                <Skeleton className="h-20 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-64 mx-auto" />
                <Skeleton className="h-5 w-80 mx-auto" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 border rounded-xl">
                  <Skeleton className="h-5 w-6 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="p-4 border rounded-xl">
                  <Skeleton className="h-5 w-6 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="p-4 border rounded-xl">
                  <Skeleton className="h-5 w-6 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="p-4 border rounded-xl">
                  <Skeleton className="h-5 w-6 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ChatInput component skeleton */}
      <div className="flex-shrink-0">
        <div className="p-4 border-t bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 items-end">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
