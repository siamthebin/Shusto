export default function ProvidersLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-10 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
          <div className="h-6 bg-gray-100 rounded-lg w-2/3 animate-pulse"></div>
        </div>

        {/* Search bar skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-12 bg-gray-100 rounded-lg w-full animate-pulse"></div>
        </div>

        {/* Tab buttons skeleton */}
        <div className="mb-8 flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse flex-shrink-0"></div>
          ))}
        </div>

        {/* Cards grid skeleton */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded-lg w-full animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded-lg w-2/3 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
