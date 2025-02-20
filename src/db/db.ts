import * as sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

async function openDatabase(): Promise<Database> {
  try {
    return await open({
      filename: "./database.db", 
      driver: sqlite3.Database,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

async function main() {
  try {
    const db = await openDatabase();

    // Generate a secure AES-GCM key
    const encryptionKey = await generateEncryptionKey();

    // Encrypt and store data
    const data = "Sensitive information";
    const encryptedData = await encryptData(data, encryptionKey);

    // Convert encrypted data to base64 for storage
    const encryptedBase64 = bufferToBase64(encryptedData);
    await db.run("INSERT INTO sensitive_table (encrypted_column) VALUES (?)", encryptedBase64);

    // Retrieve and decrypt data
    const id = 1;
    const row = await db.get("SELECT encrypted_column FROM sensitive_table WHERE id = ?", id);

    if (row) {
      // Convert base64 back to ArrayBuffer
      const encryptedBuffer = base64ToBuffer(row.encrypted_column);

      const decryptedData = await decryptData(encryptedBuffer, encryptionKey);
      console.log("🔓 Decrypted Data:", decryptedData);
    } else {
      console.warn("⚠️ No data found for the given ID.");
    }
  } catch (error) {
    console.error("❌ Error in main function:", error);
  }
}

// Generating a random AES-GCM encryption key
async function generateEncryptionKey(): Promise<CryptoKey> {
  try {
    return await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true, // Extractable
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("Key generation error:", error);
    throw error;
  }
}

// Encrypting the data using AES-GCM with improved error handling
async function encryptData(data: string, key: CryptoKey): Promise<ArrayBuffer> {
  try {
    if (!data) throw new Error("Data to encrypt cannot be empty.");
    if (!key) throw new Error("Encryption key is required.");

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Generating a secure random IV (12 bytes for AES-GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypting data
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combinedBuffer = new Uint8Array(iv.length + encryptedData.byteLength);
    combinedBuffer.set(iv, 0);
    combinedBuffer.set(new Uint8Array(encryptedData), iv.length);

    return combinedBuffer.buffer;
  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
}

//  Decrypting data using AES-GCM with error handling
async function decryptData(encryptedData: ArrayBuffer, key: CryptoKey): Promise<string> {
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
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedContent
    );

    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error("Decryption error:", error);
    throw error;
  }
}

// ✅ Convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// ✅ Convert Base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  return Buffer.from(base64, "base64");
}

// ✅ Run the main function safely
main().catch((error) => console.error("Unhandled error:", error));
