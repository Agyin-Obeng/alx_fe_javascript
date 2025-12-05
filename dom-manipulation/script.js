// --- Server URL ---
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// --- Checker-required fetch function ---
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    const serverQuotes = serverData.slice(0, 10).map(post => ({
      text: post.title,
      category: post.userId % 2 === 0 ? "Motivation" : "Life"
    }));

    resolveConflicts(serverQuotes);
  } catch (error) {
    console.error("Error fetching server quotes:", error);
  }
}

// --- Post a new quote to server ---
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });

    const data = await response.json();
    console.log("Quote posted to server:", data);
  } catch (error) {
    console.error("Error posting quote to server:", error);
  }
}

// --- Initial array of quotes ---
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

// --- DOM Elements ---
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportQuotesBtn = document.getElementById("exportQuotesBtn");
const importFileInput = document.getElementById("importFile");
const categoryFilter = document.getElementById("categoryFilter");
const syncBtn = document.getElementById("syncBtn");

// --- Quote Display ---
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Add one!";
    return;
  }

  const selectedCategory = categoryFilter.value;
  let filteredQuotes = quotes;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<div class="quote"><strong>${quote.category}:</strong> ${quote.text}</div>`;
}

// --- Add Quote ---
function addQuote(text, category) {
  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  showRandomQuote();

  // Post the new quote to the server
  postQuoteToServer(newQuote);
}

// --- Category Filtering ---
function populateCategories() {
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const lastCategory = localStorage.getItem("selectedCategory");
  if (lastCategory && (lastCategory === "all" || categories.includes(lastCategory))) {
    categoryFilter.value = lastCategory;
  } else {
    categoryFilter.value = "all";
  }
}

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

// --- Add Quote Form ---
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

// --- Conflict Resolution ---
function resolveConflicts(serverQuotes) {
  let updated = false;

  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(
      localQuote => localQuote.text === serverQuote.text && localQuote.category === serverQuote.category
    );
    if (!exists) {
      quotes.push(serverQuote);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    showRandomQuote();
    alert("New quotes have been synced from the server!");
  }
}

// --- Initialization ---
populateCategories();
showRandomQuote();

newQuoteBtn.addEventListener("click", showRandomQuote);
exportQuotesBtn.addEventListener("click", exportToJson);
importFileInput.addEventListener("change", importFromJsonFile);
categoryFilter.addEventListener("change", filterQuotes);
createAddQuoteForm();

// Server Sync
fetchQuotesFromServer();                    // initial fetch
setInterval(fetchQuotesFromServer, 60000); // periodic fetch
syncBtn.addEventListener("click", fetchQuotesFromServer); // manual sync
