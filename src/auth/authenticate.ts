export async function authenticateCredential(credentialId: ArrayBuffer) {
    try {
        if (!(credentialId instanceof ArrayBuffer)) {
            throw new Error("Invalid credentialId: Expected an ArrayBuffer.");
        }

        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

         // Generate a unique salt for authentication request
         const salt = crypto.getRandomValues(new Uint8Array(32)); 

        const publicKey: PublicKeyCredentialRequestOptions = {
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

        const assertion = await navigator.credentials.get({ publicKey });

        if (!assertion) {
            throw new Error("Authentication failed: No assertion returned.");
        }

        // Process assertion and extract PRF result
        return assertion;
    } catch (error) {
        console.error("Authentication error:", error);
        throw error;
    }
}
