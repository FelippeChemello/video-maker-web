import {
    compare,
} from 'bcryptjs';

import mysql from '../../../config/database';

export default async (request, response) => {
    const {
        email,
        password,
    } = request.body;

    if (!email || !password) {
        return response.send('E-mail ou senha incorretos');
    }

    mysql.query(`SELECT * FROM Users WHERE Email = ${mysql.escape(email)}`, async (error, results) => {
        if (error) {
            console.error(`> [SignUp] Error: ${error}`);
            return response.status(500).send('Erro ao validar seus dados');
        }

        if (!results[0].Email) {
            return response.status(200).send('E-mail ou senha incorretos');
        }

        const passwordCheck = await compare(password, results[0].Password);

        if (!passwordCheck) {
            return response.status(200).send('E-mail ou senha incorretos');
        }

        return response.status(200).send('Login efetuado com sucesso');
    });
};
