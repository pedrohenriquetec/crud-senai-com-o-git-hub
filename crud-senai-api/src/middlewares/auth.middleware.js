import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token  ausente " });
        }
    
        const token = auth.substring("Bearer ".length).trim();

        const Payload = jwt.verify(token, process.env.jwt_secret);

        req.auth = {
            userdId:Payload.sub,
            profile:Payload.profile
        };

        next();
    }   catch (err){
        return res.status(401).json({ message: "Token  invalido ou expirado" });
    }
}