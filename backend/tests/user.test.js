import chaiHttp from 'chai-http'
import chaiPkg from 'chai'
import server from '../server.js'
import User from '../models/User.module.js'

const { use, expect } = chaiPkg
use(chaiHttp)

describe('User API - Full Suite', () => {
  let userToken
  let adminToken
  let userId
  let adminId

  const testUser = {
    name: 'Normal User',
    email: 'normal@example.com',
    password: 'testpass123',
    role: 'user',
  }

  const testAdmin = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpass123',
    role: 'admin',
  }

  const loginUser = {
    email: testUser.email,
    password: testUser.password,
    role: 'user',
  }

  const loginAdmin = {
    email: testAdmin.email,
    password: testAdmin.password,
    role: 'admin',
  }

  before(async () => {
    await User.deleteMany({})
  })

  describe('POST /api/users/register - Failures & Success', () => {
    it('should fail if fields are missing', (done) => {
      chai
        .request(server)
        .post('/api/users/register')
        .send({ email: 'incomplete@example.com' })
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('success', false)
          done()
        })
    })

    it('should register a user successfully', (done) => {
      chai
        .request(server)
        .post('/api/users/register')
        .send(testUser)
        .end((err, res) => {
          expect(res).to.have.status(200)
          userId = res.body.user._id
          done()
        })
    })

    it('should register an admin successfully', (done) => {
      chai
        .request(server)
        .post('/api/users/register')
        .send(testAdmin)
        .end((err, res) => {
          expect(res).to.have.status(200)
          adminId = res.body.user._id
          done()
        })
    })

    it('should fail to register duplicate email', (done) => {
      chai
        .request(server)
        .post('/api/users/register')
        .send(testUser)
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('success', false)
          done()
        })
    })
  })

  describe('POST /api/users/login', () => {
    it('should login user and return token', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(loginUser)
        .end((err, res) => {
          expect(res).to.have.status(200)
          userToken = res.body.token
          done()
        })
    })

    it('should login admin and return token', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send(loginAdmin)
        .end((err, res) => {
          expect(res).to.have.status(200)
          adminToken = res.body.token
          done()
        })
    })

    it('should fail login with wrong password', (done) => {
      chai
        .request(server)
        .post('/api/users/login')
        .send({ ...loginUser, password: 'wrongpass' })
        .end((err, res) => {
          expect(res).to.have.status(400)
          done()
        })
    })
  })

  describe('GET /api/users/current', () => {
    it('should return user info', (done) => {
      chai
        .request(server)
        .get('/api/users/current')
        .set('Authorization', userToken)
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('email', testUser.email)
          done()
        })
    })
  })

  describe('PUT /api/users/:id - Permission checks', () => {
    it('should prevent normal user from updating admin', (done) => {
      chai
        .request(server)
        .put(`/api/users/${adminId}`)
        .set('Authorization', userToken)
        .send({ name: 'Hacked Name' })
        .end((err, res) => {
          expect(res).to.have.status(403)
          done()
        })
    })

    it('should allow admin to update user', (done) => {
      chai
        .request(server)
        .put(`/api/users/${userId}`)
        .set('Authorization', adminToken)
        .send({ name: 'Updated by Admin' })
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body.user).to.have.property('name', 'Updated by Admin')
          done()
        })
    })
  })

  describe('DELETE /api/users/:id - Admin only', () => {
    it('should prevent user from deleting another user', (done) => {
      chai
        .request(server)
        .delete(`/api/users/${adminId}`)
        .set('Authorization', userToken)
        .end((err, res) => {
          expect(res).to.have.status(403)
          done()
        })
    })

    it('should allow admin to delete user', (done) => {
      chai
        .request(server)
        .delete(`/api/users/${userId}`)
        .set('Authorization', adminToken)
        .end((err, res) => {
          expect(res).to.have.status(200)
          done()
        })
    })
  })
})
