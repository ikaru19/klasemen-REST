var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE klasemen(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_tim INTEGER,
            nama_tim text,
            p INTEGER ,
            w INTEGER,
            d INTEGER,
            l INTEGER,
            f INTEGER,
            a INTEGER ,
            gd INTEGER ,
            pts INTEGER
          )`,

        (err) => {
            if (err) {
                // Table already created
                console.log(err);
            }else{
                // Table just created, creating some rows
                console.log('Add some row')
                var insert = 'INSERT INTO klasemen (id_tim , nama_tim, p , w, d ,l , f , a , gd , pts) VALUES ((SELECT ifnull(MAX(id) + 1 ,1)  FROM klasemen) , ?,?,?,?,?,?,?,?,?)'
                db.run(insert, ["Westham United",0,0,0,0,0,0,0,0] ,function(err) {
                    if (err) {
                      return console.error(err);
                    }

                    console.log(`Rows inserted ${this.changes}`);}
                )
                db.run(insert, ["Madura United",0,0,0,0,0,0,0,0])
                console.log(err)
            }
        });  
    }
});


module.exports = db