const algorithmia = require('algorithmia');
const sentenceBoundaryDetection = require('sbd');

const algorithmiaAuthenticated = algorithmia(process.env.ALGORITHMIA_API_KEY);
const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');

function validateLanguage(language) {
    const validLanguages = ['pt', 'en'];

    if (!validLanguages.includes(language)) throw new Error('Invalid language!');
}

function validateArticleName(articleName) {
    if (typeof articleName !== 'string' || articleName === '') throw new Error('Article Name must be a string');
}

function removeBlankLinesAndMarkdown(text) {
    const allLines = text.split('\n');

    const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
        if (line.trim().length === 0 || line.trim().startsWith('=')) {
            return false;
        }
        return true;
    });

    return withoutBlankLinesAndMarkdown.join(' ');
}

function removeDatesInParentheses(text) {
    return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/ {2}/g, ' ');
}

function sanitizeContent(content) {
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content);
    const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown);

    return withoutDatesInParentheses;
}

function breakContentIntoSentences(content) {
    const sentencesArray = [];

    const sentences = sentenceBoundaryDetection.sentences(content);

    sentences.forEach((sentence) => {
        sentencesArray.push({
            text: sentence,
        });
    });

    return sentencesArray;
}

export default async (request, response) => {
    try {
        const { articleName, lang } = request.body;

        console.log(`> [Article] Buscando artigo "${articleName}" em ${lang.toUpperCase()}`);

        validateLanguage(lang);
        validateArticleName(articleName);

        const input = {
            articleName,
            lang,
        };

        try {
            const wikipediaResponse = await wikipediaAlgorithm.pipe(input);
            const articleData = wikipediaResponse.get();

            articleData.content = sanitizeContent(articleData.content);
            articleData.sentences = breakContentIntoSentences(articleData.content);

            console.log('> [Article] Artigo encontrado e dados enviados');

            response.send(articleData);
        } catch (exception) {
            throw new Error('Article not found in language required, please try again');
        }
    } catch (exception) {
        console.error(exception);

        response.status(500).send(exception.message);
    }
};
