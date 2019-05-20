import { SynthesizeSpeechRequest, SynthesizeSpeechResponse } from '@google-cloud/text-to-speech';
import pollySsmlSplit from 'polly-ssml-split';

const CHARACTER_LIMIT = 5000; // https://cloud.google.com/text-to-speech/quotas

interface SsmlSplitOptions {
  softLimit?: number;
  hardLimit: number;
}

export const synthesizeSpeechPromise = (textToSpeechClient: any, ssmlPart: string, userRequestOptions: SynthesizeSpeechRequest): Promise<Buffer> => {
  return new Promise((resolve, reject): Buffer | any => {
    const request: SynthesizeSpeechRequest = {
      ...userRequestOptions,
      input: {
        ssml: ssmlPart
      }
    };

    return textToSpeechClient.synthesizeSpeech(request, (err: any, response: SynthesizeSpeechResponse) => {
      if (err) return reject(err);

      if (!(response.audioContent instanceof Buffer)) return reject(new Error('Response from Google Text-to-Speech API is not a Buffer.'));

      return resolve(response.audioContent);
    });
  });
}

export const synthesize = (textToSpeechClient: any, userRequestOptions: SynthesizeSpeechRequest) => {
  return new Promise(async (resolve, reject) => {
    try {
      let buffer = null;

      if (userRequestOptions.audioConfig.audioEncoding === 'AUDIO_ENCODING_UNSPECIFIED') {
        throw new Error('Please specify an audioEncoding, like: MP3, LINEAR16, OGG_OPUS');
      }

      if (userRequestOptions.audioConfig.audioEncoding === 'LINEAR16') {
        throw new Error('Package does not support LINEAR16 yet.');
      }

      if (userRequestOptions.audioConfig.audioEncoding === 'OGG_OPUS') {
        throw new Error('Package does not support OGG_OPUS yet.');
      }

      // Split the SSML into multiple parts with the Text to Speech character limit
      const ssmlParts = splitSsml(userRequestOptions.input['ssml']);

      // Do parallel requests to the API for each SSML part
      const synthesizeSpeechPromises = ssmlParts.map(ssmlPart => synthesizeSpeechPromise(textToSpeechClient, ssmlPart, userRequestOptions));

      // Wait for the requests to resolve
      // We end up with an array of Buffer's
      const allAudioBuffers = await Promise.all(synthesizeSpeechPromises);

      if (userRequestOptions.audioConfig.audioEncoding === 'MP3') {
        // Concatenate the buffers into one buffer
        buffer = Buffer.concat(allAudioBuffers, allAudioBuffers.reduce((len, a) => len + a.length, 0));
      }

      resolve(buffer);
    } catch (err) {
      reject(err);
    }
  });
};

export const splitSsml = (ssml: string) => {
  const options: SsmlSplitOptions = {
    softLimit: CHARACTER_LIMIT * 0.8, // MIN length of a single batch of split text, 10% less
    hardLimit: CHARACTER_LIMIT, // MAX length of a single batch of split text
  };

  try {
    pollySsmlSplit.configure(options);

    const ssmlParts: string[] = pollySsmlSplit.split(ssml);

    if (!ssmlParts || !ssmlParts.length) throw new Error('Got no SSML parts.');

    // Polly SSML split seems to sometimes return an empty "<speak></speak>"
    // We manually remove that from here
    const cleanSsmlParts = ssmlParts.filter((ssmlPart) => {
      if (ssmlPart !== '<speak></speak>') return ssmlPart;
    });

    return cleanSsmlParts;
  } catch (err) {
    throw err;
  }
};
