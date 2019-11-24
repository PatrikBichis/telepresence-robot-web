const request = require('request');
const express = require('express')
const app = express()
const MegaPi = require("./src/megapi").MegaPi;
const port = 3000

var bot = undefined;
var servo1 = 90;
var servo2 = 90;

/* Route for static files */
app.use(express.static('public'));

/* Proxy route for web camera */
app.get('/stream1',function(req,res){
    var url="http://192.168.1.126/mjpeg.cgi"
    var pipe=request(url).pipe(res);
    pipe.on('error', function(){
        console.log('error handling is needed because pipe will break once pipe.end() is called')
    });
    //client quit normally
    req.on('end', function(){
        pipe.end();
    });
    //client quit unexpectedly
    req.on('close', function(){
        pipe.end();
    });
});

var http = require("http").Server(app);
var io = require('socket.io')(http);

// whenever a user connects on port 8080 via
// a websocket, log that a user has connected
io.on("connection", (socket) => {
    console.log("a user connected");
    // whenever we receive a 'message' we log it out
    socket.on("message", function(message) {
      //console.log(message);
    });

    socket.on("direction", (dir, value) => {
        console.log(dir + ":" + value);
        if(bot){
            if(dir == "center"){
                servo1 = 90;
                servo2 = 90;
            }else if(dir == "forward"){
                servo1 -= value;
            }else if(dir == "backward"){
                servo1 += value;
            }else if(dir == "left"){
                servo2 += value;
            }else if(dir == "right"){
                servo2 -= value;
            }
            updateServos();
        }
    });
  });

const server = http.listen(port, () => {
    console.log(`App listening to ${port}....`)
    console.log('Press Ctrl+C to quit.')

    bot = new MegaPi("/dev/ttyUSB0", ()=>{console.log("Connected to bot")});
    servo1 = 90;
    servo2 = 90;
    updateServos();
});


function updateServos(){
    bot.servoRun(6,1,servo1);
    bot.servoRun(6,2,servo2);
}