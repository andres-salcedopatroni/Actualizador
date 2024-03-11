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
  if(estudiante_registrado){
    estudiante_registrado.fecha=hoy;
    await estudiante_registrado.save();
    axios.post("https://andressalcedo2023.pythonanywhere.com/tweets",{"usuario": estudiante_registrado.usuario})
      .then(
        async function (datos) {
          const tweets_usuario=datos.data;
          console.log(tweets_usuario)
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
  //Actualizar tweets de usuario
 /* const estudiantes_por_actualizar=await estudiantes.find({});
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

  
});

module.exports = router;
