const imageDownloader = require('image-downloader');
const path = require('path');

async function downloadAndSave(url, fileName) {
    return imageDownloader.image({
        url,
        dest: path.resolve(__dirname, '..', '..', 'files', `${fileName}-0-original.png`),
    });
}

export default async (request, response) => {
    try {
        const {
            imageUrl,
            uuid,
        } = request.body;

        await downloadAndSave(imageUrl, uuid);
        //TODO: Encontrar uma forma de realizar upload de imagens

        response.status(200);
    } catch (exception) {
        console.error(exception);

        response.status(500).send([]);
    }
};
