// Import necessary modules
import express from "express";          // Framework for building web applications
import bodyParser from "body-parser";   // Middleware to parse incoming request bodies
import axios from "axios";              // Promise-based HTTP client for making API requests
import countryList from "country-list";  // Utility to get country names from country codes

// Initialize the Express application
const app = express();

// Define the port the server will listen on
const port = 3000;

// Define the URLs for the external APIs
const API_URLA = "https://api.agify.io";         // API to predict age based on name
const API_URLG = "https://api.genderize.io";     // API to predict gender based on name
const API_URLN = "https://api.nationalize.io";   // API to predict nationality based on name

// Middleware to serve static files from the 'public' directory
app.use(express.static("public"));

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to EJS for rendering dynamic HTML pages
app.set("view engine", "ejs");

// Route handler for GET requests to the root URL ('/')
app.get("/", (req, res) => {
  // Render 'index.ejs' template with initial content
  res.render("index.ejs", { content: "Waiting for data.." });
});

// Route handler for POST requests to '/submit-name'
app.post("/submit-name", async (req, res) => {
  try {
    // Extract the name submitted from the form
    const name1 = req.body.name;

    // Make parallel API requests to fetch age, gender, and nationality data
    const resultA = await axios.get(`${API_URLA}?name=${name1}`); // Agify API call
    const resultG = await axios.get(`${API_URLG}?name=${name1}`); // Genderize API call
    const resultN = await axios.get(`${API_URLN}?name=${name1}`); // Nationalize API call

    // Destructure the response data to extract necessary information
    const { name: personName, age: personAge } = resultA.data;       // Extract name and age
    const { gender: personGender } = resultG.data;                   // Extract gender
    const data = resultN.data;                                       // Extract nationality data

    // Check if nationality data is available
    let personCountryName = "Unknown";
    if (data.country && data.country.length > 0) {
      const personCountryID = data.country[0].country_id;            // Get the first country ID
      personCountryName = countryList.getName(personCountryID) || "Unknown"; // Convert country ID to name
    }

    // Prepare the content object with all retrieved information
    const contentData = {
      name: personName,
      age: personAge,
      gender: personGender,
      country: personCountryName,
    };

    // Render 'index.ejs' with the retrieved data
    res.render("index.ejs", { content: contentData });

    // Log the retrieved data to the server console for debugging
    console.log("Retrieved data", contentData);
  } catch (error) {
    // In case of an error (e.g., API failure), render 'index.ejs' with error details
    // Check if the error has a response from the API
    if (error.response && error.response.data) {
      res.render("index.ejs", { content: JSON.stringify(error.response.data) });
    } else {
      // For other types of errors, send a generic error message
      res.render("index.ejs", { content: "An error occurred while processing your request." });
    }

    // Log the error to the server console for debugging
    console.error("Error retrieving data:", error);
  }
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server running on: http://localhost:${port}`);
});
