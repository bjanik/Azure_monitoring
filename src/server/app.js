const express = require('express')
const pg = require('pg')

const app = express()

const pool = new pg.Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
})

function getSubscriptions(req, res) {
    pool.query("SELECT Name FROM Subscriptions", (err, result) => {
        if (err) console.log(err)
        res.json(result.rows)
    })
}

function getServices(req, res) {
    pool.query("SELECT Name FROM Services", (err, result) => {
        if (err) console.log(err)
        res.json(result.rows)
    })
}

function getGeneralCostBySubs(req, res) {
    pool.query("SELECT Name, SUM(Cost) as Total FROM Cost, Subscriptions WHERE Subid=id AND recorddate = (SELECT MAX(recorddate) FROM Cost) GROUP BY Name", (err, result) => {
        if (err) console.log(err)
        res.json(result.rows)
    })
}

function getGeneralCostByServices(req, res) {
    pool.query("SELECT Name, SUM(Cost) as Total FROM Cost, Services WHERE Serviceid=id AND recorddate = (SELECT MAX(recorddate) FROM Cost) GROUP BY Name", (err, result) => {
        if (err) console.log(err)
        res.json(result.rows)
    })
}

function getSubCostByService(req, res) {
    pool.query("SELECT Services.Name as Service, Cost FROM Services, Cost, Subscriptions\
                WHERE Subid=Subscriptions.id\
                AND Subscriptions.Name=$1\
                AND Services.id=Serviceid\
                AND recorddate = (SELECT MAX(recorddate) FROM Cost)", [req.params.subscription], (err, result) => {
        if (err) console.log(err)
        res.json(result.rows)
    })
}

function getServicesCostBySub(req, res) {
    pool.query("SELECT Subscriptions.Name as Subscription, Cost FROM Subscriptions, Cost, Services\
                WHERE Subid=Subscriptions.id\
                AND Services.Name=$1\
                AND Services.id=Serviceid\
                AND recorddate = (SELECT MAX(recorddate) FROM Cost)", [req.params.service], (err, result) => {
        if (err) console.log(err)
        res.json(result.rows)
    })
}

app.use((req, res, next) => {
    res.set("Access-Control-Allow-Origin", "*");
    next();
})

app.get("/api/subscriptions", getSubscriptions)
app.get("/api/services", getServices)
app.get("/api/cost/general/subscriptions", getGeneralCostBySubs)
app.get("/api/cost/general/services", getGeneralCostByServices)
app.get("/api/cost/services/:service", getServicesCostBySub)
app.get("/api/cost/subscriptions/:subscription", getSubCostByService)

app.listen(8080, () => {
    console.log("Listening on port 8080")
})
