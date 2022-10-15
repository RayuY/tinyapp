// cross check email with database.
const getUserByEmail = (email, database) => {
  for (i in database) {
    const user = database[i];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

// generates random user key.
function generateRandomString() {
  return random = (Math.random() + 1).toString(36).substring(6);
};

module.exports = { 
  getUserByEmail, 
  generateRandomString,
}