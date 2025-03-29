// Import necessary modules
import movieAPI from "./api.js"
import storageManager from "./storage.js"

// UI Functions
class UI {
  constructor() {
    // DOM Elements
    this.moviesGrid = document.getElementById("movies-grid")
    this.resultsHeading = document.getElementById("results-heading")
    this.loader = document.getElementById("loader")
    this.pagination = document.getElementById("pagination")
    this.prevPageBtn = document.getElementById("prev-page")
    this.nextPageBtn = document.getElementById("next-page")
    this.currentPageSpan = document.getElementById("current-page")
    this.movieDetails = document.getElementById("movie-details")
    this.moviesSection = document.getElementById("movies-section")
    this.backButton = document.getElementById("back-button")
    this.recentSearchesList = document.getElementById("recent-searches-list")
    this.recentSearchesContainer = document.getElementById("recent-searches")
    this.searchInput = document.getElementById("search-input")
    this.filterYear = document.getElementById("filter-year")
    this.themeToggle = document.getElementById("theme-toggle")
    this.authModal = document.getElementById("auth-modal")
    this.shareModal = document.getElementById("share-modal")
    this.loginLink = document.getElementById("login-link")
    this.shareUrl = document.getElementById("share-url")
    this.copyLink = document.getElementById("copy-link")

    // Initialize UI
    this.populateYearFilter()
    this.setupEventListeners()
    this.applyTheme()
  }

  // Show loader
  showLoader() {
    this.loader.classList.remove("hidden")
  }

  // Hide loader
  hideLoader() {
    this.loader.classList.add("hidden")
  }

  // Display movies in grid
  displayMovies(movies, heading = "Search Results") {
    this.moviesGrid.innerHTML = ""
    this.resultsHeading.textContent = heading

    if (!movies || movies.length === 0) {
      this.showError("No movies found")
      return
    }

    movies.forEach((movie) => {
      const isFavorite = storageManager.isInFavorites(movie.imdbID)
      const isInWatchlist = storageManager.isInWatchlist(movie.imdbID)

      const movieCard = document.createElement("div")
      movieCard.className = "movie-card"
      movieCard.innerHTML = `
        <img src="${movie.Poster !== "N/A" ? movie.Poster : "/images/no-poster.png"}" alt="${movie.Title}" class="movie-poster">
        <div class="movie-info">
          <h3 class="movie-title">${movie.Title}</h3>
          <p class="movie-year">${movie.Year}</p>
          <div class="card-actions">
            <button class="card-btn favorite-btn ${isFavorite ? "active" : ""}" data-id="${movie.imdbID}">
              <i class="fas fa-heart"></i>
            </button>
            <button class="card-btn watchlist-btn ${isInWatchlist ? "active" : ""}" data-id="${movie.imdbID}">
              <i class="fas fa-bookmark"></i>
            </button>
            <button class="card-btn details-btn" data-id="${movie.imdbID}">
              <i class="fas fa-info-circle"></i>
            </button>
          </div>
        </div>
      `

      this.moviesGrid.appendChild(movieCard)
    })

    // Add event listeners to buttons
    this.addCardButtonListeners()
  }

  // Add event listeners to card buttons
  addCardButtonListeners() {
    // Favorite buttons
    const favoriteButtons = document.querySelectorAll(".favorite-btn")
    favoriteButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation()
        const imdbID = button.getAttribute("data-id")
        this.toggleFavorite(imdbID, button)
      })
    })

    // Watchlist buttons
    const watchlistButtons = document.querySelectorAll(".watchlist-btn")
    watchlistButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation()
        const imdbID = button.getAttribute("data-id")
        this.toggleWatchlist(imdbID, button)
      })
    })

    // Details buttons
    const detailsButtons = document.querySelectorAll(".details-btn")
    detailsButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation()
        const imdbID = button.getAttribute("data-id")
        window.app.showMovieDetails(imdbID)
      })
    })

    // Make entire card clickable
    const movieCards = document.querySelectorAll(".movie-card")
    movieCards.forEach((card) => {
      card.addEventListener("click", () => {
        const detailsBtn = card.querySelector(".details-btn")
        const imdbID = detailsBtn.getAttribute("data-id")
        window.app.showMovieDetails(imdbID)
      })
    })
  }

  // Toggle favorite status
  async toggleFavorite(imdbID, button) {
    if (storageManager.isInFavorites(imdbID)) {
      storageManager.removeFromFavorites(imdbID)
      button.classList.remove("active")
      this.showMessage("Removed from favorites", "success")
    } else {
      try {
        const movie = await movieAPI.getMovieDetails(imdbID)
        storageManager.addToFavorites(movie)
        button.classList.add("active")
        this.showMessage("Added to favorites", "success")
      } catch (error) {
        this.showError("Error adding to favorites")
      }
    }
  }

  // Toggle watchlist status
  async toggleWatchlist(imdbID, button) {
    if (storageManager.isInWatchlist(imdbID)) {
      storageManager.removeFromWatchlist(imdbID)
      button.classList.remove("active")
      this.showMessage("Removed from watchlist", "success")
    } else {
      try {
        const movie = await movieAPI.getMovieDetails(imdbID)
        storageManager.addToWatchlist(movie)
        button.classList.add("active")
        this.showMessage("Added to watchlist", "success")
      } catch (error) {
        this.showError("Error adding to watchlist")
      }
    }
  }

  // Display movie details
  async displayMovieDetails(movie) {
    // Hide movies section and show details section
    this.moviesSection.classList.add("hidden")
    this.movieDetails.classList.remove("hidden")

    // Get DOM elements
    const detailPoster = document.getElementById("detail-poster")
    const detailTitle = document.getElementById("detail-title")
    const detailYear = document.getElementById("detail-year")
    const detailRated = document.getElementById("detail-rated")
    const detailRuntime = document.getElementById("detail-runtime")
    const detailGenre = document.getElementById("detail-genre")
    const detailImdbRating = document.getElementById("detail-imdb-rating")
    const detailPlot = document.getElementById("detail-plot")
    const detailDirector = document.getElementById("detail-director")
    const detailWriter = document.getElementById("detail-writer")
    const detailActors = document.getElementById("detail-actors")
    const trailerContainer = document.getElementById("trailer-container")
    const addFavoriteBtn = document.getElementById("add-favorite")
    const addWatchlistBtn = document.getElementById("add-watchlist")
    const downloadPosterBtn = document.getElementById("download-poster")
    const shareMovieBtn = document.getElementById("share-movie")
    const reviewsList = document.getElementById("reviews-list")
    const userStars = document.getElementById("user-stars")
    const userRatingText = document.getElementById("user-rating-text")

    // Set movie details
    detailPoster.src = movie.Poster !== "N/A" ? movie.Poster : "/images/no-poster.png"
    detailPoster.alt = movie.Title
    detailTitle.textContent = movie.Title
    detailYear.textContent = movie.Year
    detailRated.textContent = movie.Rated
    detailRuntime.textContent = movie.Runtime
    detailImdbRating.textContent = movie.imdbRating
    detailPlot.textContent = movie.Plot
    detailDirector.textContent = movie.Director
    detailWriter.textContent = movie.Writer
    detailActors.textContent = movie.Actors

    // Set genre tags
    detailGenre.innerHTML = ""
    const genres = movie.Genre.split(", ")
    genres.forEach((genre) => {
      const genreTag = document.createElement("span")
      genreTag.className = "genre-tag"
      genreTag.textContent = genre
      detailGenre.appendChild(genreTag)
    })

    // Set favorite and watchlist button states
    const isFavorite = storageManager.isInFavorites(movie.imdbID)
    const isInWatchlist = storageManager.isInWatchlist(movie.imdbID)

    addFavoriteBtn.innerHTML = isFavorite
      ? '<i class="fas fa-heart"></i> Remove from Favorites'
      : '<i class="far fa-heart"></i> Add to Favorites'

    addWatchlistBtn.innerHTML = isInWatchlist
      ? '<i class="fas fa-bookmark"></i> Remove from Watchlist'
      : '<i class="far fa-bookmark"></i> Add to Watchlist'

    // Set user rating
    const userRating = storageManager.getUserRating(movie.imdbID)
    this.updateStarRating(userRating)

    // Display reviews
    this.displayReviews(movie.imdbID)

    // Try to get and display trailer
    try {
      const videoId = await movieAPI.searchTrailer(movie.Title, movie.Year)
      if (videoId) {
        trailerContainer.innerHTML = `
          <iframe 
            width="560" 
            height="315" 
            src="https://www.youtube.com/embed/${videoId}" 
            title="${movie.Title} Trailer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        `
      } else {
        trailerContainer.innerHTML = "<p>Trailer not available</p>"
      }
    } catch (error) {
      console.error("Error loading trailer:", error)
      trailerContainer.innerHTML = "<p>Trailer not available</p>"
    }

    // Clear previous event listeners by cloning and replacing the buttons
    const newAddFavoriteBtn = addFavoriteBtn.cloneNode(true)
    const newAddWatchlistBtn = addWatchlistBtn.cloneNode(true)
    const newDownloadPosterBtn = downloadPosterBtn.cloneNode(true)
    const newShareMovieBtn = shareMovieBtn.cloneNode(true)

    addFavoriteBtn.parentNode.replaceChild(newAddFavoriteBtn, addFavoriteBtn)
    addWatchlistBtn.parentNode.replaceChild(newAddWatchlistBtn, addWatchlistBtn)
    downloadPosterBtn.parentNode.replaceChild(newDownloadPosterBtn, downloadPosterBtn)
    shareMovieBtn.parentNode.replaceChild(newShareMovieBtn, shareMovieBtn)

    // Add event listeners for detail page buttons
    newAddFavoriteBtn.addEventListener("click", () => {
      if (storageManager.isInFavorites(movie.imdbID)) {
        storageManager.removeFromFavorites(movie.imdbID)
        newAddFavoriteBtn.innerHTML = '<i class="far fa-heart"></i> Add to Favorites'
        this.showMessage("Removed from favorites", "success")
      } else {
        storageManager.addToFavorites(movie)
        newAddFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Remove from Favorites'
        this.showMessage("Added to favorites", "success")
      }
    })

    newAddWatchlistBtn.addEventListener("click", () => {
      if (storageManager.isInWatchlist(movie.imdbID)) {
        storageManager.removeFromWatchlist(movie.imdbID)
        newAddWatchlistBtn.innerHTML = '<i class="far fa-bookmark"></i> Add to Watchlist'
        this.showMessage("Removed from watchlist", "success")
      } else {
        storageManager.addToWatchlist(movie)
        newAddWatchlistBtn.innerHTML = '<i class="fas fa-bookmark"></i> Remove from Watchlist'
        this.showMessage("Added to watchlist", "success")
      }
    })

    newDownloadPosterBtn.addEventListener("click", () => {
      if (movie.Poster !== "N/A") {
        this.downloadImage(movie.Poster, `${movie.Title}_poster.jpg`)
      } else {
        this.showError("Poster not available for download")
      }
    })

    newShareMovieBtn.addEventListener("click", () => {
      this.openShareModal(movie)
    })

    // Add event listeners for star rating
    const stars = userStars.querySelectorAll("i")
    stars.forEach((star) => {
      star.addEventListener("click", () => {
        const rating = Number.parseInt(star.getAttribute("data-rating"))
        storageManager.setUserRating(movie.imdbID, rating)
        this.updateStarRating(rating)
        this.showMessage(`You rated this movie ${rating}/5`, "success")
      })

      star.addEventListener("mouseover", () => {
        const rating = Number.parseInt(star.getAttribute("data-rating"))
        this.previewStarRating(rating)
      })

      star.addEventListener("mouseout", () => {
        const currentRating = storageManager.getUserRating(movie.imdbID)
        this.updateStarRating(currentRating)
      })
    })

    // Add event listener for review submission
    const submitReviewBtn = document.getElementById("submit-review")
    const reviewText = document.getElementById("review-text")

    submitReviewBtn.addEventListener("click", () => {
      if (reviewText.value.trim() === "") {
        this.showError("Please write a review before submitting")
        return
      }

      const review = {
        text: reviewText.value.trim(),
        date: new Date().toISOString(),
        user: "Anonymous", // Replace with actual username if auth is implemented
      }

      storageManager.addReview(movie.imdbID, review)
      this.displayReviews(movie.imdbID)
      reviewText.value = ""
      this.showMessage("Review submitted successfully", "success")
    })
  }

  // Display reviews for a movie
  displayReviews(imdbID) {
    const reviewsList = document.getElementById("reviews-list")
    const reviews = storageManager.getReviews(imdbID)

    reviewsList.innerHTML = ""

    if (reviews.length === 0) {
      reviewsList.innerHTML = "<p>No reviews yet. Be the first to review!</p>"
      return
    }

    reviews.forEach((review) => {
      const reviewDate = new Date(review.date).toLocaleDateString()
      const reviewItem = document.createElement("div")
      reviewItem.className = "review-item"
      reviewItem.innerHTML = `
        <div class="review-header">
          <span class="review-user">${review.user}</span>
          <span class="review-date">${reviewDate}</span>
        </div>
        <p>${review.text}</p>
      `

      reviewsList.appendChild(reviewItem)
    })
  }

  // Update star rating display
  updateStarRating(rating) {
    const stars = document.querySelectorAll("#user-stars i")
    const userRatingText = document.getElementById("user-rating-text")

    stars.forEach((star, index) => {
      if (index < rating) {
        star.className = "fas fa-star"
      } else {
        star.className = "far fa-star"
      }
    })

    if (rating > 0) {
      userRatingText.textContent = `Your rating: ${rating}/5`
    } else {
      userRatingText.textContent = "Rate this movie"
    }
  }

  // Preview star rating on hover
  previewStarRating(rating) {
    const stars = document.querySelectorAll("#user-stars i")

    stars.forEach((star, index) => {
      if (index < rating) {
        star.className = "fas fa-star"
      } else {
        star.className = "far fa-star"
      }
    })
  }

  // Update pagination
  updatePagination(currentPage, totalPages) {
    this.currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`
    this.prevPageBtn.disabled = currentPage <= 1
    this.nextPageBtn.disabled = currentPage >= totalPages
  }

  // Show error message
  showError(message) {
    // Remove any existing message
    this.removeMessages()

    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.textContent = message

    // Insert before movies grid
    this.moviesGrid.parentNode.insertBefore(errorDiv, this.moviesGrid)

    // Remove after 3 seconds
    setTimeout(() => {
      errorDiv.remove()
    }, 3000)
  }

  // Show success message
  showMessage(message, type = "success") {
    // Remove any existing message
    this.removeMessages()

    const messageDiv = document.createElement("div")
    messageDiv.className = type === "success" ? "success-message" : "error-message"
    messageDiv.textContent = message

    // Insert before movies grid or movie details
    if (!this.moviesSection.classList.contains("hidden")) {
      this.moviesGrid.parentNode.insertBefore(messageDiv, this.moviesGrid)
    } else {
      this.movieDetails.insertBefore(messageDiv, this.movieDetails.firstChild)
    }

    // Remove after 3 seconds
    setTimeout(() => {
      messageDiv.remove()
    }, 3000)
  }

  // Remove all message elements
  removeMessages() {
    const messages = document.querySelectorAll(".error-message, .success-message")
    messages.forEach((message) => message.remove())
  }

  // Display recent searches
  displayRecentSearches() {
    const searches = storageManager.getRecentSearches()
    this.recentSearchesList.innerHTML = ""

    if (searches.length === 0) {
      this.recentSearchesContainer.style.display = "none"
      return
    }

    searches.forEach((search) => {
      const li = document.createElement("li")
      li.textContent = search
      li.addEventListener("click", () => {
        this.searchInput.value = search
        this.recentSearchesContainer.style.display = "none"
        window.app.searchMovies(search)
      })

      this.recentSearchesList.appendChild(li)
    })

    this.recentSearchesContainer.style.display = "block"
  }

  // Hide recent searches
  hideRecentSearches() {
    this.recentSearchesContainer.style.display = "none"
  }

  // Populate year filter
  populateYearFilter() {
    const currentYear = new Date().getFullYear()
    const startYear = 1900

    for (let year = currentYear; year >= startYear; year--) {
      const option = document.createElement("option")
      option.value = year
      option.textContent = year
      this.filterYear.appendChild(option)
    }
  }

  // Download image
  downloadImage(url, filename) {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.click()
        URL.revokeObjectURL(link.href)
      })
      .catch((error) => {
        this.showError("Error downloading image")
      })
  }

  // Open share modal
  openShareModal(movie) {
    // Create shareable URL
    const shareUrl = `${window.location.origin}?id=${movie.imdbID}`
    this.shareUrl.value = shareUrl

    // Show modal
    this.shareModal.classList.remove("hidden")

    // Add event listeners for social sharing
    const facebookBtn = document.querySelector(".social-btn.facebook")
    const twitterBtn = document.querySelector(".social-btn.twitter")
    const whatsappBtn = document.querySelector(".social-btn.whatsapp")

    facebookBtn.onclick = () => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
    }

    twitterBtn.onclick = () => {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out this movie: ${encodeURIComponent(movie.Title)}`,
        "_blank",
      )
    }

    whatsappBtn.onclick = () => {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`Check out this movie: ${movie.Title} ${shareUrl}`)}`,
        "_blank",
      )
    }

    // Copy link button
    this.copyLink.onclick = () => {
      this.shareUrl.select()
      document.execCommand("copy")
      this.showMessage("Link copied to clipboard", "success")
    }
  }

  // Toggle theme
  toggleTheme() {
    const body = document.body
    const isDarkMode = body.classList.contains("dark-mode")

    if (isDarkMode) {
      body.classList.remove("dark-mode")
      this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>'
      storageManager.setTheme("light")
    } else {
      body.classList.add("dark-mode")
      this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
      storageManager.setTheme("dark")
    }
  }

  // Apply saved theme
  applyTheme() {
    const savedTheme = storageManager.getTheme()

    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode")
      this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
    } else {
      document.body.classList.remove("dark-mode")
      this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>'
    }
  }

  // Setup filter buttons
  setupFilterButtons() {
    const filterButtons = document.querySelectorAll(".filter-btn")
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Toggle active state
        button.classList.toggle("active")

        // Get all active filters
        const activeFilters = Array.from(document.querySelectorAll(".filter-btn.active")).map((btn) =>
          btn.textContent.toLowerCase(),
        )

        // Apply filters to current movies
        this.applyFilters(activeFilters)
      })
    })
  }

  // Apply filters to movies
  applyFilters(activeFilters) {
    // If no filters are active, show all movies
    if (activeFilters.length === 0) {
      document.querySelectorAll(".movie-card").forEach((card) => {
        card.style.display = "block"
      })
      return
    }

    // Hide all movies first
    document.querySelectorAll(".movie-card").forEach((card) => {
      const title = card.querySelector(".movie-title").textContent.toLowerCase()
      const year = card.querySelector(".movie-year").textContent.toLowerCase()

      // Check if movie matches any active filter
      const matchesFilter = activeFilters.some((filter) => {
        // Quality filters (480p, 720p, 1080p)
        if (["480p", "720p", "1080p"].includes(filter)) {
          return true // For demo purposes, assume all movies have these qualities
        }

        // Platform filters
        if (["amazonprime", "disney+", "netflix"].includes(filter)) {
          return true // For demo purposes, randomly match some movies
          // In a real app, you would check if the movie is available on these platforms
        }

        // Language filters
        if (["hindi", "english"].includes(filter)) {
          return true // For demo purposes, randomly match some movies
          // In a real app, you would check the movie's language
        }

        // Category filters
        if (["hollywood", "bollywood", "korean", "animation", "anime"].includes(filter)) {
          return title.includes(filter) || Math.random() > 0.5 // For demo purposes, randomly match some movies
          // In a real app, you would check the movie's category
        }

        return false
      })

      // Show or hide based on filter match
      card.style.display = matchesFilter ? "block" : "none"
    })
  }

  // Setup dropdown menu functionality
  setupDropdownMenus() {
    const dropdownLinks = document.querySelectorAll(".dropdown-content a")
    dropdownLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()

        // Get the category from the link text
        const category = link.textContent.toLowerCase()

        // Update the heading to show the selected category
        document.getElementById("results-heading").textContent = `${link.textContent} Movies & Shows`

        // Apply the category filter
        this.filterByCategory(category)
      })
    })
  }

  // Filter movies by category
  filterByCategory(category) {
    // In a real app, you would fetch movies by category from the API
    // For demo purposes, we'll just filter the current movies

    document.querySelectorAll(".movie-card").forEach((card) => {
      const title = card.querySelector(".movie-title").textContent.toLowerCase()

      // Show or hide based on category match (random for demo)
      const matchesCategory = title.includes(category) || Math.random() > 0.5
      card.style.display = matchesCategory ? "block" : "none"
    })
  }

  // Open auth modal
  openAuthModal() {
    this.authModal.classList.remove("hidden")
  }

  // Close modals
  closeModals() {
    this.authModal.classList.add("hidden")
    this.shareModal.classList.add("hidden")
  }

  // Setup event listeners
  setupEventListeners() {
    // Back button
    this.backButton.addEventListener("click", () => {
      this.movieDetails.classList.add("hidden")
      this.moviesSection.classList.remove("hidden")
    })

    // Theme toggle
    this.themeToggle.addEventListener("click", () => {
      this.toggleTheme()
    })

    // Search input focus
    this.searchInput.addEventListener("focus", () => {
      this.displayRecentSearches()
    })

    // Search input blur
    this.searchInput.addEventListener("blur", (e) => {
      // Delay hiding to allow clicking on recent searches
      setTimeout(() => {
        this.hideRecentSearches()
      }, 200)
    })

    // Login link
    this.loginLink.addEventListener("click", (e) => {
      e.preventDefault()
      this.openAuthModal()
    })

    // Close modals
    const closeModalButtons = document.querySelectorAll(".close-modal")
    closeModalButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.closeModals()
      })
    })

    // Auth tabs
    const authTabs = document.querySelectorAll(".auth-tab")
    authTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabType = tab.getAttribute("data-tab")

        // Update active tab
        authTabs.forEach((t) => t.classList.remove("active"))
        tab.classList.add("active")

        // Show corresponding form
        document.getElementById("login-form").classList.toggle("hidden", tabType !== "login")
        document.getElementById("signup-form").classList.toggle("hidden", tabType !== "signup")
      })
    })

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === this.authModal) {
        this.closeModals()
      }

      if (e.target === this.shareModal) {
        this.closeModals()
      }
    })

    // Setup filter buttons and dropdown menus
    this.setupFilterButtons()
    this.setupDropdownMenus()

    // Close mobile menu when navigating
    const navLinks = document.querySelectorAll("nav a")
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const mainNav = document.getElementById("main-nav")
        const menuOverlay = document.getElementById("menu-overlay")
        const mobileMenuToggle = document.getElementById("mobile-menu-toggle")

        if (window.innerWidth <= 768 && !link.parentElement.classList.contains("dropdown")) {
          mainNav.classList.remove("active")
          menuOverlay.classList.remove("active")
          document.body.classList.remove("menu-open")
          mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>'
        }
      })
    })
    
  }
}

// Create and export UI instance
const ui = new UI()
export default ui

