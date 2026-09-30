BookTracker

BookTracker is a simple browser-based app for readers who want to keep track of books they want to read, are currently reading, and have finished. It lets you add books, update their status, filter your list, and keeps your reading list saved in the browser.

How to run it

In the sandbox Terminal, run npm start.

Click Open your app to open the server's URL.

The server uses PORT, MONGODB_URI, and JWT_SECRET.

The sandbox already sets JWT_SECRET, so it works out of the box.

About BookTracker

BookTracker is for people who want a simple way to keep track of books they want to read, are reading, or have finished.
It lets each user create and manage their own book list.
The app uses Node and Express for the server and MongoDB for storing data.
Passwords are bcrypt-hashed, and login uses a JWT stored in an httpOnly cookie.

How a request flows

The browser calls /api/books when it needs the user's books.
Express matches the request to the /api/books route.
The requireAuth middleware reads and verifies the JWT cookie.
Mongoose queries the MongoDB books collection for that user.
The browser receives the list and renders the books on the page.

Tradeoff and what I'd improve next

One tradeoff I made was storing the login session as a JWT in an httpOnly cookie, which keeps the server stateless but means the server cannot easily revoke an individual token before it expires.
Next, I would add password reset so users can recover their accounts if they forget their passwords.

My pitch

BookTracker gives people a simple place to track the books they want to read, are reading, and have finished.
The pieces fit together as browser → Express → MongoDB, with authentication protecting each user's books.
Next, I would add password reset to make account recovery easier.