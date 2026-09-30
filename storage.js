function saveBooks(books) {
  localStorage.setItem('booktracker-books', JSON.stringify(books));
}

async function loadBooks() {
  const savedBooks = localStorage.getItem('booktracker-books');

  if (!savedBooks) {
    return [];
  }

  try {
    const books = JSON.parse(savedBooks);
    return Array.isArray(books) ? books : [];
  } catch {
    return [];
  }
}

export{
    saveBooks,loadBooks
};