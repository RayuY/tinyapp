const getUserByEmail = (email, database) => {
  for (i in database) {
    const user = database[i];
    if (user.email === email) {
      return user;
    }
  }
  // database = users
  return null;
}


function generateRandomString() {
  return random = (Math.random() + 1).toString(36).substring(6);
};


module.exports = { 
  getUserByEmail, 
  generateRandomString,
}