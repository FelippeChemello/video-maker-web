const { google } = require('googleapis');
const syncRequest = require('sync-request');

const customSearch = google.customsearch('v1');

const googleCustomSearchApiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
const googleCustomSearchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

async function fetchGoogleAndReturnImagesLinks(query) {
    const googleResponse = await customSearch.cse.list({
        auth: googleCustomSearchApiKey,
        cx: googleCustomSearchEngineId,
        q: query,
        searchType: 'image',
        num: 5,
        fileType: 'png',
    });

    if (googleResponse.status !== 200) throw new Error('Images not found');

    const base64Images = [];
    googleResponse.data.items.forEach((imageData, index) => {
        console.log(`> [Images] Convertendo a imagem ${index} para base64`);

        const imageResponse = syncRequest('GET', imageData.link, { encoding: 'binary' });
        const base64 = Buffer.from(imageResponse.getBody()).toString('base64');
        base64Images.push(base64);

        console.log(`> [Images] Imagem ${index} convertida com sucesso`);
    });

    return base64Images;
}

export default async (request, response) => {
    try {
        const { query } = request.body;

        console.log(`> [Images] Buscando imagens para o termo "${query}"`);

        const imagesBase64Encoded = await fetchGoogleAndReturnImagesLinks(query);

        console.log(`> [Images] ${imagesBase64Encoded.length} imagens encontradas`);

        response.send(imagesBase64Encoded);
    } catch (exception) {
        console.error(exception.message);

        response.status(500).send({});
    }
};
