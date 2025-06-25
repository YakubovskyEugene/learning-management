import { ReactNode } from "react";

interface CustomFixedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const CustomModal = ({ isOpen, onClose, children }: CustomFixedModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-customgreys-darkGrey p-6 rounded-lg shadow-lg w-full max-w-md">
        {children}
      </div>
    </div>
  );
};

export default CustomModal;