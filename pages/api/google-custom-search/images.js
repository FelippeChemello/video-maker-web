const { google } = require('googleapis');

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

    const imagesUrl = [];
    googleResponse.data.items.forEach((imageData) => imagesUrl.push(imageData.link));

    return imagesUrl;
}

export default async (request, response) => {
    try {
        const { query } = request.body;

        console.log(`> [Images] Buscando imagens para o termo "${query}"`);

        const images = await fetchGoogleAndReturnImagesLinks(query);

        console.log(`> [Images] ${images.length} imagens encontradas`);

        console.log(images);

        response.status(200).send(images);
    } catch (exception) {
        console.error(exception.message);

        response.status(500).send({});
    }
};
