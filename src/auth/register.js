"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCredential = registerCredential;
function registerCredential(userId, userName, userEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!userId) {
                throw new Error("User ID is required for registration.");
            }
            if (!userName || !userEmail) {
                throw new Error("User name and email are required for registration.");
            }
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);
            // Generate a unique salt for this registration request
            const salt = crypto.getRandomValues(new Uint8Array(32));
            const publicKey = {
                challenge: challenge.buffer,
                rp: { name: "Your Application", id: window.location.hostname },
                user: {
                    id: new TextEncoder().encode(userId),
                    name: userEmail,
                    displayName: userName,
                },
                pubKeyCredParams: [
                    { type: "public-key", alg: -7 }, // ES256 (ECDSA using P-256 and SHA-256)
                    { type: "public-key", alg: -257 } // RS256 (RSA using SHA-256)
                ],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    residentKey: "required",
                },
                timeout: 60000,
                extensions: {
                    prf: {
                        eval: {
                            first: salt
                        },
                    },
                },
            };
            const credential = yield navigator.credentials.create({ publicKey });
            if (!credential) {
                throw new Error("Registration failed: No credential returned.");
            }
            // Store credential information securely
            return credential;
        }
        catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    });
}
