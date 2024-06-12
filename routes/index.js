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
/*  
  //Obtener tweets
  if(estudiante_registrado){
    estudiante_registrado.fecha=hoy;
    const fecha_pasada = new Date(hoy.getTime());
    fecha_pasada.setMonth(fecha_pasada.getMonth() - 3);
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
            console.log(estudiante_registrado.usuario)
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
    if(estudiantes_por_actualizar.length>0) {
      const e = estudiantes_por_actualizar[0]
      if(hoy.getDate()!= e.fecha.getDate() && e.fecha < hoy){
        const fecha_pasada=e.fecha;
        e.fecha=hoy;
        await e.save();
        axios.post("https://andressalcedo2023.pythonanywhere.com/tweets", {"usuario": e.usuario, "fecha_actual":hoy, "fecha_pasada":fecha_pasada})
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
              console.log(e.usuario)
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
        console.log("Tweets actualizados a la fecha")
        res.render('index', { title: 'Express' });
      } 
    }
    else{
      console.log("No hay estudiantes")
      res.render('index', { title: 'Express' });
    }   
  }*/
});

module.exports = router;
