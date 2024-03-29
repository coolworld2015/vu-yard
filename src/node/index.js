'use strict';

var express = require('express');
var bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

//------------------------------------------------------------------------
var jwt = require('jsonwebtoken');
var secret = 'f3oLigPb3vGCg9lgL0Bs97wySTCCuvYdOZg9zqTY32of3oLigPb3vGCg9lgL0Bs97wySTCCuvYdOZg9zqTY32eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjoibWFnaWMiLCJpYXQiOjE1NzMxNTY0OTgsImV4cCI6MTU3MzE2MDA5OH0.uUlMkCQKt3U0OWvjBzAZEaa3V49g1AbuVOufNx-g4F0of3oLigPb3vGCg9lgL0Bs97wySTCCuvYdOZg9zqTY32of3oLigPb3vGCg9lgL0Bs97wySTCCuvYdOZg9zqTY32of3oLigPb3vGCg9lgL0Bs97wySTCCuvYdOZg9zqTY32of3oLigPb3vGCg9lgL0Bs97wySTCCuvYdOZg9zqTY32o';
var token = jwt.sign({auth: 'magic'}, secret, {expiresIn: 60 * 60});

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
    .get('/', (req, res) => res.send('It is just API Server...'))
    //.get('/', (req, res) => res.sendFile(__dirname + '/auth.html'))

    .post('/api/login', Login)

    .get('/api/messages/get', Messages)

    .get('/api/items/get', getItems)
    .get('/api/items1/get', getItems1)

    .get('/api/items/findByName/:name', findByName)
    .get('/api/items1/findByName/:name', findByName1)

    .post('/api/items/update', ItemsUpdate)
    .post('/api/items1/update', ItemsUpdate1)

    .post('/api/items/add', ItemsAdd)
    .post('/api/items/delete', ItemsDelete)

    .get('/api/locations/get', Locations)
    .post('/api/locations/add', LocationAdd)
    .post('/api/locations/update', LocationUpdate)
    .post('/api/locations/delete', LocationDelete)

    .get('/api/vehicles/get', Vehicles)
    .post('/api/vehicles/add', VehicleAdd)
    .post('/api/vehicles/update', VehicleUpdate)
    .post('/api/vehicles/delete', VehicleDelete)

    .get('/api/users/get', Users)
    .post('/api/users/add', UserAdd)
    .post('/api/users/update', UserUpdate)
    .post('/api/users/delete', UserDelete)

    .get('/api/audit/get', Audit)
    .post('/api/audit/add', AuditAdd)

    .get('/api/operations/get', Operations)

    .get('/api/targets/get', Targets)
    .post('/api/targets/add', TargetAdd)
    .post('/api/targets/update', TargetUpdate)
    .post('/api/targets/delete', TargetDelete)

    .get('/api/positions/get', Positions)
    .post('/api/positions/add', PositionAdd)
    .post('/api/positions/update', PositionUpdate)
    .post('/api/positions/delete', PositionDelete)

    .get('/api/guests/get', Guests)
    .get('/api/guests/all', GuestsAll)
    .post('/api/guests/add', GuestAdd)
    .post('/api/guests/update', GuestUpdate)
    .post('/api/guests/delete', GuestDelete)

    .get('/api/journal/get', Journal)

    .get('/api/auth', (req, res) => res.send({token: token}))

    .get('/api/test', TestPOST)

    .listen(PORT, () => console.log(`Listening on ${PORT}`));

setInterval(function () {
    token = jwt.sign({auth: 'magic'}, secret, {expiresIn: 60 * 60});
}, 1000 * 60 * 60);

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
        var date = new Date(+new Date() - (new Date()).getTimezoneOffset() * 60000).toISOString().split('T')[0];
        var time = new Date(+new Date() - (new Date()).getTimezoneOffset() * 60000).toISOString().split('T')[1];
        var now = date + ' ' + time;
        console.log('message received ' + message + '###' + now);
        for (var key in clients) {
            clients[key].send(message + '###' + now);
        }
    });
});

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
                var d = new Date();
                d.setHours(d.getHours() + 2);
                var date = d.toJSON().split('T')[0].split('-')[2] + '.' + d.toJSON().split('T')[0].split('-')[1] + '.' + d.toJSON().split('T')[0].split('-')[0];
                var time = d.toTimeString().slice(0, 8);
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

function LocationAdd(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var LocationsModel = require('./mongo').LocationsModel;
            LocationsModel.findOne({name: req.body.name}, function (err, location) {
                if (err) {
                    res.send({error: err.message});
                }
                if (location) {
                    if (location.name === req.body.name) {
                        res.send({error: 'Name: ' + location.name + ' - already exist'});
                    }
                } else {
                    var LocationsModel = require('./mongo').LocationsModel;
                    LocationsModel.create({
                            id: +new Date(),
                            name: req.body.name,
                            vehicle: 'none',
                            status: 'blank',
                            message: 'n/a',
                        },
                        function (err, location) {
                            if (err) {
                                return res.send({error: 'Server error'});
                            }
                            res.send(location);
                        });
                }
            });
        }
    })
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

function LocationDelete(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var LocationsModel = require('./mongo').LocationsModel;
            LocationsModel.remove({
                    "id": req.body.id
                },
                function (err) {
                    if (err) {
                        return res.send({error: 'Server error'});
                    } else {
                        console.log('Loc with id: ', req.body.id, ' was removed');
                        res.send('Location with id: ' + req.body.id + ' was removed');
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
            VehiclesModel.findOne({plateNo: req.body.plateNo}, function (err, vehicle) {
                    if (err) {
                        res.send({error: err.message});
                    }
                    if (vehicle) {
                        if (vehicle.plateNo === req.body.plateNo) {
                            res.send({error: 'PlateNo: ' + vehicle.plateNo + ' - already exist'});
                        }
                    } else {
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

                        // Operations start
                        var OperationsModel = require('./mongo').OperationsModel;
                        var d = new Date();
                        d.setHours(d.getHours() + 2);
                        var date = d.toJSON().split('T')[0].split('-')[2] + '.' + d.toJSON().split('T')[0].split('-')[1] + '.' + d.toJSON().split('T')[0].split('-')[0];
                        var time = d.toTimeString().slice(0, 8);
                        OperationsModel.create({
                                id: +new Date(),
                                plateNo: req.body.plateNo,
                                status: req.body.status,
                                date: date + ' ' + time,
                                standing: req.body.standing
                            },
                            function (err, audit) {
                                if (err) {
                                    return res.send({error: 'Server error'});
                                }
                            });
                        // Operations end

                    }
                }
            )
        }
    })
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

                    // Operations start
                    var OperationsModel = require('./mongo').OperationsModel;
                    var d = new Date();
                    d.setHours(d.getHours() + 2);
                    var date = d.toJSON().split('T')[0].split('-')[2] + '.' + d.toJSON().split('T')[0].split('-')[1] + '.' + d.toJSON().split('T')[0].split('-')[0];
                    var time = d.toTimeString().slice(0, 8);
                    OperationsModel.create({
                            id: +new Date(),
                            plateNo: req.body.plateNo,
                            status: req.body.status,
                            date: date + ' ' + time,
                            standing: req.body.standing
                        },
                        function (err, audit) {
                            if (err) {
                                return res.send({error: 'Server error'});
                            }
                        });
                    // Operations end

                }
            });
        }
    });
}

function VehicleDelete(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var VehiclesModel = require('./mongo').VehiclesModel;
            VehiclesModel.remove({
                    "id": req.body.id
                },
                function (err) {
                    if (err) {
                        return res.send({error: 'Server error'});
                    } else {
                        console.log('Vehicle with id: ', req.body.id, ' was removed');
                        res.send('Vehicle with id: ' + req.body.id + ' was removed');
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
                        res.send({text: 'User with id: ' + req.body.id + ' was removed'});
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
            return AuditModel.find(function (err, audit) {
                if (!err) {
                    return res.send(audit);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            }).sort({date: -1});
        }
    });
}

function AuditAdd(req, res) {
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
}

//------------------------------------------------------------------------
function Operations(req, res) {
    var agent = req.headers.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var OperationsModel = require('./mongo').OperationsModel;
            return OperationsModel.find(function (err, operations) {
                if (!err) {
                    return res.send(operations);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            }).sort({date: -1});
        }
    });
}

//------------------------------------------------------------------------
function Targets(req, res) {
    var agent = req.headers.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var TargetsModel = require('./mongo').TargetsModel;
            return TargetsModel.find(function (err, targets) {
                if (!err) {
                    return res.send(targets);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            }).sort({date: -1});
        }
    });
}

function TargetAdd(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var TargetsModel = require('./mongo').TargetsModel;
            TargetsModel.findOne({vehicle: req.body.vehicle}, function (err, target) {
                if (err) {
                    res.send({error: err.message});
                }
                if (target) {
                    if (target.vehicle === req.body.vehicle) {
                        res.send({error: 'Vehicle: ' + target.vehicle + ' - already exist'});
                    }
                } else {
                    var TargetsModel = require('./mongo').TargetsModel;
                    var date = new Date().toJSON().slice(0, 10);
                    var time = new Date().toTimeString().slice(0, 8);
                    TargetsModel.create({
                            id: +new Date(),
                            vehicle: req.body.vehicle,
                            lat: req.body.lat,
                            lng: req.body.lng,
                            date: date + ' ' + time,
                        },
                        function (err, location) {
                            if (err) {
                                return res.send({error: 'Server error'});
                            }
                            res.send(location);
                        });
                }
            });
        }
    })
}

function TargetUpdate(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var TargetsModel = require('./mongo').TargetsModel;
            var date = new Date().toJSON().slice(0, 10);
            var time = new Date().toTimeString().slice(0, 8);
            TargetsModel.findOne({
                id: req.body.id
            }, function (err, target) {
                if (err) {
                    res.send({error: err.message});
                } else {
                    target.vehicle = req.body.vehicle;
                    target.lat = req.body.lat;
                    target.lng = req.body.lng;
                    target.date = date + ' ' + time;

                    target.save(function (err) {
                        if (!err) {
                            res.send(target);
                        } else {
                            return res.send(err);
                        }
                    });
                }
            });
        }
    });
}

function TargetDelete(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var TargetsModel = require('./mongo').TargetsModel;
            TargetsModel.remove({
                    "id": req.body.id
                },
                function (err) {
                    if (err) {
                        return res.send({error: 'Server error'});
                    } else {
                        console.log('Target with id: ', req.body.id, ' was removed');
                        res.send('Target with id: ' + req.body.id + ' was removed');
                    }
                });
        }
    });
}

//------------------------------------------------------------------------
function Positions(req, res) {
    var agent = req.headers.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var PositionsModel = require('./mongo').PositionsModel;
            return PositionsModel.find(function (err, positions) {
                if (!err) {
                    return res.send(positions);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            }).sort({date: -1});
        }
    });
}

function PositionAdd(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var PositionsModel = require('./mongo').PositionsModel;
            var date = new Date().toJSON().slice(0, 10);
            var time = new Date().toTimeString().slice(0, 8);
            PositionsModel.create({
                    id: +new Date(),
                    vehicle: req.body.vehicle,
                    lat: req.body.lat,
                    lng: req.body.lng,
                    date: date + ' ' + time,
                },
                function (err, position) {
                    if (err) {
                        return res.send({error: 'Server error'});
                    }
                    res.send(position);
                });
        }
    });
}

function PositionUpdate(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var PositionsModel = require('./mongo').PositionsModel;
            var date = new Date().toJSON().slice(0, 10);
            var time = new Date().toTimeString().slice(0, 8);
            PositionsModel.findOne({
                id: req.body.id
            }, function (err, position) {
                if (err) {
                    res.send({error: err.message});
                } else {
                    position.vehicle = req.body.vehicle;
                    position.lat = req.body.lat;
                    position.lng = req.body.lng;
                    position.date = date + ' ' + time;

                    position.save(function (err) {
                        if (!err) {
                            res.send(position);
                        } else {
                            return res.send(err);
                        }
                    });
                }
            });
        }
    });
}

function PositionDelete(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var PositionsModel = require('./mongo').PositionsModel;
            PositionsModel.remove({
                    "id": req.body.id
                },
                function (err) {
                    if (err) {
                        return res.send({error: 'Server error'});
                    } else {
                        console.log('Position with id: ', req.body.id, ' was removed');
                        res.send('Position with id: ' + req.body.id + ' was removed');
                    }
                });
        }
    });
}

//------------------------------------------------------------------------
function Guests(req, res) {
    var agent = req.headers.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var GuestsModel = require('./mongo').GuestsModel;
            var d = new Date();
            d.setHours(d.getHours() + 2);
            var date = d.toJSON().split('T')[0].split('-')[2] + '.' + d.toJSON().split('T')[0].split('-')[1] + '.' + d.toJSON().split('T')[0].split('-')[0];
            return GuestsModel.find(function (err, guests) {
                if (!err) {
                    let items = guests.filter(item => item.date.split(' ')[0] === date);
                    return res.send(items);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            }).sort({date: -1});
        }
    });
}

function GuestsAll(req, res) {
    var agent = req.headers.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var GuestsModel = require('./mongo').GuestsModel;
            return GuestsModel.find(function (err, guests) {
                if (!err) {
                    return res.send(guests);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            }).sort({date: -1});
        }
    });
}

function GuestAdd(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var GuestsModel = require('./mongo').GuestsModel;
            var d = new Date();
            d.setHours(d.getHours() + 2);
            var date = d.toJSON().split('T')[0].split('-')[2] + '.' + d.toJSON().split('T')[0].split('-')[1] + '.' + d.toJSON().split('T')[0].split('-')[0];
            var time = d.toTimeString().slice(0, 8);
            GuestsModel.create({
                    id: +new Date(),
                    photo: req.body.photo,
                    name: req.body.name,
                    host: req.body.host,
                    status: req.body.status,
                    date: date + ' ' + time,
                },
                function (err, guest) {
                    if (err) {
                        return res.send({error: 'Server error'});
                    }
                    res.send(guest);
                });

            // Journal start
            var JournalModel = require('./mongo').JournalModel;
            JournalModel.create({
                    id: +new Date(),
                    name: req.body.name,
                    host: req.body.host,
                    status: req.body.status,
                    date: date + ' ' + time
                },
                function (err, journal) {
                    if (err) {
                        return res.send({error: 'Server error'});
                    }
                });
            // Journal end
        }
    });
}

function GuestUpdate(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var GuestsModel = require('./mongo').GuestsModel;
            var d = new Date();
            d.setHours(d.getHours() + 2);
            var date = d.toJSON().split('T')[0].split('-')[2] + '.' + d.toJSON().split('T')[0].split('-')[1] + '.' + d.toJSON().split('T')[0].split('-')[0];
            var time = d.toTimeString().slice(0, 8);
            GuestsModel.findOne({
                id: req.body.id
            }, function (err, guest) {
                if (err) {
                    res.send({error: err.message});
                } else {
                    guest.photo = req.body.photo;
                    guest.name = req.body.name;
                    guest.host = req.body.host;
                    guest.status = req.body.status;
                    guest.date = date + ' ' + time;

                    guest.save(function (err) {
                        if (!err) {
                            res.send(guest);
                        } else {
                            return res.send(err);
                        }
                    });

                    // Journal start
                    var JournalModel = require('./mongo').JournalModel;
                    JournalModel.create({
                            id: +new Date(),
                            name: req.body.name,
                            host: req.body.host,
                            status: req.body.status,
                            date: date + ' ' + time
                        },
                        function (err, journal) {
                            if (err) {
                                return res.send({error: 'Server error'});
                            }
                        });
                    // Journal end
                }
            });
        }
    });
}

function GuestDelete(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var GuestsModel = require('./mongo').GuestsModel;
            GuestsModel.remove({
                    "id": req.body.id
                },
                function (err) {
                    if (err) {
                        return res.send({error: 'Server error'});
                    } else {
                        console.log('Guests with id: ', req.body.id, ' was removed');
                        res.send('Guests with id: ' + req.body.id + ' was removed');
                    }
                });
        }
    });
}

//------------------------------------------------------------------------
function Journal(req, res) {
    var agent = req.headers.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var JournalModel = require('./mongo').JournalModel;
            return JournalModel.find(function (err, journal) {
                if (!err) {
                    return res.send(journal);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            }).sort({date: -1});
        }
    });
}

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
function getItems(req, res) {
    var ItemsModel = require('./mongo').ItemsModel;

    return ItemsModel.find(function (err, items) {
        if (!err) {
            return res.send(items);
        } else {
            res.statusCode = 500;
            return res.send({error: 'Server error'});
        }
    });
}
function getItems1(req, res) {
    var ItemsModel1 = require('./mongo').ItemsModel1;

    return ItemsModel1.find(function (err, items) {
        if (!err) {
            return res.send(items);
        } else {
            res.statusCode = 500;
            return res.send({error: 'Server error'});
        }
    });
}

function ItemsAdd(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var ItemsModel = require('./mongo').ItemsModel;
            ItemsModel.create({
                    id: req.body.id,
                    name: req.body.name,
                    pic: req.body.name,
                    category: req.body.category,
                    group: req.body.group,
                    description: req.body.description
                },
                function (err, item) {
                    if (err) {
                        return res.send({error: 'Server error'});
                    }
                    res.send(item);
                });
        }
    });
}


function ItemsDelete(req, res) {
    var agent = req.body.authorization;

    jwt.verify(agent, secret, function (err, decoded) {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        } else {
            var ItemsModel = require('./mongo').ItemsModel;
            ItemsModel.remove({
                    "id": req.body.id
                },
                function (err) {
                    if (err) {
                        return res.send({error: 'Server error'});
                    } else {
                        console.log('Item with id: ', req.body.id, ' was removed');
                        res.send({text: 'Item with id: ' + req.body.id + ' was removed'});
                    }
                });
        }
    });
}

//------------------------------------------------------------------------
function findByName1(req, res) {
    var ItemsModel1 = require('./mongo').ItemsModel1;

    ItemsModel1.find({
        "name": new RegExp(req.params.name, 'i')
    }, function (err, item) {
        if (err) {
            return res.send({error: err.message});
        } else {
            console.log(item);
            return res.send(item);
        }
    });
}

function findByName(req, res) {
    var ItemsModel = require('./mongo').ItemsModel;

    ItemsModel.find({
        "name": new RegExp(req.params.name, 'i')
    }, function (err, item) {
        if (err) {
            return res.send({error: err.message});
        } else {
            console.log(item);
            return res.send(item);
        }
    });
}

//------------------------------------------------------------------------
function ItemsUpdate1(req, res) {
    var ItemsModel1 = require('./mongo').ItemsModel1;

    ItemsModel1.findOne({
        id: req.body.id
    }, function (err, item) {
        if (err) {
            res.send({error: err.message});
        }

        item.pic = req.body.pic;
        item.name = req.body.name;
        item.category = req.body.category;
        item.group = req.body.group;
        item.description = req.body.description;

        item.save(function (err) {
            if (!err) {
                res.send(item);
            } else {
                return res.send(err);
            }
        });
    });
}

function ItemsUpdate(req, res) {
    var ItemsModel = require('./mongo').ItemsModel;

    ItemsModel.findOne({
        id: req.body.id
    }, function (err, item) {
        if (err) {
            res.send({error: err.message});
        }

        item.pic = req.body.pic;
        item.name = req.body.name;
        item.category = req.body.category;
        item.group = req.body.group;
        item.description = req.body.description;

        item.save(function (err) {
            if (!err) {
                res.send(item);
            } else {
                return res.send(err);
            }
        });
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