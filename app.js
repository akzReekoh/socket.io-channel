'use strict';

/*
 * Initialize the endpoint.
 */
var endpoint = require('./endpoint')();

endpoint.on('ready', function (options) {

    var ws = require('socket.io')(options.port);

	ws.on('connection', function(socket) {

		socket.on('ready', function () {
                        
			process.send({type: 'listening'});
			console.log('listening')
		});
              
		socket.on('message', function (m) {
			if (m.type === 'message' && m.data.message) {
				process.send({
					type: 'message',
					data: m.data
				});
			}
		});

		socket.on('data', function (m) {
			if (m.type === 'data' && m.data) {
				process.send({
					type: 'data',
					data: m.data
				});
			}
		});
              
	});

	endpoint.on('message', function (message) {
		console.log(message);
	});



	//endpoint.on('message', function (message) {
	//	if (message.server === serverAddress && _.contains(_.keys(server.getClients()), message.client)) {
	//		server.send(message.client, message.message, false, function (error) {
	//			if (error) {
	//				console.log('Message Sending Error', error);
	//				endpoint.sendError(error);
	//			}
	//			else
	//				endpoint.sendLog('Message Sent', message.message);
	//		});
	//	}
	//	else if (message.client === '*') {
	//		server.getClients().forEach(function (client) {
	//			server.send(client, message.message, false, function (error) {
	//				if (error) {
	//					console.log('Message Sending Error', error);
	//					endpoint.sendError(error);
	//				}
	//				else
	//					endpoint.sendLog('Message Sent', message.message);
	//			});
	//		});
	//	}
	//});


});