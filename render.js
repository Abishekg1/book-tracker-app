export function renderList(books, currentFilter, listEl) {
  listEl.textContent = '';

  const visibleBooks =
    currentFilter === 'all'
      ? books
      : books.filter(function (book) {
          return book.status === currentFilter;
        });

  if (visibleBooks.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty';
    emptyMessage.textContent =
      'No books here yet. Add one above to get started.';
    listEl.appendChild(emptyMessage);
    return;
  }

  for (const book of visibleBooks) {
    listEl.appendChild(renderBookCard(book));
  }
}

function renderBookCard(book) {
  const card = document.createElement('div');
  card.dataset.id = book.id;

  const title = document.createElement('h3');
  title.textContent = book.title;

  const author = document.createElement('p');
  author.textContent = book.author;

  const status = document.createElement('p');
  status.textContent = 'Status: ' + book.status;

  if (book.finishedAt) {
    const date = document.createElement('span');
    date.textContent = ' (finished ' + book.finishedAt + ')';
    status.appendChild(date);
  }

  card.appendChild(title);
  card.appendChild(author);
  card.appendChild(status);

  for (const action of nextActions(book.status)) {
    const button = document.createElement('button');
    button.dataset.action = action;

    if (action === 'start') button.textContent = 'Start reading';
    else if (action === 'finish') button.textContent = 'Mark finished';
    else if (action === 'back') button.textContent = 'Move back';
    else button.textContent = 'Delete';

    card.appendChild(button);
  }

  return card;
}

function nextActions(status) {
  switch (status) {
    case 'want': return ['start', 'finish', 'delete'];
    case 'reading': return ['finish', 'back', 'delete'];
    case 'finished': return ['back', 'delete'];
    default: return [];
  }
}

export function renderCounts(books, countsEl) {
  countsEl.textContent = '';

  const want = books.filter(b => b.status === 'want').length;
  const reading = books.filter(b => b.status === 'reading').length;
  const finished = books.filter(b => b.status === 'finished').length;

  const summary = document.createElement('p');
  summary.className = 'summary';
  summary.textContent =
    want + ' want to read · ' +
    reading + ' reading · ' +
    finished + ' finished';

  countsEl.appendChild(summary);
}
