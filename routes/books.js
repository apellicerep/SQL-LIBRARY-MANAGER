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
    res.render("books/listbooks", { books, title: "Books" });
}));

/* Create a new article form. */
router.get('/new', asyncHandler(async (req, res) => {
    res.render("books/newbook", { books: {}, title: "New Book" })
}));

/* POST create article. */
router.post('/', asyncHandler(async (req, res) => {
    let book;
    try {
        book = await Book.create(req.body);
        console.log(book)
        res.redirect("/books/");
    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            book = await Book.build(req.body);
            console.log(error.errors)
            res.render("books/newbook", { book, errors: error.errors, title: "New Book" })
        } else {
            throw error;
        }
    }
}));

router.get("/:id/edit", asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render("books/newbook", { book, title: "Edit Book" })
    } else {
        res.sendStatus(404);
    }
}))



module.exports = router;