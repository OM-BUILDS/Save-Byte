
import Hero from "../components/Hero"
import donateImg from  "../assets/donate.png"
import deliveryImg from  "../assets/delivery.png"
import reportImg from  "../assets/statistics.png"
import notificationImg from  "../assets/push-notification.png"
import mapImg from  "../assets/home.png"
import styles from "./Home.module.css"
import {cardDetails} from "../data/data"
import Card from "../components/Card";



export default function Home() {
  return (
    <>
    <div className={styles.upperContainer}>
      <Hero></Hero>
      <div className={styles.cardsWrapper}>
      <Card cardDetails={cardDetails[0]}/>
      <Card cardDetails={cardDetails[1]} />
      <Card cardDetails={cardDetails[2]} />
    </div>
    </div>
    <div className={styles.servicesContainer}>
           <h1>Our Services</h1> 
           <div className={styles.services}>
           <div className={styles.eachService}>
            <img src= {donateImg}alt="" />
            <p>Food Donation</p>
           </div>
           <div className={styles.eachService}>
            <img src={deliveryImg} alt="" />
            <p>Volunteer Pick Up</p>
           </div>
           <div className={styles.eachService}>
            <img src={reportImg} alt="" />
            <p>Waste Reports</p>
           </div>
           <div className={styles.eachService}>
            <img src={notificationImg} alt="" />
            <p>Notification & Alerts</p>
           </div>
           <div className={styles.eachService}>
            <img src={mapImg} alt="" />
            <p>Map Integration</p>
           </div>
           </div>
        </div>
    </>
  );
}
