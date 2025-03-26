const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
    let token = req.header("Authorization");
    token = token.split(" ")[1];
    console.log(token);
    
    if (!token) {
        return res.status(403).json({ message: "Token no proporcionado" });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Token inválido" });
            }
            req.user = decoded;
            next();
        });
    } catch (err) {
        return res.status(403).json({ message: "Token inválido" });
    }
};

module.exports = authenticateJWT;
