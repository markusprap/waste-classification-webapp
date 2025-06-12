"use client"

import Link from "next/link"
import { useLanguage } from "@/models/language-context"
import { useEffect, useState } from "react"
import { fetchArticlesByMainCategory } from "@/services/articleService"
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
      <div className="flex justify-center py-12">
        <span className="text-emerald-600 font-medium animate-pulse">{t('classify.analyzing', 'Loading articles...')}</span>
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex justify-center py-12">
        <span className="text-red-600 font-medium">{error}</span>
      </div>
    )
  }
  if (!articles || articles.length === 0) {
    return null
  }

  return (
    <section className="bg-gradient-to-b from-emerald-50 to-white py-12">
      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center space-x-2 mb-2">
            <div className="w-10 h-1 bg-emerald-400 rounded"></div>
            <div className="text-emerald-600 font-medium text-sm uppercase tracking-wider">
              {t('classify.knowledgeHub', 'Knowledge Hub')}
            </div>
            <div className="w-10 h-1 bg-emerald-400 rounded"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {t('classify.recommendedArticles', 'Read More About This Waste Type')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('classify.articleDescription', 'Explore our curated articles to learn more about proper waste management techniques for this type of waste.')}
          </p>
        </div>
        {articles.length > 3 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="!pb-12"
          >
            {articles.map(article => (
              <SwiperSlide key={article.slug || article.id}>
                <ArticleCard article={article} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map(article => (
              <ArticleCard key={article.slug || article.id} article={article} />
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link 
            href="/blog" 
            className="inline-flex items-center px-5 py-2.5 font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            {t('classify.viewAllArticles', 'View All Articles')}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

function ArticleCard({ article }) {
  const { t } = useLanguage()
  
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden border border-gray-100 hover:border-emerald-400"
    >
      {article.coverImage && (
        <div className="h-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
          <img 
            src={article.coverImage} 
            alt={article.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center mb-3">
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            {article.category || 'Article'}
          </span>
          {article.readTime && (
            <span className="ml-2 text-xs text-gray-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {article.readTime} min read
            </span>
          )}
        </div>
        <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-emerald-700 transition-colors duration-200">
          {article.title}
        </h3>
        <div className="text-gray-600 text-sm line-clamp-3 mb-3">
          {article.excerpt}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-emerald-600 font-medium group-hover:text-emerald-700">
            {t('classify.readMore', 'Read article')} 
            <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1 inline-block">→</span>
          </div>
          {article.createdAt && (
            <div className="text-xs text-gray-400">
              {new Date(article.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
