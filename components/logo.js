import React from 'react'
import styles from '../styles/Logo.module.css'

export default function Logo() {
    return (
        <a href="/">
            <h1 className={styles.logo}>V<span>MAKER</span></h1>
        </a>
    )
}