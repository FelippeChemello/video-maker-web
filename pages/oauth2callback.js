import {useRouter} from 'next/router'
import axios from 'axios'

import Logo from '../components/logo'

import styles from '../styles/Home.module.css'

export default function Home() {
    const router = useRouter();
    console.log(router.query.code)

    axios.post('/api/auth/saveOAuth', {
        code: router.query.code
    })
    .then((response) => {
        console.log(response.data)
    }).catch((error) => {
        if (error.response.status === 302) {
            cookies.set('token', '')
            router.push(error.response.data)
        } else {
            console.log(error.response)
        }
    })

    return (
        <>
            <div className={styles.container}>
                <div className={styles.containerCentral}>
                    <div className={styles.header} id="header">
                        <Logo/>
                    </div>

                    <div className={styles.body}>
                        <h1>Obrigado por autorizar o envio do vídeo, agora você fechar esta janela e finalizar seu vídeo!</h1>
                    </div>
                </div>
            </div>
        </>
    )
}
