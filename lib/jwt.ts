import { JWTPayload, SignJWT, errors, jwtVerify } from "jose";
import { TokenExpiredError, TokenInvalidError } from "./errors";

interface Params {
  payload: any;
  secret: string;
  expiresIn: number;
}

export const encode = (params: Params) => {
  const { payload, secret, expiresIn } = params;
  const sign = new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("SimpleAuth")
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .setSubject("auth");

  const secretKey = Buffer.from(secret, "base64");
  return sign.sign(secretKey);
};

export const decode = async (token: string, secret: string) => {
  const secretKey = Buffer.from(secret, "base64");
  let payload: JWTPayload;
  try {
    const { payload: decoded } = await jwtVerify(token, secretKey, {
      issuer: "SimpleAuth",
      subject: "auth",
    });

    payload = decoded;
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      throw new TokenExpiredError();
    }
    if (error instanceof errors.JWTInvalid) {
      throw new TokenInvalidError();
    }
    throw new Error("An error occurred");
  }

  return payload;
};
