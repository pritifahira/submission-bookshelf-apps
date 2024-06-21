const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("add-form");
  if (isStorageExist()) {
    loadDataFromStorage();
  }
  submitForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addBook();
  });
});

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id: Number(id),
    title,
    author,
    year: Number(year),
    isComplete,
  };
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return console.log("Buku tidak ditemukan!");
}

function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Browser kamu tidak mendukung Web Storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = document.getElementById("year").value;
  const isComplete = document.getElementById("isComplete").checked;
  const id = generateId();

  const bookObject = generateBookObject(id, title, author, year, isComplete);

  books.push(bookObject);
  const bookTitle = `${title}`;
  const message = ` Successfully Added!`;
  toastNotification(message, bookTitle);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function addBookToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  const title = bookTarget.title;
  const bookTitle = `${title}`;
  const message = ` Added to Finished!`;
  toastNotification(message, bookTitle);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;

  const title = bookTarget.title;
  const bookTitle = `${title}`;
  const message = ` Added to Unfinished!`;
  toastNotification(message, bookTitle);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  const bookTargetProperties = findBook(bookId);
  if (bookTarget === -1) return;

  const title = bookTargetProperties.title;
  const bookTitle = `${title}`;
  const message = ` Successfully Removed!`;
  toastNotification(message, bookTitle);
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function updateBook(bookId) {
  const bookTarget = findBook(Number(bookId));
  if (bookTarget == null) return;
  const title = bookTarget.title;

  const updateTitle = document.getElementById("update-title").value;
  const updateAuthor = document.getElementById("update-author").value;
  const updateYear = document.getElementById("update-year").value;
  const updateisComplete = document.getElementById("update-isComplete").checked;

  bookTarget.title = updateTitle;
  bookTarget.author = updateAuthor;
  bookTarget.year = Number(updateYear);
  bookTarget.isComplete = updateisComplete;

  document.dispatchEvent(new Event(RENDER_EVENT));
  const bookTitle = `${title}`;
  const message = ` Sucessfully Updated!`;
  toastNotification(message, bookTitle);
  saveData();
}

function toastNotification(message, bookTitle) {
  const toastElement = [].slice.call(document.querySelectorAll('.toast'));
  const toastBookTitle = document.getElementById("toast-book-title");
  const toastMessage = document.getElementById("toast-message");

  toastBookTitle.innerText = bookTitle;
  toastMessage.innerText = message;

  const showToast = toastElement.map(function(toastShow) {
    return new bootstrap.Toast(toastShow)
  })
  showToast.forEach(toast => toast.show()) 

  setTimeout(function() {
    showToast.forEach(function(toast) {
      toast.hide();
    });
  }, 3000);
}

function renderBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;
  let row = document.createElement("tr");
  let cell1 = row.insertCell(0);
  let cell2 = row.insertCell(1);
  let cell3 = row.insertCell(2);
  let cell4 = row.insertCell(3);

  cell1.textContent = title;
  cell2.textContent = author;
  cell3.textContent = year;

  const removeButton = document.createElement("button");
  removeButton.role = "button";
  removeButton.type = "button";
  removeButton.id = "action-button";
  removeButton.className = "btn btn-outline-danger btn-sm";
  const removeIcon = document.createElement("i");
  removeIcon.className = "bi bi-trash-fill";

  removeButton.appendChild(removeIcon);

  removeButton.addEventListener("click", function () {
    removeBook(id);
  });

  const updateButton = document.createElement("button");
  updateButton.role = "button";
  updateButton.type = "button";
  updateButton.id = "action-button";
  updateButton.className = "btn btn-outline-primary btn-sm";
  updateButton.setAttribute("data-bs-toggle", "modal");
  updateButton.setAttribute("data-bs-target", "#updateModal");

  const updateIcon = document.createElement("i");
  updateIcon.className = "bi bi-pencil-square";

  updateButton.appendChild(updateIcon);

  updateButton.addEventListener("click", function () {
    const bookItem = findBook(Number(id));
    const textTitle = document.getElementById("update-title");
    const textAuthor = document.getElementById("update-author");
    const textYear = document.getElementById("update-year");
    const isComplete = document.getElementById("update-isComplete");

    textTitle.value = bookItem.title;
    textAuthor.value = bookItem.author;
    textYear.value = bookItem.year;
    isComplete.checked = bookItem.isComplete;

    const btnUpdate = document.getElementById("btn-update");
    btnUpdate.addEventListener("click", function () {
      updateBook(id);
      closeModal();
    });
  });


  const undoButton = document.createElement("button");
  undoButton.role = "button";
  undoButton.type = "button";
  undoButton.id = "action-button";
  undoButton.className = "btn btn-outline-warning btn-sm";
  const undoIcon = document.createElement("i");
  undoIcon.className = "bi bi-arrow-counterclockwise";

  undoButton.appendChild(undoIcon);

  undoButton.addEventListener("click", function () {
    undoBookFromComplete(id);
  });

  const checkButton = document.createElement("button");
  checkButton.type = "button";
  checkButton.role = "button";
  checkButton.id = "action-button";
  checkButton.className = "btn btn-outline-success btn-sm";
  const checkIcon = document.createElement("i");
  checkIcon.className = "bi bi-check2-all";

  checkButton.appendChild(checkIcon);

  checkButton.addEventListener("click", function () {
    addBookToComplete(id);
  });

  const actionDiv = document.createElement("div");
  actionDiv.id = "action";

  if (isComplete == false) {
    cell4.appendChild(actionDiv);
    actionDiv.appendChild(checkButton);
    actionDiv.appendChild(updateButton);
    actionDiv.appendChild(removeButton);
  } else {
    cell4.appendChild(actionDiv);
    actionDiv.appendChild(undoButton);
    actionDiv.appendChild(updateButton);
    actionDiv.appendChild(removeButton);
  }

  return row;
}

document.addEventListener(RENDER_EVENT, function () {
  const unfinishedBookList = document.getElementById("not-finished-reading");
  const finishedBookList = document.getElementById("finished-reading");
  const searchForm = document.getElementById("search-form");
  let isFormSubmitted = false;

  function renderBooks(books) {
    unfinishedBookList.innerHTML = "";
    finishedBookList.innerHTML = "";

    for (const bookItem of books) {
      const bookElement = renderBook(bookItem);
      if (bookItem.isComplete) {
        finishedBookList.append(bookElement);
      } else {
        unfinishedBookList.append(bookElement);
      }
    }
  }

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    isFormSubmitted = true;

    const keyword = document.getElementById("search-book").value.toLowerCase();

    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(keyword) ||
      book.author.toLowerCase().includes(keyword)
    );
    renderBooks(filteredBooks);
  });

  renderBooks(books);
});

function closeModal() {
  const modalElement = document.getElementById('updateModal');
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) {
      modalInstance.hide();
  } else {
      const newModalInstance = new bootstrap.Modal(modalElement);
      newModalInstance.hide();
  }
}