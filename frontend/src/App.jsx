
import { useEffect, useState } from 'react';
import {getClips,createClip,updateClip,deleteClip} from './services/clipService';
import PinButton from './components/PinButton';
import DeleteButton from './components/DeleteButton';

function App() {
  const [clips, setClips] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

async function fetchClips() {
  try {
    setError('');

    const data = await getClips();
    setClips(data);
  } catch (err) {
    console.error(err);
    setError('Could not load clips. Check that the backend is running.');
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    fetchClips();
  }, []);

  async function handleAddClip(event) {
  event.preventDefault();

  if (!content.trim()) {
    setError('Please enter some text or code first.');
    setMessage('');
    return;
  }

  try {
    setSaving(true);
    setError('');
    setMessage('');

    await createClip(content.trim());

    setContent('');
    setMessage('Clip saved successfully!');

    await fetchClips();
  } catch (err) {
    console.error(err);
    setError(err.message || 'Could not save clip.');
    setMessage('');
  } finally {
    setSaving(false);
  }
}

async function handleTogglePin(clip) {
  try {
    setError('');
    setMessage('');

    await updateClip(clip.id, {
      is_pinned: !clip.is_pinned,
    });

    setMessage(
      clip.is_pinned
        ? 'Clip unpinned successfully!'
        : 'Clip pinned successfully!'
    );

    await fetchClips();
  } catch (err) {
    console.error(err);
    setError(err.message || 'Could not update pin status.');
  }
}

async function handleDeleteClip(clip) {
  const confirmed = window.confirm(
    'Are you sure you want to delete this clip?'
  );

  if (!confirmed) return;

  try {
    setError('');
    setMessage('');

    await deleteClip(clip.id);

    setMessage('Clip deleted successfully!');
    await fetchClips();
  } catch (err) {
    console.error(err);
    setError(err.message || 'Could not delete clip.');
    setMessage('');
  }
}

  return (
    <main className="app">
      <aside className="sidebar">
        <h2>ClipVault</h2>
        <p>Smart Clipboard Manager</p>

        <button className="active">All Clips</button>
        <button>Pinned</button>
        <button>Code Snippets</button>
        <button>Links</button>
      </aside>

      <section className="content">
        <h1>Your Clipboard</h1>
        <p className="subtitle">
          Your copied text and code, all in one place.
        </p>

        <form className="add-clip-form" onSubmit={handleAddClip}>
          <label htmlFor="clip-content">Add a new clip</label>

          <textarea
            id="clip-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Paste your text, code, or URL here..."
            rows={4}
          />

          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Clip'}
          </button>
        </form>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error">{error}</p>}

        {loading && <p>Loading clips...</p>}

        {!loading && !error && clips.length === 0 && (
          <div className="empty-state">
            <h2>No clips yet</h2>
            <p>Your saved clips will appear here.</p>
          </div>
        )}

        {!loading && clips.length > 0 && (
          <div className="clips-list">
            <p className="clip-count">
              {clips.length} saved clip(s)
            </p>

            {clips.map((clip) => (
              <article className="clip-card" key={clip.id}>
                <div className="clip-header">
                  <span className="clip-type">{clip.type}</span>
                  {clip.is_pinned && <span>📌 Pinned</span>}
                </div>

                <pre>{clip.content}</pre>

                
                <button
                type="button"
                className="clip-action-button copy-button"
                onClick={async () => {
                    try {
                    await window.clipVault.copyText(clip.content);
                    setMessage('Copied to clipboard!');
                    setError('');
                    } catch (err) {
                    console.error('Copy failed:', err);
                    setError('Could not copy this clip.');
                    setMessage('');
                    }
                }}
                >
                Copy
                </button>


                <PinButton
                isPinned={clip.is_pinned}
                onToggle={() => handleTogglePin(clip)}
                />

                <DeleteButton
                    onDelete={() => handleDeleteClip(clip)}
                />

                <p className="clip-date">
                  {new Date(clip.created_at).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
