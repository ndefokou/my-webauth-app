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
exports.deriveEncryptionKey = deriveEncryptionKey;
function deriveEncryptionKey(prfResult) {
    return __awaiter(this, void 0, void 0, function* () {
        // Import PRF result as a raw key
        const baseKey = yield crypto.subtle.importKey('raw', prfResult.buffer, { name: 'HKDF' }, false, ['deriveKey']);
        // Derive an AES-GCM key
        const encryptionKey = yield crypto.subtle.deriveKey({
            name: 'HKDF',
            hash: 'SHA-256',
            salt: window.crypto.getRandomValues(new Uint8Array(32)),
            info: new TextEncoder().encode('encryption')
        }, baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
        return encryptionKey;
    });
}
