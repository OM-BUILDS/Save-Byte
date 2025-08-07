import React from 'react'
import TrendChart from '../../components/charts/TrendChart'
import DoughnutChart from '../../components/charts/DoughnutChart'
import VerticalChart from '../../components/charts/VerticalChart'
import StackedBarChart from '../../components/charts/StackedBarChart'
import styles from "./HostelHome.module.css"
import HostelCards from '../../components/HostelCards'

export default function HostelHome() {
  return (
    <div className={styles.dashboardHomeContainer}>
     <HostelCards></HostelCards>   
    <TrendChart></TrendChart>
    <DoughnutChart></DoughnutChart>
    <VerticalChart></VerticalChart>
    <StackedBarChart></StackedBarChart>
    </div>
  )
}
