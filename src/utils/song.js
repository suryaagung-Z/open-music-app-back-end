const mapDBToSongModelForList = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

const mapDBToSongModelForDetail = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

module.exports = {
  mapDBToSongModelForList,
  mapDBToSongModelForDetail,
};