require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const config = require('./utils/config');
const path = require('path');

const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications');

const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

const playlistActivities = require('./api/playlist-activities');
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesService');

const CacheService = require('./services/redis/CacheService');

const LikesService = require('./services/postgres/LikesService');

const StorageService = require('./services/storage/StorageService');

const UploadsValidator = require('./validator/uploads');

const ClientError = require('./exceptions/ClientError');
const TokenManager = require('./tokenize/TokenManager');

const init = async () => {
  const cacheService = new CacheService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const collaborationsService = new CollaborationsService();
  const playlistActivitiesService = new PlaylistActivitiesService();
  const playlistsService = new PlaylistsService(collaborationsService, playlistActivitiesService);
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const likesService = new LikesService(cacheService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/albums/uploads'));

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: config.token.access,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.token.age,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });
  
  await server.register([
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        service: authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        albumsValidator: AlbumsValidator,
        uploadsValidator: UploadsValidator,
        storageService, 
        likesService,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        service: collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },    
    {
      plugin: playlistActivities,
      options: {
        service: playlistActivitiesService,
        playlistsService,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    }, 
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
  
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }
  
    if (!response.isServer) {
      return h.continue;
    }
  
    const newResponse = h.response({
      status: 'error',
      message: 'Terjadi kegagalan pada server kami.',
    });
    newResponse.code(500);
    return newResponse;
  });
  

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();