import React from 'react'

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-blue-900/20 rounded-lg ${className}`}></div>
  )
}

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#111318] border border-blue-900/20 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2 w-full">
            <Skeleton className="h-6 w-1/3" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default Skeleton
