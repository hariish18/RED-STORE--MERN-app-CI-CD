// Utility script: resets a user's password via email
// (e.g. forgotten admin password when no mail service is configured
// for "forgot password" flow).
//
// The new password is prompted in the terminal (masked input) and
// never passed as a CLI argument, so it never appears in shell history.
//
// Usage: node scripts/resetPassword.js you@example.com
//    or: npm run reset:password -- you@example.com

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const readline = require("readline");
const mongoose = require("mongoose");
const connectDB = require("../config/connectDB");
const User = require("../model/User");

const [, , email] = process.argv;

// Same bounds as updateProfile/resetPassword in auth.controller.js
const MIN_LENGTH = 6;
const MAX_LENGTH = 32;

// Reads a line without echoing typed characters ("*" per character).
// If stdin is not a TTY (redirected input), falls back to plain line reading.
const askHidden = (question) =>
    new Promise((resolve) => {
        const { stdin, stdout } = process;

        if (!stdin.isTTY) {
            const rl = readline.createInterface({ input: stdin, terminal: false });
            stdout.write(question);
            rl.once("line", (line) => {
                rl.close();
                resolve(line);
            });
            return;
        }

        stdout.write(question);
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding("utf8");

        let input = "";
        const onData = (chunk) => {
            for (const char of chunk) {
                if (char === "\r" || char === "\n" || char === "\u0004") {
                    stdin.setRawMode(false);
                    stdin.pause();
                    stdin.removeListener("data", onData);
                    stdout.write("\n");
                    resolve(input);
                    return;
                }
                if (char === "\u0003") {
                    // Ctrl+C
                    stdin.setRawMode(false);
                    stdout.write("\nCancelled.\n");
                    process.exit(130);
                }
                if (char === "\u007f" || char === "\b") {
                    // Backspace
                    if (input.length > 0) {
                        input = input.slice(0, -1);
                        stdout.write("\b \b");
                    }
                    continue;
                }
                input += char;
                stdout.write("*");
            }
        };
        stdin.on("data", onData);
    });

const resetPassword = async () => {
    if (!email) {
        console.error("Usage: node scripts/resetPassword.js you@example.com");
        process.exit(1);
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
        console.log(`Not found: ${email}`);
        await mongoose.disconnect();
        process.exit(1);
    }

    const password = await askHidden("New password: ");
    const confirm = await askHidden("Confirm password: ");

    // User schema applies trim to password: we validate the value as it will be hashed
    const trimmed = password.trim();
    let error = null;
    if (password !== confirm) {
        error = "Passwords do not match.";
    } else if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
        error = `Password must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`;
    }
    if (error) {
        console.error(error);
        await mongoose.disconnect();
        process.exit(1);
    }

    // Same path as signup: pre('save') hook on User model hashes
    // password with bcrypt (10 rounds). Also invalidates any active reset token.
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log(`Password updated for ${user.email}`);

    await mongoose.disconnect();
    process.exit(0);
};

resetPassword().catch(async (error) => {
    // Only the message: full error object (e.g. ValidationError)
    // might contain the value of password field
    console.error("Script failed:", error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
});
