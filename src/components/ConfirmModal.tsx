type ConfirmModalProps = {
  isOpen: boolean;
  pendingVertexCount: number | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  isOpen,
  pendingVertexCount,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen || pendingVertexCount === null) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        aria-labelledby="confirm-modal-title"
        aria-modal="true"
        className="modal"
        role="dialog"
      >
        <div>
          <h2 className="modal__title" id="confirm-modal-title">
            Reconstruct current graph?
          </h2>
        </div>

        <p className="modal__text">
          Confirm reconstruction with {pendingVertexCount} isolated vertices. Current edges and
          staged history will be cleared.
        </p>

        <div className="modal__actions">
          <button className="button" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="button button--primary" type="button" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
