const express = require('express');
const ctrl = require('./controller');
const isAuthenticated = require('../../middlewares/isAuthenticated');

const router = express.Router();

router.route('/')
  .get(ctrl.list);
router.route('/:id')
  .all(isAuthenticated)
  .get(ctrl.read)
  .put(ctrl.update)
  .delete(ctrl.remove);
router.post('/', isAuthenticated, ctrl.create);
router.post('/reply', isAuthenticated, ctrl.reply);

module.exports = router;
