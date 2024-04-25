import { JWTPayload, SignJWT, errors, jwtVerify } from "jose";
import { TokenExpiredError, TokenInvalidError } from "./errors";

interface Params {
  payload: any;
  secret: string;
  expiresIn: number;
}

export const encode = (params: Params) => {
  const { payload = {}, secret, expiresIn } = params;

  const sign = new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer("AuthFlow")
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn);

  const secretKey = getSecretKey(secret);
  return sign.sign(secretKey);
};

interface DecodeParams {
  token: string;
  secret: string;
}

export const decode = async ({ secret, token }: DecodeParams) => {
  const secretKey = getSecretKey(secret);

  let payload: JWTPayload;
  try {
    const { payload: decoded } = await jwtVerify(token, secretKey, {
      issuer: "AuthFlow",
    });

    payload = decoded;
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      throw new TokenExpiredError();
    }
    if (
      error instanceof errors.JWTInvalid ||
      error instanceof errors.JWSSignatureVerificationFailed ||
      error instanceof errors.JWSInvalid
    ) {
      throw new TokenInvalidError();
    }

    console.error(error, "Error decoding token");
    throw new Error("An error occurred");
  }

  return payload;
};

const getSecretKey = (secret: string) => new TextEncoder().encode(secret);
