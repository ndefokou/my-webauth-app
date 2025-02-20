"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const sqlite3 = __importStar(require("sqlite3"));
const sqlite_1 = require("sqlite");
function openDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield (0, sqlite_1.open)({
                filename: "./database.db",
                driver: sqlite3.Database,
            });
        }
        catch (error) {
            console.error("Database connection error:", error);
            throw error;
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const db = yield openDatabase();
            // Generate a secure AES-GCM key
            const encryptionKey = yield generateEncryptionKey();
            // Encrypt and store data
            const data = "Sensitive information";
            const encryptedData = yield encryptData(data, encryptionKey);
            // Convert encrypted data to base64 for storage
            const encryptedBase64 = bufferToBase64(encryptedData);
            yield db.run("INSERT INTO sensitive_table (encrypted_column) VALUES (?)", encryptedBase64);
            // Retrieve and decrypt data
            const id = 1;
            const row = yield db.get("SELECT encrypted_column FROM sensitive_table WHERE id = ?", id);
            if (row) {
                // Convert base64 back to ArrayBuffer
                const encryptedBuffer = base64ToBuffer(row.encrypted_column);
                const decryptedData = yield decryptData(encryptedBuffer, encryptionKey);
                console.log("🔓 Decrypted Data:", decryptedData);
            }
            else {
                console.warn("⚠️ No data found for the given ID.");
            }
        }
        catch (error) {
            console.error("❌ Error in main function:", error);
        }
    });
}
// Generating a random AES-GCM encryption key
function generateEncryptionKey() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield crypto.subtle.generateKey({
                name: "AES-GCM",
                length: 256,
            }, true, // Extractable
            ["encrypt", "decrypt"]);
        }
        catch (error) {
            console.error("Key generation error:", error);
            throw error;
        }
    });
}
// Encrypting the data using AES-GCM with improved error handling
function encryptData(data, key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!data)
                throw new Error("Data to encrypt cannot be empty.");
            if (!key)
                throw new Error("Encryption key is required.");
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            // Generating a secure random IV (12 bytes for AES-GCM)
            const iv = crypto.getRandomValues(new Uint8Array(12));
            // Encrypting data
            const encryptedData = yield crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, dataBuffer);
            // Combine IV and encrypted data
            const combinedBuffer = new Uint8Array(iv.length + encryptedData.byteLength);
            combinedBuffer.set(iv, 0);
            combinedBuffer.set(new Uint8Array(encryptedData), iv.length);
            return combinedBuffer.buffer;
        }
        catch (error) {
            console.error("Encryption error:", error);
            throw error;
        }
    });
}
//  Decrypting data using AES-GCM with error handling
function decryptData(encryptedData, key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!encryptedData || encryptedData.byteLength < 12) {
                throw new Error("Invalid encrypted data: Buffer is too small.");
            }
            if (!key) {
                throw new Error("Decryption key is required.");
            }
            const combinedBuffer = new Uint8Array(encryptedData);
            // Extract IV (first 12 bytes)
            const iv = combinedBuffer.slice(0, 12);
            // Extract encrypted content
            const encryptedContent = combinedBuffer.slice(12);
            // Decrypt the data
            const decryptedData = yield crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedContent);
            return new TextDecoder().decode(decryptedData);
        }
        catch (error) {
            console.error("Decryption error:", error);
            throw error;
        }
    });
}
// ✅ Convert ArrayBuffer to Base64
function bufferToBase64(buffer) {
    return Buffer.from(buffer).toString("base64");
}
// ✅ Convert Base64 to ArrayBuffer
function base64ToBuffer(base64) {
    return Buffer.from(base64, "base64");
}
// ✅ Run the main function safely
main().catch((error) => console.error("Unhandled error:", error));
