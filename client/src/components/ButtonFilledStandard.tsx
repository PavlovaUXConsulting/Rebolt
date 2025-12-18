import React from 'react';
import styles from '../styles/ButtonFilledStandard.module.css';

interface ButtonFilledStandardProps {
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function ButtonFilledStandard({
  onClick,
  children = 'Review Payment',
  disabled = false,
  type = 'button',
  className = '',
}: ButtonFilledStandardProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.ButtonFilledStandard_344_1444} ${className}`}
      data-figma-node="344:1444"
    >
      <span className={styles.CheckOut_344_1445} data-figma-node="344:1445">
        {children}
      </span>
    </button>
  );
}