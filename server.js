// Create express app
var express = require("express")
var app = express()
var db = require("./database.js")
// var md5 = require("md5")
var bodyParser = require("body-parser")

// Server port
var HTTP_PORT = 8000 
// Start server


app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});


// Insert here other API endpoints

// Default response for any other request


app.get("/api/klasemen", (req, res, next) => {
    var sql = "select * from klasemen order by pts desc"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});


app.get("/api/klasemen/:id", (req, res, next) => {
    var sql = "select * from klasemen where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

app.post("/api/klasemen/", (req, res, next) => {
    var errors=[]
 
    if (!req.body.nama_tim){
        errors.push("Nama Tim Kosong");
    }

    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        nama_tim: req.body.nama_tim
    }
    var sql ='INSERT INTO klasemen (id_tim, nama_tim, p , w, d ,l , f , a , gd , pts) VALUES ((SELECT MAX(id) + 1 FROM klasemen) ,?,0,0,0,0,0,0,0,0)'
    var params =[data.nama_tim]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

app.delete("/api/klasemen/:id", (req, res, next) => {
    db.run(
        'DELETE FROM klasemen WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
})

app.post("/api/pertandingan/", (req, res, next) => {
    var errors=[]
    
    if (!req.body.id_tim){
        errors.push("No id_tim specified");
    }
    if (!req.body.nama_tim){
        errors.push("No nama_tim specified");
    }

    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        id_tim: req.body.id_tim,
        nama_tim: req.body.nama_tim
    }
    var sql ='INSERT INTO klasemen (id_tim, nama_tim, p , w, d ,l , f , a , gd , pts) VALUES (?,?,0,0,0,0,0,0,0,0)'
    var params =[data.id_tim, data.nama_tim]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

app.post("/api/pertandingan/", (req, res, next) => {
    var errors=[]
 
    if (!req.body.nama_tim){
        errors.push("Nama Tim Kosong");
    }

    // if (errors.length){
    //     res.status(400).json({"error":errors.join(",")});
    //     return;
    // }
    var data = {
        nama_tim1: req.body.nama_tim1,
        nama_tim2: req.body.nama_tim2
    }

    var sql = "select * from klasemen where id_tim = ?"
    var tim1 , tim2;
    var params = [req.params.id]
    db.get(sql, tim1, (err, row) => {
            tim1 = row;
      });

    db.get(sql, tim2, (err, row) => {
        tim2 = row;
    });  

    
    res.json({
        "message":"success",
        "data_tim1": tim1,
        "data_tim2": tim2
    })
})




app.use(function(req, res){
    res.status(404);
});