import mysql from 'mysql';

const connection = mysql.createConnection({
    host: process.env.DATABASE_URL,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

connection.connect((error) => {
    if (error) {
        console.error('> [Database] Connection error');
    } else {
        console.log('> [Database] Connection established');
    }
});

module.exports = {
    query: (text, callback) => connection.query(text, callback),
    escape: (text) => connection.escape(text),
    close: () => connection.end(() => console.log('> [Database] Connection closed')),
    beginTransaction: (callback) => connection.beginTransaction(callback),
    rollback: (callback) => connection.rollback(callback),
    commit: (callback) => connection.commit(callback),
};
