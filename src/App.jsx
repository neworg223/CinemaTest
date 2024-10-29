import React, { useState, useEffect } from 'react';
import { Search, Film, Clock, User, Calendar, Star, Globe, Theater } from 'lucide-react';
import { Alert, AlertDescription } from './components/ui/alert';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieSearchApp = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);

  const handleSearch = async () => {
    if (!search.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchResponse = await fetch(
        `${TMDB_API_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(search)}`
      );
      const searchData = await searchResponse.json();
      
      if (!searchData.results || searchData.results.length === 0) {
        setError('No results found');
        setMovieDetails(null);
        return;
      }
      
      const movieId = searchData.results[0].id;
      const detailsResponse = await fetch(
        `${TMDB_API_BASE}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
      );
      const movieDetails = await detailsResponse.json();
      
      setMovieDetails({
        title: movieDetails.title,
        plot: movieDetails.overview,
        rating: movieDetails.vote_average.toFixed(1),
        genres: movieDetails.genres.map(g => g.name),
        year: new Date(movieDetails.release_date).getFullYear(),
        poster: movieDetails.poster_path 
          ? `${TMDB_IMAGE_BASE}/w500${movieDetails.poster_path}`
          : "/api/placeholder/300/450",
        director: movieDetails.credits.crew.find(c => c.job === 'Director')?.name || 'N/A',
        cast: movieDetails.credits.cast.slice(0, 5).map(c => c.name).join(', ')
      });
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Movie Search</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search for a movie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {movieDetails && !loading && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <img
              src={movieDetails.poster}
              alt={movieDetails.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">
              {movieDetails.title} ({movieDetails.year})
              <span className="ml-2 text-yellow-500">★ {movieDetails.rating}</span>
            </h2>
            <p className="mb-4">{movieDetails.plot}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Genres:</strong> {movieDetails.genres.join(', ')}
              </div>
              <div>
                <strong>Director:</strong> {movieDetails.director}
              </div>
            </div>
            <div className="mt-4">
              <strong>Cast:</strong> {movieDetails.cast}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieSearchApp;
