import '../ControlPanel/ControlPanel.module.css';
import './ConfirmModal.module.css';
type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({ isOpen, title, description, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div aria-labelledby="confirm-modal-title" aria-modal="true" className="modal" role="dialog">
        <div>
          <h2 className="modal__title" id="confirm-modal-title">
            {title}
          </h2>
        </div>

        <p className="modal__text">{description}</p>

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


