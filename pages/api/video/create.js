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
            return response.send(500);
        }

        mysql.query(`INSERT INTO RelUsersVideos (IdUser, IdVideo) VALUES (${userId}, ${queryResponse.insertId})`, async (error, queryResponse) => {
            if (error) {
                console.log(error);
                return response.send(500);
            }

            // TODO: Criar o vídeo
            // response.status(200).send({});
        });
    });
}
