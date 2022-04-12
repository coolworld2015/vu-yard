'use strict';

var express = require('express');
var bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://admin:1314@coolworld.obhth.mongodb.net/for1post?retryWrites=true&w=majority";
//const uri = "mongodb://localhost:27017/forpost";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

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

    .get('/',(req, res) => res.sendFile(__dirname + '/build/index.html'))
    //.get('/', (req, res) => res.send('It is just API Server...'))
    //.get('/', (req, res) => res.sendFile(__dirname + '/collection.html'))

    .post('/api/login', function (req, res) {
        client.connect(err => {
            const collection = client.db("forpost").collection("users")
            console.log(" Mongoose is connected ")

            collection.findOne({name: req.body.name}, function(err, user) {
                console.log('UsersModel ', user)
                if (err) {
                    res.send({error: err.message});
                }

                if (user) {
                    if (user.pass == req.body.pass) {

                        // Audit start
                        const audit = client.db("forpost").collection("audit")
                        console.log(" Mongoose is connected ", audit)

                        var d = new Date();
                        d.setHours(d.getHours() + 2);
                        var date = d.toJSON().split('T')[0].split('-')[2] + '.' + d.toJSON().split('T')[0].split('-')[1] + '.' + d.toJSON().split('T')[0].split('-')[0];
                        var time = d.toTimeString().slice(0, 8);

                        audit.insertOne({
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
                                    client.close();
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

        })

        })

//------------------------------------------------------------------------
    .get('/api/items/get', function (req, res) {
        client.connect(err => {
            const collection = client.db("forpost").collection("items")
            console.log(" Mongoose is connected ")

            collection.find({}).sort({'_id': -1}).limit(20).toArray(function(err, result) {
                if (!err) {
                    console.log('length - ', result.length);
                    client.close();
                    return res.send(result);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            });

        });
    })

    .get('/api/items/chunk/:chunk', function (req, res) {
        client.connect(err => {
            const collection = client.db("forpost").collection("items");
            const start = parseInt(req.params.chunk);
            console.log(" Mongoose is connected with chunk - ", start);

            collection.find({}).skip(start).limit(20).sort({'_id': -1}).toArray(function(err, result) {
                if (!err) {
                    console.log('length - ', result.length);
                    //client.close();
                    return res.send(result);
                } else {
                    console.log('err - ', err);
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            });

        });
    })

    .get('/api/items/getall', function (req, res) {
        client.connect(err => {
            const collection = client.db("forpost").collection("items")
            console.log(" Mongoose is connected ")

            collection.find({}).sort({'_id': -1}).toArray(function(err, result) {
                if (!err) {
                    console.log('length - ', result.length);
                    client.close();
                    return res.send(result);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            });

        });
    })

    .get('/api/pic/get', function (req, res) {
        client.connect(err => {
            const collection = client.db("forpost").collection("items")
            console.log(" Mongoose is connected ")

            collection.find({}).sort({'_id': -1}).limit(20).toArray(function(err, result) {
                if (!err) {
                    console.log('length - ', result.length);
                    let filteredItems = result.filter((item) => item.pic);
                    client.close();
                    return res.send(filteredItems);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            });

        });
    })

    .get('/api/pic/getall', function (req, res) {
        client.connect(err => {
            const collection = client.db("forpost").collection("items")
            console.log(" Mongoose is connected ")

            collection.find({}).sort({'_id': -1}).toArray(function(err, result) {
                if (!err) {
                    console.log('length - ', result.length);
                    let filteredItems = result.filter((item) => item.pic);
                    client.close();
                    return res.send(filteredItems);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            });

        });
    })

    .get('/api/items/findByName/:name', function (req, res) {
        client.connect(err => {
            const collection = client.db("forpost").collection("items")
            console.log(" Mongoose is connected ")

            collection.find({"name": new RegExp(req.params.name, 'i')}).sort({'_id': -1}).toArray(function(err, result) {
                if (!err) {
                    console.log('length - ', result.length);
                    client.close();
                    return res.send(result);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            });

        });
    })

    .post('/api/items/update', function (req, res) {
        client.connect(err => {
            const collection = client.db("forpost").collection("items")
            console.log(" Mongoose is connected ")

            collection.updateOne({id: req.body.id}, { $set : {
                    pic: req.body.pic,
                    pictures: req.body.pictures,
                    name: req.body.name,
                    category: req.body.category,
                    group: req.body.group,
                    description: req.body.description
                } }, function (err, item) {
                if (!err) {
                    client.close();
                    return res.send(item);

                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            });

        });
    })

    .post('/api/items/add', function (req, res) {
        var agent = req.body.authorization;

        jwt.verify(agent, secret, function (err, decoded) {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: 'No token provided.'
                });
            } else {
                client.connect(err => {
                    const collection = client.db("forpost").collection("items")
                    console.log(" Mongoose is connected ")

                    collection.insertOne({
                        id: req.body.id,
                        name: req.body.name,
                        pic: req.body.pic,
                        category: req.body.category,
                        group: req.body.group,
                        description: req.body.description
                    },
                    function (err, item) {
                        if (err) {
                            return res.send({error: 'Server error'});
                        } else {
                            client.close();
                            return res.send(item);
                        }
                    });
                });
            }
        });
    })

    .post('/api/items/delete', function (req, res) {
        var agent = req.body.authorization;

        jwt.verify(agent, secret, function (err, decoded) {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: 'No token provided.'
                });
            } else {
                client.connect(err => {
                    const collection = client.db("forpost").collection("items")
                    console.log(" Mongoose is connected ")

                    collection.deleteOne({
                        "id": req.body.id
                    },
                    function (err) {
                        if (err) {
                            return res.send({error: 'Server error'});
                        } else {
                            console.log('Item with id: ', req.body.id, ' was removed');
                            return res.send({text: 'Item with id: ' + req.body.id + ' was removed'});
                        }
                    });
                })
            }
        })
    })

//------------------------------------------------------------------------
    .get('/api/users/get', function (req, res) {
        client.connect(err => {
            const collection = client.db("forpost").collection("users")
            console.log(" Mongoose is connected ")

            collection.find({}).sort({'_name': -1}).toArray(function(err, result) {
                if (!err) {
                    console.log('length - ', result.length);
                    client.close();
                    return res.send(result);
                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            });

        });
    })

    .post('/api/users/add', function (req, res) {
        var agent = req.body.authorization;

        jwt.verify(agent, secret, function (err, decoded) {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: 'No token provided.'
                });
            } else {
                client.connect(err => {
                    const collection = client.db("forpost").collection("users")
                    console.log(" Mongoose is connected ")

                    collection.insertOne({
                            id: req.body.id,
                            name: req.body.name,
                            pass: req.body.pass,
                            description: req.body.description
                        },
                        function (err, item) {
                            if (err) {
                                return res.send({error: 'Server error'});
                            } else {
                                client.close();
                                return res.send(item);
                            }
                        });
                });
            }
        });
    })

    .post('/api/users/update', function (req, res) {
        client.connect(err => {
            const collection = client.db("forpost").collection("users")
            console.log(" Mongoose is connected ")

            collection.updateOne({id: req.body.id}, { $set : {
                    name: req.body.name,
                    pass: req.body.pass,
                    description: req.body.description
                } }, function (err, item) {
                if (!err) {
                    client.close();
                    return res.send(item);

                } else {
                    res.statusCode = 500;
                    return res.send({error: 'Server error'});
                }
            });

        });
    })

    .post('/api/users/delete', function (req, res) {
        var agent = req.body.authorization;

        jwt.verify(agent, secret, function (err, decoded) {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: 'No token provided.'
                });
            } else {
                client.connect(err => {
                    const collection = client.db("forpost").collection("users")
                    console.log(" Mongoose is connected ")

                    collection.deleteOne({
                            "id": req.body.id
                        },
                        function (err) {
                            if (err) {
                                return res.send({error: 'Server error'});
                            } else {
                                console.log('Item with id: ', req.body.id, ' was removed');
                                return res.send({text: 'Item with id: ' + req.body.id + ' was removed'});
                            }
                        });
                })
            }
        })
    })

//------------------------------------------------------------------------
    .get('/api/audit/get', function (req, res) {
        var agent = req.headers.authorization;

        jwt.verify(agent, secret, function (err, decoded) {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: 'No token provided.'
                });
            } else {
                client.connect(err => {
                    const collection = client.db("forpost").collection("audit")
                    console.log(" Mongoose is connected ")

                    collection.find({}).sort({ id: -1}).toArray(function(err, result) {
                        if (!err) {
                            console.log('length - ', result.length);
                            client.close();
                            return res.send(result);
                        } else {
                            res.statusCode = 500;
                            return res.send({error: 'Server error'});
                        }
                    });

                });
            }
        });
    })

//------------------------------------------------------------------------
    .get('/api/auth', (req, res) => res.send({token: token}))

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