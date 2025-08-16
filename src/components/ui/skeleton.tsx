import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rectangular';
}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50 anime-shimmer",
        className
      )}
      {...props}
    />
  );
}

// Specialized skeleton components for different UI elements
function CardSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("anime-card glass rounded-xl p-6 space-y-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-between items-center pt-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    </div>
  );
}

function TrackerSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("anime-card glass rounded-2xl p-6 space-y-6 h-full", className)} {...props}>
      {/* Header with archive button */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      
      {/* Timer display */}
      <div className="text-center space-y-2">
        <Skeleton className="h-12 w-32 mx-auto rounded-lg" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
      
      {/* Progress section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-12 mx-auto" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-12 mx-auto" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
      </div>
      
      {/* Action button */}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 min-h-[calc(100vh-12rem)] anime-slide-up">
      {/* Tabs skeleton - matches actual layout with add button */}
      <div className="flex items-center justify-between mb-8">
        <div className="glass bg-card/50 backdrop-blur-sm border-0 p-1 rounded-2xl shadow-lg flex space-x-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      
      {/* Grid of tracker skeletons - matches actual responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-fr">
        {Array.from({ length: 6 }).map((_, i) => (
          <TrackerSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-6 anime-slide-up">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="anime-card glass rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      
      {/* Chart skeleton */}
      <div className="anime-card glass rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24 rounded" />
        </div>
        <Skeleton className="h-64 w-full rounded" />
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  CardSkeleton, 
  TrackerSkeleton, 
  DashboardSkeleton, 
  StatsSkeleton 
};
