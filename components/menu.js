import React, { useEffect, useState } from 'react'
import { Cookies } from 'react-cookie'
import axios from 'axios'

import styles from '../styles/Menu.module.css'

const cookies = new Cookies();

export default function Menu() {
    const [logged, setLogged] = useState(false);
    const [credits, setCredits] = useState(0);

    useEffect(() => {
        if (cookies.get('token')) {
            axios.get('/api/auth/isValidToken', {
                    headers: {
                        'Authorization': `token ${cookies.get('token')}`
                    }
                })
                .then((response) => {
                    console.log("logado")

                    axios.get('/api/credits/getQuantityAvailable', {
                            headers: {
                                'Authorization': `token ${cookies.get('token')}`
                            }
                        })
                        .then((response) => {
                            setCredits(response.data)
                        })
                        .catch()

                    setLogged(true)
                })
                .catch(() => {
                    cookies.set('token', '')
                    setLogged(false)
                })
        }
    }, [])

    return (
        <div id="menu-options" className={styles.headerItems}>
            <a className={styles.headerItem}>Como funciona?</a>
            {
                (logged) 
                ? 
                    (
                        <>
                            <a className={styles.headerItem}>Créditos: {credits}</a>
                            <a className={styles.headerButton}>Comprar créditos</a>
                        </>
                    )
                :
                    (
                        <>
                            <a className={styles.headerItem}>Preço</a>
                            <a className={styles.headerItem}>Login</a>
                            <a className={styles.headerButton}>Teste Gratuitamente</a>
                        </>
                    ) 
            }
        </div>
    )
}