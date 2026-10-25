const filters = [
  'All Clips',
  'Pinned',
  'Code Snippets',
  'Links',
];

function Sidebar({ activeFilter, onFilterChange }) {
  return (
    <aside className="sidebar">
      <h2>ClipVault</h2>
      <p>Smart Clipboard Manager</p>

      <nav>
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={activeFilter === filter ? 'active' : ''}
            onClick={() => onFilterChange(filter)}
          >
            {filter}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;