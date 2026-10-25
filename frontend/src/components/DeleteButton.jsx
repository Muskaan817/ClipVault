
function DeleteButton({ onDelete }) {
  return (
    <button
      type="button"
      onClick={onDelete}
    >
      Delete
    </button>
  );
}

export default DeleteButton;
