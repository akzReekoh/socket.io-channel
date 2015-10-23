'use strict';

var platform = require('./platform'),
	config   = require('./config.json'),
	io, dataEvent;

/*
 * Listen to the data that is coming from the devices.
 * Emit these data outbound to other platforms, services,
 * or apps that are connected to this channel.
 */
platform.on('data', function (data) {
	io.emit(dataEvent, data);
});

/*
 * Event to listen to in order to gracefully release all resources bound to this service.
 */
platform.on('close', function () {
	io.close();
	platform.notifyClose();
});

platform.once('ready', function (options) {
	var messageEvent = options.message_event || config.message_event.default;
	var groupMessageEvent = options.groupmessage_event || config.groupmessage_event.default;

	dataEvent = options.data_event || config.data_event.default;

	io = require('socket.io')(options.port);

	io.on('connection', function (socket) {
		/*
		 * Listen to inbound messages coming from other platforms,
		 * services, or apps. Receive the messages and send them
		 * over to the platform. These messages may contain data/commands
		 * that are to be sent to the connected devices on the network/topology.
		 */
		socket.on(messageEvent, function (data) {
			platform.sendMessageToDevice(data.target, data.message);
		});

		/*
		 * Listen to inbound group messages coming from other platforms,
		 * services, or apps. Receive the messages and send them
		 * over to the platform. These messages may contain data/commands
		 * that are to be sent to the connected devices on the network/topology.
		 */
		socket.on(groupMessageEvent, function (data) {
			platform.sendMessageToGroup(data.target, data.message);
		});
	});

	platform.log('Websockets Channel initialized on port ' + options.port);
	platform.notifyReady();
});