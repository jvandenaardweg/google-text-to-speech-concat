"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var text_to_speech_1 = __importDefault(require("@google-cloud/text-to-speech"));
var polly_ssml_split_1 = __importDefault(require("polly-ssml-split"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var credentials_1 = require("./utils/credentials");
var CHARACTER_LIMIT = 5000; // https://cloud.google.com/text-to-speech/quotas
var textToSpeechClient = new text_to_speech_1.default.TextToSpeechClient(credentials_1.getGoogleCloudCredentials());
exports.synthesizeSpeechPromise = function (ssmlPart, userRequestOptions) {
    return new Promise(function (resolve, reject) {
        var request = __assign({}, userRequestOptions, { input: {
                ssml: ssmlPart
            } });
        // console.log('Doing synthesizeSpeech...');
        return textToSpeechClient.synthesizeSpeech(request, function (err, response) {
            if (err)
                return reject(err);
            if (!(response.audioContent instanceof Buffer))
                return reject(new Error('Response from Google Text-to-Speech API is not a Buffer.'));
            // console.log('Got audioContent!');
            return resolve(response.audioContent);
        });
    });
};
exports.synthesizeMultipleSpeech = function (userRequestOptions, outputFile) {
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var buffer, ssmlParts, synthesizeSpeechPromises, allAudioBuffers, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    buffer = null;
                    if (userRequestOptions.audioConfig.audioEncoding === 'AUDIO_ENCODING_UNSPECIFIED') {
                        throw new Error('Please specify an audioEncoding, like: MP3, LINEAR16, OGG_OPUS');
                    }
                    if (userRequestOptions.audioConfig.audioEncoding === 'LINEAR16') {
                        throw new Error('Package does not support LINEAR16 yet.');
                    }
                    if (userRequestOptions.audioConfig.audioEncoding === 'OGG_OPUS') {
                        throw new Error('Package does not support OGG_OPUS yet.');
                    }
                    ssmlParts = exports.splitSsml(userRequestOptions.input['ssml']);
                    synthesizeSpeechPromises = ssmlParts.map(function (ssmlPart) { return exports.synthesizeSpeechPromise(ssmlPart, userRequestOptions); });
                    return [4 /*yield*/, Promise.all(synthesizeSpeechPromises)];
                case 1:
                    allAudioBuffers = _a.sent();
                    // console.log('All promises resolved.');
                    if (userRequestOptions.audioConfig.audioEncoding === 'MP3') {
                        // Concatenate the buffers into one buffer
                        buffer = Buffer.concat(allAudioBuffers, allAudioBuffers.reduce(function (len, a) { return len + a.length; }, 0));
                        // console.log('Concatenated the buffer.');
                    }
                    resolve(buffer);
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    reject(err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
};
exports.splitSsml = function (ssml) {
    var options = {
        softLimit: CHARACTER_LIMIT * 0.8,
        hardLimit: CHARACTER_LIMIT,
    };
    try {
        polly_ssml_split_1.default.configure(options);
        var ssmlParts = polly_ssml_split_1.default.split(ssml);
        if (!ssmlParts || !ssmlParts.length)
            throw new Error('Got no SSML parts.');
        // Polly SSML split seems to sometimes return an empty "<speak></speak>"
        // We manually remove that from here
        var cleanSsmlParts = ssmlParts.filter(function (ssmlPart) {
            if (ssmlPart !== '<speak></speak>')
                return ssmlPart;
        });
        return cleanSsmlParts;
    }
    catch (err) {
        throw err;
    }
};
(function () { return __awaiter(_this, void 0, void 0, function () {
    var request, outputFile, buffer, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                request = {
                    voice: {
                        languageCode: 'en-US',
                        ssmlGender: 'FEMALE'
                    },
                    input: {
                        ssml: "\n      <speak>\n        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>\n        <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of \"de Finibus Bonorum et Malorum\" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, \"Lorem ipsum dolor sit amet..\", comes from a line in section 1.10.32.</p>\n        <p>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from \"de Finibus Bonorum et Malorum\" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p>\n        <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>\n        <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.</p>\n      </speak>"
                    },
                    audioConfig: {
                        audioEncoding: 'MP3'
                    }
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                outputFile = path_1.default.join(__dirname, '../example-output/lorem-ipsum.mp3');
                return [4 /*yield*/, exports.synthesizeMultipleSpeech(request, outputFile)];
            case 2:
                buffer = _a.sent();
                // Handle the buffer. For example write it to a file or directly upload it to storage, like S3 or Google Cloud Storage
                return [4 /*yield*/, fs_extra_1.default.writeFile(outputFile, buffer, 'binary')];
            case 3:
                // Handle the buffer. For example write it to a file or directly upload it to storage, like S3 or Google Cloud Storage
                _a.sent();
                console.log('Got audio!', outputFile);
                return [3 /*break*/, 5];
            case 4:
                err_2 = _a.sent();
                console.log(err_2);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=index.js.map