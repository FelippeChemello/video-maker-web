const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

const watsonApiKey = process.env.WATSON_API_KEY;

const nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/',
});

async function fetchWatsonAndReturnKeywords(sentence) {
    return new Promise((resolve, reject) => {
        nlu.analyze({
            text: sentence,
            features: {
                keywords: {},
            },
        }, (error, response) => {
            if (error) {
                reject(error);
                return;
            }

            const keywords = response.keywords.map((keyword) => keyword.text);

            resolve(keywords);
        });
    });
}

export default async (request, response) => {
    try {
        const { sentence } = request.body;

        console.log(`> [Keywords] Buscando keywords da frase "${sentence}"`);

        const keywords = await fetchWatsonAndReturnKeywords(sentence);

        console.log(`> [Keywords] Keywords encontradas: ${keywords.toString()}`);

        response.send(keywords);
    } catch (exception) {
        console.error(exception);

        response.status(500).send([]);
    }
};
