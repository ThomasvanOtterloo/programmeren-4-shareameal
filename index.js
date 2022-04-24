const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

let userList = [];
let id=0;

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World",
  });
});


// Gets ALL User objects in the list.
app.get("/api/user",(req,res)=> {
res.status(200).json({
  status:200,
  result: userList
  });
  console.log("Get request /user is successfull");
});

// Creates a object in USER
app.post("/api/user", (req,res)=> {
  let user = req.body;
  if (userList.find(c => c.emailAddress === req.body.emailAddress)) {
    res.status(400).json({
      status: 400,
      result: "A user with this email address already exists!"
    });
  } else {
    id++;
    user = {
      id,
      ...user,
    };
    userList.push(user);
    res.status(201).json({
      status: 201,
      result: userList,
    });
    console.log("Succesfully POST json sent.")
  }
});

// Requests 1 user with a specifik ID.
app.get("/api/user/:id",(req,res)=> {
let user = req.params.id;
console.log(user)
if(userList.find(c => c.id === parseInt(req.params.id))) {
  res.status(200).json({
    status: 200,
    result: userList.find(c => c.id === parseInt(req.params.id))
    });
    console.log(user + " has been pulled")
} else {
  res.status(400).json({
    status: 400,
    result: `User with ID ${user} not found`,
  })
}
});


// Updates a user.
app.put("/api/user/:id", (req,res) => {
if(userList.find(c => c.id === parseInt(req.params.id))) {
  console.log(req.params.id)
  let oldEmail = userList.find(c => c.id === parseInt(req.params.id)).emailAddress
  userList.find(c => c.id === parseInt(req.params.id)).firstName = req.body.firstName
  userList.find(c => c.id === parseInt(req.params.id)).lastName = req.body.lastName
  userList.find(c => c.id === parseInt(req.params.id)).street = req.body.street
  userList.find(c => c.id === parseInt(req.params.id)).city = req.body.city
  userList.find(c => c.id === parseInt(req.params.id)).password = req.body.password
  userList.find(c => c.id === parseInt(req.params.id)).emailAddress = req.body.emailAddress

 
  if(userList.find(c => c.emailAddress === oldEmail)) {
    res.status(400).json({
      status: 401,
      result: "You updated your mail to a mail that allready exists!"
    });
  } else {
    res.status(200).json({
      status: 200,
      result: userList.find(c => c.id === parseInt(req.params.id))
      });
  }
} else {
  res.status(400).json({
    status: 400,
    result: `User with this ID not found`,
  })
}
});


// deleted a user by id
app.delete('/api/user/:id',(req,res) => {
let user = req.params.id - 1;
if(userList[user]) {
  userList.splice(user,1);
  res.status(200).json({
    status:200,
    result: 'Succesfully deleted.'
  })
} else {
  res.status(400).json({
    status: 400,
    result: `User with ID ${user+1} not found`,
  })
}

});


app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
