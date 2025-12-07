import React from "react";
import "./PrintButton.css";

interface PrintButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<PrintButtonProps> = ({
  label,
  onClick,
  disabled = false,
  type = "button"
}) => {
  return (
    <button
      className={`custom-button ${disabled ? "disabled" : ""}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;