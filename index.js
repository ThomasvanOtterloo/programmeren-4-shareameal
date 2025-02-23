const express = require("express");
const app = express();
const authRoutes = require('./src/routes/auth.routes')


require('dotenv').config()
const port = process.env.PORT;

const userRouter = require('./src/routes/user.routes')
const mealRouter = require('./src/routes/meal.routes')


const bodyParser = require("body-parser");
app.use(bodyParser.json());


// Link Heroku:
// https://progragrameren-nodejs-server.herokuapp.com/

// Local database
// /Applications/XAMPP/xamppfiles/bin/mysql -u root

// Heroku used database
// /Applications/XAMPP/xamppfiles/bin/mysql -h db-mysql-ams3-37313-do-user-2119860-0.b.db.ondigitalocean.com --port 25060 -u 2186082  -p

app.all("*", (req, res, next) => {
  const method = req.method;
  // console.log(`Method ${method} is aangeroepen`);
  next();
});


app.use('/api', authRoutes)
app.use(userRouter);
app.use(mealRouter)



app.use((err,req,res,next) => {
  res.status(err.status).json(err)
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

module.exports = app;