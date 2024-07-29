import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

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
db.connect()

let books = db.query("SELECT * FROM books")

let error = null;

app.get("/", async (req, res) => {

    books = await db.query("SELECT * FROM books")
    res.render("index.ejs",{
        data: books.rows,
        error: error
    })

    error = null; 
})

app.get("/add-book", async (req, res) => {
    res.render("add-a-book.ejs", {
        error: error
    })

    error = null;
});

app.post("/add-a-book", async (req, res) => {
    try {
        console.log(req.body.ISBN)
        const userISBN = req.body.ISBN;
        const result = await axios.get(
            `https://openlibrary.org/api/books?bibkeys=ISBN:${userISBN}&jscmd=details&format=json`);

        console.log(result.data)

        if ( result.data[`ISBN:${userISBN}`] == undefined ) {
            error = "We dont have this book in our record. Sorry ;("
            res.redirect("/add-book")
        } else {
            const smallCover = result.data[`ISBN:${userISBN}`]["thumbnail_url"];
            const LargeCover = smallCover ? smallCover.replace("-S", "-L") : "assets/images/no_cover.png";
            const bookTitle = result.data[`ISBN:${userISBN}`]["details"]['title'];

            await db.query("INSERT INTO books (name, cover) VALUES ($1, $2)",
                [bookTitle ,LargeCover]);

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
