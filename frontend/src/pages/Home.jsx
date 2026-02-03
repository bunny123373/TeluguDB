import React, { useState } from 'react'
import CategoryBar from '../components/CategoryBar'
import MovieSection from '../components/MovieSection'
import FilterPanel from '../components/FilterPanel'
import MetaTags from '../components/MetaTags'
import { useMovies } from '../hooks/useMovies'

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filters, setFilters] = useState({
    language: '',
    category: '',
    genre: '',
    year: '',
    quality: ''
  })

  // Fetch trending movies
  const { 
    movies: trendingMovies, 
    loading: trendingLoading, 
    error: trendingError 
  } = useMovies({ isTrending: 'true', limit: 12 })

  // Fetch latest movies
  const { 
    movies: latestMovies, 
    loading: latestLoading, 
    error: latestError 
  } = useMovies({ limit: 12 })

  // Fetch featured/popular movies
  const { 
    movies: featuredMovies, 
    loading: featuredLoading, 
    error: featuredError 
  } = useMovies({ isFeatured: 'true', limit: 12 })

  // Fetch category-filtered movies
  const { 
    movies: categoryMovies, 
    loading: categoryLoading, 
    error: categoryError 
  } = useMovies({ 
    language: selectedCategory,
    ...filters,
    limit: 24 
  })

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setFilters(prev => ({ ...prev, language: category }))
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags 
        title="MovieHub - Download Movies"
        description="Download your favorite movies in high quality. Telugu, Tamil, Hindi, English movies available with fast, free downloads."
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 py-16 lg:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Download Your Favorite Movies
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            High-quality movies in Telugu, Tamil, Hindi, English and more. 
            Fast, free downloads with multiple quality options.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white font-semibold">HD Quality</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white font-semibold">Fast Downloads</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white font-semibold">100% Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Bar */}
      <CategoryBar 
        selectedCategory={selectedCategory} 
        onSelect={handleCategorySelect} 
      />

      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-36">
                <FilterPanel 
                  filters={filters} 
                  onFilterChange={handleFilterChange}
                />
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              {/* Mobile Filters */}
              <div className="lg:hidden mb-6">
                <FilterPanel 
                  filters={filters} 
                  onFilterChange={handleFilterChange}
                />
              </div>

              {/* Trending Section */}
              {!selectedCategory && (
                <MovieSection
                  type="trending"
                  movies={trendingMovies}
                  loading={trendingLoading}
                  error={trendingError}
                  showViewAll={false}
                />
              )}

              {/* Latest Section */}
              {!selectedCategory && (
                <MovieSection
                  type="latest"
                  movies={latestMovies}
                  loading={latestLoading}
                  error={latestError}
                  showViewAll={false}
                />
              )}

              {/* Popular Section */}
              {!selectedCategory && (
                <MovieSection
                  type="popular"
                  movies={featuredMovies}
                  loading={featuredLoading}
                  error={featuredError}
                  showViewAll={false}
                />
              )}

              {/* Category Section */}
              {selectedCategory && (
                <MovieSection
                  type={selectedCategory.toLowerCase()}
                  title={`${selectedCategory} Movies`}
                  movies={categoryMovies}
                  loading={categoryLoading}
                  error={categoryError}
                  showViewAll={false}
                />
              )}

              {/* All Movies Section (when no category selected) */}
              {!selectedCategory && (
                <MovieSection
                  type="default"
                  title="All Movies"
                  movies={latestMovies}
                  loading={latestLoading}
                  error={latestError}
                  showViewAll={false}
                />
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
