import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import { compareAsc, format } from "date-fns";

const app = express()
const port = 3000;
const db = new pg.Client({
    host: "localhost",
    port: "5432",
    database: "share_your_readings",
    user: "postgres",
    password: "postgreadmin"
})

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
db.connect();

let books = db.query(
    "SELECT users.username, books.id, books.name, books.cover, books.user_comment, books.user_id, books.publish_date, books.rating FROM books INNER JOIN users ON books.user_id = users.id")

let error = null;

app.get("/", async (req, res) => {

    books = await db.query("SELECT users.username, books.id, books.name, books.cover, books.user_comment, books.user_id, books.publish_date, books.rating FROM books INNER JOIN users ON books.user_id = users.id")
    console.log(books.rows)
    res.render("index.ejs",{
        data: books.rows,
        error: error
    })

    error = null; 
})

app.get("/sortByTitle", async (req, res) => {

    books = await db.query("SELECT users.username, books.id, books.name, books.cover, books.user_comment, books.user_id, books.publish_date, books.rating FROM books INNER JOIN users ON books.user_id = users.id ORDER BY name ASC")

    res.render("index.ejs",{
        data: books.rows,
        error: error
    })
})

app.get("/sortByDate", async (req, res) => {

    books = await db.query("SELECT users.username, books.id, books.name, books.cover, books.user_comment, books.user_id, books.publish_date, books.rating FROM books INNER JOIN users ON books.user_id = users.id ORDER BY publish_date DESC")

    res.render("index.ejs",{
        data: books.rows,
        error: error
    })
})

app.get("/sortByRating", async (req, res) => {

    books = await db.query("SELECT users.username, books.id, books.name, books.cover, books.user_comment, books.user_id, books.publish_date, books.rating FROM books INNER JOIN users ON books.user_id = users.id ORDER BY books.rating DESC")

    res.render("index.ejs",{
        data: books.rows,
        error: error
    })
})

app.get("/add-book", async (req, res) => {
    res.render("add-a-book.ejs", {
        error: error
    })

    error = null;
});

app.post("/add-a-book", async (req, res) => {
    try {
        const userISBN = req.body.ISBN;
        const user = req.body.username;
        const userComment = req.body.userComment
        const rating = req.body.rating;
        console.log(rating)
        const result = await axios.get(
            `https://openlibrary.org/api/books?bibkeys=ISBN:${userISBN}&jscmd=details&format=json`);

        if ( result.data[`ISBN:${userISBN}`] == undefined ) {
            error = "We dont have this book in our record. Sorry ;("
            res.redirect("/add-book")
        } else {
            const smallCover = result.data[`ISBN:${userISBN}`]["thumbnail_url"];
            const LargeCover = smallCover ? smallCover.replace("-S", "-L") : "assets/images/no_cover.png";
            const bookTitle = result.data[`ISBN:${userISBN}`]["details"]['title'];
            const publishDate = new Date();
            console.log(format(publishDate, "yyyy-MM-dd HH:mm:ss"))

            const pushingUser = await db.query("INSERT INTO users (username) VALUES ($1) RETURNING id;",
                [user]
            )

            await db.query(
                `INSERT INTO books (name, cover, user_id, user_comment, publish_date, rating) VALUES ($1, $2, $3, $4, TO_TIMESTAMP($5, 'YYYY-MM-DD HH24:MI:SS'), $6);`,
                [bookTitle ,LargeCover,pushingUser.rows[0].id, userComment, format(publishDate, "yyyy-MM-dd HH:mm:ss"), rating]);

            error = '';
            res.redirect("/")
        }
    } catch (error) {
        console.error(error)
    }
})


app.listen(port, () => {
    console.log(`Application listen on port: ${port}`)
})
