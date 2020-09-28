import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

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
            console.error(`> [Login] Error: ${error}`);
            return response.status(500).send('Erro ao validar seus dados');
        }

        if (!results[0]) {
            return response.status(401).send('E-mail ou senha incorretos');
        }

        const passwordCheck = await compare(password, results[0].Password);

        if (!passwordCheck) {
            return response.status(401).send('E-mail ou senha incorretos');
        }

        const token = sign({}, process.env.JWT_SECRET, {
            subject: `${results[0].Id}`,
            expiresIn: 3600,
        });

        return response.status(200).json({ token });
    });
};
