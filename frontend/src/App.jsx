function App() {
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

        <div className="empty-state">
          <h2>No clips yet</h2>
          <p>Your clipboard history will appear here.</p>
        </div>
      </section>
    </main>
  );
}

export default App;