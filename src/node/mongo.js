var mongoose = require('mongoose');

var options = { server: { socketOptions: { connectTimeoutMS: 60000 }}};

//mongoose.connect('mongodb://admin:admin1@ds241268.mlab.com:41268/jwt-yard', options);
mongoose.connect('mongodb://localhost:27017/forpost'); //TODO ONLY for Local INSTANCE MongoDB

var db = mongoose.connection;

db.on('error', function (err) {
    console.log('Error from mongoDB: ' + err.message);
});

db.once('open', function callback() {
    console.log('Connected to mongoDB');
});

var Schema = mongoose.Schema;

//---------------------------------------------------------------------------------------------
var Items = new Schema({
    id: {type: String, required: true},
    pic: {type: String, required: true},
    name: {type: String, required: true},
    category: {type: String, required: true},
    group: {type: String, required: true},
    description: {type: String, required: true}
});

var ItemsModel = mongoose.model('Items', Items);
module.exports.ItemsModel = ItemsModel;

//---------------------------------------------------------------------------------------------
var Vehicles = new Schema({
    id: {type: String, required: true},
    vehicleOid: {type: String, required: true},
    plateNo: {type: String, required: true},
    companyName: {type: String, required: true},
    arrived: {type: String, required: true},
    booked: {type: String, required: true},
    docked: {type: String, required: true},
    undocked: {type: String, required: true},
    departed: {type: String, required: true},
    standing: {type: String, required: true},
    status: {type: String, required: true},
    message: {type: String, required: true}
});

var VehiclesModel = mongoose.model('Vehicles', Vehicles);
module.exports.VehiclesModel = VehiclesModel;

//---------------------------------------------------------------------------------------------
var Locations = new Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
    vehicle: {type: String, required: true},
    status: {type: String, required: true},
    message: {type: String, required: true}
});

var LocationsModel = mongoose.model('Locations', Locations);
module.exports.LocationsModel = LocationsModel;

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

//---------------------------------------------------------------------------------------------
var Operations = new Schema({
    id: {type: String, required: true},
    plateNo: {type: String, required: true},
    status: {type: String, required: true},
    date: {type: String, required: true},
    standing: {type: String, required: true},
});

var OperationsModel = mongoose.model('Operations', Operations);
module.exports.OperationsModel = OperationsModel;

//---------------------------------------------------------------------------------------------
var Targets = new Schema({
    id: {type: String, required: true},
    vehicle: {type: String, required: true},
    lat: {type: String, required: true},
    lng: {type: String, required: true},
    date: {type: String, required: true},
});

var TargetsModel = mongoose.model('Targets', Targets);
module.exports.TargetsModel = TargetsModel;

//---------------------------------------------------------------------------------------------
var Positions = new Schema({
    id: {type: String, required: true},
    vehicle: {type: String, required: true},
    lat: {type: String, required: true},
    lng: {type: String, required: true},
    date: {type: String, required: true},
});

var PositionsModel = mongoose.model('Positions', Positions);
module.exports.PositionsModel = PositionsModel;

//---------------------------------------------------------------------------------------------
var Guests = new Schema({
    id: {type: String, required: true},
    photo: {type: String, required: true},
    name: {type: String, required: true},
    host: {type: String, required: true},
    status: {type: String, required: true},
    date: {type: String, required: true},
});

var GuestsModel = mongoose.model('Guests', Guests);
module.exports.GuestsModel = GuestsModel;

//---------------------------------------------------------------------------------------------
var Journal = new Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
    host: {type: String, required: true},
    status: {type: String, required: true},
    date: {type: String, required: true},
});

var JournalModel = mongoose.model('Journal', Journal);
module.exports.JournalModel = JournalModel;