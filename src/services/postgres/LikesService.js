const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { nanoid } = require('nanoid');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async likeAlbum(userId, albumId) {
    await this.verifyAlbumExists(albumId);

    const queryCheck = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const resultCheck = await this._pool.query(queryCheck);

    if (resultCheck.rowCount > 0) {
      throw new InvariantError('Anda sudah menyukai album ini');
    }

    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES($1, $2, $3)',
      values: [id, userId, albumId],
    };
    await this._pool.query(query);

    await this._cacheService.delete(`album_likes:${albumId}`);
  }

  async unlikeAlbum(userId, albumId) {
    await this.verifyAlbumExists(albumId);

    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Anda belum menyukai album ini');
    }

    await this._cacheService.delete(`album_likes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try {
      const cachedLikes = await this._cacheService.get(`album_likes:${albumId}`);
      return { likes: parseInt(cachedLikes, 10), fromCache: true };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const likes = parseInt(result.rows[0].count, 10);
  
      await this._cacheService.set(`album_likes:${albumId}`, likes.toString(), 1800);
      return { likes, fromCache: false };
    }
  }
  

  async verifyAlbumExists(albumId) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = LikesService;
