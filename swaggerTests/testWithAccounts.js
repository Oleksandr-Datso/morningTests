
const BookStoreApi = require('../api/BookStoreApi');
const AccountApi = require('../api/AccountApi');
const { default: axios } = require('axios');
const expect = require("chai").expect;
require('dotenv').config({ path: './swaggerTests/.env' });
const showLog = require('./logger').loggerToExport;
const DataClass = require('./data');
const {testUserData} = require('./credentials');

let accountApi = new AccountApi(process.env.HOST);
let bookStoreApi = new BookStoreApi(process.env.HOST);

describe("User creation endpoint", function() {
  let userName, password, userId, token, userIsCreated;

  describe("Successfull user creation", function() {
    beforeEach(async function() {
      userName = testUserData.userName();
      password = testUserData.password;
    })
    afterEach(async function() {
      token = (await accountApi.generateToken(userName, password)).data.token;
      userId = userIsCreated.data.userID;
      const deleteCreatedUser = await accountApi.deleteUser(userId, token);
      expect(deleteCreatedUser).to.have.property("status", 204);
    })
    it("Returns 201 status for creating new user", async function () {
      userIsCreated = await accountApi.createNewUser(userName, password);
      expect(userIsCreated).to.have.property("status", 201);
      expect(userIsCreated.status).to.equal(201);
    });
  })
  describe("Check creation of already existing user", function() {
    beforeEach(async function() {
      userName = testUserData.userName();
      password = testUserData.password;
    })
    afterEach(async function() {
      token = (await accountApi.generateToken(userName, password)).data.token;
      userId = userIsCreated.data.userID;
      const deleteCreatedUser = await accountApi.deleteUser(userId, token);
      expect(deleteCreatedUser).to.have.property("status", 204);
    })

    it("Returns 406 status for creating already existing user", async function () {
      userIsCreated = await accountApi.createNewUser(userName, password);
      const creatingTheSameUser = await accountApi.createAlreadyCreatedUser(userName, password);
      showLog.error(creatingTheSameUser.data);
      expect(creatingTheSameUser).to.have.property("status", 406);
    });
  })
  describe("Invalid inputs during user creation (may be put in parent describe with solo it block))", function() {
    beforeEach(async function() {
      userName = "";
      password = "";
    })
    it("Returns 400 status with invalid data for creating new user", async function () {
      const cannotCreateUserWithInvalidData = await accountApi.createUserWithInvalidData(userName, password);
      showLog.debug(cannotCreateUserWithInvalidData.data);
      expect(cannotCreateUserWithInvalidData).to.have.property("status", 400);
    });
  })
})
describe("Authorization endpoint", function() {
    let userName, password, userId, token, createNewUser;

    describe("Successful authorization", function() {
        beforeEach(async function() {      
          userName = testUserData.userName();
          password = testUserData.password;  
          createNewUser = await accountApi.createNewUser(userName, password);
          token = (await accountApi.generateToken(userName, password)).data.token;
          userId = createNewUser.data.userID;
        })
        afterEach(async function() {
          const deleteCreatedUser = await accountApi.deleteUser(userId, token);
          expect(deleteCreatedUser.status).to.equal(204);
      })
        it("Returns code 200 for authorization", async function () {
          const authorization = await accountApi.authorization(userName, password);
          expect(authorization).to.have.property("status", 200);
          // showLog.info(authorization);
          });
    })
    describe("Inner authorization tests (failed)", function() {
        beforeEach(async function() {      
          userName = testUserData.userName();
          password = testUserData.password;  
          createNewUser = await accountApi.createNewUser(userName, password);
          token = (await accountApi.generateToken(userName, password)).data.token;
          userId = createNewUser.data.userID;
        })
        afterEach(async function() {
          const deleteCreatedUser = await accountApi.deleteUser(userId, token);
          expect(deleteCreatedUser.status).to.equal(204);
      })
            it("Returns code 400 for authorization", async function () {
                userName = "";
                password = "";
                const authorization = await accountApi.authorization(userName, password);
                expect(authorization).to.have.property("status", 400);
                // showLog.info(authorization);
            });
            it("Returns code 404 for authorization", async function () {            
                password = "12345";
                const authorization = await accountApi.authorization(userName, password);
                expect(authorization).to.have.property("status", 404);
                // showLog.info(authorization);
            });
    })
})
describe("Check token creation endpoint", function() {
  let userName, password, userId, token, createNewUser;

  beforeEach(async function() {      
    userName = testUserData.userName();
    password = testUserData.password;  
    createNewUser = await accountApi.createNewUser(userName, password);
  })
    describe("Successfull token generation", async function() {
      afterEach(async function() {
        userId = createNewUser.data.userID;
        const deleteCreatedUser = await accountApi.deleteUser(userId, token.data.token);
        expect(deleteCreatedUser.status).to.equal(204);
    })
      it("Create new auth token for user", async function () {
        token = await accountApi.generateToken(userName, password);
        expect(token).to.have.property("status", 200);
        showLog.info(token);
      });
    })
    describe("Failed token creation", async function() {
    // Created variables to store created data to let me delete user after error
      let userNameOld, passwordOld;

      after(async function() {
        token = await accountApi.generateToken(userNameOld, passwordOld);
        userId = createNewUser.data.userID;
        const deleteCreatedUser = await accountApi.deleteUser(userId, token.data.token);
        expect(deleteCreatedUser.status).to.equal(204);
    })
      it("Create new auth token for user 400 error", async function () {
        userNameOld = userName;
        passwordOld = password;
        userName = "";
        password = "";
  
        token = await accountApi.generateToken(userName, password);
        expect(token).to.have.property("status", 400);
        showLog.info(token);
      });
    })
})
describe("Get user by userID endpoint", async function() {
  let userName, password, userId, token, createNewUser, authorization;

  beforeEach(async function() {
    userName = testUserData.userName();
    password = testUserData.password;
    createNewUser = await accountApi.createNewUser(userName, password);
    token = (await accountApi.generateToken(userName, password)).data.token;
    authorization = await accountApi.authorization(userName, password);
    userId = createNewUser.data.userID;
  })
  describe("Get user shows 200 code", async function() {
    afterEach(async function() {
      showLog.trace("Deleting created user");
      const deleteCreatedUser = await accountApi.deleteUser(userId, token);
      expect(deleteCreatedUser).to.have.property("status", 204);
    })
    it("Returns 200 for user without book", async function () {
      const getUserByIsbn = await accountApi.getUser(userId, token);
      expect(getUserByIsbn).to.have.property("status", 200);
      //Why objects instead of books in output? - logger properties. use result.data or JSON.stringify(result)
      showLog.info(JSON.stringify(getUserByIsbn, null, 4));
    });
    it("Returns 200 for user with book", async function () {
      const isbnNumbers = await bookStoreApi.getAllIsbns();
      expect(isbnNumbers.length, "No books in isbnNumbers").to.be.greaterThan(0);
      let count = isbnNumbers.length;
      const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
      const randomIsbn = isbnNumbers[randomIsbnIndex];
      showLog.error("Random ISBN = " + randomIsbn);
      const addBookToTheCreatedUser = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]); 
  
      const getUserByIsbn = await accountApi.getUser(userId, token);
  
      expect(getUserByIsbn).to.have.property("status", 200);
      //Why objects instead of books in output? - logger properties. use result.data or JSON.stringify(result)
      showLog.info(JSON.stringify(getUserByIsbn, null, 4));
    });
  })
  describe("Get user shows 401 error", async function() {
    afterEach(async function() {
      showLog.trace("Deleting created user");
      const deleteCreatedUser = await accountApi.deleteUser(userId, tokenOld);
      expect(deleteCreatedUser).to.have.property("status", 204);
    })
    it("Returns 401 error", async function () { 
      tokenOld = token;
      token = "Oops, something went wrong!";
      showLog.debug(token);
      const getUserByIsbn = await accountApi.getUser401Error(userId, token);
  
      expect(getUserByIsbn).to.have.property("status", 401);
      showLog.info(JSON.stringify(getUserByIsbn, null, 4));
    });
  })
})
describe("Delete user endpoint", async function() {
  let userName, password, userId, token, tokenOld, createNewUser, authorization;

  beforeEach(async function() {
    userName = testUserData.userName();
    password = testUserData.password;
    createNewUser = await accountApi.createNewUser(userName, password);
    token = (await accountApi.generateToken(userName, password)).data.token;
    // Create instance to delete original created user
    tokenOld = token;
    authorization = await accountApi.authorization(userName, password);
    userId = createNewUser.data.userID;
    //Check that user exist before delete
    const userExist = await accountApi.getUser(userId, token);
    expect(userExist).to.have.property("status", 200);
    showLog.info(userExist.data);
  })
  describe("Successfully delete flow", async function() {
    it("Delete user flow 204", async function(){
      const resultOfDeletingUser = await accountApi.deleteUser(userId, token);
      expect(resultOfDeletingUser).to.have.property("status", 204);
      expect(resultOfDeletingUser.status).to.equal(204);
      showLog.debug(resultOfDeletingUser);
    })
  })
  describe("Unauthorized during deleting flow", async function() {
    afterEach(async function() {
      const correctDeleting = await accountApi.deleteUser(userId, tokenOld);
      expect(correctDeleting).to.have.property("status", 204);
    })
    it("Delete user flow 401 error", async function(){
      token = "Token is changed!";
  
      const resultOfDeletingUser = await accountApi.deleteUser(userId, token);
      expect(resultOfDeletingUser).to.have.property("status", 401);
      expect(resultOfDeletingUser.status).to.equal(401);
      showLog.debug("Status should be 401 and equal to = " + resultOfDeletingUser.status);
    })
  })
})


// describe("Regiser user endpoint", function() {
//     beforeEach(async function() {
//         showLog.trace("Test started!");
//     })
//     /* afterEach(async function() {
//         showLog.info("***After Test*** - Deleting current user");
//         try {
//             if(userId && token) {
//                 const resultOfDeletingUser = await accountApi.deleteUser(userId, token);
//                 expect(resultOfDeletingUser.status).to.equal(204);
//             } else {
//                 showLog.trace("No userId and/or token");
//             }
//         } catch {
//           showLog.error("Invalid user data for afterEach hook");
//         } finally {
//           showLog.trace("***Finnaly we are here!***");
//         }
//       }) */

//     // Account checks
//     // User creation
//   it("Return 200 OK status for creating new user", async function () {
//     const userName = testUserData.userName();
//     const password = testUserData.password;
//     const userIsCreated = await accountApi.createNewUser(userName, password);
//     showLog.info(userIsCreated);
//     //userID is shown in 201 result
//     expect(userIsCreated).to.have.property("status", 201);
//     expect(userIsCreated.status).to.equal(201);
//   });
//   it("Return 406 status for creating already existing user", async function () {
//     const userName = testUserData.userName();
//     const password = testUserData.password;

//     const userIsCreated = await accountApi.createNewUser(userName, password);

//     const creatingTheSameUser = await accountApi.createAlreadyCreatedUser(userName, password);
//     showLog.error(creatingTheSameUser.data);
//     expect(creatingTheSameUser).to.have.property("status", 406);
//   });
//   it("Return 400 status with invalid data for creating new user", async function () {
//     const userName = "";
//     const password = "";

//     const result = await accountApi.createUserWithInvalidData(userName, password);
//     showLog.error(result.data);
//     expect(result).to.have.property("status", 400);
//   });
//     // Auth
//   it("Authorization", async function () {
//     const userName = testUserData.userName();
//     const password = testUserData.password;

//     const createNewUser = await accountApi.createNewUser(userName, password);
//     showLog.info(createNewUser);
//     //const token = await accountApi.generateToken(userName, password); //looks like we don't need token to authorized 
//     const authorization = await accountApi.authorization(userName, password);

//     expect(authorization).to.have.property("status", 200);
//     showLog.info(authorization);
//   });
//   it("Authorization 400 error", async function () {
//     const userName = "";
//     const password = "";
//     const authorization = await accountApi.authorization(userName, password);

//     expect(authorization).to.have.property("status", 400);
//     showLog.info(authorization);
//   });
//   it("Authorization 404 error", async function () {
//     const userName = testUserData.userName();
//     let password = testUserData.password;

//     const createNewUser = await accountApi.createNewUser(userName, password);
//     password = "12345";
//     const authorization = await accountApi.authorization(userName, password);

//     expect(authorization).to.have.property("status", 404);
//     showLog.info(authorization);
//   });

//    // Token
//   it("Create new auth token for user", async function () {
//     const userName = testUserData.userName();
//     const password = testUserData.password;

//     const createNewUser = await accountApi.createNewUser(userName, password);

//     const token = await accountApi.generateToken(userName, password);
//     expect(token).to.have.property("status", 200);
//     showLog.info(token);
//   });
//   it("Create new auth token for user 400 error", async function () {
//     const userName = "";
//     const password = "";

//     const token = await accountApi.generateToken(userName, password);
//     expect(token).to.have.property("status", 400);
//     showLog.info(token);
//   });

//   // Get user by user ID
//   it("Get user by userID", async function () {
//     const userName = testUserData.userName();
//     const password = testUserData.password;

//     const createNewUser = await accountApi.createNewUser(userName, password);
//     const token = await accountApi.generateToken(userName, password); //looks like we don't need token to authorized 
//     const authorization = await accountApi.authorization(userName, password);

//     const userId = createNewUser.data.userID;
//     const isbnNumbers = await bookStoreApi.getAllIsbns();
//     expect(isbnNumbers.length, "No books in isbnNumbers").to.be.greaterThan(0);
//     let count = isbnNumbers.length;
//     const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
//     const randomIsbn = isbnNumbers[randomIsbnIndex];
//     showLog.error("Random ISBN = " + randomIsbn);

//     const addBookToTheCreatedUser = await bookStoreApi.addBookToTheUserByIsbn(userId, token.data.token, [randomIsbn]); 

//     const getUserByIsbn = await accountApi.getUser(userId, token.data.token);

//     expect(getUserByIsbn).to.have.property("status", 200);
//     //Why objects instead of books in output? - logger properties. use result.data or JSON.stringify(result)
//     showLog.info(JSON.stringify(getUserByIsbn, null, 4));
//   });
//   it("Get user by userID 401 error", async function () {
//     const userName = testUserData.userName();
//     const password = testUserData.password;

//     const createNewUser = await accountApi.createNewUser(userName, password);
//     let token = (await accountApi.generateToken(userName, password)).data.token; 
//     const authorization = await accountApi.authorization(userName, password);

//     const userId = createNewUser.data.userID;
//     // Aditionally book(s) can be added to user
//     // const isbnNumbers = await bookStoreApi.getAllIsbns();
//     // expect(isbnNumbers.length, "No books in isbnNumbers").to.be.greaterThan(0);
//     // let count = isbnNumbers.length;
//     // const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
//     // const randomIsbn = isbnNumbers[randomIsbnIndex];
//     // showLog.error("Random ISBN = " + randomIsbn);
//     // const addBookToTheCreatedUser = await bookStoreApi.addBookToTheUserByIsbn(userId, token.data.token, [randomIsbn]); 

//     token = "Oops, something went wrong!";
//     showLog.debug(token);
//     const getUserByIsbn = await accountApi.getUser401Error(userId, token);

//     expect(getUserByIsbn).to.have.property("status", 401);
//     showLog.info(JSON.stringify(getUserByIsbn, null, 4));
//   });

//   // Delete user by user ID
//   it("Delete user flow 401 error", async function(){
//     const userName = testUserData.userName();
//     const password = testUserData.password;

//     const createNewUser = await accountApi.createNewUser(userName, password);
//     let token = await accountApi.generateToken(userName, password); 
//     const authorization = await accountApi.authorization(userName, password);

//     const userId = createNewUser.data.userID;

//     //Check that user exist before delete
//     const userExist = await accountApi.getUser(userId, token.data.token);
//     expect(userExist).to.have.property("status", 200);

//     token.data.token = "Token is changed!";

//     const resultOfDeletingUser = await accountApi.deleteUser401Error(userId, token.data.token);
//     expect(resultOfDeletingUser).to.have.property("status", 401);
//     expect(resultOfDeletingUser.status).to.equal(401);
//     showLog.debug("Status should be 401 and equal to = " + resultOfDeletingUser.status);
//   })
//   it("Delete user flow 204", async function(){
//     const userName = testUserData.userName();
//     const password = testUserData.password;

//     const createNewUser = await accountApi.createNewUser(userName, password);
//     const token = await accountApi.generateToken(userName, password); //looks like we don't need token to authorized 
//     const authorization = await accountApi.authorization(userName, password);

//     const userId = createNewUser.data.userID;
//     //Check that user exist before delete
//     const userExist = await accountApi.getUser(userId, token.data.token);
//     expect(userExist).to.have.property("status", 200);
//     showLog.info(userExist.data);

//     const resultOfDeletingUser = await accountApi.deleteUser(userId, token.data.token);
//     expect(resultOfDeletingUser).to.have.property("status", 204);
//     expect(resultOfDeletingUser.status).to.equal(204);
//     showLog.debug(resultOfDeletingUser);
//   })
// });
