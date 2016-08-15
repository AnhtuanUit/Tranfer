
exec = require('child_process');

//socket client.js
var io = require('socket.io-client');
var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzllOWJhMzcxNzgxMWUwMjA3NTI1OGIiLCJ1c2VybmFtZSI6InR1YW4iLCJhdmF0YXIiOiJmZW1hbGUucG5nIiwiaWF0IjoxNDcwMDEzMDU0fQ.wb5Vv6pJc9HVF_YKkZLYHi0zT3EebAMIQz0apobDQq0';
var socket = io.connect('http://192.168.1.19:3000?token=' + token, {reconnect: true});

var ackTuoi = -2, ackDoAm = -2;

var message ;//= "800100-06040005-0366026605660666";


var testDataSocket =
{ control:
	[ 
	{ 
		estimatedTime: 10, 
		node: [
		{
			nodeIp: "01",
			crtData: "01000200",
			nVan: "06"
		}
		] 
	},
	{ 
		estimatedTime: 10, 
		node: [
		{
			nodeIp: "01",
			crtData: "03000400",
			nVan: "06"
		}
		] 
	},
	{ 
		estimatedTime: 10, 
		node: [
		{
			nodeIp: "01",
			crtData: "0500",
			nVan: "06"
		},
		{
			nodeIp: "01",
			crtData: "0600",
			nVan: "06"
		}
		] 
	}
	],
	activityType: "01"
};


var activityType;
var controlArray;

var i, howManyTimes, time;
socket.on('chat', function (zzz) {
	var data = testDataSocket;
	activityType = data.activityType;
	controlArray = data.control;
	howManyTimes = controlArray.length;
	i = 0;
	console.log("-------------Start-------------");
	f();
});


function f() {
	var header = "80";
	var detailData = "-";
	

	var obj = controlArray[i].node;

	for (var prop in obj) {
		//console.log("obj." + prop + " = " + obj[prop]);
		header+= obj[prop].nodeIp + "00";
		detailData+= obj[prop].nVan + activityType + "00" + controlArray[i].estimatedTime.toString();
		var data = "-" + obj[prop].crtData;
		while((16 - data.length) >= 0){
			data += "0";
		}
		console.log(data);
		message = header + detailData + data;
		sendMessage(socket, message);
	}

	
	time = controlArray[i].estimatedTime;
	i++;
	if( i < howManyTimes){
		setTimeout( f, time * 1000 );
	}
}


//just some output to know everything is working
console.log("Run client!!!");


//define the routes from the external file
function sendMessage(socket, data){
	var nodeIpChar =  data.substring(2, 4);
	var nodeIp = parseInt(nodeIpChar);
	var ack = parseInt(data.substring(4, 6));
	var crtData = data.substring(7);
	exec.execFile('./remote', [data]
		,function (error, stdout) {
			console.log('stdout: ' + stdout);
			if( stdout.indexOf("Got this response") > -1 ){
				var state = stdout.split('Got this response ')[1].split('.')[0];
				socket.emit('updateNode', state);
				checkSum(socket, state, nodeIpChar, crtData);
				console.log("-------------////--------------");
			} else if (error !== null) {
				if(ack == 0){
					console.log('error Anten');
					socket.emit('updateNode', 81);
				} else {
					console.log('error nodeIp: '+ nodeIp);
					socket.emit('updateNode', nodeIp);
				}
				
			} 
		});
}



function checkSum(socket, state, nodeIpChar, crtData) {
	var startIp = parseInt(state.substring(0, 2));
	var endIp = parseInt(state.substring(2, 4));
	var ack = parseInt(state.substring(4, 6));
	var ackChar;
	var header = "80";
	if(startIp == 81 && endIp == 80){
		if(ack == 0){
			console.log("Feedback from anten: who you are?");
		}
		if(ack > 0 && ack < 10){
			console.log("Hands shake 1 from anten");
			ackTuoi = ack + 1;
			ackChar = ackTuoi > 9 ? ackTuoi.toString() : "0" + ackTuoi.toString();
			header += nodeIpChar + ackChar;
			sendMessage(socket, header + "-" + crtData);
		}
		if(ack > 50 && ack < 60){
			console.log("Hands shake 51 from anten");
			ackDoAm = ack + 1;
			ackChar = ackTuoi > 9 ? ackTuoi.toString() : "0" + ackTuoi.toString();
			header += nodeIpChar + ackChar;
			sendMessage(socket, header +  "-" + crtData);
		}
	} 

	if((startIp > 0 && startIp < 80) && endIp == 80){
		
		if(ack == ackTuoi + 1){
			console.log("Data from van" + startIp);
			var ackChar = ack > 9 ? ack.toString() : "0" + ack.toString();
			socket.emit('updateNode', "0" + startIp + ackChar);
		} else {
			console.log("Van: who you are?");
		}
	} 
}