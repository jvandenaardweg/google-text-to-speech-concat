import TextToSpeech, { SynthesizeSpeechRequest } from '@google-cloud/text-to-speech';
import pollySsmlSplit from 'polly-ssml-split';
import fsExtra from 'fs-extra';
import path from 'path';

import { getGoogleCloudCredentials } from './utils/credentials';

const CHARACTER_LIMIT = 5000; // https://cloud.google.com/text-to-speech/quotas

interface SsmlSplitOptions {
  softLimit?: number;
  hardLimit: number;
}

const textToSpeechClient = new TextToSpeech.TextToSpeechClient(getGoogleCloudCredentials());

export const synthesizeSpeechPromise = (ssmlPart: string, userRequestOptions: SynthesizeSpeechRequest): Promise<Buffer> => {
  return new Promise((resolve, reject): Buffer | any => {
    const request = {
      ...userRequestOptions,
      input: {
        ssml: ssmlPart
      }
    };

    // console.log('Doing synthesizeSpeech...');

    return textToSpeechClient.synthesizeSpeech(request, (err, response) => {
      if (err) return reject(err);

      if (!(response.audioContent instanceof Buffer)) return reject(new Error('Response from Google Text-to-Speech API is not a Buffer.'));

      // console.log('Got audioContent!');
      return resolve(response.audioContent);
    });
  });
}

export const synthesizeMultipleSpeech = (userRequestOptions: SynthesizeSpeechRequest, outputFile: string) => {
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

      // console.log('SSML Parts to process:', ssmlParts.length);

      // Do parallel requests to the API for each SSML part
      const synthesizeSpeechPromises = ssmlParts.map(ssmlPart => synthesizeSpeechPromise(ssmlPart, userRequestOptions));

      // Wait for the requests to resolve
      // We end up with an array of Buffer's
      const allAudioBuffers = await Promise.all(synthesizeSpeechPromises);

      // console.log('All promises resolved.');

      if (userRequestOptions.audioConfig.audioEncoding === 'MP3') {
        // Concatenate the buffers into one buffer
        buffer = Buffer.concat(allAudioBuffers, allAudioBuffers.reduce((len, a) => len + a.length, 0));
        // console.log('Concatenated the buffer.');
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

(async () => {

  /* tslint:disable max-line-length */
  const request: SynthesizeSpeechRequest = {
    voice: {
      languageCode: 'en-US',
      ssmlGender: 'FEMALE'
    },
    input: {
      ssml: `
      <speak>
        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
        <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p>
        <p>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p>
        <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
        <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.</p>
      </speak>`
    },
    audioConfig: {
      audioEncoding: 'MP3'
    }
  };

  try {
    const outputFile = path.join(__dirname, '../example-output/lorem-ipsum.mp3');
    const buffer = await synthesizeMultipleSpeech(request, outputFile);

    // Handle the buffer. For example write it to a file or directly upload it to storage, like S3 or Google Cloud Storage
    await fsExtra.writeFile(outputFile, buffer, 'binary');

    console.log('Got audio!', outputFile);
  } catch (err) {
    console.log(err);
  }

})();
