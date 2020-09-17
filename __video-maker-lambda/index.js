exports.handler = async (event) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify(`Não acredito que o deploy é tão fácil!`),
    };
    return response;
};