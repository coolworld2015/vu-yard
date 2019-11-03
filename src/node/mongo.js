var mongoose = require('mongoose');

var options = { server: { socketOptions: { connectTimeoutMS: 60000 }}};

mongoose.connect('mongodb://admin:admin1@ds241268.mlab.com:41268/jwt-yard', options);
//mongoose.connect('mongodb://localhost:27017/chat'); //TODO ONLY for Local INSTANCE MongoDB

var db = mongoose.connection;

db.on('error', function (err) {
    console.log('Error from mongoDB: ' + err.message);
});

db.once('open', function callback() {
    console.log('Connected to mongoDB');
});

var Schema = mongoose.Schema;

//---------------------------------------------------------------------------------------------
var Vehicles = new Schema({
    id: {type: String, required: true},
    vehicleOid: {type: String, required: true},
    transportCompanyName: {type: String, required: true},
    plateNo: {type: String, required: true},
    arrival: {type: String, required: true},
    departure: {type: String, required: true},
    docking: {type: String, required: true},
    undocking: {type: String, required: true},
    status: {type: String, required: true},
    standing: {type: String, required: true},
    cargoUnitStatus: {type: String, required: true},
    message: {type: String, required: true}
});

var VehiclesModel = mongoose.model('Vehicles', Vehicles);
module.exports.VehiclesModel = VehiclesModel;

//---------------------------------------------------------------------------------------------
var Gates = new Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
    status: {type: String, required: true},
    message: {type: String, required: true}
});

var GatesModel = mongoose.model('Gates', Gates);
module.exports.GatesModel = GatesModel;

//---------------------------------------------------------------------------------------------
var Messages = new Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
    date: {type: String, required: true},
    message: {type: String, required: true}
});

var MessagesModel = mongoose.model('Messages', Messages);
module.exports.MessagesModel = MessagesModel;

//---------------------------------------------------------------------------------------------
var Users = new Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
    pass: {type: String, required: true},
    description: {type: String, required: true}
});

var UsersModel = mongoose.model('Users', Users);
module.exports.UsersModel = UsersModel;

//---------------------------------------------------------------------------------------------
var Audit = new Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
    date: {type: String, required: true},
    ip: {type: String, required: true},
    description: {type: String, required: true}
});

var AuditModel = mongoose.model('Audit', Audit);
module.exports.AuditModel = AuditModel;