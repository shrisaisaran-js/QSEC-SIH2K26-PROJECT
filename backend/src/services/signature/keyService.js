const crypto = require("crypto");

function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return {
    publicKey,
    privateKey,
  };
}


function signMessage(message, privateKey) {
  const signature = crypto.sign(
    null,
    Buffer.from(message, "utf8"),
    privateKey
  );

  return signature.toString("base64");
}
function verifySignature(message, signature, publicKey) {
  return crypto.verify(
    null,
    Buffer.from(message, "utf8"),
    publicKey,
    Buffer.from(signature, "base64")
  );
}

module.exports = {
  generateKeyPair,
  signMessage,
  verifySignature,
};