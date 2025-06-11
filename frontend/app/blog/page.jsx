'use client';

import { useState, useEffect, useCallback } from 'react';
import ArticleCard from '@/components/blog/ArticleCard';
import BlogFilters from '@/components/blog/BlogFilters';
import Pagination from '@/components/blog/Pagination';
import { Loader2, BookOpen, Lightbulb, Recycle, Search, Filter } from 'lucide-react';
import { Navbar } from '@/components/features/navigation/navbar';
import { Footer } from '@/components/features/shared/footer';
import { ScrollToTop } from '@/components/features/shared/scroll-to-top';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    page: 1
  });

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: '12'
      });
        if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();

      if (response.ok) {
        setArticles(data.articles);
        setPagination(data.pagination);
      } else {
        console.error('Error fetching articles:', data.error);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`/api/articles/categories`);
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filter changes
    }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Header Section - Minimal and Modern */}
      <header className="pt-24 pb-10 px-4 bg-white border-b border-gray-100">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl font-serif font-bold mb-3 text-gray-900">
            EcoWaste Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Panduan mendalam dan inspirasi untuk gaya hidup berkelanjutan dan pengelolaan sampah yang efektif.
          </p>
        </div>
      </header>

      {/* Search and Filter Bar - Sticky */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm transition-all duration-200">
        <div className="container mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="relative flex-grow max-w-2xl">
            <input
              type="text"
              placeholder="Cari artikel..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-gray-500 focus:ring-0 outline-none transition-all text-gray-900"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            {filters.search && (
              <button 
                onClick={() => handleFilterChange({ search: '' })}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Clear search</span>
                &times;
              </button>
            )}
          </div>
          <button
            onClick={toggleFilters}
            className={`ml-3 flex items-center px-3 py-2 rounded-full border ${showFilters ? 'bg-gray-100 text-gray-900 border-gray-300' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Filter</span>
          </button>
        </div>
      </div>

      {/* Filters Panel - Collapsible */}
      {showFilters && (
        <div className="sticky top-32 z-30 bg-gray-50 border-b border-gray-200 transition-all duration-200">
          <div className="container mx-auto max-w-5xl px-4 py-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleFilterChange({ category: '' })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.category === '' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Semua
              </button>
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleFilterChange({ category: category.name })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.category === category.name 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
            {filters.category && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => handleFilterChange({ category: '' })}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Reset filter
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto max-w-5xl px-4 py-10">
        {/* Results Summary */}
        {!loading && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold text-gray-900">
                {filters.search || filters.category ? (
                  <>
                    {filters.search && `Hasil pencarian "${filters.search}"`}
                    {filters.category && !filters.search && `Kategori: ${filters.category}`}
                  </>
                ) : (
                  <>Artikel Terbaru</>
                )}
              </h2>
              <p className="text-sm text-gray-500">
                {pagination.total} artikel • Halaman {pagination.current} dari {pagination.pages}
              </p>
            </div>
          </div>
        )}

        {/* Featured Article - First Article Highlight */}
        {!loading && articles.length > 0 && !filters.search && !filters.category && pagination.current === 1 && (
          <div className="mb-12">            <Link href={`/blog/${articles[0].slug}`} className="group">              
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4">
                <Image 
                  src={articles[0].coverImage 
                    ? (articles[0].coverImage.startsWith('http') 
                      ? articles[0].coverImage 
                      : `/uploads/articles/${articles[0].coverImage.replace(/^.*[\\\/]/, '')}`)
                    : '/images/placeholder.jpg'} 
                  alt={articles[0].title}
                  width={1200}
                  height={675}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  {articles[0].category}
                </span>
                <h3 className="text-2xl font-serif font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                  {articles[0].title}
                </h3>
                <p className="text-gray-600 line-clamp-2">
                  {articles[0].excerpt}
                </p>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <span>{new Date(articles[0].createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="mx-2">•</span>
                  <span>{articles[0].readTime || 5} menit baca</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mr-3" />
            <span className="text-gray-600 font-medium">Memuat artikel...</span>
          </div>
        )}

        {/* Articles Grid - Modern and Clean */}
        {!loading && articles.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-12">
              {(pagination.current === 1 && !filters.search && !filters.category 
                ? articles.slice(1) // Skip first article if it's featured
                : articles
              ).map((article) => (                <Link href={`/blog/${article.slug}`} key={article.id} className="group flex flex-col h-full">                  
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                    <Image 
                      src={article.coverImage 
                        ? (article.coverImage.startsWith('http') 
                          ? article.coverImage 
                          : `/uploads/articles/${article.coverImage.replace(/^.*[\\\/]/, '')}`)
                        : '/images/placeholder.jpg'}
                      alt={article.title}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="space-y-2 flex-grow">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {article.category}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-3">
                    <span>{new Date(article.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="mx-2">•</span>
                    <span>{article.readTime || 5} menit baca</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination - Minimalist */}
            <div className="flex justify-center mt-12 border-t border-gray-100 pt-10">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={!pagination.hasPrev}
                  className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                    pagination.hasPrev 
                      ? 'text-gray-700 hover:bg-gray-100' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-full transition-colors ${
                      page === pagination.current
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={!pagination.hasNext}
                  className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                    pagination.hasNext 
                      ? 'text-gray-700 hover:bg-gray-100' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {/* Empty State - Clean and Helpful */}
        {!loading && articles.length === 0 && (
          <div className="text-center py-24 border border-gray-100 rounded-xl bg-gray-50">
            <div className="max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2">
                Tidak Ada Artikel Ditemukan
              </h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.category 
                  ? 'Coba ubah filter pencarian Anda atau gunakan kata kunci yang berbeda.'
                  : 'Belum ada artikel yang tersedia saat ini.'
                }
              </p>
              {(filters.search || filters.category) && (
                <button
                  onClick={() => handleFilterChange({ category: '', search: '' })}
                  className="px-5 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  Lihat Semua Artikel
                </button>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Newsletter - Medium-style */}
      <section className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="container mx-auto max-w-xl px-4 text-center">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            Dapatkan artikel terbaru langsung ke inbox Anda
          </h2>
          <p className="text-gray-600 mb-6">
            Berlangganan newsletter kami untuk mendapatkan inspirasi dan panduan tentang pengelolaan sampah dan gaya hidup berkelanjutan.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Alamat email Anda"
              className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-500 focus:ring-0 outline-none"
            />
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Berlangganan
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Kami menghormati privasi Anda. Anda dapat berhenti berlangganan kapan saja.
          </p>
        </div>
      </section>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
}
