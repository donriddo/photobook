const mongoose = require('mongoose');
const chai = require('chai');
const _ = require('lodash');
const chaiHTTP = require('chai-http');
const expect = chai.expect;
const app = require('../../app.test');
chai.use(chaiHTTP);
let token;
let id;

const commentUserObj = {
    email: "login@user.com",
    password: "dummy"
};

const commentObj = {
    text: "dummy@comment.com",
    user: "dummy"
};

describe('Comment service', function () {
  after(function (done) {
    if (mongoose.connection.db.databaseName === 'photobook_test') {
        console.log('Dropping Test Database...');
        mongoose.connection.db.dropDatabase(done);
    }
  });

  describe('#Create', () => {
    it('should return 401: You need to be logged in to post a', (done) => {
      chai.request(app)
        .post('/api/comment')
        .set('Accept', 'application/json')
        .send({})
        .end((err, res) => {
            expect(res).to.have.status(401);
            expect(res.body).to.have.property('response');
            expect(res.body.response).to.have.property('message');
            expect(res.body.response.message).to.equal('No Authorization header was found');
            done();
        });
    });

    it('should return 201: User created', (done) => {
        chai.request(app)
          .post('/api/user')
          .set('Accept', 'application/json')
          .send(commentUserObj)
          .end((err, res) => {
            expect(res).to.have.status(201);
            expect(res.body).to.have.property('email');
            expect(res.body.email).to.equal('login@user.com');
            id = res.body._id;
            done();
          });
      });

    it('should return 200, Login successfully', (done) => {
        chai.request(app)
          .post('/api/login')
          .send(commentUserObj)
          .set('Accept', 'application/json')
          .end((err, res) => {
            token = res.body.token;
            id = res.body.user._id;
            commentObj.user = id;
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('token');
            expect(res.body.token).to.be.a('string');
            done();
          });
      });

    it('should return 400: Text and User are required', (done) => {
        chai.request(app)
          .post('/api/comment')
          .set('Authorization', 'Bearer '.concat(token))
          .send({})
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body).to.have.property('name');
            expect(res.body.name).to.equal('ValidationError');
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.include('comment validation failed');
            expect(res.body).to.have.property('errors');
            expect(res.body.errors).to.be.an('object');
            expect(res.body.errors).to.have.all.keys('text', 'user');
            expect(res.body.errors.text).to.be.an('object');
            expect(res.body.errors.text).to.have.all.keys(
              'message', 'name', 'properties', 'kind', 'path', '$isValidatorError'
            );
            expect(res.body.errors.user).to.be.an('object');
            expect(res.body.errors.user).to.have.all.keys(
              'message', 'name', 'properties', 'kind', 'path', '$isValidatorError'
            );
            done();
          });
      });

    it('should return 400: Text is required', (done) => {
      chai.request(app)
        .post('/api/comment')
        .set('Authorization', 'Bearer '.concat(token))
        .send(_.omit(commentObj, 'text'))
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('name');
          expect(res.body.name).to.equal('ValidationError');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('comment validation failed');
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.be.an('object');
          expect(res.body.errors).to.have.all.keys('text');
          expect(res.body.errors.text).to.be.an('object');
          expect(res.body.errors.text).to.include.keys(
            'message', 'name', 'properties', 'kind', 'path'
          );
          done();
        });
    });

    it('should return 400: User is required', (done) => {
      chai.request(app)
        .post('/api/comment')
        .set('Authorization', 'Bearer '.concat(token))
        .send(_.omit(commentObj, 'user'))
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('name');
          expect(res.body.name).to.equal('ValidationError');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.include('comment validation failed');
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.be.an('object');
          expect(res.body.errors).to.have.all.keys('user');
          expect(res.body.errors.user).to.be.an('object');
          expect(res.body.errors.user).to.include.keys(
            'message', 'name', 'properties', 'kind', 'path'
          );
          done();
        });
    });

    it('should return 201: Comment created', (done) => {
      chai.request(app)
        .post('/api/comment')
        .set('Authorization', 'Bearer '.concat(token))
        .send(commentObj)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('text');
          expect(res.body.text).to.equal('dummy@comment.com');
          id = res.body._id;
          done();
        });
    });

  });

  describe('#Read', () => {
    it('should return 200, Comments retrieved successfully', (done) => {
      chai.request(app)
        .get(`/api/comment/${id}`)
        .set('Authorization', 'Bearer '.concat(token))
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('_id');
          expect(res.body._id).to.be.a('string');
          done();
        });
    });
  });

  describe('#Update', () => {
    it('should return 404: Comment not found', done => {
      chai.request(app)
        .put('/api/comment/58a58b41ccd50a3f0ec99ee2')
        .set('Authorization', 'Bearer '.concat(token))
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.equal('Comment not found');
          done();
        });
    });

    it('should return 200: Comment updated successfully', done => {
      chai.request(app)
        .put(`/api/comment/${id}`)
        .send(commentObj)
        .set('Authorization', 'Bearer '.concat(token))
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.include.keys('_id', 'text');
          done();
        });
    });
  });

  describe('#Delete', () => {
    it('should return 404: Comment not found', done => {
      chai.request(app)
        .delete('/api/comment/58a58b41ccd50a3f0ec99ee2')
        .set('Authorization', 'Bearer '.concat(token))
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.equal('Comment not found');
          done();
        });
    });

    it('should return 200: Comment Soft-Deleted successfully', done => {
      chai.request(app)
        .delete(`/api/comment/${id}`)
        .set('Authorization', 'Bearer '.concat(token))
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.include.keys('text', 'isDeleted');
          expect(res.body.isDeleted).to.equal(true);
          done();
        });
    });

    it('should return 404: Comment already Soft-Deleted', done => {
      chai.request(app)
        .get(`/api/comment/${id}`)
        .set('Authorization', 'Bearer '.concat(token))
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.equal('Comment not found');
          done();
        });
    });

    it('should return 404: Cannot update deleted comment', done => {
      chai.request(app)
        .put(`/api/comment/${id}`)
        .set('Authorization', 'Bearer '.concat(token))
        .send(commentObj)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.equal('Comment not found');
          done();
        });
    });

  });

});
