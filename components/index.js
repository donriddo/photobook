const UserRoutes = require('./user');
const PictureRoutes = require('./picture');
const CommentRoutes = require('./comment');
const Auth = require('./authentication');
const express = require('express');

const router = express.Router();

global._ = require('lodash');

router.get('/health-check', (req, res) => res.send('OK'));

router.use('/user', UserRoutes);

router.use('/picture', PictureRoutes);

router.use('/comment', CommentRoutes);

router.use('/login', Auth);

module.exports = router;
