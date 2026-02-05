import React from "react";
import './PrintButton.css';

interface PrintButtonProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const PrintButton: React.FC<PrintButtonProps> = ({
  label = "Print",
  onClick,
  disabled = false,
  type = "button"
}) => {
  return (
    <div className="print-btn-row">
      <button 
        className="print-button"
        onClick={onClick}
        type={type}
        disabled={disabled}
      >
        {label}
      </button>
    </div>
  );
};

export default PrintButton;