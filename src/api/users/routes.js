const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: handler.getUserByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/users/{id}',
    handler: handler.deleteUserByIdHandler,
  },
];

module.exports = routes;
