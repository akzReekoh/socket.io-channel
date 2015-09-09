'use strict';

var platform = require('./platform')();

platform.once('ready', function (options) {
	var app = require('http').createServer(function (req, res) {
		res.end('Channel Online');
	});

	var io = require('socket.io')(app);

	io.on('connection', function (socket) {
		/*
		 * Listen to inbound messages coming from other platforms,
		 * services, or apps. Receive the messages and send them
		 * over to the platform. These messages may contain data/commands
		 * that are to be sent to the connected devices on the network/topology.
		 */
		socket.on('message', function (data) {
			platform.sendMessageToDevice(data.device, data.message);
		});

		/*
		 * Listen to inbound messages coming from other platforms,
		 * services, or apps. Receive the messages and send them
		 * over to the platform. These messages may contain data/commands
		 * that are to be sent to the connected devices on the network/topology.
		 */
		socket.on('groupmessage', function (data) {
			platform.sendMessageToGroup(data.group, data.message);
		});

		/*
		 * Listen to the data that is coming from the devices.
		 * Send these data outbound to the other platforms, services,
		 * or apps that are connected to this channel.
		 */
		platform.on('data', function (data) {
			socket.emit('data', data);
		});
	});

	app.listen(options.port, require('ip').address(), function(error) {
		if (error)
			platform.handleException(error);
	});
});