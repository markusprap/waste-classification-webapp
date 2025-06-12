// Service to fetch articles from the backend based on category

// Map waste classification categories to blog post categories
const categoryMapping = {
  // Main waste categories
  'cardboard': 'recycling',
  'glass': 'recycling',
  'metal': 'recycling',
  'paper': 'recycling',
  'plastic': 'recycling',
  'trash': 'general-waste',
  
  // Specific glass types
  'brown-glass': 'recycling',
  'green-glass': 'recycling',
  'white-glass': 'recycling',
  
  // Other categories
  'battery': 'e-waste',
  'biological': 'organic',
  'clothes': 'textile-recycling',
  'shoes': 'textile-recycling',
  'organic': 'organic',
  'other': 'general-waste'
};

// Map main classification categories to blog categories
const mainCategoryMapping = {
  'Daur Ulang': 'Daur Ulang', // Recyclable
  'Organik': 'Organik',      // Organic
  'Anorganik': 'Anorganik',  // Inorganic
  'B3': 'B3',                // Hazardous
  'Tekstil': 'Tekstil',      // Textile
  'Lainnya': 'Lainnya',      // Other
};

/**
 * Fetch articles by main category (prefer mainCategory, fallback to category)
 * @param {string} mainCategory - Main category from classification result
 * @param {string} category - Subcategory from classification result (optional)
 * @param {number} limit - Number of articles to fetch
 */
export async function fetchArticlesByMainCategory(mainCategory, category, limit = 3) {
  try {
    // Prefer mainCategory, fallback to category
    let blogCategory = mainCategoryMapping[mainCategory];
    if (!blogCategory && category) {
      // Fallback to old mapping if needed
      blogCategory = categoryMapping[category.toLowerCase()] || 'Lainnya';
    }
    if (!blogCategory) blogCategory = 'Lainnya';

    const res = await fetch(`/api/articles?category=${encodeURIComponent(blogCategory)}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    const data = await res.json();

    // Fallback to 'Lainnya' if no articles found
    if ((!data.articles || data.articles.length === 0) && blogCategory !== 'Lainnya') {
      const fallbackRes = await fetch(`/api/articles?category=Lainnya&limit=${limit}`);
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        return fallbackData.articles || [];
      }
    }
    return data.articles || [];
  } catch (err) {
    console.error('Error fetching articles:', err);
    return [];
  }
}

/**
 * Fetch articles from the backend based on category
 * @param {string} category - The category to fetch articles for
 * @param {number} limit - The number of articles to fetch
 * @returns {Promise<Array>} - A promise that resolves to an array of articles
 */
export async function fetchArticlesByCategory(category, limit = 3) {
  try {
    // Map the waste category to a blog category
    const blogCategory = categoryMapping[category.toLowerCase()] || 'general-waste';
    
    const res = await fetch(`/api/articles?category=${encodeURIComponent(blogCategory)}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    const data = await res.json();
    
    // If no articles found for the specific category, try to get general articles
    if ((!data.articles || data.articles.length === 0) && blogCategory !== 'general-waste') {
      console.log(`No articles found for category ${blogCategory}, trying general-waste`);
      const fallbackRes = await fetch(`/api/articles?category=general-waste&limit=${limit}`);
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        return fallbackData.articles || [];
      }
    }
    
    return data.articles || [];
  } catch (err) {
    console.error('Error fetching articles:', err);
    return [];
  }
}
