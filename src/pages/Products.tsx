import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';

type ViewMode = 'grid' | 'list';

const Products = () => {
  const [searchParams] = useSearchParams();
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 10;
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState({
    category: category || searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name'
  });

  useEffect(() => {
    // Update filters when category param changes
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
  }, [category]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [filters, searchParams]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            slug
          )
        `, { count: 'exact' })
        .eq('is_active', true);

      // Handle search query
      const searchQuery = searchParams.get('search');
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Handle category filter
      if (filters.category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.category)
          .single();
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      // Handle price filters
      if (filters.minPrice) {
        query = query.gte('price', parseFloat(filters.minPrice));
      }

      if (filters.maxPrice) {
        query = query.lte('price', parseFloat(filters.maxPrice));
      }

      // Handle sorting
      if (filters.sortBy === 'price') {
        query = query.order('price', { ascending: true });
      } else if (filters.sortBy === 'price desc') {
        query = query.order('price', { ascending: false });
      } else if (filters.sortBy === 'rating desc') {
        query = query.order('rating', { ascending: false });
      } else if (filters.sortBy === 'created_at desc') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('name', { ascending: true });
      }

      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage - 1;

      const { data, error, count } = await query
        .range(startIndex, endIndex);

      if (error) throw error;
      
      setProducts(data || []);
      setTotalProducts(count || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentCategory = categories.find(c => c.slug === filters.category);
  const searchQuery = searchParams.get('search');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-festive-red">
              {searchQuery ? `Search Results for "${searchQuery}"` : (currentCategory?.name || 'All Products')}
            </h1>
            {products.length > 0 && (
              <p className="text-gray-600 mt-2">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ProductFilters
              categories={categories}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
          
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  {searchQuery ? `No products found for "${searchQuery}"` : 'No products found matching your criteria.'}
                </p>
                {searchQuery && (
                  <Button onClick={() => window.location.href = '/products'} className="bg-festive-gradient hover:opacity-90">
                    View All Products
                  </Button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
              }>
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {totalProducts > productsPerPage && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-gray-700">
              Page {currentPage} of {Math.ceil(totalProducts / productsPerPage)}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage * productsPerPage >= totalProducts}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Products;