// API Configuration
const CONFIG = {
  API_KEY: "558d0e9d", // Using the correct API key from your original request
  API_URL: "https://www.omdbapi.com/", // Fixed the base URL - no parameters here
  YOUTUBE_API_KEY: "AIzaSyD9nT7PpOo27z0UOF6LKze9glsBG8K6sSc",
  DEFAULT_SEARCH: "avengers",
  RESULTS_PER_PAGE: 15,
  MAX_RECENT_SEARCHES: 5,
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyAKda6rspFY-meX_Q7OljKHKcojOFIsiFI",
    authDomain: "movies-search-app-c8d2e.firebaseapp.com",
    projectId: "movies-search-app-c8d2e",
    storageBucket: "movies-search-app-c8d2e.firebasestorage.app",
    messagingSenderId: "1054613013808",
    appId: "1:1054613013808:web:8a2864ab2e2d7b45cab4f5",
    measurementId: "G-TFVESPQPSP",
  },
}

// Export the config for ES modules
export default CONFIG

