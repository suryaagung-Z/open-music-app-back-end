const mapDBToAlbumListModel = ({
  id,
  name,
  year,
  cover,
}) => ({
  id,
  name,
  year,
  coverUrl: cover || null,
});

const mapDBToAlbumDetailModel = ({
  id,
  name,
  year,
  cover,
  songs,
}) => ({
  id,
  name,
  year,
  coverUrl: cover || null,
  songs,
});

module.exports = { mapDBToAlbumListModel, mapDBToAlbumDetailModel };