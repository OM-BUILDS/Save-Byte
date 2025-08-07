import React from 'react';
import styles from './Card.module.css';
import DarkButton from "./DarkButton"
import LightButton from "./LightButton"


export default function Card({cardDetails}) {
  return (
    <div className={styles.cardWrapper}>
      <h1>{cardDetails.title}</h1>
      <h3>{cardDetails.subtitle}</h3>
      <div className={styles.line}></div>
      <div className={styles.listContainer}>
      {
        cardDetails.services.map((service,index)=>{
            return <li key={index}>✅ {service}</li>
        })
      }
      </div>
      <div className={styles.line}></div>
      <div className={styles.buttonContainer}>
      <DarkButton buttonText="Log in" redirectTo="/login" buttonProps={cardDetails.title}></DarkButton>
      <LightButton buttonText="Register" redirectTo="/register" buttonProps={cardDetails.title}></LightButton>
      </div>
    </div>
   
    
  );
}
