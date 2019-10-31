const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Book = require('../models').Book;
const Op = Sequelize.Op


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


/* Pagination */
router.get('/', asyncHandler(async (req, res) => {
    const books = await Book.findAndCountAll(
        { offset: 0, limit: 5 })
    const numPagination = Math.ceil(books.count / 5)
    if (books) {
        res.render("books/listbooks", { books: books.rows, title: "Books", pagination: numPagination });
    } else {
        res.status(404);
        res.render('pageNotFound');
    }
}))


/* Create a new book form. */
router.get('/new', asyncHandler(async (req, res) => {
    res.render("books/newbook", { book: {}, title: "New Book", button: "New Book" })
}));

/* POST create book. */
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

/* Pagination */
router.get('/page', asyncHandler(async (req, res) => {
    const searchInput = req.query.page - 1;
    const activePage = req.query.page
    const books = await Book.findAndCountAll(
        { offset: 5 * searchInput, limit: 5 })
    const numPagination = Math.ceil(books.count / 5)
    console.log(Math.ceil(books.count / 5))
    if (books) {
        res.render("books/listbooks", { books: books.rows, title: "Books", pagination: numPagination, active: activePage });
    } else {
        res.status(404);
        res.render('pageNotFound');
    }
}))

/* Search Input */
router.get('/results', asyncHandler(async (req, res) => {
    console.log(req.query.search)
    const searchInput = req.query.search;
    const books = await Book.findAll({
        where: {
            [Op.or]: [{ title: { [Op.substring]: `${searchInput}` } },
            { author: { [Op.substring]: `${searchInput}` } },
            { genre: { [Op.substring]: `${searchInput}` } },
            { year: { [Op.substring]: `${searchInput}` } }]
        }
    })
    if (books) {
        res.render("books/listbooks", { books, title: "Books", results: "results" });
    } else {
        res.status(404);
        res.render('pageNotFound');
    }
}))



/* Edit book form. */
router.get("/:id", asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
        res.render("books/editbook", { book, title: "Edit Book", button: "Update Book" })
    } else {
        res.status(404);
        res.render('pageNotFound');
    }
}))


/* Update an book. */
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