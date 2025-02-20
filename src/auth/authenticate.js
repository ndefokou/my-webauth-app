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
exports.authenticateCredential = authenticateCredential;
function authenticateCredential(credentialId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(credentialId instanceof ArrayBuffer)) {
                throw new Error("Invalid credentialId: Expected an ArrayBuffer.");
            }
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);
            // Generate a unique salt for authentication request
            const salt = crypto.getRandomValues(new Uint8Array(32));
            const publicKey = {
                challenge: challenge.buffer,
                allowCredentials: [
                    {
                        type: "public-key",
                        id: credentialId,
                        transports: ["internal"],
                    },
                ],
                timeout: 60000,
                rpId: window.location.hostname,
                extensions: {
                    prf: {
                        eval: {
                            first: salt,
                        },
                    },
                },
            };
            const assertion = yield navigator.credentials.get({ publicKey });
            if (!assertion) {
                throw new Error("Authentication failed: No assertion returned.");
            }
            // Process assertion and extract PRF result
            return assertion;
        }
        catch (error) {
            console.error("Authentication error:", error);
            throw error;
        }
    });
}
