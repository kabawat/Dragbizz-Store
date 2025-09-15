import React from 'react';
import { LucideIcon } from 'lucide-react';
import styles from './Input.module.scss';

interface InputProps {
  type?: 'text' | 'email' | 'tel' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  leftIcon?: LucideIcon;
  rightElement?: React.ReactNode;
  error?: string;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  maxLength?: number;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  leftIcon: LeftIcon,
  rightElement,
  error,
  className = '',
  autoFocus = false,
  disabled = false,
  name,
  id,
  maxLength
}) => {
  const inputClasses = `${styles.input} ${
    LeftIcon ? styles.inputWithLeftIcon : ''
  } ${
    rightElement ? styles.inputWithRightElement : ''
  } ${
    error ? styles.inputError : ''
  } ${
    disabled ? styles.inputDisabled : ''
  } ${className}`;

  return (
    <div className={styles.inputContainer}>
      {/* Left Icon */}
      {LeftIcon && (
        <LeftIcon className={styles.leftIcon} />
      )}
      
      {/* Input Field */}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        disabled={disabled}
        name={name}
        id={id}
        maxLength={maxLength}
        className={inputClasses}
      />
      
      {/* Right Element */}
      {rightElement && (
        <div className={styles.rightElement}>
          {rightElement}
        </div>
      )}
    </div>
  );
};

export default Input;
