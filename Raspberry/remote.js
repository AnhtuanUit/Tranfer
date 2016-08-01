
exec = require('child_process');

//socket client.js
var io = require('socket.io-client');
var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzllOWJhMzcxNzgxMWUwMjA3NTI1OGIiLCJ1c2VybmFtZSI6InR1YW4iLCJhdmF0YXIiOiJmZW1hbGUucG5nIiwiaWF0IjoxNDcwMDEzMDU0fQ.wb5Vv6pJc9HVF_YKkZLYHi0zT3EebAMIQz0apobDQq0';
var socket = io.connect('http://192.168.1.4:3000?token=' + token, {reconnect: true});


//define the routes from the external file
function sendMessage(socket, activityType, antenChanel, nodeChanel){
	exec.execFile('./remote.exe',
		[activityType, antenChanel, nodeChanel],
		function (error, stdout, stderr) {
			console.log('stdout: ' + stdout);
			if( stdout.indexOf("Got this response") > -1 ){
				activityType = activityType == 1 ? 0 : 1;

				var state = stdout.split('Got this response ')[1].split('.')[0];
				socket.emit('2', state);
			}
			if (error !== null) {
				console.log('exec error: ' + error);
				socket.emit('2', 'error');
			}
		});
}

var activityTyp;

var antenChanel;

var pumpChanel;
var vanArray;

var i, howManyTimes, time;

socket.on('chat', function (data) {
	pumpChanel = data.pump[0].chanel;
	antenChanel = data.anten[0].chanel;
	activityType = data.activityType;
	vanArray = data.van;
	howManyTimes = vanArray.length;
	i = 0;
	console.log(data);
	f(); 
});


function f() {
	sendMessage(socket, activityType, antenChanel, vanArray[i].chanel);
	time = vanArray[i].estimatedTime;
	i++;
	if( i < howManyTimes ){
		setTimeout( f, time * 1000 );
	}
}


//just some output to know everything is working
console.log("Run client!!!");
