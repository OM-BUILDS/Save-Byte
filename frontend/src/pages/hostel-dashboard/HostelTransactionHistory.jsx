import React, { useState, useEffect, useContext } from "react"; 
import styles from "./HostelTransactionHistory.module.css";
import { useHttpClient } from "../../hooks/http-hook";
import { BASE_API_URL } from "../../api/api";
import { AuthContext } from "../../context/auth-context";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

export default function HostelTransactionHistory() {
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [transactionId, setTransactionId] = useState(null);
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [sendRequest, auth.token, auth.userId]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleVerifyOtp = (id) => {
    setTransactionId(id);
    setShowOtpModal(true);
  };

  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    if (/^[0-9]?$/.test(value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await sendRequest(
        `${BASE_API_URL}/get-all-hostel-transactions/${auth.userId}`,
        "GET",
        null,
        {
          Authorization: "Bearer " + auth.token,
        }
      );

      if (response.success && response.transactions) {
        setTransactions(response.transactions);
        showSuccessToast("✅ Transactions fetched successfully!");
      } else {
        setError("No transactions found.");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch transactions.");
      showErrorToast("⚠️ Error fetching transactions!");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      showErrorToast("Please enter a 6-digit OTP");
      return;
    }

    try {
      const response = await sendRequest(
        `${BASE_API_URL}/verify-otp/${transactionId}`,
        "POST",
        { otp: enteredOtp },
        {
          Authorization: "Bearer " + auth.token,
        }
      );

      if (response?.success) {
        showSuccessToast("✅ OTP Verified! Transaction Completed.");
        setShowOtpModal(false);
        fetchTransactions();
      } else {
        showErrorToast("❌ Incorrect OTP. Try Again.");
      }
    } catch (error) {
      showErrorToast(
        error.message || "⚠️ Verification failed. Please try again."
      );
    }
  };

  const handleReject = async (foodId) => {
    try {
      const response = await sendRequest(
        `${BASE_API_URL}/cancel-food/${foodId}`,
        "POST",
        null,
        {
          Authorization: "Bearer " + auth.token,
        }
      );

      if (response.success) {
        showSuccessToast("Food pickup request has been cancelled by you!");
        fetchTransactions();
      }
    } catch (err) {
      showErrorToast(err.message || "Failed to reject food.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>TRANSACTION HISTORY</h1>

      {loading && (
        <p className={styles.loading}>⏳ Loading transaction data...</p>
      )}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && transactions.length === 0 && (
        <p className={styles.noData}>📭 No transactions found.</p>
      )}

      {!loading && transactions.length > 0 && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Transaction Id</th>
                <th>Receiver Name</th>
                <th>Food Name</th>
                <th>Quantity (KG)</th>
                <th>Start Date</th>
                <th>Failed Date</th>
                <th>Completed Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className={
                    activeTransaction === transaction._id ? styles.activeRow : ""
                  }
                >
                  <td>{transaction._id}</td>
                  <td>{transaction.receiverId?.organizationName || "Unknown"}</td>
                  <td>{transaction.foodId?.foodName || "Unknown"}</td>
                  <td>{transaction.foodId?.quantity || 0} KG</td>
                  <td>{formatDateTime(transaction.startDateTime)}</td>
                  <td>{formatDateTime(transaction.failedDateTime)}</td>
                  <td>{formatDateTime(transaction.completedDateTime)}</td>
                  <td
                    className={
                      transaction.status === "Completed"
                        ? styles.completed
                        : transaction.status === "Failed"
                        ? styles.failed
                        : styles.started
                    }
                  >
                    {transaction.status}
                  </td>
                  <td>
                    {transaction.status === "Started" ? (
                      <div className={styles.buttonContainer}>
                        <button
                          className={styles.enabledButton}
                          onClick={() => handleReject(transaction.foodId._id)}
                        >
                          Cancel Food
                        </button>
                        <button
                          className={styles.enabledButton}
                          onClick={() => handleVerifyOtp(transaction._id)}
                        >
                          Verify OTP
                        </button>
                      </div>
                    ) : (
                      <button
                        className={styles.disabledButton}
                        disabled
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for OTP */}
      {showOtpModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Enter OTP</h2>
            <div className={styles.otpInputContainer}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  className={styles.otpInput}
                />
              ))}
            </div>
            <div className={styles.modalButtons}>
              <button className={styles.submitButton} onClick={verifyOtp}>
                Submit OTP
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowOtpModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
