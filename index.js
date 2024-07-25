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

db.connect()

app.get("/", (req, res) => {
    res.render("index.ejs")
})





app.listen(port, () => {
    console.log(`Application listen on port: ${port}`)
})