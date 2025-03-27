// Import the configuration
import CONFIG from "./config.js"

// API Functions
class MovieAPI {
  constructor() {
    this.apiKey = CONFIG.API_KEY
    this.apiUrl = CONFIG.API_URL
  }

  // Search for movies
  async searchMovies(query, page = 1, type = "") {
    try {
      // Construct the URL correctly without including parameters in the base URL
      const url = `${this.apiUrl}?apikey=${this.apiKey}&s=${encodeURIComponent(query)}&page=${page}${type ? `&type=${type}` : ""}`
      console.log("Search URL:", url) // Debug log

      const response = await fetch(url)
      const data = await response.json()

      console.log("API Response:", data) // Debug log

      if (data.Response === "False") {
        throw new Error(data.Error || "No results found")
      }

      return {
        movies: data.Search,
        totalResults: Number.parseInt(data.totalResults),
        totalPages: Math.ceil(Number.parseInt(data.totalResults) / CONFIG.RESULTS_PER_PAGE),
      }
    } catch (error) {
      console.error("Error searching movies:", error)
      throw error
    }
  }

  // Get movie details by ID
  async getMovieDetails(imdbID) {
    try {
      const url = `${this.apiUrl}?apikey=${this.apiKey}&i=${imdbID}&plot=full`
      console.log("Details URL:", url) // Debug log

      const response = await fetch(url)
      const data = await response.json()

      if (data.Response === "False") {
        throw new Error(data.Error || "Movie details not found")
      }

      return data
    } catch (error) {
      console.error("Error getting movie details:", error)
      throw error
    }
  }

  // Search for movie trailer on YouTube
  async searchTrailer(movieTitle, year) {
    if (!CONFIG.YOUTUBE_API_KEY || CONFIG.YOUTUBE_API_KEY === "YOUR_YOUTUBE_API_KEY") {
      return null
    }

    try {
      const query = `${movieTitle} ${year} official trailer`
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${CONFIG.YOUTUBE_API_KEY}&maxResults=1&type=video`
      console.log("Trailer search URL:", url) // Debug log

      const response = await fetch(url)
      const data = await response.json()

      if (data.items && data.items.length > 0) {
        return data.items[0].id.videoId
      }

      return null
    } catch (error) {
      console.error("Error searching for trailer:", error)
      return null
    }
  }
}

// Create and export API instance
const movieAPI = new MovieAPI()
export default movieAPI

