const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists/{playlistId}/songs',
    handler: handler.getPlaylistSongsHandler,
    options: { auth: 'openmusic_jwt' },
  },
  {
    method: 'POST',
    path: '/playlists/{playlistId}/songs',
    handler: handler.postSongToPlaylistHandler,
    options: { auth: 'openmusic_jwt' },
  },  
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.postPlaylistHandler,
    options: { auth: 'openmusic_jwt' },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getPlaylistsHandler,
    options: { auth: 'openmusic_jwt' },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: handler.deletePlaylistHandler,
    options: { auth: 'openmusic_jwt' },
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}/songs',
    handler: handler.deleteSongFromPlaylistHandler,
    options: { auth: 'openmusic_jwt' },
  },
  
];

module.exports = routes;
