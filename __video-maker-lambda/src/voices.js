const textToSpeech = require('@google-cloud/text-to-speech');
const tempy = require('tempy');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const mp3Duration = require('mp3-duration');
const { resolve } = require('path');
const audioConcat = require('audioconcat');

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, '..', 'config', 'google-tts.json');

const client = new textToSpeech.TextToSpeechClient();

function bufferToStream(binary) {
    const readableInstanceStream = new Readable({
        read() {
            this.push(binary);
            this.push(null);
        },
    });

    return readableInstanceStream;
}

function downloadTextToSpeech(sentence, fileDestination, config) {
    const request = {
        input: {
            text: sentence,
        },
        voice: {
            languageCode: config.prefixLanguage,
            name: config.fullNameLanguage,
        },
        audioConfig: {
            audioEncoding: 'MP3',
        },
    };

    return new Promise((resolvePromise, rejectPromise) => {
        const writeStream = fs.createWriteStream(fileDestination);

        writeStream.on('finish', () => {
            console.log(`> [Images] Synthesis complete: ${sentence}`);
            resolvePromise();
        });
        writeStream.on('error', (err) => {
            console.error(`> [Images] Synthesis save error: ${err}`);
            rejectPromise();
        });

        client.synthesizeSpeech(request, (error, response) => {
            if (error) {
                console.error(`> [Images] Synthesis error: ${error}`);
            } else {
                bufferToStream(response.audioContent).pipe(writeStream);
            }
        });
    });
}

exports.downloadAllTextToSpeech = async (sentences) => {
    const voicesFilesNames = [];
    const voicesDownloadPromisses = [];

    sentences.forEach((sentence) => {
        const voiceFileName = tempy.file({
            extension: 'mp3',
        });

        voicesFilesNames.push(voiceFileName);

        console.log(`> [Voices] Synthesizing: ${sentence} -> ${voiceFileName}`);

        voicesDownloadPromisses.push(downloadTextToSpeech(sentence, voiceFileName, {
            prefixLanguage: 'pt-BR',
            fullNameLanguage: 'pt-BR-Wavenet-A',
        }));
    });

    return {
        voicesFilesNames,
        voicesDownloadPromisses,
    };
};

exports.getDurationFromAudios = async (fileNames) => {
    const voicesDurationPromisses = [];

    fileNames.forEach((fileName) => {
        voicesDurationPromisses.push(
            mp3Duration(fileName, (err, duration) => {
                if (err) {
                    console.error(err.message);
                } else {
                    resolve();
                    console.log(`> [Voices] ${fileName} - ${duration} seconds`);
                }
            }),
        );
    });

    return voicesDurationPromisses;
};

exports.concatAllVoicesAndInsertTimeToIntro = async (fileNames, finalFilename) => {
    console.log(`> [Voices] Final audio creation is starting -> ${finalFilename}`);

    return audioConcat(fileNames)
        .concat(finalFilename)
        .on('start', () => console.log('> [Voices] Voices concat started'))
        .on('error', (err, stdout, stderr) => console.error(`> [Voices] Voice concat failed: ${err} \n\t\t FFMPEG error: ${stderr}`))
        .on('end', () => console.log('> [Voices] Voices concat ended'));
};
