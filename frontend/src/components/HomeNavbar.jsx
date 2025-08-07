import styles from "./HomeNavbar.module.css"
import { BrowserRouter as Router,Link } from "react-router-dom"
import Logo from "./Logo"


export default function HomeNavbar() {
  return (
    <nav>
      <Logo/>
      <ul>
        <Link to="/home">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact Us</Link>
        <Link to="/faq">FAQs</Link>
      </ul>
    </nav>
  )
}
