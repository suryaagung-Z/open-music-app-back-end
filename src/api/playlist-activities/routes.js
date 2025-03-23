const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists/{playlistId}/activities',
    handler: handler.getPlaylistActivitiesHandler,
    options: { auth: 'openmusic_jwt' },
  },
];

module.exports = routes;
