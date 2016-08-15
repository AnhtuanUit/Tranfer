
exec = require('child_process');

//socket client.js
var io = require('socket.io-client');
var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzllOWJhMzcxNzgxMWUwMjA3NTI1OGIiLCJ1c2VybmFtZSI6InR1YW4iLCJhdmF0YXIiOiJmZW1hbGUucG5nIiwiaWF0IjoxNDcwMDEzMDU0fQ.wb5Vv6pJc9HVF_YKkZLYHi0zT3EebAMIQz0apobDQq0';
var socket = io.connect('http://192.168.1.19:3000?token=' + token, {reconnect: true});

var startAck = 0;

var message = "800101-06040005-0366026605660666";
/*String header = "80" + nodeIp + ack;
String detailData = "-0" + nVan + type + time;
String data = "-" + crtOne + crtTwo + crtThree + crtFour;*/

var i, howManyTimes, time;
var newControl = 0;
socket.on('chat', function (data) {
	console.log("Da nhan");
	f();
});


function f() {
	sendMessage(socket, message);
	time = 5;
	i++;
	if( i < howManyTimes){
		setTimeout( f, time * 1000 );
	}
}


//just some output to know everything is working
console.log("Run client!!!");


//define the routes from the external file
function sendMessage(socket, data){
	var nodeIp =  parseInt(data.substring(2, 4));
	exec.execFile('./remote', [data]
		,function (error, stdout) {
			console.log('stdout: ' + stdout);
			if( stdout.indexOf("Got this response") > -1 ){
				var state = stdout.split('Got this response ')[1].split('.')[0];
				socket.emit('updateNode', state);
				checkSum(data);
			}
			if (error !== null) {
				console.log('error: ' + nodeIp);
				socket.emit('updateNode', nodeIp);
			}
		});
}



function checkSum(data) {
	var startIp = parseInt(data.substring(0, 2));
	var endIp = parseInt(data.substring(2, 4));
	var ack = parseInt(data.substring(4, 6));

	if(startIp == 81 && endIp == 80){
		if(ack == 0){
			console.log("Feedback from anten");
		}
		if(ack > 0 && ack < 10){
			console.log("Hands shake 1 from anten");
		}
		if(ack > 50 && ack < 60){
			console.log("Hands shake 51 from anten")
		}
	} 

	if((startIp > 0 && startIp < 80) && endIp == 80){
		console.log("Data from van" + startIp);
	} 
}