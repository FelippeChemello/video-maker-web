exports.handler = async (event, context, callback) => {    
    const body = JSON.parse(event.body)
    
    const response = {
        statusCode: 200,
        body: JSON.stringify(`Hello ${body.name}!`),
    };
    return response;
};