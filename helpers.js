// cross check email with database.
function getUserByEmail(email, database){
  for (i in database) {
    const user = database[i];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}


function userOwnedURLs(userID, database) {
  const urlList = {}

  for(let shortURL in database) {
    if(database[shortURL].userID === userID) {
      urlList[shortURL] = database[shortURL]
    }
  }

  return urlList
}



function getUserEmail(userID, users) {
  if(users[userID]) return users[userID].email
  return null
}





// generates random user key.
function generateRandomString() {
  return random = (Math.random() + 1).toString(36).substring(6);
};

module.exports = { 
  getUserByEmail, 
  generateRandomString,
  userOwnedURLs,
  getUserEmail
}