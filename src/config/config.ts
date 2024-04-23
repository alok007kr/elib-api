import {config as conf} from 'dotenv'

conf();

const _config = {
    port: process.env.PORT,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    databaseUrl: process.env.MONGO_CONNECTION_STRING,
}


//Object.freeze() : It provides READ-ONLY
export const config = Object.freeze(_config);