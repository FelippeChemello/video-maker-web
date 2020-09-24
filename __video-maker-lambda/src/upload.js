const fs = require('fs');
const { google } = require('googleapis');

const youtube = google.youtube({ version: 'v3' });
const { OAuth2 } = google.auth;

const youtubeClientId = process.env.YOUTUBE_CLIENT_ID;
const youtubeClientSecret = process.env.YOUTUBE_CLIENT_SECRET;
const youtubeRedirectUrl = process.env.YOUTUBE_REDIRECT_URL;

function authorizeYoutube(tokens) {
    return new Promise((resolve) => {
        const oAuth2Client = new OAuth2(
            youtubeClientId,
            youtubeClientSecret,
            youtubeRedirectUrl,
        );

        oAuth2Client.setCredentials(tokens);

        google.options({
            auth: oAuth2Client,
        });

        resolve();
    });
}

async function uploadYoutubeThumbnail(videoId, thumbnailFileName) {
    return new Promise((resolve, reject) => {
        try {
            const requestParameters = {
                videoId,
                media: {
                    mimeType: 'image/jpeg',
                    body: fs.createReadStream(thumbnailFileName),
                },
            };

            youtube.thumbnails.set(requestParameters).then(resolve);
            console.log('> [youtube-robot] Thumbnail uploaded!');
        } catch (e) {
            console.log(`> [youtube-robot] Thumbnail não enviada ${e}`);
            reject(e);
        }
    });
}

exports.youtubeUpload = async (accessToken, videoFile, title, description, tags, thumbnailFile) => {
    try {
        await authorizeYoutube(accessToken);

        const requestParameters = {
            part: 'snippet, status',
            requestBody: {
                snippet: {
                    title,
                    description,
                    tags,
                },
                status: {
                    privacyStatus: 'private',
                },
            },
            media: {
                body: fs.createReadStream(videoFile),
            },
        };

        console.log('> [Upload] Starting upload to YouTube');
        const youtubeResponse = await youtube.videos.insert(requestParameters);

        console.log(`> [Upload] Video available at: https://youtu.be/${youtubeResponse.data.id}`);

        await uploadYoutubeThumbnail(youtubeResponse.data.id, thumbnailFile);

        return `https://youtu.be/${youtubeResponse.data.id}`;
    } catch (e) {
        console.error(`> [Upload] YouTube upload failed: ${e}`);
    }
};
