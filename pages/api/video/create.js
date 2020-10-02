import axios from 'axios';

import authMiddleware from '../../../config/auth-middleware';
import mysql from '../../../config/database';

export default async function (request, response) {
    const userId = await authMiddleware(request, response).catch();

    console.log(request.body);

    const {
        title,
        description,
        tags,
        imagesUrl,
        sentences,
    } = request.body;

    mysql.query(`INSERT INTO Videos                 
    (Title, Description, Tags, Sentences, ImagesUrl) VALUES                 
    (${mysql.escape(title)}, ${mysql.escape(description)}, ${mysql.escape(tags)}, ${mysql.escape(sentences.toString())}, ${mysql.escape(imagesUrl.toString())})`,
    async (error, queryResponse) => {
        if (error) {
            console.log(error);
            return response.status(500).send({});
        }

        mysql.query(`INSERT INTO RelUsersVideos (IdUser, IdVideo) VALUES (${userId}, ${queryResponse.insertId})`, async (error, queryResponse) => {
            if (error) {
                console.log(error);
                return response.status(500).send({});
            }

            mysql.query(`SELECT RefreshCode AS RefreshToken FROM UserOAuth WHERE IdUser = ${userId}`, async (error, rows) => {
                if (error) {
                    console.log(error);
                    return response.status(500).send({});
                }

                if (!rows[0].RefreshToken) {
                    console.log(rows);
                    return response.status(500).send({});
                }

                const refreshToken = rows[0].RefreshToken;

                axios.post('https://accounts.google.com/o/oauth2/token', {
                    client_id: process.env.YOUTUBE_CLIENT_ID,
                    client_secret: process.env.YOUTUBE_CLIENT_SECRET,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token',
                }).then((returnTokens) => {
                    const youtubeTokens = returnTokens.data;

                    const url = process.env.NODE_ENV == 'development' ? 'http://localhost:8080' : 'https://us-central1-youtubevideomaker.cloudfunctions.net/video-maker-1';
                    axios.post(url, {
                        auth: process.env.AUTH_FUNCTION,
                        youtubeToken: {
                            access_token: youtubeTokens.access_token,
                        },
                        title,
                        description,
                        tags,
                        imagesUrl,
                        sentences,
                    }).then((r) => response.status(200).send({ ok: 'ok' }));
                }).catch((err) => {
                    console.log(err);
                    return response.status(500).send({});
                });

                // TODO: Criar o vídeo
                // response.status(200).send({});
            });
        });
    });
}
