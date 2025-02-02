const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToAlbumListModel, mapDBToAlbumDetailModel } = require('../../utils/album');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(mapDBToAlbumListModel);
  }


  async getAlbumById(id) {
    const query = {
      text: `
        SELECT 
          a.id, a.name, a.year, 
          s.id AS song_id, s.title AS song_title, s.performer AS song_performer
        FROM albums a
        LEFT JOIN songs s ON a.id = s.album_id
        WHERE a.id = $1
      `,
      values: [id],
    };
  
    const result = await this._pool.query(query);
  
    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  
    const songs = result.rows
    .filter(row => row.song_id)
    .map(row => ({
      id: row.song_id,
      title: row.song_title,
      performer: row.song_performer,
    }));
  
    result.rows[0].songs = songs;
  
    return result.rows.map(mapDBToAlbumDetailModel)[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;