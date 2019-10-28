const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb) {
    return async (req, res, next) => {
        try {
            await cb(req, res, next)
        } catch (error) {
            res.status(500).send(error);
        }
    }
}

/* GET articles listing. */
router.get('/', asyncHandler(async (req, res) => {
    const books = await Book.findAll();
    res.render("books/listbooks", { books, title: "Sequelize-It!" });
}));

/* Create a new article form. */
router.get('/new', asyncHandler(async (req, res) => {
    res.render("books/newbook", { books: {}, title: "New Book" })
}));

module.exports = router;