'use strict';

var cp     = require('child_process'),
	io     = require('socket.io-client'),
	should = require('should'),
	port   = 8080,
	channel, receivedData;

describe('WS Channel', function () {
	this.slow(5000);

	after('terminate child process', function () {
		channel.kill('SIGKILL');
	});

	describe('#spawn', function () {
		it('should spawn a child process', function (done) {
			channel = cp.fork(process.cwd());
			should.ok(channel, 'Child process not spawned.');
			done();
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			channel.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			channel.send({
				type: 'ready',
				data: {
					options: {
						port: port
					}
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});

	describe('#data', function () {
		it('should be able to serve a client', function (done) {
			var url = 'http://' + require('ip').address() + ':' + port;
			var sock = io(url);

			sock.on('data', function (data) {
				receivedData = data;

				should.ok(data);
			});

			done();
		});

		it('should be able to emit the data to the client', function (done) {
			channel.send({
				type: 'data',
				data: {
					key1: 'value1',
					key2: 121,
					key3: 40
				}
			}, done);
		});

		it('should have emitted the correct data to the client', function (done) {
			setTimeout(function () {
				should.equal(receivedData.key1, 'value1');
				should.equal(receivedData.key2, 121);
				should.equal(receivedData.key3, 40);
				done();
			}, 500);
		});
	});
});