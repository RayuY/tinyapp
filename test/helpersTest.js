const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user object with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    console.log("USER=", user)
    const expectedUserID = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    console.log("EXPECTED=", expectedUserID)

    assert.deepEqual(user, expectedUserID)
  });

  it('should null if user is not in the data', function() {
    const user = getUserByEmail("a@a.com", testUsers)
    const expectedUserID = null;
    assert.strictEqual(user, expectedUserID)
  });

  it('should return null if pass in nothing', function() {
    const user = getUserByEmail("", testUsers)
    const expectedUserID = null;
    assert.strictEqual(user, expectedUserID)
  });
});