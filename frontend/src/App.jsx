
import { useEffect, useState } from 'react';

function App() {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchClips() {
      try {
        const response = await fetch('http://localhost:5001/api/clips');
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to fetch clips');
        }

        setClips(result.data);
      } catch (err) {
        console.error('Error fetching clips:', err);
        setError('Could not load clips. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    }

    fetchClips();
  }, []);

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

        {loading && <p>Loading clips...</p>}

        {error && <p className="error">{error}</p>}

        {!loading && !error && clips.length === 0 && (
          <div className="empty-state">
            <h2>No clips yet</h2>
            <p>Your clipboard history will appear here.</p>
          </div>
        )}

        {!loading && !error && clips.length > 0 && (
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
