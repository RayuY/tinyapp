const express = require("express");
const morgan = require("morgan");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

// require helper functions from helpers.js

const { getUserByEmail, generateRandomString } = require('./helpers.js');

// ----------- middleware

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['secret']
}));

// ------------ data base

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

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

// ---------- get

app.get('/', (req, res) => {
  res.send('<h1>Tiny Url! 🐳</h1>');
});


app.get("/urls/new", (req, res) => {
  const userId = req.session.username;
  console.log("USERID=", req.session.username);
  if (!userId) {
    return res.send("<h1><a href=\"/register\">Register</a> or <a href=\"/login\">login</a> before you can start using Tiny Urls!</1>");
  }

  const user = getUserByEmail(req.session["username"], users);
  const templateVars = { user };
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const userId = req.session.username;
  if (!userId) {
    return res.status(401).send("user does not logged in.");
  }

  const user = getUserByEmail(userId, users);
  if (!user) {
    return res.status(401).send("unauthorized. You are not owner of the url.");
  }

  const urlId = req.params.id;
  const urlObj = urlDatabase[urlId];
  if (!urlObj) {
    return res.status(404).send("url doesn't exist.");
  }

  const urlBelongsToUser = urlObj.userID === userId;
  if (!urlBelongsToUser) {
    return res.status(401).send("unauthorized. You are not owner of the url.");
  }

  const templateVars = {
    urlId,
    urlObj,
    user
  };

  res.render("urls_show", templateVars);
});


app.get("/urls", (req, res) => {
  const userEmail = req.session.username;

  if (!userEmail) {
    return res
      .status(401)
      .send("<h1><a href=\"/register\">Register</a> or <a href=\"/login\">login</a> before you can start using Tiny Urls!</1>");
  }
  
  const user = getUserByEmail(userEmail, users);
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});


app.get("/u/:id", (req, res) => {
  const urlId = urlDatabase[req.params.id];

  if (!urlId) {
    res.send("Unknown Territory");
  } else {
    const url = urlDatabase[req.params.id]["longURL"];
    res.redirect(url);
  }
});


app.get("/register", (req, res) => {
  const userEmail = req.session["username"];
  const user = getUserByEmail(userEmail, users);

  if (user) {
    res.redirect("/urls");
  } else {
    res.render("urls_register");
  }
});


app.get("/login", (req, res) => {
  const email = getUserByEmail(req.session["username"]);

  if (email) {
    res.redirect("/urls");
  } else {
    res.render("urls_login");
  }
});


// ------- post


app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Email or Password can't be empty.");
  }
  const email = req.body.email;
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send(`No matching user: ${email}`);
  }

  //password validation
  const match = bcrypt.compareSync(req.body.password, user.hashedPassword);
  
  if (!match) {
    return res.status(403).send("Invalid credentials.");
  }

  req.session.username = email;
  res.redirect("/urls");
});


app.post("/urls/logout", (req, res) => {
  res.clearCookie('session');
  res.redirect(`/register`);
});


app.post("/urls/login", (req, res) => {
  const username = req.body.email;
  req.session.username = username;
  res.redirect(`/urls`);
});



app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.username;
  const urlId = req.params.id;
  const urlObj = urlDatabase[urlId];

  const urlBelongsToUser = urlObj.userID === userID;
  if (!urlBelongsToUser) {
    return res.status(401).send("unauthorized. You are not owner of the url.");
  }

  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls`);
});


app.post("/urls/:id", (req, res) => {

  const userID = req.session.username;
  if (!userID) {
    return res.status(401).send("user does not logged in.");
  }

  const user = getUserByEmail(userID, users);
  if (!user) {
    return res.status(401).send("user does not exist.");
  }

  const urlId = req.params.id;
  const urlObj = urlDatabase[urlId];
  if (!urlObj) {
    return res.status(404).send("url doesn't exist.");
  }

  const urlBelongsToUser = urlObj.userID === userID;
  if (!urlBelongsToUser) {
    return res.status(401).send("Unauthorized. Not the owner of selected url.");
  }

  const newURL = req.body.newURL;
  if (!newURL) {
    return res.status(401).send("new URL can't be empty.");
  }

  urlDatabase[urlId] = {
    longURL: newURL,
    userID
  };
  res.redirect(`/urls`);
});



app.post("/urls", (req, res) => {

  const userID = req.session.username;

  if (!userID) {
    res
      .send("Only logged in users can use tiny url.");
  } else {
    let r = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[r] = {
      longURL: longURL,
      userID: req.session.username
    };
    res.redirect(`/urls`);
  }
});



app.post("/register", (req, res) => {

  // res.cookie("username", req.body.email);
  req.session.username = req.body.email;
  const id = generateRandomString();

  // check for empty inputs
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .send("Email or Password can't be empty. <a href=\"/register\">Try again</a>.");
  }
  const email = req.body.email;
  const password = req.body.password;

  // hashing password
  const hashedPassword = bcrypt.hashSync(password, 8);
  console.log(hashedPassword);

  // check if email already exists
  if (getUserByEmail(email, users) !== null) {
    return res
      .status(400)
      .send("User already exist! <a href=\"/register\">Try again</a>.");
  }

  // create new user
  users[id] = { id, email, hashedPassword };
  res.redirect(`/urls`);
});



// ------- listen


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

