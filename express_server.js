const express = require("express");
const morgan = require("morgan");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

// require helper functions from helpers.js

const { getUserByEmail, generateRandomString, userOwnedURLs,
  getUserEmail } = require('./helpers.js');

// ----------- middlewares

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['secret']
}));

// ------------ data base

const urlDatabase = {};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@b.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "ab@cd.com",
    password: "456",
  },
};

// ---------- routes / endpoints

app.get('/', (req, res) => {
  const userId = req.session.userID;
  if (!userId) {
    res.redirect('/login');
  }
  res.redirect('/urls')
});

// renders urls_new with urls created by user when logged in.
// shows error otherwise without active user.
app.get("/urls/new", (req, res) => {
  const userId = req.session.userID;
  if (!userId) {
    return res.send("<h1>Error! <a href=\"/register\">Register</a> or <a href=\"/login\">login</a> before you can start using Tiny Urls!</1>");
  }

  const user = getUserByEmail(req.session["userID"], users);
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// validations before granting access to specific url.
app.get("/urls/:id", (req, res) => {
  const userId = req.session.userID;
  if (!userId) return res.send("No user is currently logged in.");

  const userEmail = users[userId].email
  const user = getUserByEmail(userEmail, users);
  if (!user) return res.send("No existing user found");

  const urlId = req.params.id;
  const urlObj = urlDatabase[urlId];

  if (!urlObj) return res.send("Url doesn't exist.");

  const urlBelongsToUser = urlObj.userID === userId;
  if (!urlBelongsToUser) return res.send("Unauthorized. You are not owner of the url.");

  // generate page with user owned urls once all checks passed.
  const templateVars = { urlId, urlObj, user };

  res.render("urls_show", templateVars);
});

// main page if there's an active user, otherwise shows error.
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  const userEmail = getUserEmail(userID, users)
  const user = getUserByEmail(userEmail, users);

  console.log("TEST", userID)
  if (!userID) {
    return res
      .render("urls_index", { user, urls: userOwnedURLs(userID, urlDatabase) })
  }

  const templateVars = { urls: userOwnedURLs(userID, urlDatabase), user};
  res.render("urls_index", templateVars);
});

// long url validation.
app.get("/u/:id", (req, res) => {
  const urlId = urlDatabase[req.params.id];

  if (!urlId) {
    res.send("Unknown Territory");
  } else {
    const url = urlDatabase[req.params.id]["longURL"];
    res.redirect(url);
  }
});

// register new user into database.
app.get("/register", (req, res) => {
  const userID = req.session.userID

  if(!userID) {
    res.render("urls_register");
  } else {
    res.redirect("/urls");
  }

});

// login page if no active user, otherwise redirect to main page.
app.get("/login", (req, res) => {
  const userID = req.session.userID;

  if (userID) {
    res.redirect("/urls");
  } else {
    res.render("urls_login");
  }
});

// ------- post

// clears all cookies upon logging out.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/register`);
});

// login validation
app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.send("Email or Password can't be empty.");
  }

  const email = req.body.email;
  const user = getUserByEmail(email, users);

  if (!user) return res.send(`No matching user: ${email}`);

  const match = bcrypt.compareSync(req.body.password, user.hashedPassword);
  
  if (!match) return res.send("Invalid credentials.");

  req.session.userID = user.id;
  res.redirect("/urls");
});

// delete urls only if logged in user is the owner of targeted url.
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.userID;
  const urlId = req.params.id;
  const urlObj = urlDatabase[urlId];

  const urlBelongsToUser = urlObj.userID === userID;
  if (!urlBelongsToUser) {
    return res.send("unauthorized. You are not owner of the url.");
  }

  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls`);
});

// shows urls page with urls that belong to the user if logged in.
// display error messages otherwise.
app.post("/urls/:id", (req, res) => {

  const userID = req.session.userID;
  if (!userID) return res.send("user does not logged in.");
  
  const userEmail = getUserEmail(userID, users)
  const user = getUserByEmail(userEmail, users);
  if (!user) return res.send("user does not exist.");

  const urlId = req.params.id;
  const urlObj = urlDatabase[urlId];
  if (!urlObj) return res.send("url doesn't exist.");

  const urlBelongsToUser = urlObj.userID === userID;
  if (!urlBelongsToUser) return res.send("Unauthorized. Not the owner of selected url.");

  const newURL = req.body.newURL;
  if (!newURL) return res.send("new URL can't be empty.");

  urlDatabase[urlId] = {
    longURL: newURL,
    userID
  };
  res.redirect(`/urls`);
});

// creates new short url
app.post("/urls", (req, res) => {

  let r = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[r] = {
    longURL: longURL,
    userID: req.session.userID
  };

  res.redirect(`/urls/${r}`);
});

// registeration checks
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  const id = generateRandomString();
  
  if (!email || !password) {
    return res
    .send("Email or Password can't be empty. <a href=\"/register\">Try again</a>.");
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  console.log(hashedPassword);
  
  if (getUserByEmail(email, users) !== null) {
    return res
    .send("User already exist! <a href=\"/register\">Try again</a>.");
  }
  
  req.session.userID = id;
  // create new user if pass all checks.
  users[id] = { id, email, hashedPassword };
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

