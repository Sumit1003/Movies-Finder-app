// Import UI module
import ui from "./ui.js"

// Authentication Functions
class Auth {
  constructor() {
    this.isLoggedIn = false
    this.currentUser = null

    // DOM Elements
    this.loginForm = document.getElementById("login-form")
    this.signupForm = document.getElementById("signup-form")
    this.loginLink = document.getElementById("login-link")

    // Initialize
    this.init()
  }

  // Initialize auth
  init() {
    // Check if user is already logged in
    const user = localStorage.getItem("movieflix_user")
    if (user) {
      this.currentUser = JSON.parse(user)
      this.isLoggedIn = true
      this.updateUI()
    }

    // Add event listeners
    this.setupEventListeners()
  }

  // Setup event listeners
  setupEventListeners() {
    // Login form submission
    this.loginForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const email = document.getElementById("login-email").value
      const password = document.getElementById("login-password").value

      this.login(email, password)
    })

    // Signup form submission
    this.signupForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const name = document.getElementById("signup-name").value
      const email = document.getElementById("signup-email").value
      const password = document.getElementById("signup-password").value
      const confirmPassword = document.getElementById("signup-confirm-password").value

      this.signup(name, email, password, confirmPassword)
    })
  }

  // Login user
  login(email, password) {
    // For demo purposes, we'll use localStorage to simulate authentication
    // In a real app, you would use Firebase or another auth service

    const users = JSON.parse(localStorage.getItem("movieflix_users") || "[]")
    const user = users.find((u) => u.email === email)

    if (!user) {
      ui.showError("User not found")
      return
    }

    if (user.password !== password) {
      ui.showError("Invalid password")
      return
    }

    // Set current user
    this.currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    }

    this.isLoggedIn = true

    // Save to localStorage
    localStorage.setItem("movieflix_user", JSON.stringify(this.currentUser))

    // Update UI
    this.updateUI()

    // Close modal
    ui.closeModals()

    // Show success message
    ui.showMessage(`Welcome back, ${user.name}!`, "success")
  }

  // Signup user
  signup(name, email, password, confirmPassword) {
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      ui.showError("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      ui.showError("Passwords do not match")
      return
    }

    // For demo purposes, we'll use localStorage to simulate authentication
    // In a real app, you would use Firebase or another auth service

    const users = JSON.parse(localStorage.getItem("movieflix_users") || "[]")

    // Check if user already exists
    if (users.some((u) => u.email === email)) {
      ui.showError("User with this email already exists")
      return
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
    }

    // Add to users array
    users.push(newUser)

    // Save to localStorage
    localStorage.setItem("movieflix_users", JSON.stringify(users))

    // Set current user
    this.currentUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    }

    this.isLoggedIn = true

    // Save to localStorage
    localStorage.setItem("movieflix_user", JSON.stringify(this.currentUser))

    // Update UI
    this.updateUI()

    // Close modal
    ui.closeModals()

    // Show success message
    ui.showMessage(`Welcome, ${newUser.name}!`, "success")
  }

  // Logout user
  logout() {
    this.isLoggedIn = false
    this.currentUser = null

    // Remove from localStorage
    localStorage.removeItem("movieflix_user")

    // Update UI
    this.updateUI()

    // Show success message
    ui.showMessage("You have been logged out", "success")
  }

  // Update UI based on auth state
  updateUI() {
    if (this.isLoggedIn) {
      this.loginLink.textContent = `Logout (${this.currentUser.name})`
      this.loginLink.addEventListener("click", (e) => {
        e.preventDefault()
        this.logout()
      })
    } else {
      this.loginLink.textContent = "Login"
      this.loginLink.addEventListener("click", (e) => {
        e.preventDefault()
        ui.openAuthModal()
      })
    }
  }

  // Check if user is logged in
  isAuthenticated() {
    return this.isLoggedIn
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser
  }
}

// Create and export auth instance
const auth = new Auth()
export default auth

