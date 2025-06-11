'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function BlogFilters({ onFilterChange, categories = [] }) {
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    onFilterChange({
      category: activeCategory,
      search: searchQuery
    });
  }, [activeCategory, searchQuery, onFilterChange]);

  const handleCategoryChange = (category) => {
    setActiveCategory(activeCategory === category ? '' : category);
  };

  const clearFilters = () => {
    setActiveCategory('');
    setSearchQuery('');
  };

  const hasActiveFilters = activeCategory || searchQuery;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari artikel tentang pengolahan sampah..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Category Filters */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Kategori</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryChange(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === category.name
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Filter aktif:</span>
            {activeCategory && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md">
                {activeCategory}
              </span>
            )}
            {searchQuery && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                "{searchQuery}"
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4 mr-1" />
            Hapus Filter
          </button>
        </div>
      )}
    </div>
  );
}
