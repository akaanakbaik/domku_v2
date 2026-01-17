import React from 'react'

const Skeleton = ({ className }) => {
  return (
    <div className={`bg-blue-900/10 animate-pulse rounded-lg ${className}`}></div>
  )
}

export const TableSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-[#111318] border border-blue-900/10 p-4 rounded-xl flex items-center justify-between">
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    ))}
  </div>
)

export default Skeleton
