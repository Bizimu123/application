const express = require('express')
const mysql = require('mysql2/promise')
const cors = require('cors')

const app = express()

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// Basic error handling middleware (add this without changing other code)
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send({ error: 'Something went wrong!' })
})

app.listen(5000, () => {
    console.log('server is run on port 5000')
})

const conn = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'group'
})

// Wrap each route in try-catch without restructuring
app.get("/book", async (req, res, next) => {
    try {
        const book = await conn.query("select * from books")
        res.send(book[0])
    } catch (err) {
        next(err)
    }
})

app.get("/book/:id", async (req, res, next) => {
    try {
        const id = req.params.id
        const book = await conn.query("select * from books where id = ?", [id])
        res.send(book[0])
    } catch (err) {
        next(err)
    }
})

app.post("/book", async (req, res, next) => {
    try {
        const { title, author, genre, price, instock } = req.body
        await conn.query("insert into books (title, author, genre, price, instock) values(?, ?, ?, ?, ?)", 
            [title, author, genre, price, instock])
        res.send({ message: "book created successfully" })
    } catch (err) {
        next(err)
    }
})


app.put("/book/:id", async (req, res, next) => {
    try {
        const id = req.params.id  // Fixed: Changed from idc to id
        const { title, author, genre, price, instock } = req.body
        await conn.query("update books set title=?, author=?, genre=?, price=?, instock=? where id = ?", 
            [title, author, genre, price, instock, id])
        res.send({ message: "books modified successfully" })
    } catch (err) {
        next(err)
    }
})


app.delete("/book/:id", async (req, res, next) => {
    try {
        const id = req.params.id
        await conn.query("delete from books where id = ?", [id])
        res.send({ message: "book removed successfully" })
    } catch (err) {
        next(err)
    }
})