const mongoose = require('mongoose');
const genericPlugin = require('../../helpers/generic-plugin');
const picturePlugin = require('./plugin');

mongoose.Promise = require('bluebird');

const picture = new mongoose.Schema({

  url: { type: String, required: true },

  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },

  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }],

}, { usePushEach: true });

picture.plugin(genericPlugin);

picture.plugin(picturePlugin);

module.exports = mongoose.model('picture', picture);
