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
 
    if (!req.body.nama_tim1){
        errors.push("Nama Tim Kosong");
    }
    
    var data = {
        nama_tim1: req.body.nama_tim1,
        nama_tim2 : req.body.nama_tim2,
        skor_tim1 : req.body.skor_tim1,
        skor_tim2 : req.body.skor_tim2
    }

    if(data.skor_tim1 > data.skor_tim2){
        console.log("tim 1 menang")
        db.run(
            `UPDATE klasemen set 
               p = COALESCE((SELECT MAX(p) + 1 from klasemen where id_tim = ?),p),
               w = COALESCE((SELECT MAX(w) + 1 from klasemen where id_tim = ?),w),
               f = COALESCE((SELECT MAX(f) + ? from klasemen where id_tim = ?),f),
               a = COALESCE((SELECT MAX(a) + ? from klasemen where id_tim = ?),a),
               gd = COALESCE((SELECT MAX(f) + ? from klasemen where id_tim = ?) - (SELECT MAX(a) + ? from klasemen where id_tim = ?),gd),
               pts = COALESCE((SELECT MAX(pts) + 3 from klasemen where id_tim = ?),pts) 
               where id_tim = ?`,
            [data.nama_tim1, data.nama_tim1 , data.skor_tim1  , data.nama_tim1 , data.skor_tim2 , data.nama_tim1 
                , data.skor_tim1  , data.nama_tim1 , data.skor_tim2 , data.nama_tim1, data.nama_tim1, data.nama_tim1],
            function (err, result) {
                if (err){
                    res.status(400).json({"error": res.message})
                    console.log("ASU")
                    console.log(err)
                    
                    return;
                }
                console.log("isi 2 menang")
                db.run(
                    `UPDATE klasemen set 
                       p = COALESCE((SELECT MAX(p) + 1 from klasemen where id_tim = ?),p),
                       l = COALESCE((SELECT MAX(l) + 1 from klasemen where id_tim = ?),l),
                       f = COALESCE((SELECT MAX(f) + ? from klasemen where id_tim = ?),f),
                       a = COALESCE((SELECT MAX(a) + ? from klasemen where id_tim = ?),a),
                       gd = COALESCE((SELECT MAX(f) + ? from klasemen where id_tim = ?) - (SELECT MAX(a) + ? from klasemen where id_tim = ?),gd)
                       WHERE id_tim = ?`,
                    [data.nama_tim2, data.nama_tim2 , data.skor_tim2 , data.nama_tim2 , data.skor_tim1 , data.nama_tim2, data.skor_tim2 , data.nama_tim2 , data.skor_tim1 , data.nama_tim2 , data.nama_tim2],
                    function (err, result) {
                        if (err){
                            res.status(400).json({"error": res.message})
                            console.log(err)
                            return;
                        }
                        res.json({
                            message: "success",
                            result : "Team 1 win"
                        })
                });
        });
    }else if(data.skor_tim1 < data.skor_tim2){
        console.log("tim 2 menang")
        db.run(
            `UPDATE klasemen set 
            p = COALESCE((SELECT MAX(p) + 1 from klasemen where id_tim = ?),p),
            w = COALESCE((SELECT MAX(w) + 1 from klasemen where id_tim = ?),w),
            f = COALESCE((SELECT MAX(f) + ? from klasemen where id_tim = ?),f),
            a = COALESCE((SELECT MAX(a) + ? from klasemen where id_tim = ?),a),
            gd = COALESCE((SELECT MAX(f) + ? from klasemen where id_tim = ?) - (SELECT MAX(a) + ? from klasemen where id_tim = ?),gd),
            pts = COALESCE((SELECT MAX(pts) + 3 from klasemen where id_tim = ?),pts) 
               WHERE id_tim = ?`,
               [data.nama_tim2, data.nama_tim2 , data.skor_tim2  , data.nama_tim2 , data.skor_tim1 , data.nama_tim2
                , data.skor_tim2  , data.nama_tim2 , data.skor_tim1 , data.nama_tim2, data.nama_tim2, data.nama_tim2],
            function (err, result) {
                if (err){
                    res.status(400).json({"error": res.message})
                    console.log(err)
                    return;
                }
                db.run(
                    `UPDATE klasemen set 
                    p = COALESCE((SELECT MAX(p) + 1 from klasemen where id_tim = ?),p),
                    l = COALESCE((SELECT MAX(l) + 1 from klasemen where id_tim = ?),l),
                    f = COALESCE((SELECT MAX(f) + ? from klasemen where id_tim = ?),f),
                    a = COALESCE((SELECT MAX(a) + ? from klasemen where id_tim = ?),a),
                    gd = COALESCE((SELECT MAX(f) + ? from klasemen where id_tim = ?) - (SELECT MAX(a) + ? from klasemen where id_tim = ?),gd)
                    WHERE id_tim = ?`,
                    [data.nama_tim1, data.nama_tim1 , data.skor_tim1 , data.nama_tim1 , data.skor_tim2 , data.nama_tim1, data.skor_tim1 ,
                         data.nama_tim1 , data.skor_tim2 , data.nama_tim1 , data.nama_tim1],
                    function (err, result) {
                        if (err){
                            res.status(400).json({"error": res.message})
                            console.log(err)
                            return;
                        }
                        res.json({
                            message: "success",
                            result : "Team 2 win"
                        })
                });
        });
    }else if(data.skor_tim1 == data.skor_tim2 && data.skor_tim1 != "undefined"){
        console.log("draw !")
        db.run(
            `UPDATE klasemen set 
               p = COALESCE((SELECT MAX(p) + 1 from klasemen where id_tim = ?),p),
               d = COALESCE((SELECT MAX(d) + 1 from klasemen where id_tim = ?),d),
               f = COALESCE((SELECT MAX(f) + ? from klasemen where id_tim = ?),f),
               a = COALESCE((SELECT MAX(a) + ? from klasemen where id_tim = ?),a),
               pts = COALESCE((SELECT MAX(pts) + 1 from klasemen where id_tim = ?),pts)
               WHERE id_tim = ?`,
            [data.nama_tim2, data.nama_tim2 , data.skor_tim2 , data.nama_tim2 , data.skor_tim1 
                , data.nama_tim2 , data.nama_tim2 ,data.nama_tim2],
            function (err, result) {
                if (err){
                    res.status(400).json({"error": res.message})
                    console.log(err)
                    return;
                }
                db.run(
                    `UPDATE klasemen set 
                    p = COALESCE((SELECT MAX(p) + 1 from klasemen where id_tim = ?),p),
                    d = COALESCE((SELECT MAX(d) + 1 from klasemen where id_tim = ?),d),
                    f = COALESCE((SELECT MAX(f) + ? from klasemen where id_tim = ?),f),
                    a = COALESCE((SELECT MAX(a) + ? from klasemen where id_tim = ?),a),
                    pts = COALESCE((SELECT MAX(pts) + 1 from klasemen where id_tim = ?),pts)
                    WHERE id_tim = ?`,
                 [data.nama_tim1, data.nama_tim1 , data.skor_tim1 , data.nama_tim1 , data.skor_tim2
                     , data.nama_tim1 , data.nama_tim1 ,data.nama_tim1],
                    function (err, result) {
                        if (err){
                            res.status(400).json({"error": res.message})
                            console.log(err)
                            console.log("ASU")
                            return;
                        }
                        res.json({
                            message: "success",
                            result : "draw"
                        })
                });
        });
    }else{
        res.json({
            message: "Error",
            result : "error"
        })

    }

})




app.use(function(req, res){
    res.status(404);
});