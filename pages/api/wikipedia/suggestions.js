import authMiddleware from '../../../config/auth-middleware';

const algorithmia = require('algorithmia');

const algorithmiaAuthenticated = algorithmia(process.env.ALGORITHMIA_API_KEY);
const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');

export default async (request, response) => {
    await authMiddleware(request, response).catch();

    try {
        const { search } = request.body;

        console.log(`> [Suggestions] Buscando sugestões para o termo "${search}"`);

        // TODO: Implementar random sugestions

        const wikipediaArticlesSugestions = await wikipediaAlgorithm.pipe({ search });
        const wikipediaArticlesSugestionsArray = wikipediaArticlesSugestions.get();

        console.log(`> [Suggestions] Sugestões encontradas: ${wikipediaArticlesSugestionsArray.toString()}`);

        response.send(wikipediaArticlesSugestionsArray);
    } catch (exception) {
        console.error(exception);

        response.status(500).send([]);
    }
};
