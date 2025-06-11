import Link from 'next/link';
import Image from 'next/image';
import { convertUnsplashUrl } from '@/utils/image-utils';
import { Clock, Eye, Calendar, Tag } from 'lucide-react';

export default function ArticleCard({ article }) {
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

  return (
    <article className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={article.coverImage 
            ? (article.coverImage.startsWith('http') 
              ? article.coverImage 
              : `/uploads/articles/${article.coverImage.replace(/^.*[\\\/]/, '')}`)
            : '/images/placeholders/placeholder.jpg'}
          alt={article.title}          
          width={800}
          height={600}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <Link href={`/blog/${article.slug}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-green-600 transition-colors">
            {article.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {article.excerpt}
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {article.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(article.createdAt)}
            </div>
            {article.readTime && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {article.readTime} min
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            {article.viewCount || 0}
          </div>
        </div>

        {/* Read More Button */}
        <div className="mt-4">
          <Link 
            href={`/blog/${article.slug}`}
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm group"
          >
            Baca Selengkapnya
            <svg 
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
