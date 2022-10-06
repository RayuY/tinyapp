const express = require("express");
const morgan = require("morgan")
const cookieParser = require('cookie-parser');
const { resolveInclude } = require("ejs");
const app = express();
const PORT = 8080; // default port 8080

// ----------- middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

const urlDatabase = {
  "9sm5xK": "http://www.google.com",
  "b2xVn2": "http://www.lighthouselabs.ca"
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

const getUserByEmail = (email) => {
  for (i in users) {
    const value = users[i];
    if (value.email === email) {
      return value;
    }
  }
  return null;
}


app.get("/urls/new", (req, res) => {
  if (!getUserByEmail(req.cookies["username"])) {
    res.redirect("/urls");
  } else {
  const user = getUserByEmail(req.cookies["username"])
  const templateVars = { user }
  res.render("urls_new", templateVars);
  }
});


app.get("/urls/:id", (req, res) => {
  const user = getUserByEmail(req.cookies["username"])
  const templateVars = { id: req.params.id, longURL: urlDatabase, user};
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user = getUserByEmail(req.cookies["username"])
  const templateVars = { urls: urlDatabase, user};
  res.render("urls_index", templateVars);
});


app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    res.send("Unknown Territory")
  } else {
  const url = urlDatabase[req.params.id];
  res.redirect(url)
  };
});

app.get("/register", (req, res) => {
  if (getUserByEmail(req.cookies["username"])) {
    res.redirect("/urls");
  } else {
   res.render("urls_register");
  }
});


app.get("/login", (req, res) => {
  if (getUserByEmail(req.cookies["username"])) {
    res.redirect("/urls");
  } else {
    res.render("urls_login")
  };
});


// ------- post

app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email);

  if (user === null ) {
    return res.status(403).send("User does not exist!")
  } else if (user.password !== req.body.password) {
    return res.status(403).send("password does not match!")
  }
  
  res.cookie('username', email);
  res.redirect("/urls");
});


app.post("/urls/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect(`/urls`);
})

app.post("/urls/login", (req, res) => {
  const username = req.body.email
  res.cookie('username', username);
  res.redirect(`/urls`);
})

app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls`); 
})

app.post("/urls/edit/:id", (req, res) => {
  const id = req.params.id
  res.redirect(`/urls/${id}`); 
})

app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  urlDatabase[id] = req.body.newURL;
  res.redirect(`/urls`); 
})

app.post("/urls", (req, res) => {
  if (!getUserByEmail(req.cookies["username"])) {
    res.send("Only logged in users can use tiny url.")
  } else {
  let r = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[r] = longURL;
  res.redirect(`/urls`); 
  }
});

app.post("/register", (req, res) => {
  res.cookie("username", req.body.email);
  const id = generateRandomString();
  
  // check for empty inputs
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Email or Password can't be empty.")
  }
  const email = req.body.email;
  const password = req.body.password;

  // check if email already exists
  if (getUserByEmail(email) !== null ) {
    return res.status(400).send("User already exist!")
  }

  users[id] = { id, email, password }
  res.redirect(`/urls`);
});


// ------- listen

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




// ------------ functions

function generateRandomString() {
  return random = (Math.random() + 1).toString(36).substring(6);
};