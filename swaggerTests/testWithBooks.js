//const assert = require('chai').assert; 
const BookStoreApi = require('../api/BookStoreApi');
const AccountApi = require('../api/AccountApi');
const { default: axios } = require('axios');
const expect = require("chai").expect;
require('dotenv').config({ path: './swaggerTests/.env' });
const showLog = require('./logger').loggerToExport;
const DataClass = require('./data');
const {testUserData} = require('./credentials');

/*
class BookStoreApi {
  constructor(baseURL) {
    this.baseURL = baseURL,
    this.headers = {
        accept: "application/json",
        "Content-Type": "application/json",
    };
  }
  async createNewUser(userName, password) {
    const body = JSON.stringify({
      userName,
      password,
    });

    const config = {
      headers: this.headers,
    };
    const { status, data } = await axios.post(
      `${this.baseURL}/Account/v1/User`,
      body,
      config
    );
    console.log(status, JSON.stringify(data, null, 4)); // 4 пробела вместо таба
    return { status, data };
  }
  async createAlreadyCreatedUser(userName, password) {
    const data = JSON.stringify({
      userName: "testUser05",
      password: "QWErty123$%^",
    });

    const config = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: (status) => status === 406, //error is NOT shown ONLY if 406 status code is shown
      //validateStatus: () => true, //If you never want axios to throw an error, you can have the function always return true
    };
    const response = await axios.post(
      `${this.baseURL}/Account/v1/User`,
      data,
      config
    );
    return response;
  }
  async createUserWithInvalidData(userName, password) {
    const data = JSON.stringify({
      userName: "",
      password: "",
    });

    const config = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: (status) => status === 400,
    };
    const response = await axios.post(
      `${this.baseURL}/Account/v1/User`,
      data,
      config
    );
    return response;
  }
  async getAllBooks() {
    const config = {
      headers: {
        accept: "application/json",
      },
    };
    const response = await axios.get(
      `${this.baseURL}/BookStore/v1/Books`,
      config
    );
    return response;
  }
  async addBookToTheUserByIsbn(userName, password) {
    const data = JSON.stringify({
      userId: "28939a17-af52-4974-b801-cf13cb5fff8d",
      collectionOfIsbns: [
        {
          isbn: "9781449365035",
        },
        {
          isbn: "9781593277574",
        },
      ],
    });

    const config = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6InRlc3RVc2VyMDUiLCJwYXNzd29yZCI6IlFXRXJ0eTEyMyQlXiIsImlhdCI6MTY5OTg5NTU5OH0.wSWSN3ABdr557j8H7-73B7C-kkOBYmefotSdyhn8yxk",
      },
      data: data,
    };
    const response = await axios.post(
      `${this.baseURL}/BookStore/v1/Books`,
      data,
      config
    );
    return response;
  }
}
*/
let bookStoreApi = new BookStoreApi(process.env.HOST); //тут ловим то, что передали в командной строке HOST="demoqa.com" npm run ....
let accountApi = new AccountApi(process.env.HOST);
describe("Book Store API Swagger UI checks", function () { 
  let userId, token;

  //Create a user before test
  beforeEach(async function() {
    showLog.info("***Before Test*** - Creating new user");
    const userName = testUserData.userName();
    const password = testUserData.password;
    const createdUserResults = await accountApi.createNewUser(userName, password);
    showLog.debug(createdUserResults, userName, password);
    userId = createdUserResults.data.userID;
    token = (await accountApi.generateToken(userName, password)).data.token;
    showLog.info(token);
  })
  afterEach(async function() {
    showLog.info("***After Test*** - Deleting current user");
    try {
      const resultOfDeletingUser = await accountApi.deleteUser(userId, token);
      expect(resultOfDeletingUser.status).to.equal(204);
    } catch {
      showLog.error("Invalid user data for afterEach hook");
    } finally {
      showLog.trace("***Finnaly we are here!***");
    }
  })

// Books checks (only main positive outcome)
  it("Get list of all books", async function () {
    const result = await bookStoreApi.getAllBooks();

    showLog.info(result.data);
    expect(result).to.have.property("status", 200);
  });
  it("Add book to the user by isbn book number(s)", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbnNumbers").to.be.greaterThan(0);
    let count = isbnNumbers.length;
    const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomIsbn = isbnNumbers[randomIsbnIndex];
    // or don't care and use -> var isbnNumber = [listOfAllBooks.data.books[0]];

    // Add books to the user's collection
    const resultOfAddingBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]);

    showLog.debug(resultOfAddingBook.data); //if showLog.info(result); тогда мы увидим { status: 201, data: { books: [ [Object], [Object] ] } }, а если showLog.info(result.data), то isbns 
    expect(resultOfAddingBook).to.have.property("status", 201);
  });
  it("Delete book from the user by isbn book number(s)", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbn Numbers").to.be.greaterThan(0);
    const count = isbnNumbers.length;
    const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomIsbn = isbnNumbers[randomIsbnIndex];

    // Add books to the user's collection
    const userWithAddedBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]);
    showLog.error(userWithAddedBook.data); 
    expect(userWithAddedBook, "The list of books for current user is empty").to.be.not.equal(null);

    // Delete book from user's collection
    const resultOfDeletingBook = await bookStoreApi.deleteBookFromUserByIsbn(userId, token, [randomIsbn]);
    showLog.warn(resultOfDeletingBook);
    expect(resultOfDeletingBook).to.have.property("status", 204);
  });
  it("Delete all books from the user by user id", async function() {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbn Numbers").to.be.greaterThan(0);
    const count = isbnNumbers.length;
    const randomFirstIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
    while(randomSecondIsbnIndex === randomFirstIsbnIndex) {
      showLog.error("Oops, the isbn is the same");
      randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
    }
    const randomFirstIsbn = isbnNumbers[randomFirstIsbnIndex];
    const randomSecondIsbn = isbnNumbers[randomSecondIsbnIndex];

    // Add books to the user's collection
    const userWithAddedBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomFirstIsbn, randomSecondIsbn]);
    showLog.error(userWithAddedBook.data); 
    expect(userWithAddedBook, "The list of books for current user is empty").to.be.not.equal(null);

    // Delete all books from the user's collection
    const resultOfDeletingBooks = await bookStoreApi.deleteAllBooksFromUserByUserId(userId, token);
    showLog.warn(resultOfDeletingBooks);
    expect(resultOfDeletingBooks).to.have.property("status", 204);
  });
  it("It woooooooooooooooooooooorks!!!!! book instead of books in url... -> Get information about book by its isbn", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbn Numbers").to.be.greaterThan(0);
    const count = isbnNumbers.length;
    const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomIsbn = isbnNumbers[randomIsbnIndex];

    const informationAboutBookByIsbn = await bookStoreApi.getBookByIsbn([randomIsbn]);

    showLog.debug(informationAboutBookByIsbn.data);
    expect(informationAboutBookByIsbn).to.have.property("status", 200);
  });
  xit("Error on demoqa ?! Looks like yes (checked) - Edit book by isbn book number for current user", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbn Numbers").to.be.greaterThan(0);
    const count = isbnNumbers.length;
    const randomFirstIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
    while(randomSecondIsbnIndex === randomFirstIsbnIndex) {
      showLog.error("Oops, the isbn is the same");
      randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
    }
    const randomFirstIsbn = isbnNumbers[randomFirstIsbnIndex];
    const randomSecondIsbn = isbnNumbers[randomSecondIsbnIndex];

    // Add books to the user's collection
    const userWithAddedBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomFirstIsbn]);
    showLog.error(userWithAddedBook.data); 
    expect(userWithAddedBook, "The list of books for current user is empty").to.be.not.equal(null);

    const result = await bookStoreApi.editBookByIsbnForUser(userId, token, [randomFirstIsbn], [randomSecondIsbn]);

    showLog.info(result.data); //if showLog.info(result); тогда мы увидим { status: 201, data: { books: [ [Object], [Object] ] } }, а если showLog.info(result.data), то isbns 
    expect(result).to.have.property("status", 201);
  });


// All cases with books from Get list method
//Get Books. Method the same as above ?
  it("Add book(s) to the user by isbn book number(s)", async function () {
      const isbnNumbers = await bookStoreApi.getAllIsbns();

      // const getAllBooksResult = await bookStoreApi.getAllBooks();
    // //Extract ISBNs from the list of all books
    // const books = getAllBooksResult.data.books;
    //   const isbnNumbers = books.map(book => book.isbn); // const isbnNumbers = []; to check if test can be failed
    
    // A custom error message can be given as the second argument to expect
      expect(isbnNumbers.length, "No books in isbnNumbers").to.be.greaterThan(0);

      let count = isbnNumbers.length;
      showLog.fatal(isbnNumbers);
      showLog.error(`Number of isbns in the list is ${count}`);

      const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
      const randomIsbn = isbnNumbers[randomIsbnIndex];
      showLog.error(randomIsbn);
    
      const userWithBooks = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]);
      showLog.info(userWithBooks.data); 
      expect(userWithBooks).to.have.property("status", 201);
  });
//Receive all results when adding book to the user
  it("Add book to the user by isbn book number", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbnNumbers").to.be.greaterThan(0);
    let count = isbnNumbers.length;
    const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomIsbn = isbnNumbers[randomIsbnIndex];
    // or don't care and use -> var isbnNumber = [listOfAllBooks.data.books[0]];

    // Add books to the user's collection
    const resultOfAddingBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]);

    showLog.debug(resultOfAddingBook.data); //if showLog.info(result); тогда мы увидим { status: 201, data: { books: [ [Object], [Object] ] } }, а если showLog.info(result.data), то isbns 
    expect(resultOfAddingBook).to.have.property("status", 201);
  });
  it("Goal is to receive error 401 for Add book to the user by isbn book number", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbnNumbers").to.be.greaterThan(0);
    let count = isbnNumbers.length;
    const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomIsbn = isbnNumbers[randomIsbnIndex];
    token = "Oops, replaced token ^_^";
    showLog.info("Token = " + token);

    // Add books to the user's collection
    const resultOfAddingBookForUnauthorizedUser = await bookStoreApi.addBookToTheUserByIsbnWith401Error(userId, token, [randomIsbn]);

    showLog.debug(resultOfAddingBookForUnauthorizedUser.data); 
    expect(resultOfAddingBookForUnauthorizedUser).to.have.property("status", 401);
  });
  it("Goal is to receive error 400 for Add book to the user by isbn book number", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbnNumbers").to.be.greaterThan(0);
    let count = isbnNumbers.length;
    const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomIsbn = isbnNumbers[randomIsbnIndex] + `invalidNumberToSeeError`;
    showLog.error("Random ISBN = " + randomIsbn);

    // Add books to the user's collection
    const resultOfAddingBookWithWrongData = await bookStoreApi.addBookToTheUserByIsbnWith400Error(userId, token, [randomIsbn]);
    showLog.debug(resultOfAddingBookWithWrongData.data);
    expect(resultOfAddingBookWithWrongData).to.have.property("status", 400);
  });

//Receive all results when deleting the book from the user
  it("Delete book from the user by isbn book number", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbn Numbers").to.be.greaterThan(0);
    const count = isbnNumbers.length;
    const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomIsbn = isbnNumbers[randomIsbnIndex];

    // Add books to the user's collection
    const userWithAddedBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]);
    showLog.error(userWithAddedBook.data); 
    expect(userWithAddedBook, "The list of books for current user is empty").to.be.not.equal(null);

    // Delete book from user's collection
    const resultOfDeletingBook = await bookStoreApi.deleteBookFromUserByIsbn(userId, token, [randomIsbn]);
    showLog.warn(resultOfDeletingBook);
    expect(resultOfDeletingBook).to.have.property("status", 204);
  });
  it("Goal is 400 error for Delete book from the user by isbn book number", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbn Numbers").to.be.greaterThan(0);
    const count = isbnNumbers.length;
    const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
    let randomIsbn = isbnNumbers[randomIsbnIndex];

    // Add books to the user's collection
    const userWithAddedBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]);
    showLog.error(userWithAddedBook.data); 
    expect(userWithAddedBook, "The list of books for current user is empty").to.be.not.equal(null);

    // Delete book from user's collection
    randomIsbn = "Oops ISBN is chnaged ^_^";
    const resultOfDeletingBook = await bookStoreApi.deleteBookFromUserByIsbnWith400Error(userId, token, randomIsbn);
    showLog.warn(resultOfDeletingBook);
    expect(resultOfDeletingBook).to.have.property("status", 400);
  });
  it("Goal is 401 error for Delete book from the user by isbn book number", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbn Numbers").to.be.greaterThan(0);
    const count = isbnNumbers.length;
    const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomIsbn = isbnNumbers[randomIsbnIndex];

    // Add books to the user's collection
    const userWithAddedBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomIsbn]);
    showLog.error(userWithAddedBook.data); 
    expect(userWithAddedBook, "The list of books for current user is empty").to.be.not.equal(null);

    //Change token to receive 401 error
    token = "Oops, wrong token ^_^";
    showLog.info("Token = " + token);

    // Delete book from user's collection
    const resultOfDeletingBookForUnauthorizedUser = await bookStoreApi.deleteBookFromUserByIsbnWith401Error(userId, token, [randomIsbn]);
    showLog.warn(resultOfDeletingBookForUnauthorizedUser);
    expect(resultOfDeletingBookForUnauthorizedUser).to.have.property("status", 401);
  });
//Get information about 1 book by random ISBN
  it("Get information about book by its isbn", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbn Numbers").to.be.greaterThan(0);
    const count = isbnNumbers.length;
    const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomIsbn = isbnNumbers[randomIsbnIndex];

    const informationAboutBookByIsbn = await bookStoreApi.getBookByIsbn([randomIsbn]);

    showLog.debug(informationAboutBookByIsbn.data);
    expect(informationAboutBookByIsbn).to.have.property("status", 200);
  });
  it("Goal is 400 error for Get information about book by its isbn chosen randomly", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbn Numbers").to.be.greaterThan(0);
    const count = isbnNumbers.length;
    const randomIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomIsbn = isbnNumbers[randomIsbnIndex] + " and unknown ISBN text";
    showLog.info(randomIsbn);

    const informationAboutBookByIsbn400Error = await bookStoreApi.getBookByIsbnWith400Error([randomIsbn]);

    showLog.debug(informationAboutBookByIsbn400Error.data);
    expect(informationAboutBookByIsbn400Error).to.have.property("status", 400);
  });
//Delete all books from user
  it("Delete all books from the user by user id", async function() {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbn Numbers").to.be.greaterThan(0);
    const count = isbnNumbers.length;
    const randomFirstIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
    while(randomSecondIsbnIndex === randomFirstIsbnIndex) {
      showLog.error("Oops, the isbn is the same");
      randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
    }
    const randomFirstIsbn = isbnNumbers[randomFirstIsbnIndex];
    const randomSecondIsbn = isbnNumbers[randomSecondIsbnIndex];

    // Add books to the user's collection
    const userWithAddedBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomFirstIsbn, randomSecondIsbn]);
    showLog.error(userWithAddedBook.data); 
    expect(userWithAddedBook, "The list of books for current user is empty").to.be.not.equal(null);

    // Delete all books from the user's collection
    const resultOfDeletingBooks = await bookStoreApi.deleteAllBooksFromUserByUserId(userId, token);
    showLog.warn(resultOfDeletingBooks);
    expect(resultOfDeletingBooks).to.have.property("status", 204);
  });
  xit("ERROR why?... I want 401 and 401 is shown!!! Goal is 401 error for Delete all books from the the user by user id", async function() {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbn Numbers").to.be.greaterThan(0);
    const count = isbnNumbers.length;
    const randomFirstIsbnIndex = await DataClass.generateIsbnIndex(count);
    const randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
    while(randomSecondIsbnIndex === randomFirstIsbnIndex) {
      showLog.error("Oops, the isbn is the same");
      randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
    }
    const randomFirstIsbn = isbnNumbers[randomFirstIsbnIndex];
    const randomSecondIsbn = isbnNumbers[randomSecondIsbnIndex];

    // Add books to the user's collection
    const userWithAddedBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomFirstIsbn, randomSecondIsbn]);
    showLog.error(userWithAddedBook.data); 
    expect(userWithAddedBook, "The list of books for current user is empty").to.be.not.equal(null);

    // Delete all books from the user's collection
    userId = "Oops, user ID is changed ^_^";
    showLog.error(userId);
    const resultOfDeletingBooks = await bookStoreApi.deleteAllBooksFromUserByUserIdWith401Error(userId, token);
    showLog.warn(resultOfDeletingBooks.data);
    expect(resultOfDeletingBooks).to.have.property("status", 401);
  });
//Put 
  xit("Error on demoqa ?! Looks like yes (checked) - Edit book by isbn book number for current user", async function () {
    const isbnNumbers = await bookStoreApi.getAllIsbns();
    expect(isbnNumbers.length, "No books in isbn Numbers").to.be.greaterThan(0);
    const count = isbnNumbers.length;
    const randomFirstIsbnIndex = await DataClass.generateIsbnIndex(count);
    let randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
    while(randomSecondIsbnIndex === randomFirstIsbnIndex) {
      showLog.error("Oops, the isbn is the same");
      randomSecondIsbnIndex = await DataClass.generateIsbnIndex(count);
    }
    const randomFirstIsbn = isbnNumbers[randomFirstIsbnIndex];
    const randomSecondIsbn = isbnNumbers[randomSecondIsbnIndex];

    // Add books to the user's collection
    const userWithAddedBook = await bookStoreApi.addBookToTheUserByIsbn(userId, token, [randomFirstIsbn]);
    showLog.error(userWithAddedBook.data); 
    expect(userWithAddedBook, "The list of books for current user is empty").to.be.not.equal(null);

    const result = await bookStoreApi.editBookByIsbnForUser(userId, token, [randomFirstIsbn], [randomSecondIsbn]);

    showLog.info(result.data); //if showLog.info(result); тогда мы увидим { status: 201, data: { books: [ [Object], [Object] ] } }, а если showLog.info(result.data), то isbns 
    expect(result).to.have.property("status", 201);
  });

});