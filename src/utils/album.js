const mapDBToAlbumListModel = ({
  id,
  name,
  year,
}) => ({
  id,
  name,
  year,
});

const mapDBToAlbumDetailModel = ({
  id,
  name,
  year,
  songs,
}) => ({
  id,
  name,
  year,
  songs,
});

module.exports = { mapDBToAlbumListModel, mapDBToAlbumDetailModel };
