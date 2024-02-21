module.exports.testUserData = {
    userName: () => {return `testUser${Date.now()}`},
    password: "QWErty123$%^"
}

// module.exports = {
//     testUserData: {
//         userName: () => {return `testUser${Date.now()}`},  // async function every time creates user with new timestamp
//         password: 'QWErty123$%^'
//       }
// }

      // {
      //   dev:{
      //     username: "username",
      //     passwordD:"password ",
      //   }
      //   qa:{
      //     username: "usernameQA",
      //     password: "passwordQA",
      //   }
      // }['dev']