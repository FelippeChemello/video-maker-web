import React, {useState} from 'react'
import axios from 'axios'
import { Cookies } from 'react-cookie'
import { useRouter } from 'next/router'

import Logo from '../components/logo'
import Menu from '../components/menu'
import IsAlreadyLoggedRedirectToDashboard from '../components/isAlreadyLoggedRedirectToDashboard'

import styles from '../styles/Auth.module.css'

const cookies = new Cookies();

export default function Home() {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const router = useRouter();

    function handleEmailChange(event) {
        setEmail(event.target.value)
    }

    function handlePasswordChange(event) {
        setPassword(event.target.value)
    }

    function handleLogin() {
        axios.post("/api/auth/login", {
            email,
            password
        }).then(response => {
            if (response.status === 200 && response.data.token) {
                cookies.set('token', response.data.token, {expiresIn: 3000})
                router.push('/dashboard')
            } else {
                alert(response.data)
            }
        }).catch((error) => {
            console.log(error)
            alert("E-mail ou senha incorretos")
        })
    }

    return (
        <>
            <IsAlreadyLoggedRedirectToDashboard/>
            <div className={styles.container}>
                <div className={styles.containerCentral}>
                    <div className={styles.header} id="header">
                        <Logo />

                        <Menu />
                    </div>

                    <div className={styles.body}>
                        <h1 className={styles.title}>Login</h1>

                        <div className={styles.form}>
                            <label for="email">E-mail:</label>
                            <input id="email" type="email" name="email" value={email} onChange={handleEmailChange}/>
                            <label for="senha">Senha:</label>
                            <input id="senha" type="password" name="senha" value={password} onChange={handlePasswordChange}/>

                            <div className = {styles.buttonAuth}>
                                <a onClick={handleLogin}>
                                    Login
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
