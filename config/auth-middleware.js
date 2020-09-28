import { verify } from 'jsonwebtoken';

export default function (req, res) {
    return new Promise(((resolve, reject) => {
        const authHeader = req.headers.authorization;

        try {
            if (!authHeader) {
                throw new Error('JWT is missing');
            }

            const [, token] = authHeader.split(' ');

            const decoded = verify(token, process.env.JWT_SECRET);

            const { sub } = decoded;

            resolve(sub);
        } catch (err) {
            // Catch the JWT Expired or Invalid errors
            return res.redirect('/login');
        }
    }));
}
