import styles from "./DarkButton.module.css";
import { useNavigate } from "react-router-dom";

export default function DarkButton({
  buttonText,
  bgColor,
  color,
  redirectTo,
  buttonProps,
  onClick, // ✅ Accept onClick prop for custom actions
}) {
  const navigate = useNavigate();

  // Handle Button Click
  const handleClick = () => {
    if (redirectTo) {
      navigate(redirectTo, { state: buttonProps }); // ✅ Navigate if redirectTo is provided
    } else if (onClick) {
      onClick(); // ✅ Execute onClick if provided
    }
  };

  return (
    <span className={styles.buttonContainer}>
      <button className={styles.darkButton}
        onClick={handleClick}
      >
        {buttonText}
      </button>
    </span>
  );
}
