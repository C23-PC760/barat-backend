const autoBind = require('auto-bind');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    
    autoBind(this);
  }
  
  async postUserHandler({ payload }, h) {
    this._validator.validateUserPayload(payload);
    
    const userId = await this._service.addUser(payload);
    
    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahakan',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }
  
  async getUserByIdHandler({ params }) {
    const user = await this._service.getUserById(params.id);
    
    return {
      status: 'success',
      data: {
        user,
      },
    };
  }
  
  async deleteUserByIdHandler({ params }) {
    await this._service.deleteUserById(params.id);
    
    return {
      status: 'success',
      message: 'User berhasil di hapus',
    };
  }
};

module.exports = UsersHandler;
