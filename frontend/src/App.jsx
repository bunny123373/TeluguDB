import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { WatchlistProvider } from './contexts/WatchlistContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import MovieDetails from './pages/MovieDetails'
import SearchResults from './pages/SearchResults'
import Watchlist from './pages/Watchlist'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/AdminDashboard'
import AdminMovieForm from './pages/AdminMovieForm'

function App() {
  return (
    <WatchlistProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Routes>
          {/* Admin Routes - No Navbar/Footer */}
          <Route path="/admin/*" element={<AdminRoutes />} />
          
          {/* Public Routes - With Navbar/Footer */}
          <Route path="/*" element={<PublicRoutes />} />
        </Routes>
      </div>
    </WatchlistProvider>
  )
}

function PublicRoutes() {
  return (
    <>
      <Navbar />
      <main className="pt-16 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/add" element={<AdminMovieForm />} />
      <Route path="/edit/:id" element={<AdminMovieForm />} />
    </Routes>
  )
}

export default App
