'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://admin:1314@coolworld.obhth.mongodb.net/";
//const uri = "mongodb://localhost:27017/base09";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//------------------------------------------------------------------------
const jwt = require('jsonwebtoken');
const secret = 'f3oLigPb3vGCg9lgL0Bs97wySTCCuvYdOZg9zqTY32of3oLigPb3vGCg9lgL0Bs97wySTCCuvYdOZg9zqTY32eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjoibWFnaWMiLCJpYXQiOjE1NzMxNTY0OTgsImV4cCI6MTU3MzE2MDA5OH0.uUlMkCQKt3U0OWvjBzAZEaa3V49g1AbuVOufNx-g4F0of3oLigPb3vGCg9lgL0Bs97wySTCCuvYdOZg9zqTY32of3oLigPb3vGCg9lgL0Bs97wySTCCuvYdOZg9zqTY32of3oLigPb3vGCg9lgL0Bs97wySTCCuvYdOZg9zqTY32of3oLigPb3vGCg9lgL0Bs97wySTCCuvYdOZg9zqTY32o';
let token = jwt.sign({auth: 'magic'}, secret, {expiresIn: 60 * 60});

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

//------------------------------------------------------------------------
    .post('/api/login', (req, res) => {
        client.connect(err => {
            if (err) {
                console.log('Server error ' + err);
                return res.send({error: 'Server error ' + err});
            } else {
                const collection = client.db("base09").collection("users");
                console.log(" Mongoose is connected ");

                collection.findOne({name: req.body.name}, (err, user) => {
                    console.log('UsersModel ', user);
                    if (err) {
                        res.send({error: err.message});
                    }

                    if (user) {
                        if (user.pass === req.body.pass) {

                            // Audit start
                            const audit = client.db("base09").collection("audit");
                            console.log(" Mongoose is connected ", audit);

                            const d = new Date();
                            d.setHours(d.getHours());
                            const date = d.toJSON().split('T')[0].split('-')[2] + '.' + d.toJSON().split('T')[0].split('-')[1] + '.' + d.toJSON().split('T')[0].split('-')[0];
                            const time = d.toTimeString().slice(0, 8);

                            audit.insertOne({
                                    id: +new Date(),
                                    name: req.body.name,
                                    date: date + ' ' + time,
                                    ip: req.ip,
                                    description: req.body.description
                                },
                                (err) => {
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
            }
        })

    })

//------------------------------------------------------------------------
    .get('/api/items/get', (req, res) => {
        client.connect(err => {
            if (err) {
                console.log('Server error ' + err);
                return res.send({error: 'Server error ' + err});
            } else {
                const collection = client.db("base09").collection("items");
                console.log(" Mongoose is connected ");

                collection.find({}).sort({'_name': 1}).limit(1000).toArray((err, result) => {
                    if (!err) {
                        console.log('length - ', result.length);
                        client.close();
                        return res.send(result);
                    } else {
                        res.statusCode = 500;
                        return res.send({error: 'Server error'});
                    }
                });
            }
        });
    })

    .get('/api/items/getall', (req, res) => {
        client.connect(err => {
            if (err) {
                console.log('Server error ' + err);
                return res.send({error: 'Server error ' + err});
            } else {
                const collection = client.db("base09").collection("items");
                console.log(" Mongoose is connected ");

                collection.find({}).sort({'_id': -1}).toArray((err, result) => {
                    if (!err) {
                        console.log('length - ', result.length);
                        client.close();
                        return res.send(result);
                    } else {
                        res.statusCode = 500;
                        return res.send({error: 'Server error ' + err});
                    }
                });
            }
        });
    })

    .get('/api/items/findByName/:name', (req, res) => {
        client.connect(err => {
            if (err) {
                console.log('Server error ' + err);
                return res.send({error: 'Server error ' + err});
            } else {
                const collection = client.db("base09").collection("items");
                console.log(" Mongoose is connected ");

                collection.find({"name": new RegExp(req.params.name, 'i')}).limit(1000).sort({'_id': -1}).toArray((err, result) => {
                    if (!err) {
                        console.log('length - ', result.length);
                        client.close();
                        return res.send(result);
                    } else {
                        res.statusCode = 500;
                        return res.send({error: 'Server error'});
                    }
                });
            }
        });
    })

    .get('/api/items/findByPhone/:phone', (req, res) => {
        client.connect(err => {
            if (err) {
                console.log('Server error ' + err);
                return res.send({error: 'Server error ' + err});
            } else {
                const collection = client.db("base09").collection("items");
                console.log(" Mongoose is connected ");

                collection.find({"phone": new RegExp(req.params.phone, 'i')}).limit(1000).sort({'_id': -1}).toArray((err, result) => {
                    if (!err) {
                        console.log('length - ', result.length);
                        client.close();
                        return res.send(result);
                    } else {
                        res.statusCode = 500;
                        return res.send({error: 'Server error'});
                    }
                });
            }
        });
    })

//------------------------------------------------------------------------
    .get('/api/users/get', (req, res) => {
        client.connect(err => {
            if (err) {
                console.log('Server error ' + err);
                return res.send({error: 'Server error ' + err});
            } else {
                const collection = client.db("base09").collection("users");
                console.log(" Mongoose is connected ");

                collection.find({}).sort({'_name': -1}).toArray((err, result) => {
                    if (!err) {
                        console.log('length - ', result.length);
                        client.close();
                        return res.send(result);
                    } else {
                        res.statusCode = 500;
                        return res.send({error: 'Server error'});
                    }
                });
            }
        });
    })

    .post('/api/users/add', (req, res) => {
        const agent = req.body.authorization;

        jwt.verify(agent, secret, (err) => {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: 'No token provided.'
                });
            } else {
                client.connect(err => {
                    if (err) {
                        console.log('Server error ' + err);
                        return res.send({error: 'Server error ' + err});
                    } else {
                        const collection = client.db("base09").collection("users");
                        console.log(" Mongoose is connected ");

                        collection.insertOne({
                                id: req.body.id,
                                name: req.body.name,
                                pass: req.body.pass,
                                description: req.body.description
                            },
                            (err, item) => {
                                if (err) {
                                    return res.send({error: 'Server error'});
                                } else {
                                    client.close();
                                    return res.send(item);
                                }
                            });
                    }
                });
            }
        });
    })

    .post('/api/users/update', (req, res) => {
        client.connect(err => {
            if (err) {
                console.log('Server error ' + err);
                return res.send({error: 'Server error ' + err});
            } else {
                const collection = client.db("base09").collection("users");
                console.log(" Mongoose is connected ");

                collection.updateOne({id: req.body.id}, {
                    $set: {
                        name: req.body.name,
                        pass: req.body.pass,
                        description: req.body.description
                    }
                }, (err, item) => {
                    if (!err) {
                        client.close();
                        return res.send(item);
                    } else {
                        res.statusCode = 500;
                        return res.send({error: 'Server error'});
                    }
                });
            }
        });
    })

    .post('/api/users/delete', (req, res) => {
        const agent = req.body.authorization;

        jwt.verify(agent, secret, (err) => {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: 'No token provided.'
                });
            } else {
                client.connect(err => {
                    if (err) {
                        console.log('Server error ' + err);
                        return res.send({error: 'Server error ' + err});
                    } else {
                        const collection = client.db("base09").collection("users");
                        console.log(" Mongoose is connected ");

                        collection.deleteOne({
                                "id": req.body.id
                            },
                            (err) => {
                                if (err) {
                                    return res.send({error: 'Server error'});
                                } else {
                                    console.log('Item with id: ', req.body.id, ' was removed');
                                    return res.send({text: 'Item with id: ' + req.body.id + ' was removed'});
                                }
                            });
                    }
                });
            }
        })
    })

//------------------------------------------------------------------------
    .get('/api/audit/get', (req, res) => {
        const agent = req.headers.authorization;

        jwt.verify(agent, secret, (err) => {
            if (err) {
                return res.status(403).send({
                    success: false,
                    message: 'No token provided.'
                });
            } else {
                client.connect(err => {
                    if (err) {
                        console.log('Server error ' + err);
                        return res.send({error: 'Server error ' + err});
                    } else {
                        const collection = client.db("base09").collection("audit");
                        console.log(" Mongoose is connected ");

                        collection.find({}).sort({id: -1}).toArray((err, result) => {
                            if (!err) {
                                console.log('length - ', result.length);
                                client.close();
                                return res.send(result);
                            } else {
                                res.statusCode = 500;
                                return res.send({error: 'Server error'});
                            }
                        });
                    }
                });
            }
        });
    })

//------------------------------------------------------------------------
    .get('/api/auth', (req, res) => res.send({token: token}))

    .listen(PORT, () => console.log(`Listening on ${PORT}`));

setInterval(() => {
    token = jwt.sign({auth: 'magic'}, secret, {expiresIn: 60 * 60});
}, 1000 * 60 * 60);

//------------------------------------------------------------------------
const SocketServer = require('ws').Server;
const webSocketServer = new SocketServer({server});
let clients = {};

webSocketServer.on('connection', (ws) => {
    const id = +new Date();
    clients[id] = ws;
    console.log('new connection ' + id);

    const timeID = setInterval(() => {
        ws.send('still alive', () => {
        })
    }, 30000);

    ws.on('close', () => {
        console.log('connection closed ' + id);
        delete clients[id];
    });

    ws.on('message', (message) => {
        const date = new Date(+new Date() - (new Date()).getTimezoneOffset() * 60000).toISOString().split('T')[0];
        const time = new Date(+new Date() - (new Date()).getTimezoneOffset() * 60000).toISOString().split('T')[1];
        let now = date + ' ' + time;
        console.log('message received ' + message + '###' + now);
        for (let key in clients) {
            clients[key].send(message + '###' + now);
        }
    });
});

//------------------------------------------------------------------------