BookTracker

BookTracker is a simple browser-based app for readers who want to keep track of books they want to read, are currently reading, and have finished. It lets you add books, update their status, filter your list, and keeps your reading list saved in the browser.

How to use

Add a book by entering its title and author, then click Add Book.

Use Start reading, Mark finished, or Move back to change a book's status.

What I learned

I learned how to use JavaScript to update the page dynamically when data changes.

I split the app into modules so each file has one responsibility. For example, storage.js handles saving and loading the books array with localStorage.

How a click becomes data

When I click Mark finished, the click handler finds the matching book in the books array and changes its status to finished. It then saves the updated array to localStorage as JSON and renders the updated list on screen.

When the page loads again, the saved JSON is read from localStorage and converted back into the books array, so the updated data appears on screen.

Publishing the static site

Publishing a static site means putting the files that make up the website on a web server so people can open the site through a public URL.

For BookTracker, the published files are index.html, styles.css, and the JavaScript modules such as app.js and storage.js. The browser loads these files and runs the HTML, CSS, and JavaScript to display and operate the app.

Trade-offs and what I would change

Trade-off: Using localStorage keeps the app simple and avoids needing a backend, but the data is only available in that browser.

Change I would make: I would add a backend database so the book list could be saved and accessed across devices.

Commits this step

First commit: split the app into app.js, render.js, and storage.js, with module imports.

Second commit: make loadBooks async, wrap startup in async main, and add .gitignore for node_modules.
Browser requests and Node

When my browser opens a page, the browser sends a request to a web server asking for the page and its files. The server sends a response containing those files, and the browser uses them to display the page.

When JavaScript runs in Node, it runs outside the browser. Node does not automatically provide browser APIs such as localStorage or document. Instead, Node can run JavaScript directly and can work with things such as files and network connections.

The JSON file was not enough for an online app because data could be lost on restart, concurrent users could overwrite each other’s changes, and querying specific books would require reading the whole file. A database gives the app safer concurrent storage and makes it easier to query books.
Running the server

Start the server with:

npm start


The server uses these environment variables:

PORT — the port the server listens on.

MONGODB_URI — the MongoDB connection string.

JWT_SECRET — the secret used to sign authentication tokens.

In the studio sandbox, JWT_SECRET is set automatically, so the server works out of the box.