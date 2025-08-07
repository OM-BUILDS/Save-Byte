import styles from "./LightButton.module.css";
import { useNavigate } from "react-router-dom";

export default function LightButton({
  buttonText,
  redirectTo,
  buttonProps,
  onClick,
  disabled = false, // ✅ Accept disabled prop (default false)
}) {
  const navigate = useNavigate();

  // Handle Button Click
  const handleClick = () => {
    if (disabled) return; // ✅ Prevent action if disabled
    if (redirectTo) {
      navigate(redirectTo, { state: buttonProps });
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <span className={styles.buttonContainer}>
      <button
        className={`${styles.lightButton} ${disabled ? styles.disabled : ""}`}
        onClick={handleClick}
        disabled={disabled} // ✅ Properly disable the button
      >
        {buttonText}
      </button>
    </span>
  );
}
