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
    return new Promise(((resolve, reject) => {
        try {
            const jsonCookie = cookiesToJson(req.headers.cookie);

            console.log(`> [AuthMiddleware] Token ${jsonCookie.token}`);

            const decoded = verify(jsonCookie.token, process.env.JWT_SECRET);

            const { sub } = decoded;

            console.log(`> [AuthMiddleware] Client ${sub}`);

            resolve(sub);
        } catch (err) {
            return res.status(302).send('/login');
        }
    }));
}
