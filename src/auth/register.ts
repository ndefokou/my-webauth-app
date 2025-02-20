export async function registerCredential(userId: string, userName: string, userEmail: string) {
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

        const publicKey: PublicKeyCredentialCreationOptions = {
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

        const credential = await navigator.credentials.create({ publicKey });

        if (!credential) {
            throw new Error("Registration failed: No credential returned.");
        }

        // Store credential information securely
        return credential;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
}
