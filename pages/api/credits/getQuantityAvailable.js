import mysql from '../../../config/database';
import authMiddleware from '../../../config/auth-middleware';

export default async (request, response) => {
    const userId = await authMiddleware(request, response);

    mysql.query(`SELECT PaidVideosLimit FROM UsersVideosLimits WHERE IdCliente = ${userId}`, async (error, result) => {
        if (error) {
            response.send(500);
        }

        response.send(result[0].PaidVideosLimit);
    });
};
