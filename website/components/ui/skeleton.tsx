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
    <div className={cn("anime-card glass border-0 bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden h-[400px]", className)} {...props}>
      <div className="relative bg-card rounded-xl m-px h-full flex flex-col">
        {/* Header - matches CardHeader */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-3 border-b border-border/50 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="space-y-1 min-w-0 flex-1">
              <Skeleton className="h-4 w-3/4" /> {/* Tracker name */}
              <div className="h-4">
                <Skeleton className="h-3 w-1/2" /> {/* Description */}
              </div>
            </div>
            <Skeleton className="h-5 w-12 rounded-full" /> {/* Status badge */}
          </div>
        </div>

        {/* Content - matches CardContent */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="space-y-3 flex-1">
            {/* Timer Display */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center">
                <Skeleton className="h-8 w-24 rounded-lg" /> {/* Timer */}
              </div>
              <div className="flex items-center justify-center gap-1">
                <Skeleton className="h-3 w-16" /> {/* Goal text */}
              </div>
            </div>

            {/* Work Days */}
            <div className="flex justify-center gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="w-6 h-6 rounded-md" />
              ))}
            </div>
          </div>

          {/* Work Stats - Always at bottom */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="glass rounded-md p-2 text-center space-y-1 border border-destructive/20">
              <Skeleton className="h-3 w-8 mx-auto" />
              <Skeleton className="h-4 w-6 mx-auto" />
            </div>
            <div className="glass rounded-md p-2 text-center space-y-1 border border-success/20">
              <Skeleton className="h-3 w-10 mx-auto" />
              <Skeleton className="h-4 w-6 mx-auto" />
            </div>
          </div>
        </div>

        {/* Footer - matches CardFooter */}
        <div className="p-3 pt-0 space-y-2 flex-shrink-0">
          {/* Primary Actions */}
          <div className="flex gap-2 w-full">
            <Skeleton className="flex-1 h-8 rounded" /> {/* Start button */}
            <Skeleton className="flex-1 h-8 rounded" /> {/* Stop button */}
          </div>
          
          {/* Archive Action */}
          <Skeleton className="h-8 w-full rounded" /> {/* Archive button */}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 min-h-[calc(100vh-12rem)] anime-slide-up">
      {/* Tabs skeleton - matches actual layout with 3 tabs and buttons */}
      <div className="flex items-center justify-between mb-2">
        <div className="glass bg-card/50 backdrop-blur-sm border-0 p-1 rounded-2xl shadow-lg flex">
          <Skeleton className="h-10 w-36 rounded-xl mr-1" /> {/* Active Trackers */}
          <Skeleton className="h-10 w-24 rounded-xl mr-1" /> {/* Statistics */}
          <Skeleton className="h-10 w-20 rounded-xl" /> {/* Archives */}
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <Skeleton className="h-10 w-10 rounded-xl" />
          {/* Add Task Button */}
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>
      
      {/* Grid of tracker skeletons - matches actual custom grid layout */}
      <div 
        className="grid gap-6 auto-rows-fr"
        style={{
          gridTemplateColumns: "repeat(auto-fit, 250px)",
        }}
      >
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
