import mysql from '../../config/database';
import authMiddleware from '../../config/auth-middleware';

export default async (request, response) => {
    const userId = await authMiddleware(request, response);

    mysql.query(`SELECT v.* FROM Videos AS v JOIN RelUsersVideos AS ruv WHERE ruv.IdUser = ${userId}`, async (error, videos) => {
        if (error) {
            response.send(500);
        }

        const videosData = [];

        videos.forEach((video) => videosData.push({
            id: video.Id,
            title: video.Title,
            url: video.FinalUrl,
        }));

        response.send(videosData);
    });
};
