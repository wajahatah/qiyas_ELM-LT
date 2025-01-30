import React from "react";
import styles from "./error.module.css";
function ErrorPage() {
  return (
    <div className={styles.main}>
      <h1 className={styles.error404}>Error 404</h1>
      <h2 className={styles.pageNotFound}>page not found!</h2>
    </div>
  );
}

export default ErrorPage;
