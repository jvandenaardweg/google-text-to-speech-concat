# Google Text To Speech Concat
Automatically split large text into parts Google's Text To Speech API can consume, and concatenate the resulting audio into one single buffer.

Google's Text To Speech API has a [5.000 character limit](https://cloud.google.com/text-to-speech/quotas). So, if you want to synthesize large text's, you have to manually split the text, do multiple requests to the API and concatenate the resulting audio into one audiofile.

All of this is handled by this package.

## Features
- Automatically split the SSML using the 5.000 character limit.
- Send and process the SSML using the Google Cloud Text to Speech API.
- Returns one single buffer to be processed into an audiofile or further processing.

**Important:** currently only handles `MP3` processing. Processing of `LINEAR16` and `OGG_OPUS` does not work yet. Feel free to send a PR.

## Requirements
- Google's NodeJS Text To Speech client: https://github.com/googleapis/nodejs-text-to-speech

## Example
1. Install using npm: `npm install google-text-to-speech-concat --save`

2. Make sure you already have setup the [NodeJS Text To Speech client](https://github.com/googleapis/nodejs-text-to-speech).

3. Use the `synthesize` method to process your SSML. Pass in your Text To Speech client as the first parameter.

```javascript
import textToSpeech from '@google-cloud/text-to-speech';
import { synthesize } from 'google-cloud-text-to-speech-concat';
import fs from 'fs';
import path from 'path';

(async () => {

  const request = {
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
        <p>Again. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
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

    // Create your Text To Speech client
    // More on that here: https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application
    const textToSpeechClient = new textToSpeech.TextToSpeechClient({
      keyFilename: path.join(__dirname, '../google-cloud-credentials.json')
    });

    // Synthesize the text, resulting in an audio buffer
    const buffer = await synthesize(textToSpeechClient, request);

    // Handle the buffer
    // For example write it to a file or directly upload it to storage, like S3 or Google Cloud Storage
    const outputFile = path.join(__dirname, '../example-output/lorem-ipsum.mp3');

    // Write the file
    fs.writeFile(outputFile, buffer, 'binary', (err) => {
      if (err) throw err;
      console.log('Got audio!', outputFile);
    });
  } catch (err) {
    console.log(err);
  }

})();

```
