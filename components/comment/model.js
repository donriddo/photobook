const mongoose = require('mongoose');
const genericPlugin = require('../../helpers/generic-plugin');
const commentPlugin = require('./plugin');

mongoose.Promise = require('bluebird');

const comment = new mongoose.Schema({

  text: { type: String, required: true },

  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },

  picture: { type: mongoose.Schema.Types.ObjectId, ref: 'picture' },

  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }],

}, { usePushEach: true });

comment.plugin(genericPlugin);

comment.plugin(commentPlugin);

module.exports = mongoose.model('comment', comment);
