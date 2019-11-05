'use strict';

var express = require('express');
var bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

//------------------------------------------------------------------------
var jwt = require('jsonwebtoken');
var secret = 'f3oLigPb3vGCg9lgL0Bs97wySTCCuvYdOZg9zqTY32o';
var token = jwt.sign({auth: 'magic'}, secret, {expiresIn: 60 * 60});

setInterval(function () {
    token = jwt.sign({auth: 'magic'}, secret, {expiresIn: 60 * 60});
}, 1000 * 60 * 60);

//------------------------------------------------------------------------
const server = express()
    .use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, accept, authorization');
        next();
    })
    .use(bodyParser({limit: '50mb'}))
    .use(express.static(__dirname + '/build'))

    //.get('/',(req, res) => res.sendFile(__dirname + '/build/index.html'))
    .get('/',(req, res) => res.send('It is just API Server...'))
    //.get('/', (req, res) => res.sendFile(__dirname + '/auth.html'))

    .post('/api/login', Login)

    .get('/api/messages/get', Messages)

    .get('/api/locations/get', Locations)
    .post('/api/locations/update', LocationUpdate)

    .get('/api/vehicles/get', Vehicles)
    .post('/api/vehicles/add', VehicleAdd)
    .post('/api/vehicles/update', VehicleUpdate)

    .get('/api/users/get', Users)
    .post('/api/users/add', UserAdd)
    .post('/api/users/update', UserUpdate)
    .post('/api/users/delete', UserDelete)

    .get('/api/audit/get', Audit)

    .get('/api/test', TestPOST)
    .get('/api/auth', (req, res) => res.send(token))

    .listen(PORT, () => console.log(`Listening on ${PORT}`));

//------------------------------------------------------------------------
var SocketServer = require('ws').Server;
var webSocketServer = new SocketServer({server});
var clients = {};

webSocketServer.on('connection', (ws) => {
    var id = +new Date();
    clients[id] = ws;
    console.log('new connection ' + id);

    var timeID = setInterval(function () {
        ws.send('still alive', function () {
        })
    }, 30000);

    ws.on('close', function () {
        console.log('connection closed ' + id);
        delete clients[id];
    });

    ws.on('message', function (message) {
        // Message start
        var MessagesModel = require('./mongo').MessagesModel;
        var date = new Date().toJSON().slice(0, 10);
        var time = new Date().toTimeString().slice(0, 8);
        var now = date + ' ' + time;
        console.log(message)
        MessagesModel.create({
            id: +new Date(),
            name: message.split('###')[1],
            date: now,
            message: message.split('###')[0]
        });
        // Message end
        console.log('message received ' + message + '###' + now);
        for (var key in clients) {
            clients[key].send(message + '###' + now);
            //this.send(message);
        }
    });
});

//------------------------------------------------------------------------
function TestPOST(req, res) {
    const request = require('request');

    request.post('https://213.144.11.162:10380/authentication', {
        form:
            {
                'grant_type': 'password',
                'username': 'manyvehicles@abona-erp.com',
                'password': '1234qwerQWER,.-'
            }
    }, (err, resp, body) => {
        if (err) {
            console.log(err);
            res.send(err)
        }
        res.send(body);
    });
}

//------------------------------------------------------------------------
function TestPOST1(req, res) {
    const request = require('request');

    request.post('https://jwt-base.herokuapp.com/api/login', {
        form:
            {
                'name': '1',
                'pass': '1',
                'description': 'test'
            }
    }, (err, resp, body) => {
        if (err) {
            return console.log(err);
        }
        res.send(body);
    });
}

//------------------------------------------------------------------------
function TestGET_Old(req, res) {
    const https = require('https');

    https.get('https://ui-base.herokuapp.com/api/users/get', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
            console.log(data);
        });

        resp.on('end', () => {
            console.log(JSON.parse(data));
            res.send(data);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

//------------------------------------------------------------------------
function TestGET(req, res) {
    const request = require('request');

    request('https://ui-base.herokuapp.com/api/users/get', {json: true}, (err, resp, body) => {
        if (err) {
            return console.log(err);
        }
        res.send(body);
    });
}

//------------------------------------------------------------------------
function Login(req, res) {
    var UsersModel = require('./mongo').UsersModel;
    UsersModel.findOne({name: req.body.name}, function (err, user) {
        if (err) {
            res.send({error: err.message});
        }
        if (user) {
            if (user.pass == req.body.pass) {

                // Audit start
                var AuditModel = require('./mongo').AuditModel;
                var date = new Date().toJSON().slice(0, 10);
                var time = new Date().toTimeString().slice(0, 8);
                AuditModel.create({
                        id: +new Date(),
                        name: req.body.name,
                        date: date + ' ' + time,
                        ip: req.ip,
                        description: req.body.description
                    },
                    function (err, audit) {
                        if (err) {
                            return res.send({error: 'Server error'});
                        } else {
                            res.send({token: token}); // Send TOKEN here !!!
                        }
                    });
                // Audit end
            } else {
                res.status(403).send({
                    success: false,
                    message: 'No such pass.'
                });
            }
        } else {
            res.status(403).send({
                success: false,
                message: 'No such user.'
            });
        }

    });
}

//------------------------------------------------------------------------
function Messages(req, res) {
    var agent = req.headers.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var MessagesModel = require('./mongo').MessagesModel;
            return MessagesModel.find(function (err, messages) {
                if (!err) {
                    return res.send(messages);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            }).limit(1000);
        }
    });
}

//------------------------------------------------------------------------
function Locations(req, res) {
    var agent = req.headers.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var LocationsModel = require('./mongo').LocationsModel;
            return LocationsModel.find(function (err, locations) {
                if (!err) {
                    return res.send(locations);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            });
        }
    });
}

function LocationUpdate(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var LocationsModel = require('./mongo').LocationsModel;
            LocationsModel.findOne({
                id: req.body.id
            }, function (err, location) {
                if (err) {
                    res.send({error: err.message});
                } else {

                    location.name = req.body.name;
                    location.vehicle = req.body.vehicle;
                    location.status = req.body.status;
                    location.message = req.body.message;

                    location.save(function (err) {
                        if (!err) {
                            res.send(location);
                        } else {
                            return res.send(err);
                        }
                    });
                }
            });
        }
    });
}

//------------------------------------------------------------------------
function Vehicles(req, res) {
    var agent = req.headers.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var VehiclesModel = require('./mongo').VehiclesModel;
            return VehiclesModel.find(function (err, vehicles) {
                if (!err) {
                    return res.send(vehicles);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            });
        }
    });
}

function VehicleAdd(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var VehiclesModel = require('./mongo').VehiclesModel;
            VehiclesModel.create({
                    id: +new Date(),
                    vehicleOid: req.body.vehicleOid,
                    plateNo: req.body.plateNo,
                    companyName: req.body.companyName,
                    arrived: req.body.arrived,
                    booked: req.body.booked,
                    docked: req.body.docked,
                    undocked: req.body.undocked,
                    departed: req.body.departed,
                    standing: req.body.standing,
                    status: req.body.status,
                    message: req.body.message
                },
                function (err, vehicle) {
                    if (err) {
                        return res.send({error: 'Server error'});
                    }
                    res.send(vehicle);
                });
        }
    });
}

function VehicleUpdate(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var VehiclesModel = require('./mongo').VehiclesModel;
            VehiclesModel.findOne({
                id: req.body.id
            }, function (err, vehicle) {
                if (err) {
                    res.send({error: err.message});
                } else {

                    vehicle.vehicleOid = req.body.vehicleOid;
                    vehicle.plateNo = req.body.plateNo;
                    vehicle.companyName = req.body.companyName;

                    switch (req.body.status) {
                        case 'arrived':
                            vehicle.arrived = +new Date();
                            break;
                        case 'booked':
                            vehicle.booked = +new Date();
                            break;
                        case 'docked':
                            vehicle.docked = +new Date();
                            break;
                        case 'undocked':
                            vehicle.undocked = +new Date();
                            break;
                        case 'departed':
                            vehicle.departed = +new Date();
                            break;
                    }

                    vehicle.standing = req.body.standing;
                    vehicle.status = req.body.status;
                    vehicle.message = req.body.message;

                    vehicle.save(function (err) {
                        if (!err) {
                            res.send(vehicle);
                        } else {
                            return res.send(err);
                        }
                    });
                }
            });
        }
    });
}

//------------------------------------------------------------------------
function Users(req, res) {
    var agent = req.headers.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var UsersModel = require('./mongo').UsersModel;
            return UsersModel.find(function (err, users) {
                if (!err) {
                    return res.send(users);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            });
        }
    });
}

function UserAdd(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var UsersModel = require('./mongo').UsersModel;
            UsersModel.create({
                    id: req.body.id,
                    name: req.body.name,
                    pass: req.body.pass,
                    description: req.body.description
                },
                function (err, user) {
                    if (err) {
                        return res.send({error: 'Server error'});
                    }
                    res.send(user);
                });
        }
    });
}

function UserUpdate(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var UsersModel = require('./mongo').UsersModel;
            UsersModel.findOne({
                id: req.body.id
            }, function (err, user) {
                if (err) {
                    res.send({error: err.message});
                } else {
                    user.name = req.body.name;
                    user.pass = req.body.pass;
                    user.description = req.body.description;

                    user.save(function (err) {
                        if (!err) {
                            res.send(user);
                        } else {
                            return res.send(err);
                        }
                    });
                }
            });
        }
    });
}

function UserDelete(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var UsersModel = require('./mongo').UsersModel;
            UsersModel.remove({
                    "id": req.body.id
                },
                function (err) {
                    if (err) {
                        return res.send({error: 'Server error'});
                    } else {
                        console.log('User with id: ', req.body.id, ' was removed');
                        res.send('User with id: ' + req.body.id + ' was removed');
                    }
                });
        }
    });
}

//------------------------------------------------------------------------
function Audit(req, res) {
    var agent = req.headers.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var AuditModel = require('./mongo').AuditModel;
            return AuditModel.find(function (err, users) {
                if (!err) {
                    return res.send(users);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            }).sort({date: -1});
        }
    });
}

/*
//------------------------------------------------------------------------
 
app.get('/api/items/get', function(req, res) {
	var agent = req.headers.authorization;
	
	jwt.verify(agent, secret, function(err, decoded) {
		if (err) {
			return res.status(403).send({ 
				success: false, 
				message: 'No token provided.' 
			});
		} else {
			var ItemsModel = require('./mongo').ItemsModel;
			return ItemsModel.find(function (err, users) {
				if (!err) {
					return res.send(users);
				} else {
					res.statusCode = 500;
					return res.send({error: 'Server error'});
				}
			}).limit(1000);
		}
	});
});

app.get('/api/items/findByName/:name', function(req, res) {
	var agent = req.headers.authorization;
	
	jwt.verify(agent, secret, function(err, decoded) {
		if (err) {
			return res.status(403).send({ 
				success: false, 
				message: 'No token provided.' 
			});
		} else {
			var ItemsModel = require('./mongo').ItemsModel;
			ItemsModel.find({
				"name": new RegExp(req.params.name, 'i')
			}, function (err, items) {
				if (err) {
					res.send({error: err.message});
				} else {
					console.log('mongo - ' + items.length);
					res.send(items);
				}
			});
		}
	});
});

app.get('/api/items/findByPhone/:name', function(req, res) {
	var agent = req.headers.authorization;
	
	jwt.verify(agent, secret, function(err, decoded) {
		if (err) {
			return res.status(403).send({ 
				success: false, 
				message: 'No token provided.' 
			});
		} else {
			var ItemsModel = require('./mongo').ItemsModel;
			ItemsModel.find({
				"phone": new RegExp(req.params.name)
			}, function (err, items) {
				if (err) {
					res.send({error: err.message});
				} else {
					console.log('mongo - ' + items.length);
					res.send(items);
				}
			});
		}
	});
});

*/