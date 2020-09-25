import React, {useState} from 'react'
import axios from 'axios'

import styles from '../styles/Auth.module.css'

export default function Home() {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [passwordConfirm, setPasswordConfirm] = useState();

    function handleEmailChange (event) {
        setEmail(event.target.value)
    }

    function handlePasswordChange(event) {
        setPassword(event.target.value)
    }

    function handlePasswordConfirmChange(event) {
        setPasswordConfirm(event.target.value)
    }

    function handleSignup() {
        console.log(email, password, passwordConfirm)
        const emailPattern = /[a-zA-Z0-9]+[\.]?([a-zA-Z0-9]+)?[\@][a-z]{3,9}[\.][a-z]{2,5}/g;
        if (!emailPattern.test(email)) {
            alert("E-mail inválido")
            return;
        }

        if (passwordConfirm !== password ) {
            alert("Confirmação de senha não coincide com a senha digitada, por favor, tente novamente")
            return;
        }
        
        axios.post("/api/auth/signup", {
            email,
            password
        }).then(response => { alert(response.data)})
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.containerCentral}>
                    <div className={styles.header} id="header">
                        <h1 className={styles.logo}>V<span>MAKER</span></h1>

                        <div id="menu-options" className={styles.headerItems}>
                            <a className={styles.headerItem}>Preço</a>
                            <a className={styles.headerItem}>Como funciona?</a>
                            <a className={styles.headerItem}>Login</a>
                            <a className={styles.headerButton}>Teste Gratuitamente</a>
                        </div>
                    </div>

                    <div className={styles.body}>
                        <h1 className={styles.title}>Cadastre-se</h1>

                        <div className={styles.form}>
                            <label for="email">E-mail:</label>
                            <input id="email" type="email" name="email" value={email} onChange={handleEmailChange}/>
                            <label for="senha">Senha:</label>
                            <input id="senha" type="password" name="senha" value={password} onChange={handlePasswordChange}/>
                            <label for="senha-confirm">Confirmação de Senha:</label>
                            <input id="senha-confirm" type="password" name="senha-confirm" value={passwordConfirm} onChange={handlePasswordConfirmChange}/>

                            <div className={styles.buttonAuth}>
                                <a onClick={handleSignup}>
                                    Cadastrar
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
