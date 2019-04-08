const Picture = require('./model');
const Comment = require('../comment/model');

module.exports = {
  create: function (req, res) {
    if (!req.files.image) return res.status(400).json({ message: 'Please upload an image' });
    Picture.create(Object.assign(
      { user: req.user._id },
      req.body,
      { url: `/uploads/${req.files.image.path.split('/').splice(-1)[0]}` }
    ))
    .then(picture => {
      io.emit('newPicture', picture);
      return res.status(201).json(picture);
    }).catch(err => {
      console.log(err);
      if (err.code === 11000)
        return res.status(400).json({ message: "Validation error has occured", reason: "Email exists" });
      return res.status(400).json(err);
    });
  },
  comment: function (req, res) {
    Picture.findById(req.body.picture).where('isDeleted', false)
    .populate({ path: 'user', match: { isDeleted: false }}).then(async picture => {
      if (!picture) return false;
      const comment = new Comment({ picture: picture._id, text: req.body.text, user: req.user._id })
      await comment.save();
      picture.comments.push(comment);
      return picture.save();
    })
    .then(picture => {
      if (!picture) return res.status(404).json({ message: 'Picture not found' });
      io.emit('newPictureComment', picture);
      return res.status(200).json(picture);
    })
    .catch(err => {
      console.log(err);
      return res.status(404).json(err);
    });
  },
  read: function (req, res) {
    Picture.findById(req.params.id).where('isDeleted', false)
    .populate({ path: 'user', match: { isDeleted: false }}).populate({ path: 'comments', match: { isDeleted: false }}).then(picture => {
      if (!picture) return res.status(404).json({ message: 'Picture not found' });
      return res.status(200).json(picture);
    }).catch(err => {
      console.log(err);
      return res.status(404).json(err);
    });
  },
  list: function (req, res) {
    Picture.find({ isDeleted: false })
    .populate({ path: 'user', match: { isDeleted: false }})
    .populate({ path: 'comments', match: { isDeleted: false }}).then(pictures => {
      return res.status(200).json(pictures);
    }).catch(err => {
      console.log(err);
      return res.status(404).json(err);
    });
  },
  update: function (req, res) {
    Picture.findById(req.params.id).where('isDeleted', false).then(picture => {
      if (!picture) return false;
      Object.keys(req.body).forEach(key => {
        picture[key] = req.body[key];
      });
      return picture.save();
    }).then(picture => {
      if (!picture) return res.status(404).json({ message: 'Picture not found' });
      return res.status(200).json(picture);
    }).catch(err => {
      console.log(err);
      return res.status(400).json(err);
    })
  },
  remove: function (req, res) {
    Picture.findById(req.params.id).where('isDeleted', false).then(picture => {
      if (!picture) return false;
      picture.isDeleted = true;
      return picture.save();
    }).then(picture => {
      if (!picture) return res.status(404).json({ message: 'Picture not found' });
      return res.status(200).json(picture);
    }).catch(err => {
      console.log(err);
      return res.status(400).json(err);
    })
  }
};
