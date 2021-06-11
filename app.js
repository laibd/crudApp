const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();


app.listen(8000, () => {
    console.log('Server is running');
});

const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'test'
});

connection.connect(function(error){
    if(!!error) console.log(error);
    else console.log('Database Connected!');
});

app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/persons',(req, res) => {
    let sql = "SELECT * FROM person";
    let query = connection.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('person_index', {
            title : 'Osoby: ',
            person : rows
        });
    });
});

app.get('/home',(req, res) => {
        res.render('home', {
            title : 'APV projekt ',
        });
    });

app.get('/meetings',(req, res) => {
   let sql = "SELECT * FROM meeting m JOIN location l ON m.id_location=l.id_location";
    let query = connection.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('meeting_index', {
            title : 'Schůzky: ',
            sql : rows
        });
    });
});

app.get('/addperson',(req, res) => {
    res.render('person_add', {
        title : 'Přidej osobu'
    });
});
app.get('/addmeeting',(req, res) => {
    let sql2 = `Select * from location`;
    let query = connection.query(sql2,(err, rows) => {
        if (err) throw err;
        res.render('meeting_add', {
            title: 'Přidej schůzku',
            sql2 : rows
        });
    });
});

app.post('/saveperson',(req, res) => {
    let typ;
    let pom;
    if (req.body.con=='1'){
        typ='1';
    }
    else if (req.body.con=='2'){
        typ='2';
    }
    else if (req.body.con=='3'){
        typ='3';
    }
    else if (req.body.con=='4'){
        typ='4';
    }
    else if (req.body.com=='5'){
        typ='5';
    }
    else typ='6';

    let sql = "INSERT INTO location SET ?";
    let sql2 = "INSERT INTO person SET ?";
    let sql3 = "INSERT INTO contact SET ?";

    let location = {city: req.body.city, street_name: req.body.street_name, street_number: req.body.street_number, zip: req.body.zip};

    let query = connection.query(sql,location,(err, results) => {
        if(err) throw err;
        pom=results.insertId;

    let person = {id_location: pom,first_name: req.body.first_name,last_name: req.body.last_name, nickname: req.body.nickname,
        birth_day: req.body.birth_day, gender: req.body.gender, height: req.body.height};

    let query2 = connection.query(sql2,person,(err, results) => {
        if(err) throw err;
        let personId = results.insertId;

        let con = {id_person: personId,id_contact_type:  typ, contact: req.body.contact};

        let query = connection.query(sql3,con,(err, results) => {
            if(err) throw err;
            res.redirect('/persons');
    });
    });
});
});

app.post('/savemeeting',(req, res) => {
    let meetingdata = {id_location: req.body.misto , start: req.body.start, description: req.body.description};
    let sql = "INSERT INTO meeting SET?";
    let query2 = connection.query(sql, meetingdata,(err, results) => {
        if(err) throw err;
        res.redirect('/meetings');
    });
});

app.get('/personedit/:id_person',(req, res) => {
    const personId = req.params.id_person;
    let sql = `Select * from person where id_person = ${personId}`;
    let sql2 = `Select * from person`;
    let query = connection.query(sql,(err, result) => {
        let query2 = connection.query(sql2,(err,rows)=>{
            if (err) throw err;
            res.render('person_edit', {
                title : 'Edit Osoby č. : ' + req.params.id_person,
                person : result[0],
                sql2 : rows
            })
        });
    });

});
app.get('/meetingedit/:id_meeting',(req, res) => {
    const meetingId = req.params.id_meeting;
    let sql = `Select * from meeting where id_meeting = ${meetingId}`;
    let sql2 = `Select * from person`;
    let sql3 = `Select * from location`;
    let query = connection.query(sql,(err, result) => {
        if(err) throw err;
        let query2 = connection.query(sql2,(err,rows)=>{
            if (err) throw err;
            let query3 = connection.query(sql3,(err,rows2)=>{
            res.render('meeting_edit', {
                title : 'Edit Schůzky č. : ' + req.params.id_meeting,
                meeting : result[0],
                sql2 : rows,
                sql3 : rows2
        })
        });
        });
    });
});

app.post('/personupdate',(req, res) => {
    const personId = req.body.id_person;
    let contact_type;
    let relation_type;

        if (req.body.con=='1'){
            contact_type='1';
        }
        else if (req.body.con=='2'){
            contact_type='2';
        }
        else if (req.body.con=='3'){
            contact_type='3';
        }
        else if (req.body.con=='4'){
            contact_type='4';
        }
        else contact_type='';

    if (req.body.rel=='1'){
        relation_type='1';
    }
    else if (req.body.rel=='2'){
        relation_type='2';
    }
    else if (req.body.rel=='3'){
        relation_type='3';
    }
    else if (req.body.rel=='4'){
        relation_type='4';
    }
    else if (req.body.rel=='5'){
        relation_type='5';
    }
    else if (req.body.rel=='6'){
        relation_type='6';
    }
    else if (req.body.rel=='7'){
        relation_type='7';
    }
    else if (req.body.rel=='8'){
        relation_type='8';
    }else relation_type='';

    let sql2 = "INSERT INTO contact SET ?";
    let sql3 = "INSERT INTO relation SET ?";
    let con = {id_person: personId,id_contact_type:  contact_type, contact: req.body.contact};
    let rel = {id_person1: personId,id_person2: req.body.osoby,id_relation_type:  relation_type};
    let rel2 = {id_person1: req.body.osoby,id_person2: personId,id_relation_type:  relation_type};
    let sql = "UPDATE person SET nickname='"+req.body.nickname+"', "
        + " first_name='"+req.body.first_name+"', last_name='"+req.body.last_name+"',  birth_day='"+req.body.birth_day+"', "
        +" height='"+req.body.height
        +"' where id_person ="+personId;
    let query2 = connection.query(sql,(err, results) => {
        if(err) throw err;
    });
    if(contact_type!=''){
        let query = connection.query(sql2,con,(err, results) => {
            if(err) throw err;
        });
    }
    if(relation_type!=''){
        let query3 = connection.query(sql3,rel,(err, results) => {
            if(err) throw err;
            let query4 = connection.query(sql3,rel2,(err, results) => {
            if(err) throw err;
        });
        });
    }
    res.redirect('/persons');
});

app.post('/meetingupdate',(req, res) => {
    const meetingId = req.body.id_meeting;
    let sql = "UPDATE meeting SET start='"+req.body.start+"', " + " id_location='"+req.body.mista+"', description='"+req.body.description+"' where id_meeting ="+meetingId;
    let sql2 = "INSERT INTO person_meeting SET ?";
    let pm = {id_person: req.body.osoby ,id_meeting: meetingId};
    let query = connection.query(sql2,pm,(err, results) => {
        if(err) throw err;
        let query2 = connection.query(sql,(err, results) => {
            if(err) throw err;
            res.redirect('/meetings');
        });
    });
});

app.get('/persondelete/:id_person',(req, res) => {
    const personId = req.params.id_person;
    let sql = `DELETE from person where id_person = ${personId}`;
    let sql2 = `DELETE from contact where id_person = ${personId}`;
    let sql3 = `DELETE from relation where id_person1 = ${personId}`;
    let sql4 = `DELETE from person_meeting where id_person = ${personId}`;
    let query = connection.query(sql2,(err, result) => {
        if(err) throw err;
    });
    let query2 = connection.query(sql3,(err, result) => {
        if(err) throw err;
    });
    let query3 = connection.query(sql4,(err, result) => {
        if(err) throw err;
        let query4 = connection.query(sql,(err, result) => {
            if(err) throw err;
        res.redirect('/persons');
    });
    });
});

app.get('/meetingdelete/:id_meeting',(req, res) => {
    const meetingId = req.params.id_meeting;
    let sql = `DELETE from person_meeting where id_meeting = ${meetingId}`;
    let sql2 = `DELETE from meeting where id_meeting = ${meetingId}`;
    let query = connection.query(sql,(err, result) => {
        if(err) throw err;
        let query = connection.query(sql2,(err, result) => {
            if(err) throw err;
        res.redirect('/meetings');
    });
    });
});

app.get('/persondetail/:id_person',(req, res) => {
    const personId = req.params.id_person;
    let sql = `SELECT * FROM person p JOIN location l ON p.id_location=l.id_location where p.id_person = ${personId}`;
    let sql3 = `SELECT * FROM contact c JOIN contact_type ct ON ct.id_contact_type=c.id_contact_type where id_person = ${personId}`;
    let sql2 = `SELECT * FROM person p JOIN relation r ON r.id_person2=p.id_person JOIN relation_type rt ON rt.id_relation_type=r.id_relation_type WHERE id_person1= ${personId}`;
    let query = connection.query(sql,(err, result1) => {
        if(err) throw err;
        let query2 = connection.query(sql2,(err, result2)=>{
            if(err) throw err;
           let query3 = connection.query(sql3,(err,result3)=>{
               if (err) throw err;
               res.render('person_detail', {
                   persons : result1[0],
                   relations: result2,
                   contacts : result3

               });
           });
        });
});
});

app.get('/meetingdetail/:id_meeting',(req, res) => {
    const meetingId = req.params.id_meeting;
    let sql = `SELECT * FROM meeting m JOIN location l ON m.id_location=l.id_location WHERE m.id_meeting= ${meetingId}`;
    let sql2 = `SELECT * FROM person_meeting pm JOIN person p ON p.id_person=pm.id_person WHERE id_meeting= ${meetingId}`;
    let query = connection.query(sql,(err, rows) => {
        if(err) throw err;
        let query = connection.query(sql2,(err, rows2) => {
        res.render('meeting_detail', {
            sql : rows[0],
            sql2 : rows2
        });
        });
    });
});
