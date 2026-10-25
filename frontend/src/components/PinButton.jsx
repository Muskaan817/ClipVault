function PinButton({ isPinned, onToggle }) {
  return (
    <button
      type="button"
      className={`clip-action-button pin-button ${isPinned ? 'pinned' : ''}`}
      onClick={onToggle}
    >
      {isPinned ? '📌 Unpin' : '📌 Pin'}
    </button>
  );
}

export default PinButton;
