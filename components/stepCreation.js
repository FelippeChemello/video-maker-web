import React from 'react'
import styles from '../styles/StepCreation.module.css'

export default function Logo({name, isActive, isLast}) {
    return (
        <>
            <div className={styles[`stepItem${isActive ? 'Active' : ''}`]}>
                <div className={styles[`stepIndicator${isActive ? 'Active' : ''}`]}></div> <span>{name}</span>
            </div>
            {isLast ? <></> : <div className={styles[`stepDivider${isActive ? 'Active' : ''}`]}> </div>}
            {isLast ? <></> : <div className={styles[`stepDivider${isActive ? 'Active' : ''}`]}> </div>}
        </>
    )
}