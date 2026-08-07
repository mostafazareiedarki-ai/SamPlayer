import React, { useState, useRef } from 'react';
import { usePlayer } from '../store/playerStore';

export default function TagEditorModal() {
  const { state, dispatch } = usePlayer();
  const { editingSong } = state;
  const [form, setForm] = useState({ ...editingSong });
  const fileInputRef = useRef();

  const close = () => dispatch({ type: 'CLOSE_MODAL' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCover = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    set('cover', url);
  };

  const save = () => {
    dispatch({ type: 'UPDATE_SONG', payload: form });
    close();
  };

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <h3 style={{ marginBottom: 20 }}>Edit Song Tags</h3>

        {/* Cover Picker */}
        <div className="cover-picker">
          <div className="cover-preview">
            {form.cover ? <img src={form.cover} alt="" /> : <span>🎵</span>}
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: 8 }}>Album Art</p>
            <button className="btn btn-ghost" style={{ border: '1px solid var(--border)', fontSize: '0.8rem' }}
              onClick={() => fileInputRef.current.click()}>
              Choose Image
            </button>
            {form.cover && (
              <button className="btn btn-ghost" style={{ fontSize: '0.8rem', color: 'var(--danger)', marginLeft: 8 }}
                onClick={() => set('cover', null)}>
                Remove
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleCover} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="Song title" />
        </div>

        <div className="form-group">
          <label className="form-label">Artist</label>
          <input className="form-input" value={form.artist || ''} onChange={e => set('artist', e.target.value)} placeholder="Artist name" />
        </div>

        <div className="form-group">
          <label className="form-label">Album</label>
          <input className="form-input" value={form.album || ''} onChange={e => set('album', e.target.value)} placeholder="Album name" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Year</label>
            <input className="form-input" value={form.year || ''} onChange={e => set('year', e.target.value)} placeholder="2024" />
          </div>
          <div className="form-group">
            <label className="form-label">Track #</label>
            <input className="form-input" value={form.track || ''} onChange={e => set('track', e.target.value)} placeholder="1" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Genre</label>
          <input className="form-input" value={form.genre || ''} onChange={e => set('genre', e.target.value)} placeholder="Genre" />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)' }} onClick={close}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
