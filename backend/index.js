// dependencies

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;

// dotenv
require('dotenv').config();

// middlewares
const middlewares = require('./middlewares/mw');
const books = require('./api/books');

// express init
const app = express();
app.enable('trust proxy'); // needed for rate limiting by Client IP

// mongoose init
const db_uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@lending-library-cluster.llorr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

MongoClient.connect(db_uri, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(process.env.DB_NAME);
    dbo.collection("books").findOne(function(err, result) {
      if (err) throw err;
      console.log(result.title);
      db.close();
    });
  });

// mw init
app.use(morgan('common'));
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));
app.use(express.json());

// config
const PORT = process.env.PORT || 5000;

// routes
app.get("/", (req, res) => {
    res.send("We're online")
})

app.get("/db-test", (req, res) => {
    res.send(process.env.DATABASE_URL)
})

// api route
app.use('/api/books', books);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);


// server launch
app.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`)
  })