
exec = require('child_process');
async = require('async');
//socket client.js
var io = require('socket.io-client');
var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzllOWJhMzcxNzgxMWUwMjA3NTI1OGIiLCJ1c2VybmFtZSI6InR1YW4iLCJhdmF0YXIiOiJmZW1hbGUucG5nIiwiaWF0IjoxNDcwMDEzMDU0fQ.wb5Vv6pJc9HVF_YKkZLYHi0zT3EebAMIQz0apobDQq0';
var socket = io.connect('http://192.168.1.4:3000?token=' + token, {reconnect: true});

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
			crtData: "05000600",
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
socket.on('chat', function (data) {
	//var data = testDataSocket;
	console.log(data);
	activityType = data.activityType;
	controlArray = data.control;
	howManyTimes = controlArray.length;
	i = 0;
	console.log("-------------Start-------------");
	f();
});


function f() {
	var obj = controlArray[i].node;
	async.series([
		function(callback){ 
			if(obj.length > 0){
				sendNode(obj, 0);
			}
			return callback(null);
		},
		function(callback){
			if(obj.length > 1){
				sendNode(obj, 1);
			}
			return callback(null);
		}
		]);
	
	time = controlArray[i].estimatedTime;

	var timePump = controlArray[i].estimatedTime.toString();
	var headTime="";
	
	while((time.length + headTime.length) < 4){
		headTime +="0";
	}
	timePump = headTime + timePump;
	var msgPump = "809001-0101" + timePump +"-0000000000000000";
	sendMessage(socket, msgPump);
	i++;
	if( i < howManyTimes){
		setTimeout( f, time * 1000 );
	}
}

function sendNode(obj, prop) {
	var header = "80" + obj[prop].nodeIp + "00";
	var time = controlArray[i].estimatedTime.toString();
	var headTime="";
	while((time.length + headTime.length) < 4){
		headTime +="0";
	}
	time = headTime + time;
	var detailData = "-" + obj[prop].nVan + "04" + time;
	var data = "-" + obj[prop].crtData;
	while((16 - data.length) >= 0){
		data += "0";
	}
	message = header + detailData + data;
	console.log(message);
	sendMessage(socket, message);
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
				checkSum(socket, state, nodeIpChar, crtData);
				console.log("-------------////--------------");
			} else if (error !== null) {
				if(ack == 0){
					console.log('error Anten');
					socket.emit('updateNode', "81");
				} else {
					console.log('error nodeIp: '+ nodeIpChar);
					socket.emit('updateNode', nodeIpChar);
				}				
			} 
		});
}



function checkSum(socket, state, nodeIpChar, crtData) {
	var startIp = parseInt(state.substring(0, 2));
	var endIp = parseInt(state.substring(2, 4));
	var ack = parseInt(state.substring(4, 6));
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
			console.log("Data from van" + startIp);
			var dataVan = "0" + startIp + state.substring(7);
			socket.emit('updateNode', dataVan);
	}

	if((startIp >= 90 && startIp < 100) && endIp == 80){
			console.log("Data from pump" + startIp);
			var dataVan =+ startIp;
			socket.emit('updateNode', dataVan);
	}
}