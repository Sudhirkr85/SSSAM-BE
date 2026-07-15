const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.log("Usage: node src/scripts/hashAdminPassword.js <password>");
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log("Plaintext password:", password);
  console.log("Bcrypt hash (save in ADMIN_PASSWORD_HASH in .env):");
  console.log(hash);
});
