// Import necessary modules
import CONFIG from "./config.js"
import ui from "./ui.js"
import storageManager from "./storage.js"
import movieAPI from "./api.js"

document.getElementById("movieflix-logo").addEventListener("click", function () {
  // Apply fade-out effect
  document.body.classList.add("fade-out");

  // Wait for animation to complete before reloading
  setTimeout(() => {
    location.reload(); // Reload the page smoothly
    // OR redirect smoothly: window.location.href = "index.html";
  }, 300); // Delay must match CSS transition time
});

// Main App Class
class App {
  constructor() {
    // State
    this.currentSearch = ""
    this.currentPage = 1
    this.totalPages = 0
    this.currentType = ""
    this.isLoading = false
    this.activeFilters = []

    // DOM Elements
    this.searchForm = document.getElementById("search-form")
    this.searchInput = document.getElementById("search-input")
    this.prevPageBtn = document.getElementById("prev-page")
    this.nextPageBtn = document.getElementById("next-page")
    this.filterType = document.getElementById("filter-type")
    this.filterYear = document.getElementById("filter-year")
    this.sortBy = document.getElementById("sort-by")
    this.homeLink = document.getElementById("home-link")
    this.favoritesLink = document.getElementById("favorites-link")
    this.watchlistLink = document.getElementById("watchlist-link")
    this.filterButtons = document.querySelectorAll(".filter-btn")
    this.dropdownLinks = document.querySelectorAll(".dropdown-content a")
    this.currentPageSpan = document.getElementById("current-page")

    // Initialize app
    this.init()
  }

  // Initialize app
  async init() {
    // Add event listeners
    this.setupEventListeners()

    // Check for movie ID in URL (for sharing)
    const urlParams = new URLSearchParams(window.location.search)
    const movieId = urlParams.get("id")

    if (movieId) {
      // Show movie details if ID is in URL
      await this.showMovieDetails(movieId)
    } else {
      // Load default search
      await this.searchMovies(CONFIG.DEFAULT_SEARCH)
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Search form submission
    this.searchForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const query = this.searchInput.value.trim()

      if (query) {
        this.searchMovies(query)
      }
    })

    // Enable horizontal scrolling for filter buttons on mobile
    const filterButtons = document.querySelector(".filter-buttons")
    if (filterButtons) {
      filterButtons.addEventListener("wheel", (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault()
          filterButtons.scrollLeft += e.deltaY
        }
      })

      // Touch scrolling for mobile
      let isDown = false
      let startX
      let scrollLeft

      filterButtons.addEventListener("mousedown", (e) => {
        isDown = true
        startX = e.pageX - filterButtons.offsetLeft
        scrollLeft = filterButtons.scrollLeft
      })

      filterButtons.addEventListener("mouseleave", () => {
        isDown = false
      })

      filterButtons.addEventListener("mouseup", () => {
        isDown = false
      })

      filterButtons.addEventListener("mousemove", (e) => {
        if (!isDown) return
        e.preventDefault()
        const x = e.pageX - filterButtons.offsetLeft
        const walk = (x - startX) * 2
        filterButtons.scrollLeft = scrollLeft - walk
      })
    }

    // Pagination buttons
    this.prevPageBtn.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--
        this.searchMovies(this.currentSearch, this.currentPage)
      }
    })

    this.nextPageBtn.addEventListener("click", () => {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.searchMovies(this.currentSearch, this.currentPage)
      }
    })

    // Filter type change
    this.filterType.addEventListener("change", () => {
      this.currentType = this.filterType.value
      this.currentPage = 1
      this.searchMovies(this.currentSearch, this.currentPage)
    })

    // Filter year change
    this.filterYear.addEventListener("change", () => {
      this.currentPage = 1
      this.searchMovies(this.currentSearch, this.currentPage)
    })

    // Sort by change
    this.sortBy.addEventListener("change", () => {
      this.sortMovies(this.sortBy.value)
    })

    // Navigation links - ensure they work from anywhere in the app
    this.homeLink.addEventListener("click", (e) => {
      e.preventDefault()
      this.showHome()
    })

    this.favoritesLink.addEventListener("click", (e) => {
      e.preventDefault()
      this.showFavorites()
    })

    this.watchlistLink.addEventListener("click", (e) => {
      e.preventDefault()
      this.showWatchlist()
    })

    // Filter buttons
    this.filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Toggle active state
        button.classList.toggle("active")

        // Update active filters
        this.updateActiveFilters()

        // Apply filters
        this.applyFilters()
      })
    })

    // Dropdown menu links
    this.dropdownLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()

        // Get category from link text
        const category = link.textContent.trim().toLowerCase()

        // Update heading
        document.getElementById("results-heading").textContent = `${link.textContent} Movies & Shows`

        // Search for category
        this.searchByCategory(category)
      })
    })

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle")
    const mainNav = document.getElementById("main-nav")
    const menuOverlay = document.getElementById("menu-overlay")

    if (mobileMenuToggle && mainNav && menuOverlay) {
      mobileMenuToggle.addEventListener("click", () => {
        mainNav.classList.toggle("active")
        menuOverlay.classList.toggle("active")
        document.body.classList.toggle("menu-open")
        mobileMenuToggle.innerHTML = mainNav.classList.contains("active")
          ? '<i class="fas fa-times"></i>'
          : '<i class="fas fa-bars"></i>'
      })

      // Close mobile menu when clicking on overlay
      menuOverlay.addEventListener("click", () => {
        mainNav.classList.remove("active")
        menuOverlay.classList.remove("active")
        document.body.classList.remove("menu-open")
        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>'
      })

      // Handle dropdown toggles in mobile view
      const dropdowns = document.querySelectorAll(".dropdown")
      dropdowns.forEach((dropdown) => {
        const dropdownLink = dropdown.querySelector("a")
        dropdownLink.addEventListener("click", (e) => {
          if (window.innerWidth <= 768) {
            e.preventDefault()
            dropdown.classList.toggle("active")

            // Close other dropdowns
            dropdowns.forEach((otherDropdown) => {
              if (otherDropdown !== dropdown) {
                otherDropdown.classList.remove("active")
              }
            })
          }
        })
      })
    }

  }

  // Update active filters
  updateActiveFilters() {
    this.activeFilters = Array.from(document.querySelectorAll(".filter-btn.active")).map((btn) =>
      btn.textContent.trim().toLowerCase(),
    )
  }

  // Apply filters to current movies
  applyFilters() {
    // If no filters are active, show all movies
    if (this.activeFilters.length === 0) {
      document.querySelectorAll(".movie-card").forEach((card) => {
        card.style.display = "block"
      })
      return
    }

    // Apply filters to movies
    document.querySelectorAll(".movie-card").forEach((card) => {
      const title = card.querySelector(".movie-title").textContent.toLowerCase()
      const year = card.querySelector(".movie-year").textContent.toLowerCase()

      // Check if movie matches any active filter
      const matchesFilter = this.activeFilters.some((filter) => {
        // Quality filters (480p, 720p, 1080p)
        if (["480p", "720p", "1080p"].includes(filter)) {
          return true // For demo purposes, assume all movies have these qualities
        }

        // Platform filters
        if (["amazonprime", "disney+", "netflix"].includes(filter)) {
          return Math.random() > 0.5 // For demo purposes, randomly match some movies
        }

        // Language filters
        if (["hindi", "english"].includes(filter)) {
          return Math.random() > 0.5 // For demo purposes, randomly match some movies
        }

        // Category filters
        if (["hollywood", "bollywood", "korean", "animation", "anime"].includes(filter)) {
          return title.includes(filter) || Math.random() > 0.5 // For demo purposes
        }

        return false
      })

      // Show or hide based on filter match
      card.style.display = matchesFilter ? "block" : "none"
    })
  }

  // Search by category
  async searchByCategory(category) {
    this.currentPage = 1

    // For demo purposes, we'll just search for the category name
    // In a real app, you would have a more sophisticated category search
    await this.searchMovies(category)

    // Apply additional filtering if needed
    document.querySelectorAll(".movie-card").forEach((card) => {
      const title = card.querySelector(".movie-title").textContent.toLowerCase()

      // Show or hide based on category match (random for demo)
      const matchesCategory = title.includes(category) || Math.random() > 0.5
      card.style.display = matchesCategory ? "block" : "none"
    })
  }

  // Search for movies
  async searchMovies(query, page = 1) {
    if (this.isLoading) return

    this.isLoading = true
    ui.showLoader()

    try {
      // Update current search
      this.currentSearch = query
      this.currentPage = page

      // Add to recent searches
      storageManager.addToRecentSearches(query)

      // Get filter values
      const type = this.filterType.value !== "all" ? this.filterType.value : ""
      const year = this.filterYear.value

      // Construct search query
      let searchQuery = query
      if (year) {
        searchQuery += `&y=${year}`
      }

      // Search movies
      const result = await movieAPI.searchMovies(searchQuery, page, type)

      // Update state
      this.totalPages = result.totalPages

      // Display movies with appropriate heading
      let heading = "Latest Movies & Series"
      if (query !== CONFIG.DEFAULT_SEARCH) {
        heading = `Search Results for "${query}"`
      }

      ui.displayMovies(result.movies, heading)

      // Update pagination
      ui.updatePagination(page, this.totalPages)

      // Update navigation
      this.updateNavigation("home")

      // Always show movie section and hide details section
      document.getElementById("movie-details").classList.add("hidden")
      document.getElementById("movies-section").classList.remove("hidden")

      // Apply any active filters
      if (this.activeFilters.length > 0) {
        this.applyFilters()
      }

      // Scroll to top
      window.scrollTo(0, 0)
    } catch (error) {
      ui.showError(error.message || "Error searching movies")
    } finally {
      this.isLoading = false
      ui.hideLoader()
    }
  }

  // Show movie details
  async showMovieDetails(imdbID) {
    if (this.isLoading) return

    this.isLoading = true
    ui.showLoader()

    try {
      const movie = await movieAPI.getMovieDetails(imdbID)
      ui.displayMovieDetails(movie)
    } catch (error) {
      ui.showError(error.message || "Error loading movie details")
    } finally {
      this.isLoading = false
      ui.hideLoader()
    }
  }

  // Show home page
  async showHome() {
    // Reset filters
    this.filterType.value = "all"
    this.filterYear.value = ""
    this.currentPage = 1

    // Clear active filter buttons
    document.querySelectorAll(".filter-btn.active").forEach((btn) => {
      btn.classList.remove("active")
    })
    this.activeFilters = []

    // Search default query
    await this.searchMovies(CONFIG.DEFAULT_SEARCH)

    // Update navigation
    this.updateNavigation("home")

    // Always show movie section and hide details section
    document.getElementById("movie-details").classList.add("hidden")
    document.getElementById("movies-section").classList.remove("hidden")
  }

  // Show favorites
  showFavorites() {
    const favorites = storageManager.getFavorites()

    if (favorites.length === 0) {
      ui.displayMovies([], "Your Favorites")
      ui.showError("You have no favorite movies yet")
    } else {
      ui.displayMovies(favorites, "Your Favorites")
    }

    // Show pagination
    document.getElementById("pagination").style.display = "flex"

    // Disable pagination buttons since we're showing all favorites on one page
    this.prevPageBtn.disabled = true
    this.nextPageBtn.disabled = true
    this.currentPageSpan.textContent = "Page 1 of 1"

    // Update navigation
    this.updateNavigation("favorites")

    // Always show movie section and hide details section
    document.getElementById("movie-details").classList.add("hidden")
    document.getElementById("movies-section").classList.remove("hidden")
  }

  // Show watchlist
  showWatchlist() {
    const watchlist = storageManager.getWatchlist()

    if (watchlist.length === 0) {
      ui.displayMovies([], "Your Watchlist")
      ui.showError("You have no movies in your watchlist yet")
    } else {
      ui.displayMovies(watchlist, "Your Watchlist")
    }

    // Show pagination
    document.getElementById("pagination").style.display = "flex"

    // Disable pagination buttons since we're showing all watchlist on one page
    this.prevPageBtn.disabled = true
    this.nextPageBtn.disabled = true
    this.currentPageSpan.textContent = "Page 1 of 1"

    // Update navigation
    this.updateNavigation("watchlist")

    // Always show movie section and hide details section
    document.getElementById("movie-details").classList.add("hidden")
    document.getElementById("movies-section").classList.remove("hidden")
  }

  // Sort movies
  sortMovies(sortBy) {
    const moviesGrid = document.getElementById("movies-grid")
    const movieCards = Array.from(moviesGrid.querySelectorAll(".movie-card"))

    movieCards.sort((a, b) => {
      if (sortBy === "title") {
        const titleA = a.querySelector(".movie-title").textContent.toLowerCase()
        const titleB = b.querySelector(".movie-title").textContent.toLowerCase()
        return titleA.localeCompare(titleB)
      } else if (sortBy === "year") {
        const yearA = Number.parseInt(a.querySelector(".movie-year").textContent)
        const yearB = Number.parseInt(b.querySelector(".movie-year").textContent)
        return yearB - yearA // Newest first
      } else if (sortBy === "rating") {
        const ratingA = a.querySelector(".movie-rating")
          ? Number.parseFloat(a.querySelector(".movie-rating").textContent)
          : 0
        const ratingB = b.querySelector(".movie-rating")
          ? Number.parseFloat(b.querySelector(".movie-rating").textContent)
          : 0
        return ratingB - ratingA // Highest first
      }

      return 0
    })

    // Clear and re-append sorted cards
    moviesGrid.innerHTML = ""
    movieCards.forEach((card) => moviesGrid.appendChild(card))
  }

  // Update navigation active state
  updateNavigation(active) {
    this.homeLink.classList.toggle("active", active === "home")
    this.favoritesLink.classList.toggle("active", active === "favorites")
    this.watchlistLink.classList.toggle("active", active === "watchlist")

    // Always show pagination
    document.getElementById("pagination").style.display = "flex"
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const app = new App()

  // Make app globally available
  window.app = app
})

