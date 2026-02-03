import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Film, 
  TrendingUp, 
  Download, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from 'lucide-react'
import { useMovies, useStats, deleteMovie, toggleMovieStatus } from '../hooks/useMovies'
import api from '../hooks/useMovies'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [adminKey, setAdminKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  // Check for stored admin key
  useEffect(() => {
    const storedKey = localStorage.getItem('adminKey')
    if (storedKey) {
      setAdminKey(storedKey)
      verifyAdminKey(storedKey)
    }
  }, [])

  const verifyAdminKey = async (key) => {
    try {
      // Test the key by making a request
      await api.get('/movies?limit=1', {
        headers: { 'x-admin-key': key }
      })
      localStorage.setItem('adminKey', key)
      setIsAuthenticated(true)
      setAuthError('')
    } catch (err) {
      setAuthError('Invalid admin key')
      localStorage.removeItem('adminKey')
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    verifyAdminKey(adminKey)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminKey')
    setIsAuthenticated(false)
    setAdminKey('')
  }

  const { movies, loading, error, pagination, refetch } = useMovies({
    search: searchQuery,
    limit: 10,
    page: currentPage
  })

  const { stats, loading: statsLoading } = useStats()

  const handleDelete = async (id) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      return
    }
    
    try {
      setActionLoading(`delete-${id}`)
      await deleteMovie(id, adminKey)
      setDeleteConfirm(null)
      refetch()
    } catch (err) {
      alert('Failed to delete movie')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleStatus = async (id, action) => {
    try {
      setActionLoading(`${action}-${id}`)
      await toggleMovieStatus(id, action, adminKey)
      refetch()
    } catch (err) {
      alert(`Failed to ${action} movie`)
    } finally {
      setActionLoading(null)
    }
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 mt-2">Enter your admin key to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Key
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin key"
                  className="input"
                  required
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{authError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-primary py-3"
              >
                Access Dashboard
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-primary-600 hover:text-primary-700">
                Back to Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Admin Panel</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
          <nav className="p-4 space-y-1">
            <Link
              to="/admin"
              className="flex items-center space-x-3 px-4 py-3 bg-primary-50 text-primary-700 rounded-xl font-medium"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/admin/add"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Movie</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Movies</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '-' : stats?.totalMovies || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Film className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Trending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '-' : stats?.trendingMovies || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '-' : stats?.featuredMovies || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '-' : stats?.totalDownloads?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">All Movies</h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="input pl-10 w-full sm:w-64"
                />
              </div>
              
              <Link
                to="/admin/add"
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Movie</span>
              </Link>
            </div>
          </div>

          {/* Movies Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-600">{error}</div>
            ) : movies.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No movies found. <Link to="/admin/add" className="text-primary-600 hover:underline">Add your first movie</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Movie</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downloads</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {movies.map((movie) => (
                      <tr key={movie._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="w-10 h-14 object-cover rounded-lg"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{movie.title}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                {movie.isTrending && (
                                  <span className="badge bg-orange-100 text-orange-700 text-xs">Trending</span>
                                )}
                                {movie.isFeatured && (
                                  <span className="badge bg-purple-100 text-purple-700 text-xs">Featured</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge bg-gray-100 text-gray-700">{movie.language}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-900">{movie.year}</td>
                        <td className="px-4 py-3 text-gray-900">{movie.downloadCount?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${movie.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {movie.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Toggle Active */}
                            <button
                              onClick={() => handleToggleStatus(movie._id, 'toggle-active')}
                              disabled={actionLoading === `toggle-active-${movie._id}`}
                              className={`p-2 rounded-lg transition-colors ${
                                movie.isActive 
                                  ? 'text-green-600 hover:bg-green-50' 
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title={movie.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {movie.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>

                            {/* Toggle Trending */}
                            <button
                              onClick={() => handleToggleStatus(movie._id, 'toggle-trending')}
                              disabled={actionLoading === `toggle-trending-${movie._id}`}
                              className={`p-2 rounded-lg transition-colors ${
                                movie.isTrending 
                                  ? 'text-orange-600 hover:bg-orange-50' 
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title={movie.isTrending ? 'Remove from trending' : 'Mark as trending'}
                            >
                              <TrendingUp className={`w-4 h-4 ${movie.isTrending ? 'fill-current' : ''}`} />
                            </button>

                            {/* Toggle Featured */}
                            <button
                              onClick={() => handleToggleStatus(movie._id, 'toggle-featured')}
                              disabled={actionLoading === `toggle-featured-${movie._id}`}
                              className={`p-2 rounded-lg transition-colors ${
                                movie.isFeatured 
                                  ? 'text-purple-600 hover:bg-purple-50' 
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title={movie.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                            >
                              <Star className={`w-4 h-4 ${movie.isFeatured ? 'fill-current' : ''}`} />
                            </button>

                            {/* Edit */}
                            <Link
                              to={`/admin/edit/${movie._id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(movie._id)}
                              disabled={actionLoading === `delete-${movie._id}`}
                              className={`p-2 rounded-lg transition-colors ${
                                deleteConfirm === movie._id
                                  ? 'bg-red-600 text-white'
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                              title={deleteConfirm === movie._id ? 'Click again to confirm' : 'Delete'}
                            >
                              {deleteConfirm === movie._id ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {pagination.pages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage === pagination.pages}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
