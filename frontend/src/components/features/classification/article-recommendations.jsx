"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import { useLanguage } from "@/models/language-context"
import { fetchArticlesByMainCategory } from "@/services/articleService"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

export function ArticleRecommendations({ mainCategory, category }) {
  const { t } = useLanguage()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!mainCategory && !category) {
      setArticles([])
      return
    }
    setLoading(true)
    setError(null)
    fetchArticlesByMainCategory(mainCategory, category)
      .then(setArticles)
      .catch((err) => setError(err.message || 'Error fetching articles'))
      .finally(() => setLoading(false))
  }, [mainCategory, category])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('classify.analyzing', 'Loading articles...')}</span>
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex justify-center py-24">
        <span className="text-red-600 font-bold bg-red-50 px-6 py-3 rounded-2xl border border-red-100">{error}</span>
      </div>
    )
  }
  if (!articles || articles.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-24 border-t border-gray-50">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg text-emerald-700 font-black text-[10px] uppercase tracking-widest mb-4 border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Knowledge Center
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 tracking-tight">
              {t('classify.recommendedArticles', 'Learn more about this waste')}
            </h2>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">
              {t('classify.articleDescription', 'Deepen your impact with expert insights on managing and repurposing these materials correctly.')}
            </p>
          </div>
          <Link
            href="/blog"
            className="group flex items-center gap-3 px-8 py-4 bg-gray-50 hover:bg-emerald-600 text-gray-900 hover:text-white rounded-2xl font-bold transition-all duration-300"
          >
            {t('classify.viewAllArticles', 'Explore Blog')}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <div className="relative">
          {articles.length > 3 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={32}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="!pb-16 article-swiper"
            >
              {articles.map((article, idx) => (
                <SwiperSlide key={article.slug || article.id}>
                  <div className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <ArticleCard article={article} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, idx) => (
                <div key={article.slug || article.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        .article-swiper .swiper-pagination-bullet { width: 12px; height: 6px; border-radius: 3px; background: #e5e7eb; transition: all 0.3s; }
        .article-swiper .swiper-pagination-bullet-active { width: 32px; background: #059669; }
        .article-swiper .swiper-button-next, .article-swiper .swiper-button-prev { background: white; width: 48px; height: 48px; border-radius: 16px; color: #111827; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #f3f4f6; }
        .article-swiper .swiper-button-next:after, .article-swiper .swiper-button-prev:after { font-size: 18px; font-weight: 900; }
        .article-swiper .swiper-button-disabled { opacity: 0; }
      `}</style>
    </section>
  )
}

function ArticleCard({ article }) {
  const { t } = useLanguage()

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-700 overflow-hidden"
    >
      {article.coverImage && (
        <div className="h-64 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
          />
          <div className="absolute top-6 left-6 z-20">
            <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-xs font-black uppercase tracking-wider text-gray-900 shadow-sm">
              {article.category || 'Guide'}
            </span>
          </div>
        </div>
      )}
      <div className="p-8">
        <div className="flex items-center gap-4 mb-4">
          {article.readTime && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {article.readTime} MIN READ
            </span>
          )}
          {article.createdAt && (
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
              {new Date(article.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}
        </div>
        <h3 className="font-extrabold text-2xl mb-4 text-gray-900 group-hover:text-emerald-600 transition-colors duration-300 leading-tight">
          {article.title}
        </h3>
        <p className="text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed mb-6">
          {article.excerpt}
        </p>
        <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="text-sm font-black text-gray-900 flex items-center gap-2 group-hover:gap-4 transition-all duration-300">
            {t('classify.readMore', 'CONTINUE READING')}
            <span className="text-emerald-500 font-black text-xl leading-none">→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

