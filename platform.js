'use strict';

var inherits     = require('util').inherits,
	EventEmitter = require('events').EventEmitter;

var isString = function (val) {
	return typeof val === 'string' || ((!!val && typeof val === 'object') && Object.prototype.toString.call(val) === '[object String]');
};

function Platform() {
	if (!(this instanceof Platform)) return new Platform();

	var self = this;

	process.on('uncaughtException', function (error) {
		self.handleException(error);
		process.exit(1);
	});

	EventEmitter.call(this);
	Platform.init.call(this);
}

inherits(Platform, EventEmitter);

Platform.init = function () {
	var self = this;

	process.on('message', function (message) {
		if (message.type === 'ready')
			self.emit('ready', message.data.options);
		else if (message.type === 'data')
			self.emit('data', message.data);
	});
};

Platform.prototype.sendMessageToDevice = function (device, message, callback) {
	callback = callback || function () {
		};

	setImmediate(function () {
		if (!device || !isString(device)) return callback(new Error('A valid device id is required.'));
		if (!message || !isString(message)) return callback(new Error('A valid message is required.'));

		process.send({
			type: 'message',
			data: {
				device: device,
				message: message
			}
		});

		callback();
	});
};

Platform.prototype.sendMessageToGroup = function (group, message, callback) {
	callback = callback || function () {
		};

	setImmediate(function () {
		if (!group || !isString(group)) return callback(new Error('A valid group id is required.'));
		if (!message || !isString(message)) return callback(new Error('A valid message is required.'));

		process.send({
			type: 'message',
			data: {
				group: group,
				message: message
			}
		});

		callback();
	});
};

Platform.prototype.log = function (title, description, callback) {
	callback = callback || function () {
		};

	setImmediate(function () {
		if (!title || !isString(title)) return callback(new Error('A valid log title is required.'));

		process.send({
			type: 'log',
			data: {
				title: title,
				description: description
			}
		});

		callback();
	});
};

Platform.prototype.handleException = function (error, callback) {
	callback = callback || function () {
		};

	setImmediate(function () {
		if (!error) return callback(new Error('Error is required.'));

		process.send({
			type: 'error',
			data: {
				name: error.name,
				message: error.message,
				stack: error.stack
			}
		});
	});
};

module.exports = new Platform();
