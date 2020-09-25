import Head from 'next/head'

import styles from '../styles/Home.module.css'

export default function Home() {
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
                        <div className={styles.bodyLeft}>
                            <img src="/blue-dots.svg" className={styles.blueDots1}/>
                            <h2 className={styles.title}>
                                Crie vídeos de maneira <br/> automatizada com IA
                            </h2>
                            <img src="/blue-dots.svg" className={styles.blueDots2}/>

                            <h3 className={styles.description}>
                                Através de Inteligência Artificial e Aprendizado de Máquina 
                                pesquisamos o conteúdo informado, sintetizamos e o entregamos 
                                em formato de vídeo diretamente em sua conta do YouTube ou 
                                disponibilizamos para Download, tudo feito em poucos passos e rápidamente.
                            </h3>

                            <a className={styles.buttonTryFree}>
                                Teste Gratuitamente
                            </a>
                        </div>

                        <div className={styles.bodyRight}>
                            <img src="/add-content.svg" className={styles.addContent} />
                        </div>
                    </div>

                    <img src="/play-symbol.png" className={styles.playSymbol1} />
                    <img src="/play-symbol.png" className={styles.playSymbol2} />
                </div>
            </div>
        </>
    )
}
