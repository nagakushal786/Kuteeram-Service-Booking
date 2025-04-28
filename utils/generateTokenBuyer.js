import jwt from "jsonwebtoken";

const generateTokenBuyer=(res, userId)=> {
    const token=jwt.sign({userId}, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d"
    });

    res.cookie("buyerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV==="production",
        sameSite: "strict",
        maxAge: 7*24*60*60*1000
    });

    return token;
}

export default generateTokenBuyer;