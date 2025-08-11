const request = require('supertest');
const { app } = require('./server');

describe('GET /health', function() {
  it('responds with json containing a status of OK', function(done) {
    request(app)
      .get('/health')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body).toHaveProperty('status', 'OK');
        done();
      });
  });
});