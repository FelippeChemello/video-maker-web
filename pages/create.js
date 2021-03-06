import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Cookies } from 'react-cookie'
import { useRouter } from 'next/router'
// import { Carousel } from 'react-responsive-carousel';
// import { GoogleLogin } from 'react-google-login'

import Logo from '../components/logo'
import StepCreation from '../components/stepCreation'
import ImageSelector from '../components/imageSelector'

import styles from '../styles/Create.module.css'

const cookies = new Cookies();

export default function Home() {
    const [step, setStep] = useState(1)
    const [typeOfCreation, setTypeOfCreation] = useState('ia')
    const [content, setContent] = useState({})
    const [loading, setLoading] = useState(false)
    const router = useRouter();

    useEffect(() => {
    }, [])
    
    function handleInput (key, value) {
        content[key] = value

        console.log(content)

        setContent({...content})
    }

    function handleNext() {
        try {
            switch (step) {
                case 1:
                    validateStepOneIsDone();
                    if (typeOfCreation == 'ia') {
                        alert("Desculpe, criação por IA não disponivel ainda.") 
                        return;
                        setStep(4)
                    } else {
                        setStep(2)
                        getSentences()
                    }
                    break;
                case 2: 
                    getSelectedSentences();
                    if (content.selectedSentences.length <= 0) {
                        throw new Error("Selecione ao menos uma frase para compor seu vídeo");
                    }
                    setStep(3);
                    getKeywordsAndImages()
                    break;
                case 3:
                    if (content.selectedSentences.length != content.imagesSelected.length) {
                        throw new Error("Selecione uma imagem para cada frase");
                    }
                    setStep(4);
                    getInfoVideo();
                    break;
                case 4: 
                    if (content.videoTitle == "" || content.videoDescription == "" || content.videoTags == "") {
                        throw new Error("Preencha todos os campos!");
                    }
                    endsVideoCreation();
                    break;
                default: 
                    throw new Error("Ocorreu um erro desconhecido, por favor, tente novamente mais tarde.")

            }
        } catch (exception) {
            alert(exception.message)
        }
    }

    console.log(content)

    function endsVideoCreation() {
        if (loading) {
            alert("Aguarde")
            return;
        }

        setLoading(true)
        const images = []
        content.imagesUrl.forEach((imgs, index) => {
            images.push(imgs[content.imagesSelected[index]])
        })

        const sentences = []
        content.selectedSentences.forEach(sentence => sentences.push(sentence.text))

        axios.post('/api/auth/checkClientHasAuthorizedOAuth')
        .then((response) => {
            console.log(response)
            if (response.data.redirect) {
                window.open(response.data.redirect, "_blank")
            } else {
                axios.post('/api/video/create', {
                    title: content.videoTitle,
                    description: content.videoDescription,
                    tags: content.videoTags,
                    imagesUrl: images,
                    sentences
                }).then((response) => {
                    alert("Iniciamos a criação de seu vídeo, em breve estará disponível em seu dashbord!")
                    router.push("/dashboard")
                    
                }).catch((error) => {
                    setLoading(false)
                    if (error.response.status === 302) {
                        cookies.set('token', '')
                        router.push(error.response.data)
                    } else {
                        alert("Não conseguimos finalizar a criação de seu vídeo, tente novamente mais tarde! ")
                        console.log(error.response)
                    }
                })
            }
        }).catch((error) => {
            setLoading(false)
            if (error.response.status === 302) {
                cookies.set('token', '')
                router.push(error.response.data)
            } else {
                alert("Não conseguimos finalizar a criação de seu vídeo, tente novamente mais tarde! ")
                console.log(error.response)
            }
        })
    }

    function validateStepOneIsDone() {
        if (!content.suggestions) {
            throw new Error("Insira o assunto desejado e clique na lupa para pesquisar sobre o assunto")
        }
        
        if (content.title === "Selecione..." || content.title === "" || content.title == undefined) {
            throw new Error("Selecione a sugestão que melhor se adapta ao seu assunto");
        }

        if (!['ia', 'human'].includes(typeOfCreation)) {
            throw new Error("Selecione o método de criação do vídeo");
        }
    }

    function handleBack() {
        switch (step) {
            case 1:
                router.push("/dashboard")
                break;
            case 2:
                setStep(1)
                break;
            case 3:
                setStep(2)
                break;
            case 4:
                setStep(3)
                break;
            default:
                throw new Error("Ocorreu um erro desconhecido, por favor, tente novamente mais tarde.")
        }
    }

    function handleSubjectSubmit() {
        if (loading) {
            alert("Aguarde")
        }

        setLoading(true) 

        axios.post(
            '/api/wikipedia/suggestions', 
            { search: content.subject }
        ).then((response) => {
            setLoading(false)
            const suggestions = ['Selecione...', ...response.data]
            handleInput('suggestions', suggestions)
        }).catch((error) => {
            setLoading(false)
            if (error.response.status === 302) {
                cookies.set('token', '')
                router.push(error.response.data)
            } else {
                alert("Não conseguimos encontrar resultados para a pesquisa " + content.subject)
            }
        })
    }

    function handleChangeTypeOfCreation(type) {
        setTypeOfCreation(type)
    }

    function getSentences() {
        if (loading) {
            alert("Aguarde")
        }

        setLoading(true)

        //Se não mudou o assunto, não pesquisa dnv
        if (content.article?.title && content.article.title == content.subject) {
            return;
        }

        axios.post(
            '/api/wikipedia/article', {
                articleName: content.title,
                lang: 'pt'
            }
        ).then((response) => {
            setLoading(false)
            handleInput('article', response.data)
        }).catch((error) => {
            setLoading(false)
            if (error.response.status === 302) {
                cookies.set('token', '')
                router.push(error.response.data)
            } else {
                alert("Não conseguimos encontrar resultados para a pesquisa " + content.subject)
            }
        })
    }

    function handleSentenceSelect(index) {
        if (typeof content.article.sentences[index].selected == 'undefined') {
            content.article.sentences[index].selected = true;
        } else {
            content.article.sentences[index].selected = !content.article.sentences[index].selected;
        }

        handleInput('article', content.article)
    }

    function getSelectedSentences() {
        var selectedSentences = [];
        content.article.sentences.forEach(sentence => {
            if (sentence.selected) {
                selectedSentences.push(sentence)
            }
        })

        handleInput('selectedSentences', selectedSentences);
    }

    function getKeywordsAndImages() {
        handleInput('imagesUrl', []);

        content.selectedSentences.forEach((sentence, index) => {
            axios.post(
                '/api/watson/keywords', {
                    sentence: sentence.text
                }
            ).then((response) => {
                content.article.sentences[index].keywords = response.data;
                handleInput('article', content.article)

                axios.post(
                    '/api/google-custom-search/images', {
                        query: `${content.title} ${content.article.sentences[index].keywords[0]}`,
                    }
                ).then((response) => {
                    const urls = content.imagesUrl || []
                    urls.splice(index, 0, response.data);

                    handleInput('imagesUrl', urls)
                }).catch((error) => {
                    if (error.response?.status === 302) {
                        cookies.set('token', '')
                        router.push(error.response.data)
                    } else {
                        console.error(error)
                        alert("Não conseguimos encontrar imagens para a pesquisa " + content.subject)
                    }
                })
            }).catch((error) => {
                if (error.response?.status === 302) {
                    cookies.set('token', '')
                    router.push(error.response.data)
                } else {
                    console.error(error)
                    alert("Não conseguimos encontrar keywords para a pesquisa " + content.subject)
                }
            })
        })
    }

    function getInfoVideo() {
        handleInput('videoTitle', content.article.title);

        let description = '';
        let tags = '';
        content.selectedSentences.forEach(sentence => { 
             description += `${sentence.text} \n\n`
             tags += `${sentence.keywords[0]},`
        })

        handleInput('videoDescription', description);
        handleInput('videoTags', tags);
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.headerLogo}>
                    <Logo />
                </div>

                <div className = {styles.headerStep}>
                    <p> Passo {step} de 4 </p>
                </div>

                <div className={styles.sidebar}>
                    <div>
                        <StepCreation name="Insira o assunto desejado" isActive={1 <= step}/>
                        <StepCreation name="Selecione as frases" isActive={2 <= step}/>
                        <StepCreation name="Escolha as melhores imagens" isActive={3 <= step}/>
                        <StepCreation name="Revise seu vídeo" isActive={4 <= step} isLast={true}/>
                    </div>
                </div>

                <div className={styles.content}>
                    <div id="step1" style={{display: (1 == step ? 'block' : 'none')}}>
                        <h1>Assunto</h1>
                        <h2>Insira o tema para seu vídeo. Iremos busca-lo e oferecer as melhores opções encontradas.</h2>

                        <label for="assunto">Assunto:</label>
                        <input id="assunto" type="text" name="assunto" value={content.subject} onChange={(event) => {handleInput('subject', event.target.value)}}/>
                        <a onClick={handleSubjectSubmit} style={{cursor: 'pointer'}}>
                            <img className={styles.search} src="/search.png"></img>
                        </a>

                        {           
                            content.suggestions ? (
                                <>
                                    <label for="sugestoes">Sugestões:</label>
                                    <select id="sugestoes" name="sugestoes" value={content.title} onChange={(event) => {handleInput('title', event.target.value)}}>
                                        { content.suggestions.map((sugestion) => <option key={sugestion} value={sugestion}> {sugestion} </option>) }
                                    </select>

                                    <div className={styles.typeOfCreation}>
                                        <a 
                                            className={typeOfCreation == 'ia' ? styles.methodOfCreationSelected : styles.methodOfCreation}
                                            onClick={() => handleChangeTypeOfCreation('ia')}
                                        >
                                            Criar automaticamente com auxílio de IA
                                        </a>
                                        <a 
                                            className={typeOfCreation == 'human' ? styles.methodOfCreationSelected : styles.methodOfCreation}
                                            onClick={() => handleChangeTypeOfCreation('human')}
                                        >
                                            Auxiliar no processo de criação do vídeo
                                        </a>
                                    </div>
                                </>
                            ) : (
                                <> </>
                            )
                        }
                    </div>

                    <div id="step2" style={{display: (2 == step ? 'block' : 'none')}}>
                        <h1>Frases</h1>
                        <h2>Selecione as frases que deseja inserir em seu vídeo.</h2>

                        <div className={styles.sentences}>
                            {   content.article?.sentences ? (
                                    content.article.sentences.map((sentence, index) => {
                                        return (
                                            <a 
                                                className={styles[`sentence${sentence.selected ? 'Selected' : ''}`]} 
                                                key={`sentence-${index}`} 
                                                value={`sentence-${index}`}
                                                onClick={() => handleSentenceSelect(index)}
                                            > {sentence.text} </a>
                                        )
                                    })
                                ) : (
                                    <a className={styles.waitingSentences}>Carregando</a>
                                )
                            }
                        </div>
                    </div>

                    <div id="step3" style={{display: (3 == step ? 'block' : 'none')}}>
                        <h1>Imagens</h1>
                        <h2>
                            Selecione as imagens que deseja para cada quadro. <br/>
                            Observação: As imagens finais serão redimensionadas e ajustadas para ajustarem-se ao vídeo.
                        </h2>

                        <div className={styles.images}>
                            {   content.imagesUrl ? (
                                    content.imagesUrl.map((urls, index) => {
                                        return (
                                            <div className={styles.imagesRow}>
                                                <ImageSelector urls={urls} content={content} handleInput={handleInput} index={index}/>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <a className={styles.waitingSentences}>Carregando</a>
                                )
                            }
                        </div>
                    </div>

                    <div id="step4" style={{display: (4 == step ? 'block' : 'none')}}>
                        <h1>Revisão</h1>
                        <h2>
                            Revise os dados de seu vídeo e deixe o restante conosco. <br/>
                            No momento o upload é feito apenas para o YouTube, ao finalizar a revisão será solicitado para você permitir o upload em sua conta do YouTube.
                        </h2>

                        <label for="titulo">Título:</label>
                        <input id="titulo" type="text" name="titulo" value={content.videoTitle} onChange={(event) => {handleInput('videoTitle', event.target.value)}}/>

                        <label for="descricao">Descrição:</label>
                        <textarea id="descricao" type="text" name="descricao" value={content.videoDescription} onChange={(event) => {handleInput('videoDescription', event.target.value)}}/>
                        

                        <label for="tags">Tags: <span>(Insira separado por vírgulas)</span></label>
                        <input id="tags" type="text" name="tags" value={content.videoTags} onChange={(event) => {handleInput('videoTags', event.target.value)}}/>
                    </div>
                </div>
                <div className={styles.controls}>
                    <button className={styles.back} onClick={handleBack}>Voltar</button>
                    <button className={styles.next} onClick={handleNext}>{step == 4 ? "Finalizar" : "Próximo passo"}</button>
                </div>
            </div>
        </>
    )
}
