import { Navbar } from "@/components/features/navigation/navbar";
import { Footer } from "@/components/features/shared/footer";

export default function LoadingArticlePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Back Button Skeleton */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto max-w-5xl px-4 py-4">
            <div className="w-32 h-6 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
        
        {/* Article Header Skeleton */}
        <article className="bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              {/* Category */}
              <div className="mb-4">
                <div className="w-24 h-6 bg-gray-200 animate-pulse rounded-full"></div>
              </div>
              
              {/* Title */}
              <div className="w-full h-10 bg-gray-200 animate-pulse rounded-lg mb-3"></div>
              <div className="w-3/4 h-10 bg-gray-200 animate-pulse rounded-lg mb-6"></div>
              
              {/* Meta Information */}
              <div className="flex space-x-4 mb-6 pb-4 border-b border-gray-100">
                <div className="w-24 h-4 bg-gray-200 animate-pulse rounded-full"></div>
                <div className="w-24 h-4 bg-gray-200 animate-pulse rounded-full"></div>
                <div className="w-24 h-4 bg-gray-200 animate-pulse rounded-full"></div>
              </div>
              
              {/* Cover Image */}
              <div className="w-full aspect-[16/9] bg-gray-200 animate-pulse rounded-xl mb-8"></div>
            </div>
          </div>
        </article>
        
        {/* Article Content Skeleton */}
        <div className="bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-4 mb-12">
                <div className="w-full h-4 bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="w-full h-4 bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="w-full h-4 bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="w-full h-4 bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="w-full h-4 bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="w-5/6 h-4 bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
              
              {/* Tags Skeleton */}
              <div className="mt-12 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-20 h-6 bg-gray-200 animate-pulse rounded-full"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles Skeleton */}
        <section className="bg-gray-50 border-t border-gray-100 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="w-48 h-8 bg-gray-200 animate-pulse rounded-lg mx-auto mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col">
                    <div className="w-full aspect-[4/3] bg-gray-200 animate-pulse rounded-lg mb-4"></div>
                    <div className="w-24 h-5 bg-gray-200 animate-pulse rounded-full mb-3"></div>
                    <div className="w-full h-6 bg-gray-200 animate-pulse rounded-lg mb-2"></div>
                    <div className="w-3/4 h-6 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
                    <div className="w-1/2 h-4 bg-gray-200 animate-pulse rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
