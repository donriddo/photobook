const express = require('express');
const path = require('path');
const multiparty = require('connect-multiparty')({
  uploadDir: path.join(__dirname, '/../../public/uploads')
});
const ctrl = require('./controller');
const isAuthenticated = require('../../middlewares/isAuthenticated');

const router = express.Router();

router.route('/')
  .get(ctrl.list);
router.route('/:id')
  .all(isAuthenticated)
  .get(ctrl.read)
  .put(multiparty, ctrl.update)
  .delete(ctrl.remove);
router.post('/', isAuthenticated, multiparty, ctrl.create)
router.post('/comment', isAuthenticated, ctrl.comment);

module.exports = router;
