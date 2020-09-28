import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ReactPlayer from 'react-player/lazy'
import { Cookies } from 'react-cookie'
import { useRouter } from 'next/router'

import Logo from '../components/logo'
import Menu from '../components/menu'

import styles from '../styles/Dashboard.module.css'

const cookies = new Cookies();

export default function Home() {
    const [videos, setVideos] = useState([])
    const router = useRouter();

    useEffect(() => {
        axios.get('/api/video', {
                headers: {
                    'Authorization': `token ${cookies.get('token')}`
                }
            })
            .then((response) => {
                setVideos(response.data)
            })
            .catch()
    }, [])
    

    return (
        <>
            <div className={styles.container}>
                <div className={styles.containerCentral}>
                    <div className={styles.header} id="header">
                        <Logo />

                        <Menu />
                    </div>

                    <div className={styles.body}>
                        <div className={styles.createNewVideo}>
                            Criar <br/> Vídeo
                        </div>

                        {
                            videos.map(video => {
                                return (
                                    <div key={video.id} className={styles.createNewVideo}> 
                                        <ReactPlayer url={video.url} />
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    )
}
