'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/features/navigation/navbar';
import { Footer } from '@/components/features/shared/footer';
import { ScrollToTop } from '@/components/features/shared/scroll-to-top';
import { Save, Loader2, Plus, Trash, FileText, LockKeyhole } from 'lucide-react';
import Image from 'next/image';
import { convertUnsplashUrl } from '@/utils/image-utils';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

function BlogAdmin() {
  const router = useRouter();
  const [adminPass, setAdminPass] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Daur Ulang',
    tags: '',
    author: 'Tim EcoWaste',
    readTime: 5,
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [deletingArticleId, setDeletingArticleId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const categories = [
    'Daur Ulang',
    'Organik',
    'Anorganik',
    'B3',
    'Tekstil',
    'Lainnya',
    'Pengomposan',
    'Pengelolaan Plastik',
    'Zero Waste',
    'Teknologi',
    'Tips & Trik',
    'Edukasi',
  ];
  
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const generateExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    
    const cleanText = content
      .replace(/#+\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/<[^>]+>/g, '');
      
    const firstParagraph = cleanText.split('\n\n')[0];
    
    if (firstParagraph.length <= maxLength) {
      return firstParagraph;
    }
    
    return firstParagraph.substring(0, maxLength).trim() + '...';
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'coverImage' && value.includes('unsplash.com/photos/')) {
      const convertedUrl = convertUnsplashUrl(value);
      setFormData(prev => ({ ...prev, [name]: convertedUrl }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'title') {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
    
    if (name === 'content') {
      setFormData(prev => ({ ...prev, excerpt: generateExcerpt(value) }));
    }
  };
  
  const fetchArticles = async () => {
    setLoadingArticles(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/articles`);
      const data = await response.json();
      
      if (response.ok) {
        setArticles(data.articles);
        setFilteredArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoadingArticles(false);
    }
  };
  
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredArticles(articles);
      return;
    }
    
    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = articles.filter(article => 
      article.title.toLowerCase().includes(lowercasedSearch) ||
      article.category.toLowerCase().includes(lowercasedSearch) ||
      (article.tags && article.tags.toLowerCase().includes(lowercasedSearch))
    );
    
    setFilteredArticles(filtered);
  }, [searchTerm, articles]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      if (!imageFile) {
        setMessage({
          text: 'Mohon upload gambar cover artikel terlebih dahulu.',
          type: 'error',
        });
        setIsSubmitting(false);
        return;
      }
      
      const formDataToSend = new FormData();
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/admin/articles`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: 'Artikel berhasil ditambahkan!',
          type: 'success',
        });
        setFormData({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          category: 'Daur Ulang',
          tags: '',
          author: 'Tim EcoWaste',
          readTime: 5,
        });
        setImagePreview('');
        setImageFile(null);
        fetchArticles();
      } else {
        throw new Error(data.error || 'Terjadi kesalahan saat menambahkan artikel.');
      }
    } catch (error) {
      setMessage({
        text: `Error: ${error.message}`,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArticle = async (id) => {
    setArticleToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return;
    setDeletingArticleId(articleToDelete);
    setMessage({ text: '', type: '' });
    setShowDeleteDialog(false);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/admin/articles/${articleToDelete}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ text: 'Artikel berhasil dihapus!', type: 'success' });
        setShowSuccessDialog(true);
        fetchArticles();
      } else {
        setMessage({ text: `Error: ${data.error || 'Terjadi kesalahan saat menghapus artikel.'}`, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    } finally {
      setDeletingArticleId(null);
      setArticleToDelete(null);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (adminPass === 'ecowaste2025') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Kata sandi admin tidak valid!');
    }
  };
  
  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth') === 'true';
    setIsAuthenticated(isAuth);
  }, []);
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({
        text: 'Mohon upload file gambar (JPG, PNG, atau WebP)',
        type: 'error'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        text: 'Ukuran file terlalu besar. Maksimal 5MB.',
        type: 'error'
      });
      return;
    }

    setImageFile(file);
    
    setImagePreview(URL.createObjectURL(file));
    setMessage({
      text: 'Gambar siap diupload bersama artikel',
      type: 'success'
    });
  };
  
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        
        <main className="flex-grow flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
            <div className="text-center mb-6">              <div className="bg-gray-100 p-3 rounded-full inline-flex">
                <LockKeyhole className="w-8 h-8 text-gray-700" />
              </div>
              <h1 className="text-2xl font-serif font-bold mt-4 text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Masukkan kata sandi untuk mengakses dashboard admin blog.
              </p>
            </div>

            <form onSubmit={handleAdminAuth}>
              <div className="mb-4">
                <label htmlFor="adminPass" className="block text-sm font-medium text-gray-700 mb-1">
                  Kata Sandi Admin
                </label>
                <input
                  type="password"
                  id="adminPass"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Masukkan kata sandi"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Masuk
              </button>
            </form>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <header className="pt-24 pb-6 px-4 bg-white border-b border-gray-100">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-serif font-bold mb-2 text-gray-900">
            Dashboard Admin Blog
          </h1>
          <p className="text-gray-600">
            Kelola artikel blog EcoWaste dari satu tempat.
          </p>
        </div>
      </header>

      <main className="flex-grow container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-serif font-bold mb-6 pb-2 border-b">Tambah Artikel Baru</h2>

              {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {message.text}
                </div>
              )}
              
              <form id="form-tambah-artikel" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Artikel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="Masukkan judul artikel"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 bg-gray-50"
                    placeholder="judul-artikel-anda"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Auto-generated dari judul. Digunakan untuk URL artikel.
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
                    Gambar Cover <span className="text-red-500">*</span>
                  </label>
                  
                  {imagePreview && (
                    <div className="relative mb-3 aspect-[16/9] rounded-lg overflow-hidden bg-gray-100">
                      <Image 
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageFile(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <span className="sr-only">Hapus gambar</span>
                        &times;
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center">
                    <label
                      htmlFor="image-upload"
                      className="flex items-center px-4 py-2 rounded-lg border border-gray-300 cursor-pointer
                        bg-white hover:bg-gray-50"
                    >
                      <span>Upload Gambar</span>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Format yang didukung: JPG, PNG, WebP (Maks. 5MB)
                  </p>
                </div>

                <div className="mb-6">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Konten Artikel <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="Tulis konten artikel di sini (mendukung markdown)"
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                    Ringkasan/Excerpt <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs text-gray-500">(Auto-generated dari konten, bisa diedit)</span>
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    required
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="Ringkasan singkat artikel yang akan ditampilkan di halaman blog"
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    Ringkasan akan otomatis dibuat dari konten artikel saat Anda menulis, namun Anda dapat mengeditnya sesuai kebutuhan.
                  </p>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs text-gray-500">(Pisahkan dengan koma)</span>
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="Contoh: daur-ulang, plastik, lingkungan"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Baca (menit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"  
                    id="readTime"
                    name="readTime"
                    value={formData.readTime}
                    onChange={handleChange}
                    required
                    min="1"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Artikel
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h2 className="text-xl font-serif font-bold">Semua Artikel</h2>
                <button
                  onClick={fetchArticles}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Refresh
                </button>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Cari artikel..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              {loadingArticles ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredArticles.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {filteredArticles.map((article) => (
                    <div key={article.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <h3 className="font-medium text-gray-900 mb-1 truncate">{article.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          {article.category}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {new Date(article.createdAt).toLocaleDateString('id-ID')}
                          </span>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Hapus artikel"
                            disabled={deletingArticleId === article.id}
                          >
                            {deletingArticleId === article.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>{searchTerm ? 'Tidak ada artikel yang sesuai' : 'Belum ada artikel tersedia'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold mb-2">Konfirmasi Hapus Artikel</DialogTitle>
            <DialogDescription className="text-gray-700 mb-4">
              Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <button
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => setShowDeleteDialog(false)}
            >Batal</button>
            <button
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDeleteArticle}
            >Hapus</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold mb-2 text-green-700">Artikel berhasil dihapus</DialogTitle>
            <DialogDescription className="text-gray-700 mb-4">
              Artikel telah dihapus dari daftar blog.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end mt-4">
            <button
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => setShowSuccessDialog(false)}
            >Tutup</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ScrollToTop />
    </div>
  );
}

export default BlogAdmin;
