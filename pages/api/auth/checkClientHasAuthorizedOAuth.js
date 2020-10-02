import authMiddleware from '../../../config/auth-middleware';
import mysql from '../../../config/database';

export default async function (request, response) {
    const userId = await authMiddleware(request, response).catch();

    mysql.query(`SELECT COUNT(1) AS count FROM UserOAuth WHERE IdUser = ${userId}`, async (error, queryResponse) => {
        if (error) {
            console.log(error);
            return response.send(500);
        }

        if (queryResponse[0].count == 0) {
            const baseUrl = process.env.NODE_ENV == 'development' ? 'http://localhost:3000' : 'https://vmaker.codestack.me';
            const redirectUrl = encodeURIComponent(`${baseUrl}/oauth2callback`);
            return response.status(200).send({ redirect: `https://accounts.google.com/o/oauth2/auth?client_id=986152848698-n9pne5963q9i0nr2vd9qifgek25o8cn8.apps.googleusercontent.com&redirect_uri=${redirectUrl}&scope=https://www.googleapis.com/auth/youtube&response_type=code&access_type=offline` });
        }

        response.status(200).send({});
    });
}
