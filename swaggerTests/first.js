//const assert = require('chai').assert;
const expect = require("chai").expect;
const axios = require("axios");

describe("Book Store API Swagger UI checks", function () {

  xit("Create new user", async function () {
    let data = JSON.stringify({
      userName: "testUser05", //change to new user to receive valid 201 code
      password: "QWErty123$%^",
    });

    let config = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    const result = await axios.post(
      "https://demoqa.com/Account/v1/User",
      data,
      config
    );
    //userID: "28939a17-af52-4974-b801-cf13cb5fff8d"
    expect(result).include(201);
  });
  xit("Try to create already existing user to receive 406 code", async function () {
    let data = JSON.stringify({
      userName: "testUser05",
      password: "QWErty123$%^",
    });

    let config = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: (status) => status === 406, //error is NOT shown ONLY if 406 status code is shown
      //validateStatus: () => true, //If you never want axios to throw an error, you can have the function always return true
    };
    const result = await axios.post(
      "https://demoqa.com/Account/v1/User",
      data,
      config
    );
    console.log(result.data);
    //userID: "28939a17-af52-4974-b801-cf13cb5fff8d"
    expect(result).to.have.property("status", 406);
  });

  xit("Try to create user with invalid data to receive 400 code", async function () {
    let data = JSON.stringify({
      userName: "",
      password: "",
    });

    let config = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: (status) => status === 400,
    };
    const result = await axios.post(
      "https://demoqa.com/Account/v1/User",
      data,
      config
    );
    console.log(result.data);
    //userID: "28939a17-af52-4974-b801-cf13cb5fff8d"
    expect(result).to.have.property("status", 400);
  });

  xit("Create new auth token for user from data inside", async function () {
    let data = JSON.stringify({
      userName: "testUser05",
      password: "QWErty123$%^",
    });

    let config = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    const result = await axios.post(
      "https://demoqa.com/Account/v1/GenerateToken",
      data,
      config
    );
    expect(result).to.have.property("status", 200);
    console.log(result);
    //how to show token? how to copy received value into prescribed variable?
  });

  xit("Error 400 code for auth token check", async function () {
    let data = JSON.stringify({
      userName: "",
      password: "",
    });

    let config = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      validateStatus: (status) => status === 400,
    };

    const result = await axios.post(
      "https://demoqa.com/Account/v1/GenerateToken",
      data,
      config
    );
    console.log(result.data);
    expect(result.data).to.have.property("message", "UserName and Password required.");
    expect(result).to.have.property("status", 400);
  });

  xit("Should return information about user with list of books", async function () {
    let data = "";

    let config = {
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6InRlc3RVc2VyMDUiLCJwYXNzd29yZCI6IlFXRXJ0eTEyMyQlXiIsImlhdCI6MTY5OTg5NTU5OH0.wSWSN3ABdr557j8H7-73B7C-kkOBYmefotSdyhn8yxk",
      },
    };

    const result = await axios.get(
      "https://demoqa.com/Account/v1/User/28939a17-af52-4974-b801-cf13cb5fff8d",
      config
    );
    console.log(result.data);
  });

  xit("Trying to reach data with unauthorized token, code 401 ", async function () {
    let data = "";

    let config = {
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer ",
      },
      validateStatus: status => (status === 401),
    };

    const result = await axios.get(
      "https://demoqa.com/Account/v1/User/28939a17-af52-4974-b801-cf13cb5fff8d",
      config
    );
    console.log(result.data);
    expect(result).to.have.property("status", 401);
  });

  xit("Authorization", async function () {
    let data = JSON.stringify({
      userName: "testUser05",
      password: "QWErty123$%^",
    });

    let config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const result = await axios.post(
      "https://demoqa.com/Account/v1/Authorized",
      data,
      config
    );
    console.log(result.data);
    expect(result).to.have.property("status", 200);
  });

  xit("Get list of all books", async function () {
    let config = {
      headers: {
        accept: "application/json",
      },
    };

    const result = await axios.get(
      "https://demoqa.com/BookStore/v1/Books",
      config
    );

    console.log(result.data);
    expect(result).to.have.property("status", 200);
  });

  xit("Add book to the user by isbn book number", async function () {
    let data = JSON.stringify({
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

    let config = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6InRlc3RVc2VyMDUiLCJwYXNzd29yZCI6IlFXRXJ0eTEyMyQlXiIsImlhdCI6MTY5OTg5NTU5OH0.wSWSN3ABdr557j8H7-73B7C-kkOBYmefotSdyhn8yxk",
      },
      data: data,
    };

    const result = await axios.post(
      "https://demoqa.com/BookStore/v1/Books",
      data,
      config
    );
    console.log(result.data);
    expect(result).to.have.property("status", 201);
  });

  xit("UserId is not correct to see users book, 401 code is shown", async function () {
    let data = JSON.stringify({
      userId: "",
      collectionOfIsbns: [
        {
          isbn: "9781449365035",
        },
        {
          isbn: "9781593277574",
        },
      ],
    });

    let config = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6InRlc3RVc2VyMDUiLCJwYXNzd29yZCI6IlFXRXJ0eTEyMyQlXiIsImlhdCI6MTY5OTg5NTU5OH0.wSWSN3ABdr557j8H7-73B7C-kkOBYmefotSdyhn8yxk",
      },
      data: data,
      validateStatus: status => (status === 401),
    };

    const result = await axios.post(
      "https://demoqa.com/BookStore/v1/Books",
      data,
      config
    );
    console.log(result.data);
    expect(result).to.have.property("status", 401);
  });

  xit("UserId is not authorized to see users book, 401 code is shown", async function () {
    let data = JSON.stringify({
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

    let config = {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
          "Bearer ",
      },
      data: data,
      validateStatus: status => (status === 401),
    };

    const result = await axios.post(
      "https://demoqa.com/BookStore/v1/Books",
      data,
      config
    );
    console.log(result.data);
    expect(result).to.have.property("status", 401);
  });

  xit("Get information about book by its isbn", async function () {
    let config = {
      headers: {
        accept: "application/json",
      },
    };

    const result = await axios.get(
      "https://demoqa.com/BookStore/v1/Book?ISBN=9781449365035",
      config
    );

    console.log(result.data);
    expect(result).to.have.property("status", 200);
  });

  xit("400 code is shown to get book information when wrong isbn is provided", async function () {
    let config = {
      headers: {
        accept: "application/json",
      },
      validateStatus: status => (status === 400),
    };

    const result = await axios.get(
      "https://demoqa.com/BookStore/v1/Book?ISBN=1234567890",
      config
    );

    console.log(result.data);
    expect(result).to.have.property("status", 400);
  });
});