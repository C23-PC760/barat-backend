const autoBind = require('auto-bind');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;
    
    autoBind(this);
  }
  
  async postAuthenticationHandler({ payload }, h) {
    this._validator.validatePostAuthenticationPayload(payload);
    const { username, password } = payload;
    
    // eslint-disable-next-line max-len
    const { id, role } = await this._usersService.verifyUserCredential(username, password);
    
    const accessToken = this._tokenManager.generateAcessToken({ id, role });
    const refreshToken = this._tokenManager.generateRefreshToken({ id, role });
    
    await this._authenticationsService.addRefreshToken(refreshToken);
    
    const response = h.response({
      status: 'success',
      message: 'Login berhasil',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }
  
  async putAuthenticationHandler({ payload }) {
    this._validator.validatePutAuthenticationPayload(payload);
    
    const { refreshToken } = payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { id, role } = this._tokenManager.verifyRefreshToken(refreshToken);
    
    const accessToken = this._tokenManager.generateAcessToken({ id, role });
    
    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }
  
  async deleteAuthenticationHandler({ payload }) {
    this._validator.validateDeleteAuthenticationPayload(payload);
    
    const { refreshToken } = payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);
    
    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
};

module.exports = AuthenticationsHandler;
