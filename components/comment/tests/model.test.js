const expect = require('chai').expect;
const _ = require('lodash');

const User = require('../../user/model');
const Comment = require('../model');

const userObj = {
    email: "dummy@user.com",
    password: "dummy",
    name: "Dummy User",
};

const commentObj = {
    text: 'dummy text'
}
 
describe('comment', function() {
    it('should reject with error if body is empty', function(done) {
        var comment = new Comment();
 
        comment.validate(function(err) {
            expect(err.errors.text).to.exist;
            expect(err.errors.user).to.exist;
            done();
        });
    });

    it('should reject with error if user is empty', function(done) {
        var comment = new Comment(commentObj);
 
        comment.validate(function(err) {
            expect(err.errors.text).to.not.exist;
            expect(err.errors.user).to.exist;
            done();
        });
    });

    it('should reject with error if text is empty', function(done) {
        const user = new User(userObj);
        var comment = new Comment(_.omit(Object.assign(commentObj, { user: user._id }), 'text'));
 
        comment.validate(function(err) {
            expect(err.errors.user).to.not.exist;
            expect(err.errors.text).to.exist;
            done();
        });
    });

    it('should validate comment successfully', function(done) {
        const user = new User(userObj);
        var comment = new Comment(Object.assign(commentObj, { user: user._id }));
 
        comment.validate(function(err) {
            expect(err).to.be.a('null')
            done();
        });
    });
});