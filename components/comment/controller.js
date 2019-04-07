const Comment = require('./model');

module.exports = {
  create: function (req, res) {
    Comment.create(req.body).then(comment => {
      return res.status(201).json(comment);
    }).catch(err => {
      console.log(err);
      if (err.code === 11000)
        return res.status(400).json({ message: "Validation error has occured", reason: "Email exists" });
      return res.status(400).json(err);
    });
  },
  read: function (req, res) {
    Comment.findById(req.params.id).where('isDeleted', false)
    .populate('user').populate('replies').then(comment => {
      if (!comment) return res.status(404).json({ message: 'Comment not found' });
      return res.status(200).json(comment);
    }).catch(err => {
      console.log(err);
      return res.status(404).json(err);
    });
  },
  list: function (req, res) {
    Comment.find({ isDeleted: false })
    .populate('user').populate('replies').then(comments => {
      return res.status(200).json(comments);
    }).catch(err => {
      console.log(err);
      return res.status(404).json(err);
    });
  },
  update: function (req, res) {
    Comment.findById(req.params.id).where('isDeleted', false).then(comment => {
      if (!comment) return false;
      Object.keys(req.body).forEach(key => {
        comment[key] = req.body[key];
      });
      return comment.save();
    }).then(comment => {
      if (!comment) return res.status(404).json({ message: 'Comment not found' });
      return res.status(200).json(comment);
    }).catch(err => {
      console.log(err);
      return res.status(400).json(err);
    })
  },
  remove: function (req, res) {
    Comment.findById(req.params.id).where('isDeleted', false).then(comment => {
      if (!comment) return false;
      comment.isDeleted = true;
      return comment.save();
    }).then(comment => {
      if (!comment) return res.status(404).json({ message: 'Comment not found' });
      return res.status(200).json(comment);
    }).catch(err => {
      console.log(err);
      return res.status(400).json(err);
    })
  }
};
