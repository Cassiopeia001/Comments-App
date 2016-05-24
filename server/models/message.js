/**
 * Created by Ron on 23/05/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var messageSchema = mongoose.Schema({
    mail: String,
    msg: String,
    created: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Message', messageSchema);