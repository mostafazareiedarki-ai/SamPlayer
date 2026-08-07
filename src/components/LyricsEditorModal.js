import React, { useState } from 'react';
import { usePlayer } from '../store/playerStore';

const PLACEHOLDER = `[00:12.00] اول خط اول شعر
[00:16.50] خط دوم شعر
[00:21.00] خط سوم شعر

یا بدون تایم (فقط متن ساده):
یه روز میریم
یه روز برمیگردیم`;

export default function LyricsEditorModal() {
  const { state, dispatch } = usePlayer();
  const { editingSong } = state;
  const [lyrics, setLyrics] = useState(editingSong?.lyrics || '');

  const close = () => dispatch({ type: 'CLOSE_MODAL' });

  const save = () => {
    dispatch({ type: 'UPDATE_SONG', payload: { ...editingSong, lyrics } });
    close();
  };

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <h3 style={{ marginBottom: 4 }}>Edit Lyrics</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: 16 }}>
          برای همگام‌سازی، از فرمت LRC استفاده کن:<br />
          <code style={{ background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4, fontSize: '0.75rem' }}>[mm:ss.xx] متن خط</code>
        </p>

        <div className="form-group">
          <label className="form-label">Lyrics — {editingSong?.title}</label>
          <textarea
            className="form-input"
            value={lyrics}
            onChange={e => setLyrics(e.target.value)}
            placeholder={PLACEHOLDER}
            style={{ minHeight: 220, direction: 'rtl', textAlign: 'right', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.7 }}
          />
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 16 }}>
          بدون تایم هم میشه وارد کرد — فقط متن ساده نمایش داده میشه.
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)' }} onClick={close}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Save Lyrics</button>
        </div>
      </div>
    </div>
  );
}
