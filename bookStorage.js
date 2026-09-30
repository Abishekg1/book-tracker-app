const Book = require('./Book.js');

async function getBooks(userId) {
  return await Book.find({ user: userId });
}

async function addBook(userId, data) {
  return await Book.create({
    ...data,
    user: userId
  });
}

async function updateBook(userId, id, changes) {
  return await Book.findOneAndUpdate(
    { _id: id, user: userId },
    changes,
    { new: true }
  );
}

async function deleteBook(userId, id) {
  return await Book.findOneAndDelete({
    _id: id,
    user: userId
  });
}


module.exports = {
  getBooks,
  addBook,
  updateBook,
  deleteBook
};
