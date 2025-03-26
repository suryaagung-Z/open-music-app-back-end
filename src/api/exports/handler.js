const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { targetEmail } = request.payload;
  
    console.log(`🔹 Mengirim ekspor untuk Playlist ID: ${playlistId}, Email: ${targetEmail}`);
  
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.sendMessage('export:playlist', JSON.stringify({ playlistId, targetEmail }));
  
    return h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    }).code(201);
  }
  
}

module.exports = ExportsHandler;
