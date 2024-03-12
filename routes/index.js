var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const schema_estudiantes=require('../schemas/schema_estudiantes');
const schema_tweets=require('../schemas/schema_tweets');
const estudiantes = mongoose.model('Estudiantes', schema_estudiantes,'Estudiantes');
const tweets = mongoose.model('Tweets', schema_tweets,'Tweets');
const axios = require('axios');

/* GET home page. */
router.get('/', async function (req,res,next) {
  //Fecha de hoy
  const hoy = new Date();
  //Usuarios que no tienen tweets pero han sido registrados
  const estudiante_registrado=await estudiantes.findOne({"fecha":{ $eq:null}});
  //Obtener tweets
  if(estudiante_registrado){
    estudiante_registrado.fecha=hoy;
    await estudiante_registrado.save();
    axios.post("https://andressalcedo2023.pythonanywhere.com/tweets",{"usuario": estudiante_registrado.usuario})
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
            res.render('index', { title: 'Express' });
          }
          catch(error){          
            console.log(error);
            res.render('index', { title: 'Express' });
          }
        })
      .catch( 
        async function (error) {
          console.log(error);
          res.render('index', { title: 'Express' });
        });
  }
  else{
    //Actualizar tweets de usuario
    const estudiantes_por_actualizar=await estudiantes.find({}).sort({fecha:"asc"});
    console.log(hoy)
    for (const e of estudiantes_por_actualizar){
      if(hoy.getDate()!= e.fecha.getDate() && e.fecha < hoy){
        //e.fecha=hoy;
        //await e.save();
        axios.post("https://andressalcedo2023.pythonanywhere.com/actualizar_tweets", {"usuario": e.usuario, "fecha":hoy})
        .then(
          async function (datos) {
            console.log("Hola mundo")
            const tweets_usuario=datos.data;
            console.log(tweets_usuario)
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
              res.render('index', { title: 'Express' });
            }
            catch(error){
              console.log(error);
              res.render('index', { title: 'Express' });
            }
          })
        .catch(
          async function (error) {
            console.log(error)
            res.render('index', { title: 'Express' });
          });
      }
      else {
        res.render('index', { title: 'Express' });
        break;
      } 
    }
  }
});

module.exports = router;
