import { X } from "lucide-react";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, closeModal, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50 px-4 custom-modal-backdrop">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative p-6 custom-modal-content">
        <button
          className="absolute top-4 z-10 right-4 text-gray-500 hover:text-gray-300 hover:bg-red-500/40 p-2 rounded-full transition-all duration-150"
          onClick={closeModal}
        >
          <X size={24} />
        </button>
        <div className="custom-modal-text">

        {children}
        </div>
      </div>
    </div>
  );
};
export default Modal;
