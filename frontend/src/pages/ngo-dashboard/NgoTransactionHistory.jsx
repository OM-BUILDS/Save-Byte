import React, { useState, useEffect, useContext } from "react";
import styles from "./NgoTransactionHistory.module.css";
import { useHttpClient } from "../../hooks/http-hook";
import { BASE_API_URL } from "../../api/api";
import { AuthContext } from "../../context/auth-context";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import NgoTrackFood from "./NgoTrackFood"; // Import TrackFood Component

export default function NgoTransactionHistory() {
  const [activeTransaction,setActiveTransaction] = useState(null);
  const auth = useContext(AuthContext);
  const { sendRequest } = useHttpClient();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null); // Selected Transaction for Tracking

  // 📦 Fetch Transactions on Component Mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await sendRequest(
          `${BASE_API_URL}/get-all-ngo-transactions/${auth.userId}`,
          "GET",
          null,
          {
            Authorization: "Bearer " + auth.token,
          }
        );

        if (response.success) {
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

    fetchTransactions();
  }, [sendRequest, auth.token, auth.userId]);

  // 🕓 Format Date Helper
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

  // 🎯 Open Map for Tracking
  const openMap = (transaction) => {
    if (transaction.donorId && transaction.receiverId) {
      setSelectedTransaction(transaction);
      setActiveTransaction(transaction._id)
    } else {
      showErrorToast("⚠️ Unable to fetch donor/receiver coordinates.");
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
          showSuccessToast("Food pickup has been cancelled!");
        }
        else{
          showErrorToast("Failed to reject food")
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
          <table  className={styles.table} >
            <thead>
              <tr>
              <th>Transaction Id</th>
                <th>Donor Name</th>
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
                <tr key={transaction._id} 
                
                className={ activeTransaction ===transaction._id ? styles.activeRow: "" }>
                  <td>{transaction._id}</td>
                  <td>{transaction.donorId?.organizationName || "Unknown"}</td>
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
                    <div className={styles.buttonContainer}>
                    {transaction.status === "Started" && (
                      <button
                        className={styles.enabledButton}
                        onClick={() => openMap(transaction)}
                      >
                        📍 Track Food
                      </button>
                    )}
                    {transaction.status === "Started" ? 
                      <button
                        className={styles.enabledButton}
                        onClick={() => handleReject(transaction.foodId._id)}
                      >
                         Reject Food
                      </button> : 
                      <button
                      className={styles.disabledButton}
                      disabled
                      
                    >
                       Reject Food
                    </button>
                    }
                    </div>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🎯 Show Map for Selected Transaction */}
      {selectedTransaction && (
        
          <NgoTrackFood transactionId={activeTransaction}
            donorCoords={{
              lat: selectedTransaction.donorId.latitude,
              lng: selectedTransaction.donorId.longitude,
            }}
            receiverCoords={{
              lat: selectedTransaction.receiverId.latitude,
              lng: selectedTransaction.receiverId.longitude,
            }}
          />
      
      )}
    </div>
  );
}
