// Initial array of quotes
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Select DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");

// Function to show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Add one!";
    return;
  }

  // Pick a random quote
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Update DOM
  quoteDisplay.innerHTML = `<div class="quote"><strong>${quote.category}:</strong> ${quote.text}</div>`;
}

// Function to add a new quote
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  // Add new quote to the array
  quotes.push({ text, category });

  // Clear input fields
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  // Show the newly added quote
  quoteDisplay.innerHTML = `<div class="quote"><strong>${category}:</strong> ${text}</div>`;
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Show an initial quote
showRandomQuote();
