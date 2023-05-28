const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }
  
  async addUser(payload) {
    const { username, password, fullname, role } = payload;
    await this.verifyNewUsername(username);
    
    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, username, hashedPassword, fullname, role],
    };
    
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('User gagal ditambahkan');
    }
    
    return result.rows[0].id;
  }
  
  async getUserById(id) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [id],
    };
    
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('User tidak ditemukan');
    }
    
    return result.rows[0];
  }
  
  async deleteUserById(id) {
    const query = {
      text: 'DELETE FROM users WHERE id = $1 RETURNING id',
      values: [id],
    };
    
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Id tidak ditemukan');
    }
  }
  
  /* verify */
  
  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };
    
    const result = await this._pool.query(query);
    
    if (result.rowCount > 0) {
      throw new InvariantError('Username sudah digunakan.');
    }
  }
  
  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password, role FROM users WHERE username = $1',
      values: [username],
    };
    
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new AuthenticationError('Username tidak valid.');
    }
    
    const { id, password: hashedPassword, role } = result.rows[0];
    
    const match = bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new AuthenticationError('Password tidak sesuai.');
    }
    
    return { id, role };
  }
};

module.exports = UsersService;
