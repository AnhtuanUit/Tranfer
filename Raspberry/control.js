
exec = require('child_process');

//socket client.js
var io = require('socket.io-client');
var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzllOWJhMzcxNzgxMWUwMjA3NTI1OGIiLCJ1c2VybmFtZSI6InR1YW4iLCJhdmF0YXIiOiJmZW1hbGUucG5nIiwiaWF0IjoxNDcwMDEzMDU0fQ.wb5Vv6pJc9HVF_YKkZLYHi0zT3EebAMIQz0apobDQq0';
var socket = io.connect('http://192.168.1.4:3000?token=' + token, {reconnect: true});


//define the routes from the external file
function sendMessage(socket, type, nodeChanel){
	var message = type*100 + 1*10 + nodeChanel;
	exec.execFile('./remote',
		[message],
		function (error, stdout, stderr) {
			console.log('stdout: ' + stdout);
			if( stdout.indexOf("Got this response") > -1 ){
				type = type == 1 ? 0 : 1;

				var state = stdout.split('Got this response ')[1].split('.')[0];
				socket.emit('updateNode', state);
           			if(i!=0){
					var message_2 = activityType*100 + 10 + vanSub;
					socket.emit('updateNode', message_2);
				}
				if(i==howManyTimes){
					sendMessage(socket, activityType, 0)
				}
			}
			if (error !== null) {
				console.log('exec error: ' + error);
				socket.emit('updateNode', 'error');
			}
		});
}

var activityType;

var pumpChanel;
var vanArray;
var vanSub;

var i, howManyTimes, time;
var newControl = 0;
socket.on('chat', function (data) {
	pumpChanel = data.pump[0].chanel;
	activityType = data.activityType;
	vanArray = data.van;
	howManyTimes = vanArray.length;
	newControl == 1;
	i = 0;
	console.log(data);
	f(); 
});


function f() {
	newControl = 0;
	sendMessage(socket, activityType, vanArray[i].chanel);
	time = vanArray[i].estimatedTime;
	if(i!=0){
		vanSub = vanArray[i-1].chanel;
	}
	i++;
	
	if( i < howManyTimes && newControl == 0){
		setTimeout( f, time * 1000 );
	}
}


//just some output to know everything is working
console.log("Run client!!!");
