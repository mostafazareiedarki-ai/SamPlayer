import React from 'react';
import { usePlayer } from '../store/playerStore';

export default function AlbumsView() {
  const { state, dispatch } = usePlayer();
  const { albums } = state;

  if (!albums.length) {
    return (
      <div>
        <div className="page-header"><h2>Albums</h2></div>
        <div className="empty-state">
          <div className="icon">💿</div>
          <p>No albums yet.<br />Add songs from the Library tab.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header"><h2>Albums</h2></div>
      <div className="album-grid">
        {albums.map(album => (
          <div key={album.name} className="album-card"
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'album-detail', album })}>
            <div className="album-cover">
              {album.cover
                ? <img src={album.cover} alt={album.name} />
                : <span>💿</span>}
            </div>
            <div className="album-info">
              <div className="album-name">{album.name}</div>
              <div className="album-artist">{album.artist} · {album.songs.length} songs</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
