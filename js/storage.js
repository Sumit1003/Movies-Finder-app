// Import CONFIG
import CONFIG from "./config.js"

// Local Storage Functions
class StorageManager {
  constructor() {
    this.favoriteKey = "movieflix_favorites"
    this.watchlistKey = "movieflix_watchlist"
    this.recentSearchesKey = "movieflix_recent_searches"
    this.reviewsKey = "movieflix_reviews"
    this.userRatingsKey = "movieflix_user_ratings"
    this.themeKey = "movieflix_theme"
  }

  // Get favorites from localStorage
  getFavorites() {
    const favorites = localStorage.getItem(this.favoriteKey)
    return favorites ? JSON.parse(favorites) : []
  }

  // Add movie to favorites
  addToFavorites(movie) {
    const favorites = this.getFavorites()

    // Check if movie already exists in favorites
    if (!favorites.some((fav) => fav.imdbID === movie.imdbID)) {
      favorites.push(movie)
      localStorage.setItem(this.favoriteKey, JSON.stringify(favorites))
      return true
    }

    return false
  }

  // Remove movie from favorites
  removeFromFavorites(imdbID) {
    const favorites = this.getFavorites()
    const updatedFavorites = favorites.filter((movie) => movie.imdbID !== imdbID)
    localStorage.setItem(this.favoriteKey, JSON.stringify(updatedFavorites))
  }

  // Check if movie is in favorites
  isInFavorites(imdbID) {
    const favorites = this.getFavorites()
    return favorites.some((movie) => movie.imdbID === imdbID)
  }

  // Get watchlist from localStorage
  getWatchlist() {
    const watchlist = localStorage.getItem(this.watchlistKey)
    return watchlist ? JSON.parse(watchlist) : []
  }

  // Add movie to watchlist
  addToWatchlist(movie) {
    const watchlist = this.getWatchlist()

    // Check if movie already exists in watchlist
    if (!watchlist.some((item) => item.imdbID === movie.imdbID)) {
      watchlist.push(movie)
      localStorage.setItem(this.watchlistKey, JSON.stringify(watchlist))
      return true
    }

    return false
  }

  // Remove movie from watchlist
  removeFromWatchlist(imdbID) {
    const watchlist = this.getWatchlist()
    const updatedWatchlist = watchlist.filter((movie) => movie.imdbID !== imdbID)
    localStorage.setItem(this.watchlistKey, JSON.stringify(updatedWatchlist))
  }

  // Check if movie is in watchlist
  isInWatchlist(imdbID) {
    const watchlist = this.getWatchlist()
    return watchlist.some((movie) => movie.imdbID === imdbID)
  }

  // Get recent searches from localStorage
  getRecentSearches() {
    const searches = localStorage.getItem(this.recentSearchesKey)
    return searches ? JSON.parse(searches) : []
  }

  // Add search query to recent searches
  addToRecentSearches(query) {
    const searches = this.getRecentSearches()

    // Remove the query if it already exists to avoid duplicates
    const filteredSearches = searches.filter((search) => search !== query)

    // Add the new query to the beginning of the array
    filteredSearches.unshift(query)

    // Keep only the most recent searches
    const limitedSearches = filteredSearches.slice(0, CONFIG.MAX_RECENT_SEARCHES)

    localStorage.setItem(this.recentSearchesKey, JSON.stringify(limitedSearches))
    return limitedSearches
  }

  // Get reviews for a movie
  getReviews(imdbID) {
    const allReviews = localStorage.getItem(this.reviewsKey)
    const reviewsObj = allReviews ? JSON.parse(allReviews) : {}
    return reviewsObj[imdbID] || []
  }

  // Add review for a movie
  addReview(imdbID, review) {
    const allReviews = localStorage.getItem(this.reviewsKey)
    const reviewsObj = allReviews ? JSON.parse(allReviews) : {}

    if (!reviewsObj[imdbID]) {
      reviewsObj[imdbID] = []
    }

    reviewsObj[imdbID].push(review)
    localStorage.setItem(this.reviewsKey, JSON.stringify(reviewsObj))
    return reviewsObj[imdbID]
  }

  // Get user rating for a movie
  getUserRating(imdbID) {
    const allRatings = localStorage.getItem(this.userRatingsKey)
    const ratingsObj = allRatings ? JSON.parse(allRatings) : {}
    return ratingsObj[imdbID] || 0
  }

  // Set user rating for a movie
  setUserRating(imdbID, rating) {
    const allRatings = localStorage.getItem(this.userRatingsKey)
    const ratingsObj = allRatings ? JSON.parse(allRatings) : {}

    ratingsObj[imdbID] = rating
    localStorage.setItem(this.userRatingsKey, JSON.stringify(ratingsObj))
    return rating
  }

  // Get theme preference
  getTheme() {
    return localStorage.getItem(this.themeKey) || "light"
  }

  // Set theme preference
  setTheme(theme) {
    localStorage.setItem(this.themeKey, theme)
    return theme
  }
}

// Create and export storage instance
const storageManager = new StorageManager()
export default storageManager

