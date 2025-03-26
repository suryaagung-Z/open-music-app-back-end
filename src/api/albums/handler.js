const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, albumsValidator, uploadsValidator, storageService, likesService) {
    this._service = service;
    this._albumsValidator = albumsValidator;
    this._uploadsValidator = uploadsValidator;
    this._storageService = storageService;
    this._likesService = likesService;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._albumsValidator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    return h.response({
      status: 'success',
      data: {
        albumId,
      },
    }).code(201);
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._albumsValidator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async uploadAlbumCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;
  
    this._uploadsValidator.validateImageHeaders(cover.hapi.headers);
  
    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const coverUrl = `http://${request.info.host}/albums/covers/${filename}`;
  
    await this._service.updateAlbumCover(id, coverUrl);
  
    return h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    }).code(201);
  }  

  async postLikeAlbumHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._likesService.likeAlbum(userId, albumId);
    return h.response({
      status: 'success',
      message: 'Album berhasil disukai',
    }).code(201);
  }

  async deleteLikeAlbumHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._likesService.unlikeAlbum(userId, albumId);
    return h.response({
      status: 'success',
      message: 'Batal menyukai album',
    }).code(200);
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { likes, fromCache } = await this._likesService.getAlbumLikes(albumId); // 🔹 Pastikan menggunakan "fromCache"
  
    const response = h.response({
      status: 'success',
      data: { likes },
    });
  
    if (fromCache) {
      response.header('X-Data-Source', 'cache');
    }
  
    return response;
  }  
  
}

module.exports = AlbumsHandler;
