import { verify } from 'jsonwebtoken';

function cookiesToJson(cookieStr) {
    const output = {};
    cookieStr.split(/\s*;\s*/).forEach((pair) => {
        pair = pair.split(/\s*=\s*/);
        output[pair[0]] = pair.splice(1).join('=');
    });

    return output;
}

export default function (req, res) {
    try {
        console.log(req.headers.cookie);
        const jsonCookie = cookiesToJson(req.headers.cookie);

        console.log(`> [AuthMiddleware] Token ${jsonCookie.token}`);

        const decoded = verify(jsonCookie.token, process.env.JWT_SECRET);

        const {
            sub,
        } = decoded;

        console.log(`> [AuthMiddleware] Client ${sub}`);

        res.status(200).send({});
    } catch (err) {
        res.status(401).send({});
    }
}

// export default async (request, response) => {
//     try {
//         const authHeader = request.headers.authorization;

//         if (!authHeader) {
//             throw new Error('JWT is missing');
//         }

//         const [, token] = authHeader.split(' ');

//         if (!token) {
//             throw new Error('Invalid JWT');
//         }

//         verify(token, process.env.JWT_SECRET);

//         response.status(200).send({});
//     } catch (err) {
//         console.log(err);

//         response.status(401).send({});
//     }
// };
