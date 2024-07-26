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



app.get("/", (req, res) => {
    res.render("index.ejs",{
        title: "titolo",
        description: "Lorem Ipsum è un testo segnaposto utilizzato nel settore della tipografia e della stampa. Lorem Ipsum è considerato il testo segnaposto standard sin dal sedicesimo secolo, quando un anonimo tipografo prese una cassetta di caratteri e li assemblò per preparare un testo campione.",
        userComment: "È universalmente riconosciuto che un lettore che osserva il layout di una pagina viene distratto dal contenuto testuale se questo è leggibile. Lo scopo dell’utilizzo del Lorem Ipsum è che offre una normale distribuzione delle lettere (al contrario di quanto avviene se si utilizzano brevi frasi ripetute, ad esempio “testo qui”), apparendo come un normale blocco di testo leggibile. Molti software di impaginazione e di web design utilizzano Lorem Ipsum come testo modello. Molte versioni del testo sono state prodotte negli anni, a volte casualmente, a volte di proposito (ad esempio inserendo passaggi ironici)."
    })
})

app.get("/add-book", async (req, res) => {
    res.render("add-a-book.ejs")
})

app.post("/add-a-book", async (req, res) => {
    console.log(req.body)
    console.log("libro aggiunto")
    res.redirect("/")
})




app.listen(port, () => {
    console.log(`Application listen on port: ${port}`)
})