
const express = require('express')
const app = express()
const port = process.env.PORT ||3000
const bodyParser = require ('body-parser');
app.use(bodyParser.json());

let database = [];
let id = 0;

app.all('*', (req,res,next)=>{
  const method = req.method
  console.log('Methode ${method} aangeropen');
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    result: 'Hello world! Connection with the API went successful',
  });
});

app.post('/api/movie',(req,res)=> {
  let movie = req.body;
  console.log('post function wordt aangeroepen.');
  id++;
  movie = {
    id,
    ...movie,
  };

  database.push(movie);
  console.log(database);
  res.status(201).json({
    status: 201,
    result: movie,
  });
});

app.get('/api/movie',(req,res) => {
  res.status(200).json({
    status:200,
    result: database,
  })
});

// movieId is een parameter
app.get('/api/movie/:movieId',(req,res) => {
  const movieId = req.params.movieId
  let movie = database.filter((item) => (item.id==movieId));
  if(movie.length>0){
    console.log(movie)
    res.status(200).json({
      status: 200,
      result: movie,
    });
  } else {
    res.status(404).json({
      status: 404,
      result: 'Movie with ID ${movieId} not found'
    });
  }
});

app.all('*', (req,res) => {
  res.status(404).json({
    status: 400,
    result: 'End-point not found',
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})