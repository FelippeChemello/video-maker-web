import { hash } from 'bcryptjs';

import mysql from '../../../config/database';

export default async (request, response) => {
    const { email, password } = request.body;

    const emailPattern = /[a-zA-Z0-9]+[\.]?([a-zA-Z0-9]+)?[\@][a-z]{3,9}[\.][a-z]{2,5}/g;
    if (!emailPattern.test(email)) {
        response.status(400).send('E-mail Inválido');
    }

    mysql.query(`SELECT COUNT(1) AS validateIsNotRegistered FROM Users WHERE Email = ${mysql.escape(email)}`, async (error, result) => {
        if (error) {
            console.error(`> [SignUp] Error: ${error}`);
            return response.status(500).send('Erro ao validar seus dados');
        }

        if (result[0].validateIsNotRegistered) {
            return response.status(200).send('E-mail já cadastrado, realize o login');
        }

        const hashedPassword = await hash(password, 8);

        mysql.beginTransaction(() => {
            mysql.query(`INSERT INTO Users (Email, Password) VALUES (${mysql.escape(email)}, '${hashedPassword}')`, async (error, result) => {
                if (error) {
                    mysql.rollback();
                    console.error(`> [SignUp] Error: ${error}`);
                    return response.status(500).send('Erro ao criar seu cadastro, por favor, tente novamente mais tarde');
                }
                mysql.query(`INSERT INTO UsersVideosLimits (IdCliente, PaidVideosLimit) VALUES (${result.insertId}, 0)`, async (error, result) => {
                    if (error) {
                        mysql.rollback();
                        console.error(`> [SignUp] Error: ${error}`);
                        return response.status(500).send('Erro ao concluir seu cadastro, por favor, tente novamente mais tarde');
                    }

                    mysql.commit((err) => {
                        if (!err) {
                            // mysql.close();
                            return response.status(200).send('Cadastro realizado com sucesso');
                        }

                        return response.status(500).send('Erro ao concluir seu cadastro, por favor, tente novamente mais tarde');
                    });
                });
            });
        });
    });
};
