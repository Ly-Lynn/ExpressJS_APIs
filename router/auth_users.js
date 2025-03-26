const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const crypto = require('crypto');
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  for (let u of users) {
    if(u.username === username){
      return false;
    }
  }
  return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  for (let u of users) {
    if(u.username === username && u.password === password){
      return true;
    }
  }
  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  let user = req.body;
  let username = user.username;
  let password = user.password;
  if (!username || !password) {
    return res.status(404).json({message: "Missing username or password"});
  }
  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      username: username,
    }, "access", { expiresIn: 60 });
    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).json({message: "User logged in successfully"});
  }
  return res.status(208).json({message: "Invalid login"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let id = req.params.isbn;
  let uid = req.body.uid;
  let review = req.body;
  if (books[id]) {
    if (uid) {
      if (books[id].reviews[uid]) {
        review.username = req.user.username || "Anonymous";
        review.date = new Date().toISOString();
        books[id].reviews[uid] = review;
        return res.status(200).json({message: `Review updated successfully ${JSON.stringify(books[id].reviews[uid])}`});
      }
      return res.status(404).json({message: "Review of this ISBN not found"});
    }
    uid = crypto.randomBytes(4).toString('hex');
    review.uid = uid;
    review.username = req.user.username || "Anonymous";
    review.date = new Date().toISOString();
    books[id].reviews[uid] = review;
    return res.status(200).json({message: `Review added successfully ${JSON.stringify(books[id].reviews[uid])}`});
  }
  return res.status(404).json({message: "ISBN not found"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  let username = req.user.username;
  let id = req.params.isbn;
  let uid = req.body.uid;
  if (books[id]) {
    if (books[id].reviews[uid]) {
      if (books[id].reviews[uid].username === username) {
        delete books[id].reviews[uid];
        return res.status(200).json({message: `Review deleted successfully`});
      }
      return res.status(401).json({message: "Error in verifying user"});
    }
    return res.status(404).json({message: "Review not found"});
  }
  // if (books[id] && books[id].reviews[uid] && books[id].reviews[uid].username === username) {
  //     delete books[id].reviews[uid];
  //     return res.status(200).json({message: `Review deleted successfully`});
  // }
  return res.status(404).json({message: "Review not found"});
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
