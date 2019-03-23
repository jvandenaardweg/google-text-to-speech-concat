"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create the required Google Cloud Credentials based on env variables
// So we can use it on any platform and not store our credentials in git
exports.getGoogleCloudCredentials = function () {
    return {
        projectId: process.env.GOOGLE_CLOUD_CREDENTIALS_PROJECT_ID,
        credentials: {
            client_email: process.env.GOOGLE_CLOUD_CREDENTIALS_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_CLOUD_CREDENTIALS_PRIVATE_KEY,
        }
    };
};
//# sourceMappingURL=credentials.js.map