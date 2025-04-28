import jwt from "jsonwebtoken";

export const verifyTokenSeller=(req, res, next)=> {
    try{
        const token=req.cookies.sellerToken;
        if(!token){
            return res.status(400).json({
                message: "Seller unauthorized",
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