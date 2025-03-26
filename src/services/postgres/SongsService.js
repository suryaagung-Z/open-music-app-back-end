const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToSongModelForList, mapDBToSongModelForDetail } = require('../../utils/song');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    if (albumId) {
      const albumQuery = {
        text: 'SELECT id FROM albums WHERE id = $1',
        values: [albumId],
      };
      const albumResult = await this._pool.query(albumQuery);
      if (!albumResult.rows.length) {
        throw new NotFoundError('Album tidak ditemukan');
      }
    }
  
    const id = `song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };
  
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
    return result.rows[0].id;
  }
  

  async getSongs(filters = {}) {
    let queryText = 'SELECT * FROM songs';
    const queryValues = [];
    const conditions = [];

    if (filters) {
      Object.keys(filters).forEach((key, index) => {
        conditions.push(`${key} ILIKE $${index + 1}`);
        queryValues.push(`%${filters[key]}%`);
      });

      if (conditions.length > 0) {
        queryText += ' WHERE ' + conditions.join(' AND ');
      }
    }

    const result = await this._pool.query({
      text: queryText,
      values: queryValues,
    });
    return result.rows.map(mapDBToSongModelForList);
  }


  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    return result.rows.map(mapDBToSongModelForDetail)[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;