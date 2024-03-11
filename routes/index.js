var express = require('express');
var router = express.Router();
const schema_estudiantes=require('../schemas/schema_estudiantes');
const schema_tweets=require('../schemas/schema_tweets');
const estudiantes = mongoose.model('Estudiantes', schema_estudiantes,'Estudiantes');
const tweets = mongoose.model('Tweets', schema_tweets,'Tweets');
const axios = require('axios');
//Funcion de espera 
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* GET home page. */
router.get('/', 
//Acciones programadas
async function gestionarTweets() {  
  //Fecha de hoy
  const hoy = new Date();
  //Usuarios que no tienen tweets pero han sido registrados
  const estudiantes_registrados=await estudiantes.find({}).select({usuario:1,_id:0});
  console.log(estudiantes_registrados);
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
  }
  res.render('index', { title: 'Express' });
});

module.exports = router;
