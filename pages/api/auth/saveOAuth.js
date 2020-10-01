import axios from 'axios';
import authMiddleware from '../../../config/auth-middleware';
import mysql from '../../../config/database';

export default async function (request, response) {
    const userId = await authMiddleware(request, response).catch();

    const { code } = request.body;

    axios.post('https://accounts.google.com/o/oauth2/token', {
        code,
        client_id: '986152848698-n9pne5963q9i0nr2vd9qifgek25o8cn8.apps.googleusercontent.com',
        client_secret: 'yHkebYZkfRZ_zYPH8sjK_ewE',
        redirect_uri: 'http://localhost:3000/oauth2callback',
        grant_type: 'authorization_code',
    }).then((res) => {
        mysql.query(`INSERT INTO UserOAuth (IdUser, AuthorizationCode, refreshCode) VALUES (${userId}, ${mysql.escape(code)}, '${res.data.refresh_token}')`, async (error, queryResponse) => {
            if (error) {
                console.log(error);
                return response.send(500);
            }

            response.status(200).send({});
        });
    }).catch((err) => {
        console.log(err);
    });
}
