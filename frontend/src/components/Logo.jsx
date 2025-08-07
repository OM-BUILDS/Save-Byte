import React from 'react'
import styles from "./Logo.module.css"
import savebytelogo from "../assets/savebytelogo.png"
import { BrowserRouter as Router,Link } from "react-router-dom"

export default function Logo() {
  return (
    <div className={styles.logoContainer}>
        <Link to="/"><img src= {savebytelogo}  alt="logo" /></Link>
      </div>
  )
}
