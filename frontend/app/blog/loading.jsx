import { Navbar } from "@/components/features/navigation/navbar";
import { Footer } from "@/components/features/shared/footer";

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          {/* Hero section skeleton */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="w-48 h-6 bg-gray-200 animate-pulse rounded-full mb-4"></div>
            <div className="w-full h-10 bg-gray-200 animate-pulse rounded-lg mb-3"></div>
            <div className="w-3/4 h-10 bg-gray-200 animate-pulse rounded-lg mb-6"></div>
            
            <div className="w-full h-72 bg-gray-200 animate-pulse rounded-xl"></div>
          </div>
          
          {/* Filters skeleton */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="flex flex-wrap gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-24 h-8 bg-gray-200 animate-pulse rounded-full"></div>
              ))}
            </div>
            
            <div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
          
          {/* Articles grid skeleton */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col">
                <div className="w-full aspect-[4/3] bg-gray-200 animate-pulse rounded-lg mb-4"></div>
                <div className="w-24 h-5 bg-gray-200 animate-pulse rounded-full mb-3"></div>
                <div className="w-full h-6 bg-gray-200 animate-pulse rounded-lg mb-2"></div>
                <div className="w-3/4 h-6 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
                <div className="w-full h-4 bg-gray-200 animate-pulse rounded-lg mb-2"></div>
                <div className="w-full h-4 bg-gray-200 animate-pulse rounded-lg mb-3"></div>
                <div className="w-1/2 h-4 bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
