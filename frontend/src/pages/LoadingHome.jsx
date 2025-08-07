import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoadingHome.module.css";

export default function LoadingHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/Home");
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={styles.container}>
      {/* Animated Plate */}
      <div className={styles.plateWrapper}>
        <div className={styles.plate}>
          <div className={styles.food}>
            <div className={styles.vegetable}></div>
            <div className={styles.meat}></div>
            <div className={styles.grain}></div>
          </div>
        </div>
      </div>

      {/* Steam Effect */}
      <div className={styles.steam}>
        <span className={styles.steam1}></span>
        <span className={styles.steam2}></span>
      </div>

      {/* Project Title */}
      <h1 className={styles.title}>SAVE BYTE</h1>
      
      {/* Progress Indicator */}
      <div className={styles.progress}></div>
    </div>
  );
}