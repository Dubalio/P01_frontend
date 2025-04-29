

export const PORT = process.env.PORT || 5000; 
export const SALT_ROUNDS = 10;
export const SECRET_JWT_KEY = "este-es-la-clave-secreta-de-jwt"; 
export const ACCESS_TOKEN_EXPIRATION = '15m';
export const REFRESH_TOKEN_EXPIRATION = '7d';


export const MONGO_URI = "mongodb+srv://duperez:8oltYlSh@cluster0.qecrsi5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGO_URI || MONGO_URI.includes("<password>") || MONGO_URI.includes("TU_CONTRASEÑA_REAL")) {
    console.error("ERROR: MONGO_URI no está configurada correctamente en config.js. ¡Reemplaza los placeholders!");
}

