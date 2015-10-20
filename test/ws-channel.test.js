'use strict';

const PORT = 8080;

var cp     = require('child_process'),
	io     = require('socket.io-client'),
	should = require('should'),
	channel;

describe('WS Channel', function () {
	this.slow(8000);

	after('terminate child process', function () {
		channel.kill('SIGKILL');
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			should.ok(channel = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(8000);

			channel.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			channel.send({
				type: 'ready',
				data: {
					options: {
						port: PORT
					}
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});

	describe('#data', function () {
		it('should be able to serve a client and exchange data', function (done) {
			var url = 'http://127.0.0.1:' + PORT;
			var sock = io(url);

			sock.on('data', function (data) {
				should.equal(data.key1, 'value1');
				should.equal(data.key2, 121);
				should.equal(data.key3, 40);

				done();
			});

			setTimeout(function () {
				channel.send({
					type: 'data',
					data: {
						key1: 'value1',
						key2: 121,
						key3: 40
					}
				}, function (error) {
					should.ifError(error);
				});
			}, 1000);
		});
	});

	// TODO: Tests for messaging
});