const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (
    server, 
    { 
      service, 
      albumsValidator, 
      uploadsValidator,
      storageService, 
      likesService 
    }) => {
    const albumsHandler = new AlbumsHandler(
      service, 
      albumsValidator,
      uploadsValidator,
      storageService, 
      likesService
    );
    server.route(routes(albumsHandler));
  },
};
