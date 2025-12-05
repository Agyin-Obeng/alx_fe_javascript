// Initial array of quotes
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// --- Local Storage Functions ---
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Load quotes from localStorage
loadQuotes();

// Select DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportQuotesBtn = document.getElementById("exportQuotesBtn");
const importFileInput = document.getElementById("importFile");
const categoryFilter = document.getElementById("categoryFilter");

// --- Functions ---

// Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Add one!";
    return;
  }

  const filteredCategory = categoryFilter.value;
  let filteredQuotes = quotes;

  if (filteredCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === filteredCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<div class="quote"><strong>${quote.category}:</strong> ${quote.text}</div>`;
}

// Add a new quote
function addQuote(text, category) {
  quotes.push({ text, category });
  saveQuotes();           // persist
  populateCategories();   // refresh category dropdown
  showRandomQuote();
}

// Populate category dropdown
function populateCategories() {
  // Keep "All Categories" option
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  const lastCategory = localStorage.getItem("selectedCategory");
  if (lastCategory && (lastCategory === "all" || categories.includes(lastCategory))) {
    categoryFilter.value = lastCategory;
  } else {
    categoryFilter.value = "all";
  }
}

// Filter quotes when category changes
function filterQuotes() {
  localStorage.setItem("selectedCategory", categoryFilter.value);
  showRandomQuote();
}

// --- JSON Export ---
function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// --- JSON Import ---
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        showRandomQuote();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Expected an array of quotes.");
      }
    } catch (error) {
      alert("Error parsing JSON file.");
      console.error(error);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Create Add Quote Form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const heading = document.createElement("h2");
  heading.textContent = "Add a New Quote";
  formContainer.appendChild(heading);

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";
  formContainer.appendChild(quoteInput);

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  formContainer.appendChild(categoryInput);

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", () => {
    const text = quoteInput.value.trim();
    const category = categoryInput.value.trim();
    if (!text || !category) {
      alert("Please enter both a quote and a category.");
      return;
    }
    addQuote(text, category);
    quoteInput.value = "";
    categoryInput.value = "";
  });
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// --- Initialization ---
populateCategories();
showRandomQuote();
newQuoteBtn.addEventListener("click", showRandomQuote);
exportQuotesBtn.addEventListener("click", exportToJson);
importFileInput.addEventListener("change", importFromJsonFile);
categoryFilter.addEventListener("change", filterQuotes);
createAddQuoteForm();
