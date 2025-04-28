import jwt from "jsonwebtoken";

export const verifyTokenBuyer=(req, res, next)=> {
    try{
        const token=req.cookies.buyerToken;
        if(!token){
            return res.status(400).json({
                message: "Buyer unauthorized",
                success: false
            });
        }

        const decode=jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(!decode){
            return res.status(400).json({
                message: "Invalid token",
                success: false
            });
        }

        req.userId=decode.userId;
        next();
    }catch(error){
        return res.status(500).json({
            message: error.message || error,
            success: false
        })
    }
}