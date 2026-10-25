
function DeleteButton({ onDelete }) {
  return (
    <button
      type="button"
      className="clip-action-button delete-button"
      onClick={onDelete}
    >
      Delete
    </button>
  );
}

export default DeleteButton;
