'use strict';

var io, platform = require('./platform');

/*
 * Listen to the data that is coming from the devices.
 * Emit these data outbound to other platforms, services,
 * or apps that are connected to this channel.
 */
platform.on('data', function (data) {
	io.emit('data', data);
});

platform.once('ready', function (options) {
	io = require('socket.io')(options.port);

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
		 * Listen to inbound group messages coming from other platforms,
		 * services, or apps. Receive the messages and send them
		 * over to the platform. These messages may contain data/commands
		 * that are to be sent to the connected devices on the network/topology.
		 */
		socket.on('groupmessage', function (data) {
			platform.sendMessageToGroup(data.group, data.message);
		});
	});

	platform.notifyReady();
});