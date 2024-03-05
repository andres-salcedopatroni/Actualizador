var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var cron = require('node-cron');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//Conexion Atlas
const mongoose = require('mongoose');
const axios = require('axios');
//Mongo
mongoose.connect('mongodb+srv://USER:1234@cluster0.4wtcxn6.mongodb.net/Tesis?retryWrites=true&w=majority');
const schema_estudiantes=require('./schemas/schema_estudiantes');
const schema_tweets=require('./schemas/schema_tweets');
const estudiantes = mongoose.model('Estudiantes', schema_estudiantes,'Estudiantes');
const tweets = mongoose.model('Tweets', schema_tweets,'Tweets');
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
cron.schedule('0 0 * * *', async function(){
  const date = new Date();
  const lista_estudiante=await estudiantes.find({});
  var grupos=[];
  var usuarios=[];
  var numero=0;
  for (const e of lista_estudiante){
    usuarios.push({"id":e.usuario,"fecha":date});
    numero=numero+1;
    if(numero==15 || lista_estudiante.indexOf(e)+1==lista_estudiante.length){
      grupos.push(usuarios);
      usuarios=[];
      numero=0;
    }
  }
  for (const g of grupos){
    axios.post("https://andressalcedo2023.pythonanywhere.com//actualizar_tweets",g)
    .then(datos => {
      const tweets_usuarios=datos.data;
      try{
        for (const tweets_usuario of tweets_usuarios){
          for (const tweet of tweets_usuario.usuario){
            const t=new tweets({
              estado: tweet.estado,
              mensaje: tweet.texto, 
              fecha: tweet.fecha,
              usuario: tweets_usuario.usuario
            });
            t.save();
          }
        }
      }catch(error){
        console.log(error);
      }
    })
    .catch(err => {
      console.log(err);
    });
    await sleep(60000*20);
  }
  }
);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
