
exec = require('child_process');

//socket client.js
var io = require('socket.io-client');
var socket = io.connect('http://192.168.1.4:3000', {reconnect: true});

sendMessage(81);

socket.on('device', function (data) {
	console.log(data);
	console.log("-------------Start-------------");
});


//define the routes from the external file
function sendMessage(socket, data){
	exec.execFile('./remote', [data]
		,function (error, stdout) {
			console.log('stdout: ' + stdout);
			if( stdout.indexOf("Got this response") > -1 ){
				var state = stdout.split('Got this response ')[1].split('.')[0];
				//socket.emit('device', 1);
				console.log("success");
				console.log("-------------////--------------");
			} else if (error !== null) {
				console.log("fail");
				//socket.emit('device', 0);
			} 
		});
}


//just some output to know everything is working
console.log("Run client!!!");\