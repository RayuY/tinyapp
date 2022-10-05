const { urlencoded } = require("express");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan")

app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(express.urlencoded({extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));


// --------- get 

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.get("/u/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  res.redirect(url);
});


app.get("/", (req, res) => {
  res.send("<html><body><b>Hello You!</b></body></html>");
});


// ------- post



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
  let r = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[r] = longURL;
  res.redirect(`/urls`); 
})



// ------- listen

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




// ------------ functions

function generateRandomString() {
  return random = (Math.random() + 1).toString(36).substring(6);
}