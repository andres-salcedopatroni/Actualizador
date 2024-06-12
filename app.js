var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

//Manejo de tweets
const cron = require('node-cron');
const axios = require('axios');

//Mongo
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://User2:1234@cluster0.4wtcxn6.mongodb.net/Tesis?retryWrites=true&w=majority');
const schema_estudiantes=require('./schemas/schema_estudiantes');
const schema_tweets=require('./schemas/schema_tweets');
const estudiantes = mongoose.model('Estudiantes', schema_estudiantes,'Estudiantes');
const tweets = mongoose.model('Tweets', schema_tweets,'Tweets');

//Funcion de espera 
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


cron.schedule('0 55 * * * *', async function gestionarTweets() {
  try{
    //Fecha de hoy
    const hoy = new Date();
    //Usuarios que no tienen tweets pero han sido registrados
    const estudiante_registrado=await estudiantes.findOne({"fecha":{ $eq:null}});
    //Obtener tweets
    if(estudiante_registrado){
      estudiante_registrado.fecha=hoy;
      const fecha_pasada = new Date(hoy.getTime());
      fecha_pasada.setMonth(fecha_pasada.getMonth() - 1);
      await estudiante_registrado.save();
      axios.post("https://andressalcedo2023.pythonanywhere.com/tweets",{"usuario": estudiante_registrado.usuario, "fecha_actual":hoy, "fecha_pasada":fecha_pasada})
      .then(
        async function (datos) {
          const tweets_usuario=datos.data;
          try{
            for (const tweet_usuario of tweets_usuario){
              var existe_tweet_usuario= await tweets.findOne({mensaje: tweet_usuario.texto, fecha: tweet_usuario.fecha, usuario: estudiante_registrado.usuario});
              if(!existe_tweet_usuario){
                const tweet=new tweets({
                  estado: tweet_usuario.estado,
                  mensaje: tweet_usuario.texto,
                  fecha: tweet_usuario.fecha,
                  usuario: estudiante_registrado.usuario
                });
                await tweet.save();
              }
            }
            console.log("Tweets Registrados")
          }
          catch(error){          
            console.log(error);
          }
        })
      .catch( async function (error) {
          console.log(error);
      });
    }
    else{
      //Actualizar tweets de usuario
      const estudiantes_por_actualizar=await estudiantes.find({}).sort({fecha:"asc"});
      if(estudiantes_por_actualizar.length>0) {
        const e = estudiantes_por_actualizar[0]
        if(hoy.getDate()!= e.fecha.getDate() && e.fecha < hoy){
          const fecha_pasada=e.fecha;
          e.fecha=hoy;
          await e.save();
          const todos_tweets= await tweets.find({});
          axios.post("https://andressalcedo2023.pythonanywhere.com/clasificar", {"usuario": e.usuario, "fecha_actual":hoy, "fecha_pasada":fecha_pasada,"tweets":todos_tweets})
          .then(
            async function (datos) {
              const tweets_usuario=datos.data;
              try{
                for (const tweet_usuario of tweets_usuario){
                  var existe_tweet_usuario= await tweets.findOne({mensaje: tweet_usuario.texto, fecha: tweet_usuario.fecha, usuario: e.usuario});
                  if(!existe_tweet_usuario){
                    const tweet=new tweets({
                      estado: tweet_usuario.estado,
                      mensaje: tweet_usuario.texto, 
                      fecha: tweet_usuario.fecha,
                      usuario: e.usuario
                    });
                    await tweet.save();
                  }
                }
                console.log("Tweets Actualizados")
              }
              catch(error){
                console.log(error);
              }
            })
          .catch(
            async function (error) {
              console.log(error)
            });
        }
        else {
          console.log("Tweets actualizados a la fecha")
        } 
      }
      else{
        console.log("No hay estudiantes")
      }   
    }
  }
  catch(error){
    console.log(error)
  }
    /*
    var estudiantes_sin_tweets=[];
    for (let e of estudiantes_registrados){
      var existe_tweet_usuario= await tweets.findOne({usuario: e.usuario});
      if(!existe_tweet_usuario)
      estudiantes_sin_tweets.push(e.usuario);
    }
    //Registrar tweets de usuario
    for (let e of estudiantes_sin_tweets) {
      axios.post("https://andressalcedo2023.pythonanywhere.com/tweets",{"usuario": e})
      .then(
        async function (datos) {
          const tweets_usuario=datos.data;
          try{
            for (const tweet_usuario of tweets_usuario){
              var existe_tweet_usuario= await tweets.findOne({mensaje: tweet_usuario.texto, fecha: tweet_usuario.fecha, usuario: e});
              if(!existe_tweet_usuario){
                const tweet=new tweets({
                  estado: tweet_usuario.estado,
                  mensaje: tweet_usuario.texto,
                  fecha: tweet_usuario.fecha,
                  usuario: e
                });
                await tweet.save();
              }
            }
          }
          catch(error){          
            console.log(error)
          }
        })
      .catch( 
        async function (error) {
          await sleep(60000*15)
          console.log(error)
        });
      await sleep(60000*3);
    }
    //Actualizar tweets de usuario
    const estudiantes_por_actualizar=await estudiantes.find({});
    for (let e of estudiantes_por_actualizar){
      axios.post("https://andressalcedo2023.pythonanywhere.com/actualizar_tweets", {"usuario": e.usuario, "fecha":hoy})
      .then(
        async function (datos) {
          const tweets_usuario=datos.data;
          try{
            for (const tweet_usuario of tweets_usuario){
              var existe_tweet_usuario= await tweets.findOne({mensaje: tweet_usuario.texto, fecha: tweet_usuario.fecha, usuario: e});
              if(!existe_tweet_usuario){
                const tweet=new tweets({
                  estado: tweet_usuario.estado,
                  mensaje: tweet_usuario.texto, 
                  fecha: tweet_usuario.fecha,
                  usuario: e
                });
                await tweet.save();
              }
            }
          }
          catch(error){
            console.log(error);
          }
        })
      .catch(
        async function (error) {
          await sleep(60000*15)
          console.log(error)
        });
      await sleep(60000*3);
    }*/
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
