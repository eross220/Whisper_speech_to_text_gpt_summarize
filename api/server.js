var express = require('express');
var jwt = require('jsonwebtoken');
var path = require('path')
var app = express();
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/loginapi',{  useMongoClient: true});
const  fetch =require('node-fetch') ;
const axios = require('axios')
const fs=require('fs');
const sdk =require("microsoft-cognitiveservices-speech-sdk") ;
const WaveFile = require('wavefile').WaveFile;
const dotenv = require('dotenv').config();
const ChatGPTClient =require('./src/ChatGPTClient.js') ;
const settings = require('./settings');
const Mp32Wav = require('mp3-to-wav');
const chatGptClient = new ChatGPTClient(settings.openaiApiKey, settings.chatGptClient, settings.cacheOptions);
mongoose.Promise = global.Promise;
const FormData = require('form-data');
const { Blob } = require("buffer")
var Login = require('./app/models/Login');
var Notes = require('./app/models/Note');
var config = require('./config');
var bodyParser = require('body-parser');
var empty  = require('is-empty');

app.use(bodyParser.urlencoded({ extended : true}));
app.use(bodyParser.json());

app.set('superSecret',config.secret);

var port = process.env.PORT || 3003;

var router = express.Router();

app.use(express.static(path.join(__dirname, 'dist')))
app.use(function(req, res,next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.route('/register/')
	.post(function(req, res) {
		console.log(req.body)
		var login = new Login();
		Login.findOne({"username": req.body.username}, function(err, user_data){
			if(err){
				console.log(err)
			}
			if(user_data){
				return res.json({
					status : 400,
					message : "User already exist"
				});
			}
			
			login.username = req.body.username;
			login.password = req.body.password;
			login.confirm_password = req.body.confirm_password;
			login.email	   = req.body.email;
			
			login.save(function(err, login_data){
				if(err)
					return res.status(400).send(err);
				res.json({
					status: 200,
					message : 'You have succesfully registered.'
				});
			});
		});
	});

router.route('/login')
	.post(function(req, res){
		console.log(req.body);
		return res.status(200).json({msg: 'note added'})
		// Login.findOne({"username": req.body.username, "password": req.body.password}, function(err, user_data){
		// 	if(err || !user_data){
		// 		return res.status(401).json({
		// 			status : 401,
		// 			message : "Invalid username and password.",
		// 		});
		// 	} else {
		// 		const payload = {
      	// 			username: user_data.username
    	// 		};
    	// 		var token = jwt.sign(payload, app.get('superSecret'), {
        //   			expiresIn : 60*60*24 // expires in 24 hours
    	// 		});
		// 		res.status(200).json({
		// 			message : "You have succesfully loggedin.",
		// 			token	: token
		// 		});
		// 	}
		// });
	});
router.route('/note/add')
	.post(function(req, res) {
        var note = new Notes(req.body)
        note.save(function (err) {
        	if (err) {
        		return res.status(500).end()
        	} else {
        		return res.status(200).json({msg: 'note added'})	
        	}	
        })

 	});

 router.route('/note/update/:id')
 	.put(function(req, res){
		Notes.update({_id: req.params.id}, {$set: {title : req.body.title, description : req.body.description}}).exec((err, note) => {
		if (err) {
			console.log(err)
			return res.status(501).json({
				message: err
			})
		} else {
			return res.status(200).json({msg: 'note updated'})
		}
		})
 	})	

 router.route('/note/delete/:id')
 	.delete(function(req, res){
		Notes.remove({_id: req.params.id}).exec((err, note) => {
		if (err) {
			console.log(err)
			return res.status(501).json({
				message: err
			})
		} else {
			return res.status(200).json({msg: 'note removed'})
		}
		})
 	})
 router.route('/note/list')
 	.get(function(req, res){
  Notes.find({}).exec(function (err, note) {
    if (err) {
      return res.status(401).json({
        message: err
      })
    } else {
      return res.json(note)
    }
  })
})		
router.use(function(req,res,next){
	next();
});

router.route('/result')
	.get(function(req, res) {
        Login.find(function(err, logins) {
            if (err)
                res.send(err);

            res.json(logins);
        });
 	});
router.route('/webhook')
	.post(async function(req,res){
		console.log(req.body.RecordingURL);
		const timestamp = Date.now();
		const campaign_name=req.body.campaign_name;
		const number_name= Math.floor(timestamp/1000);
		const filename_mp3=process.cwd()+'/calldata/mp3/'+number_name+'.mp3';
		const filename_wav=process.cwd()+'/calldata/wav/'+number_name+'.wav';
		const sample_wav_name=process.cwd()+'/calldata/sample/'+number_name+'.wav';

		
		const reccordingurl=req.body.RecordingURL;
		try {
		  
		 
		  const response = await fetch(reccordingurl);
			
		  const audioBuffer= await response.buffer();
		  fs.writeFileSync(filename_mp3, audioBuffer);
	  
		  console.log('Audio file saved to disk');
		  
		 
		} catch (error) {
		  console.error('Error downloading audio file:', error);
		 
		}
		const audioBuffer= fs.createReadStream(filename_mp3);
		// const buffer = Buffer.alloc(filename_mp3);
		const formData = new FormData();
		formData.append('model', 'whisper-1');
		
		// console.log('isfile', audioBuffer)
		formData.append("file",audioBuffer);
		
		// console.log(audioBuffer);

		console.log("started fetching")
		try{
			const response = await axios.post('https://api.openai.com/v1/audio/transcriptions',
			formData, {
              headers: {
                // 'Content-Type': 'audio/mpeg',
				...formData.getHeaders(),
                'Authorization': `Bearer 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`,
				}
        	});
			return res.status(200).send({"response":response.data})
			// console.log("resp", response.response)
		}catch(err){
			console.log("erro", err)
			return res.status(400).send({err})
		}


});

router.route('/summarize')
	.post(async function(req,res){

		//let myMessage="please summarize this call in two sentences";
		let myMessage=req.body.prompt+"summarize the call (keep format){law firm or agency that answered call: name of caller: caller age: caller phone number:caller email address:date of accident: type of accident:were they injured: who was at fault: caller insured: attorneys office:}";
		//myMessage+=req.body.prompt;

		try {
                
			result = await chatGptClient.sendMessage(myMessage, { });
			console.log("result",result);
			return res.status(200).send({"answer":result})
		} catch (e) {
			error = e;
		}


});
app.use('/api',router);
app.get('/*', function(req, res){
  res.sendFile('/dist/index.html' ,{root:__dirname});
});
app.listen(3003);
