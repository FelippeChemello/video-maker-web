import React, { useState } from 'react'
import styles from '../styles/Image.module.css'

export default function ImageSelector({ urls, content, handleInput, index }) {
    // const [img, setImg] = useState(urls[0])
    // const [selected, setSelected] = useState()
    
    if (typeof content.imagesSelected != 'object') {
        handleInput('imagesSelected', []);
    }

    function handleImageSelect(i) {
        content.imagesSelected[index] = i;

        handleInput('imagesSelected', content.imagesSelected)
    }

    return (
        <div className={styles.imgFrame}>
            <span>{`Slide ${index+1}`}</span>
            {
                urls.map((url, i) => {
                    return (
                        <a onClick={() => handleImageSelect(i)}>
                            <img className={styles[`img${i == content.imagesSelected[index] ? 'Selected' : ''}`]} key={`${index}${i}`} src={url} />
                        </a>
                    )
                })
            }
        </div>
    );
}