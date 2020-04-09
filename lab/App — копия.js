var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var database_;


var jsonPath = path.join(__dirname, '.', 'public', 'assets', 'json');
var charset = 'utf8';

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/public'));

app.get('/templates', function(req, res){

    var jsonString = fs.readdirSync(jsonPath, charset);
    return res.json({'files': jsonString});

});

app.get('/database', function(req, res){
    database_.collection('info').find().toArray(function(err, docs){
        if(err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(docs);
    });
});

app.get('/raw/:name', function(req, res){

    var file = jsonPath+'/'+req.params.name;

    if (fs.existsSync(file)) {
        fs.readFile(file, charset, function(err, data){
            var sendData = JSON.parse(data);
            return res.json({status:'200', message: 'OK', data: sendData});
        });
    }else{
        return res.json({status:'404', message:'ERROR', data:null});
    }

});


app.get('/', function(req, res) {
    res.render('index.html');
});

app.post('/database', function(req, res) {

    var json_templ = (JSON.parse(`${req.body.currentTemplate}`)).data;
    var keys = Object.keys(json_templ);

    json_templ[keys[1]] = `${req.body[keys[1]]}`;

    for (var i = 0; i < json_templ[keys[2]].length; i++) {

        var current_obj = json_templ[keys[2]][i];
        var current_keys = Object.keys(current_obj);

        for (var j = 1; j < current_keys.length; j++) {
            current_obj[current_keys[j]] = `${req.body[current_keys[j]]}`;
        }
    }
    
    var request_data = {
        data:json_templ
    };

    database_.collection('info').insertOne(request_data, function(err, result){
        if(err){
            console.log(err);
            return res.sendStatus(500);
        }
        res.send('OK. POST запрос успешно обработан! Сделайте GET, чтоб увидеть все записи!');
    });

});

MongoClient.connect('mongodb+srv://andrey:098slTBv0VI0GEjU@test-cmnmp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true}, function(err, database){

    if(err){
         return console.log(err);
    }

    database_ = database.db('database');
    if(database_.collection('info'))
        database_.collection('info').drop();

    app.listen(port, function() {
        console.log(`Работаем: http://localhost:${port}`);
    });

});