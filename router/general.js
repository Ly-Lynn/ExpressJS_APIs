const express = require('express');
const axios = require('axios');
const books = require("./booksdb.js");

async function getBooks() {
  return await new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch (err) {
      reject(err);
    }
  }
  );
}

// let books = getBooks();
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  let user = req.body;
  let username = user.username;
  if (isValid(username)) {
    users.push({
      username: user.username,
      password: user.password
    });
    return res.status(200).json({message: `User registered successfully`});
  }
  return res.status(400).json({message: "User already exists"});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  let books = getBooks();
  books.then((result) => {
    books = result;
    if (books)
      return res.send(JSON.stringify(books));
  }).catch((err) => {
    console.log(err);
    return res.status(404).json({message: "Books not found"});
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let id = req.params.isbn;
  let books = getBooks();
  books.then((result) => {
    books = result;
    if (books[id])
      return res.send(JSON.stringify(books[id]));
  }).catch((err) => {
    console.log(err);
    return res.status(404).json({message: "ISBN not found"});
  });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let name = req.params.author;
  let books = getBooks();
  let results = [];
  books.then((result) => {
    books = result;
    for (let b in books) {
      if (books[b].author === name)
        results.push(books[b]);
    }
    if (results.length > 0)
      return res.send(JSON.stringify(results));
  }).catch((err) => {
    console.log(err);
    return res.status(404).json({message: `Author not found ${name} ${result}`});
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let title = req.params.title;
  let books = getBooks();
  books.then((result) => {
    books = result;
    for (let b in books) {
      if (books[b].title === title)
        return res.send(JSON.stringify(books[b]));
    }
  }).catch((err) => {
    console.log(err);
    return res.status(404).json({message: "Title not found"});
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let id = req.params.isbn;
  let books = getBooks();
  books.then((result) => {
    books = result;
    if (books[id].reviews)
      return res.send(JSON.stringify(books[id].reviews));
  }
  ).catch((err) => {
    console.log(err);
    return res.status(404).json({message: "Review not found"});
  })
});

module.exports.general = public_users;
