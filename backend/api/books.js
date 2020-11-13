const { Router } = require('express');
const RateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');
const MongoClient = require('mongodb').MongoClient;

const Book = require('../models/Book');

const {
  API_KEY,
  DATABASE_URL,
} = process.env;

const router = Router();

const rateLimitDelay = 10 * 1000; // 10 second delay
const limiter = new RateLimit({
  store: new MongoStore({
    uri: DATABASE_URL,
    collection: 'books',
    expireTimeMs: rateLimitDelay,
  }),
  max: 1,
  windowMs: rateLimitDelay
});

router.get('/', async (req, res, next) => {

  (async () => {
        let client = await MongoClient.connect(process.env.DATABASE_URL,
            { useNewUrlParser: true, useUnifiedTopology: true  });

        let db = client.db(process.env.DB_NAME);
        try {
           const result = await db.collection("books").findOne();
           res.json(result.title);
        }
        finally {
            client.close();
        }
    })()
    .catch(err => next(err));
});

router.post('/', limiter, async (req, res, next) => {
  try {
    if (req.get('X-API-KEY') !== API_KEY) {
      res.status(401);
      throw new Error('UnAuthorized');
    }
    const book = new Book(req.body);
    const createdBook = await book.save();
    res.json(createdBook);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(422);
    }
    next(error);
  }
});

module.exports = router;