import React from 'react';
import styles from '../styles/ButtonOutlineStandard.module.css';

interface ButtonOutlineStandardProps {
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function ButtonOutlineStandard({
  onClick,
  children = 'Back',
  disabled = false,
  type = 'button',
  className = '',
}: ButtonOutlineStandardProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.ButtonOutlineStandard} ${className}`}
    >
      <span className={styles.ButtonText}>
        {children}
      </span>
    </button>
  );
}