
import { useEffect, useState } from 'react';
import {getClips,createClip,updateClip,deleteClip} from './services/clipService';
import PinButton from './components/PinButton';
import DeleteButton from './components/DeleteButton';
import Sidebar from './components/Sidebar';

function getErrorMessage(err, fallbackMessage) {
  if (err && (err.message === 'Failed to fetch' || err.name === 'TypeError')) {
    return 'Could not connect to the backend server. Please make sure the backend is running.';
  }
  return err?.message || fallbackMessage;
}

function App() {
  const [clips, setClips] = useState([]);
  const [content, setContent] = useState('');
  const [clipType, setClipType] = useState('text');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Clips');
  const [searchQuery, setSearchQuery] = useState('');
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
    setError(
      getErrorMessage(
        err,
        'Could not load clips. Check that the backend is running.'
      )
    );
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

    await createClip(content.trim(), clipType);

    setContent('');
    setMessage('Clip saved successfully!');

    await fetchClips();
  } catch (err) {
    console.error(err);
    setError(getErrorMessage(err, 'Could not save clip.'));
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
    setError(getErrorMessage(err, 'Could not update pin status.'));
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
    setError(getErrorMessage(err, 'Could not delete clip.'));
    setMessage('');
  }
}

const filteredClips = clips.filter((clip) => {
  let matchesFilter = true;

  switch (activeFilter) {
    case 'Pinned':
      matchesFilter = clip.is_pinned;
      break;

    case 'Code Snippets':
      matchesFilter = clip.type === 'code';
      break;

    case 'Links':
      matchesFilter = clip.type === 'url';
      break;

    default:
      matchesFilter = true;
  }

  const cleanQuery = searchQuery.trim().toLowerCase();
  const matchesSearch = (clip.content || '')
    .toLowerCase()
    .includes(cleanQuery);

  return matchesFilter && matchesSearch;
});

function getEmptyState() {
  if (searchQuery.trim()) {
    return {
      title: 'No matching clips found.',
      message: 'Try searching with different keywords or clear your search.',
    };
  }

  if (clips.length === 0) {
    return {
      title: 'No clips yet',
      message: 'No clips yet. Add your first clip!',
    };
  }

  if (activeFilter === 'Pinned') {
    return {
      title: 'No pinned clips found',
      message: 'You have not pinned any clips yet.',
    };
  }

  if (activeFilter === 'Code Snippets') {
    return {
      title: 'No code snippets found',
      message: 'No code snippets found in your saved clips.',
    };
  }

  if (activeFilter === 'Links') {
    return {
      title: 'No links found',
      message: 'No links or URLs found in your saved clips.',
    };
  }

  return {
    title: 'No clips found',
    message: 'No clips match the selected filter.',
  };
}

const emptyState = getEmptyState();

  return (
    <main className="app">
        <Sidebar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
        />

      <section className="content">
        <h1>Your Clipboard</h1>
        <p className="subtitle">
          Your copied text and code, all in one place.
        </p>

        <form className="add-clip-form" onSubmit={handleAddClip}>
          <div className="form-header">
            <label htmlFor="clip-content">Add a new clip</label>
            <div className="type-selector">
              <label htmlFor="clip-type">Type:</label>
              <select
                id="clip-type"
                value={clipType}
                onChange={(event) => setClipType(event.target.value)}
              >
                <option value="text">Text</option>
                <option value="code">Code Snippet</option>
                <option value="url">Link</option>
              </select>
            </div>
          </div>

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

        <div style={{ marginTop: '24px' }}>
          <input
            id="search-input"
            type="text"
            placeholder="Search clips..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              color: '#f8fafc',
              backgroundColor: '#172338',
              border: '1px solid #263247',
              borderRadius: '8px',
              outline: 'none',
              font: 'inherit',
            }}
          />
        </div>

        {loading && <p>Loading clips...</p>}

        {!loading && !error && filteredClips.length === 0 && (
          <div className="empty-state">
            <h2>{emptyState.title}</h2>
            <p>{emptyState.message}</p>
          </div>
        )}

        {!loading && filteredClips.length > 0 && (
          <div className="clips-list">
            <p className="clip-count">
              {filteredClips.length} saved clip(s)
            </p>

            {filteredClips.map((clip) => (
              <article className="clip-card" key={clip.id}>
                <div className="clip-header">
                  <span className="clip-type">{clip.type}</span>
                  {clip.is_pinned && <span>📌 Pinned</span>}
                </div>

                <pre>{clip.content}</pre>

                
                <div className="clip-actions">
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
                </div>

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
