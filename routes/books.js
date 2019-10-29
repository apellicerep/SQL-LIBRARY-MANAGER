const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb) {
    return async (req, res, next) => {
        try {
            await cb(req, res, next)
        } catch (error) {
            res.status(500).render('error');
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
    res.render("books/newbook", { book: {}, title: "New Book", button: "New Book" })
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
            res.render("books/newbook", { book, errors: error.errors, title: "New Book", button: "Create New Book" })
        } else {
            throw error;
        }
    }
}));

/* Edit article form. */
router.get("/:id", asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render("books/editbook", { book, title: "Edit Book", button: "Update Book" })
    } else {
        res.status(404);
        res.render('pageNotFound');
    }
}))


/* Update an article. */
router.post('/:id', asyncHandler(async (req, res) => {
    let book;
    try {
        book = await Book.findByPk(req.params.id);
        if (book) {
            await book.update(req.body);
            res.redirect("/books/");
        } else {
            res.status(404);
            res.render('pageNotFound');
        }
    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            book = await Book.build(req.body);
            book.id = req.params.id;
            res.render("books/newbook", { book, errors: error.errors, title: "Edit Book", button: "Update Book" })
        } else {
            throw error;
        }
    }
}));

router.post('/:id/delete', asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        await book.destroy();
        res.redirect("/books/");
    } else {
        res.status(404);
        res.render('pageNotFound');
    }
}));


module.exports = router;