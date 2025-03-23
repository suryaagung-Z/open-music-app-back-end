const { Pool } = require('pg');
const { nanoid } = require('nanoid');

class PlaylistActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity(playlistId, userId, songId, action) {
    const id = `activity-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, userId, songId, action, new Date()],
    };
    await this._pool.query(query);
  }

  async getActivitiesByPlaylistId(playlistId) {
    const query = {
      text: `
        SELECT users.username, songs.title, playlist_activities.action, playlist_activities.time
        FROM playlist_activities
        JOIN users ON playlist_activities.user_id = users.id
        JOIN songs ON playlist_activities.song_id = songs.id
        WHERE playlist_activities.playlist_id = $1
        ORDER BY playlist_activities.time ASC`,
      values: [playlistId],
    };
  
    const result = await this._pool.query(query);
    return result.rows;
  }
  
}

module.exports = PlaylistActivitiesService;
