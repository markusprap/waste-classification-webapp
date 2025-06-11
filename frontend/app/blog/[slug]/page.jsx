"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, Eye, Calendar, Tag, Share2, BookOpen } from 'lucide-react';
import ArticleCard from '@/components/blog/ArticleCard';
import { Navbar } from '@/components/features/navigation/navbar';
import { Footer } from '@/components/features/shared/footer';
import { ScrollToTop } from '@/components/features/shared/scroll-to-top';
import { useLoadingState } from '@/hooks/use-loading-state';

export default function ArticleDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { withLoading } = useLoadingState();

  const formatContent = (content) => {
    if (!content) return '';
    
    // Split content into paragraphs
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        // Handle empty paragraphs
        if (!paragraph.trim()) return '';
        
        // Check if paragraph is a heading (starts with # for markdown)
        if (paragraph.startsWith('#')) {
          const level = paragraph.match(/^#+/)[0].length;
          const text = paragraph.replace(/^#+\s/, '');
          return `<h${level}>${text}</h${level}>`;
        }
        
        // Handle lists
        if (paragraph.trim().startsWith('- ')) {
          const items = paragraph.split('\n').map(item => 
            `<li>${item.replace(/^-\s/, '')}</li>`
          ).join('');
          return `<ul>${items}</ul>`;
        }
        
        if (paragraph.trim().startsWith('1.')) {
          const items = paragraph.split('\n').map(item => 
            `<li>${item.replace(/^\d+\.\s/, '')}</li>`
          ).join('');
          return `<ol>${items}</ol>`;
        }
        
        // Handle normal paragraphs
        // Replace single newlines with <br> within paragraphs
        return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
      })
      .join('\n');
  };
  useEffect(() => {    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles/slug/${params.slug}`);
        const data = await response.json();

        if (response.ok) {
          setArticle(data);
          setRelatedArticles(data.relatedArticles || []);
        } else {
          setError(data.error || 'Article not found');
        }
      } catch (err) {
        setError('Failed to fetch article');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      withLoading(fetchArticle);
    }
  }, [params.slug, withLoading]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Daur Ulang': 'bg-green-100 text-green-800',
      'Pengomposan': 'bg-yellow-100 text-yellow-800',
      'Pengelolaan Plastik': 'bg-blue-100 text-blue-800',
      'Zero Waste': 'bg-purple-100 text-purple-800',
      'Teknologi': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link artikel telah disalin!');
    }  };  if (loading && !article) {
    return null; // The global loader will show instead
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h1 className="text-2xl font-serif font-bold text-gray-900 mb-3">Artikel Tidak Ditemukan</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link 
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Blog
            </Link>
          </div>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    );
  }

  return (    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Back Button */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto max-w-5xl px-4 py-4">
            <Link 
              href="/blog"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Blog
            </Link>
          </div>
        </div>        {/* Article Header */}
        <article className="bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              {/* Category */}
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                  {article.category}
                </span>
              </div>              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight" style={{ fontFamily: 'Charter, Bitstream Charter, Sitka Text, Cambria, serif' }}>
                {article.title}
              </h1>              {/* Meta Information */}
              <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(article.createdAt)}
                </div>
                <span className="mx-2">•</span>
                {article.readTime && (
                  <>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {article.readTime} menit baca
                    </div>
                    <span className="mx-2">•</span>
                  </>
                )}
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {article.viewCount} views
                </div>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="ml-auto inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  <span className="text-sm">Bagikan</span>
                </button>
              </div>              {/* Cover Image */}
              {article.coverImage && (
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-8">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </article>        {/* Article Content */}
        <div className="bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto"><div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
              />{/* Tags */}
              {article.tags && (
                <div className="mt-12 pt-6 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.split(',').map((tag) => (
                      <span 
                        key={tag.trim()}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="bg-gray-50 border-t border-gray-100 py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8 text-center">
                  Artikel Terkait
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {relatedArticles.map((article) => (
                    <Link href={`/blog/${article.slug}`} key={article.id} className="group flex flex-col h-full">
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                        <img 
                          src={article.coverImage || '/images/placeholders/placeholder.jpg'} 
                          alt={article.title}
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
              </div>
            </div>
          </section>
        )}

        {/* Newsletter Section */}
        <section className="bg-white border-t border-gray-100 py-16">
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
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
}
