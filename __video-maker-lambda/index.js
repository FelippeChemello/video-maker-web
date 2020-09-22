require('dotenv').config();
const path = require('path');
const tempy = require('tempy');
const ffmpeg = require('fluent-ffmpeg');
const videoshow = require('videoshow');
const fs = require('fs');
const {
    downloadAllImages,
    createAllSentenceImages,
    convertAllImages,
    createVideoThumbnail,
    insertSubtitleInImages,
} = require('./src/images');
const {
    downloadAllTextToSpeech,
    getDurationFromAudios,
    concatAllVoicesAndInsertTimeToIntro,
} = require('./src/voices');
const { getFramesData } = require('./src/video');

ffmpeg.setFfmpegPath(path.resolve(__dirname, 'exodus', 'bin', 'ffmpeg'));
ffmpeg.setFfprobePath(path.resolve(__dirname, 'exodus', 'bin', 'ffprobe'));

exports.handler = async (req, res) => {
    const { imagesUrl, sentences } = req.body;

    const videoFileName = 'video.mp4';// tempy.file({ extension: 'mp4' });
    const voiceFileName = tempy.file({ extension: 'mp3' });
    const thumbnailFileName = tempy.file({ extension: 'png' });

    const { imagesFilesOriginalNames, imagesDownloadPromisses } = await downloadAllImages(imagesUrl);
    const { voicesFilesNames, voicesDownloadPromisses } = await downloadAllTextToSpeech(sentences);

    console.log(voicesDownloadPromisses);

    const voicesDurationPromisses = [];
    let finalAudioPromise;
    Promise.all(voicesDownloadPromisses).then(async () => {
        voicesDurationPromisses.push(...await getDurationFromAudios(voicesFilesNames));
        finalAudioPromise = concatAllVoicesAndInsertTimeToIntro(voicesFilesNames, voiceFileName);
    });

    let sentecesImagesObject;
    let imagesConvertionObject;
    // let thumbnailPromise;
    let finalFramesObject;
    Promise.all(imagesDownloadPromisses).then(async () => {
        sentecesImagesObject = await createAllSentenceImages(sentences);
        imagesConvertionObject = await convertAllImages(imagesFilesOriginalNames);

        Promise.all(sentecesImagesObject.subtitleImagesPromises, imagesConvertionObject.imagesConvertionPromises).then(async () => {
            // thumbnailPromise = await createVideoThumbnail(thumbnailFileName);
            finalFramesObject = await insertSubtitleInImages(imagesConvertionObject.imagesConvertedFilesNames, sentecesImagesObject.subtitleImagesNames);

            Promise.all([...voicesDurationPromisses, finalAudioPromise, ...finalFramesObject.finalFramesPromises])
                .then(async () => {
                    console.log('1');
                    const framesData = await getFramesData(finalFramesObject.finalFramesFilesNames, voicesDurationPromisses);
                    console.log(framesData);
                    console.log('2');

                    const videoOptions = {
                        fps: 25,
                        transition: true,
                        transitionDuration: 1, // seconds
                        videoBitrate: 1024,
                        videoCodec: 'libx264',
                        size: '1280x720',
                        audioBitrate: '128k',
                        audioChannels: 2,
                        format: 'mp4',
                        pixelFormat: 'yuv420p',
                        useSubRipSubtitles: false, // Use ASS/SSA subtitles instead
                        subtitleStyle: {
                            Fontname: 'Courier New',
                            Fontsize: '37',
                            PrimaryColour: '11861244',
                            SecondaryColour: '11861244',
                            TertiaryColour: '11861244',
                            BackColour: '-2147483640',
                            Bold: '2',
                            Italic: '0',
                            BorderStyle: '2',
                            Outline: '2',
                            Shadow: '3',
                            Alignment: '1', // left, middle, right
                            MarginL: '40',
                            MarginR: '60',
                            MarginV: '40',
                        },
                    };

                    videoshow(framesData, videoOptions)
                        .audio(voiceFileName)
                        .save(videoFileName)
                        .on('start', (command) => {
                            console.log(`> [video-robot] ffmpeg process started: ${command}`);
                        })
                        .on('progress', (progress) => {
                            if (typeof progress.targetSize !== 'undefined' && typeof progress.percent !== 'undefined') {
                                console.log(`> [video-robot] Processing: ${progress.targetSize / 1000}MB`);
                            }
                        })
                        .on('error', (err, stdout, stderr) => {
                            console.error('> [video-robot] Error:', err);
                            console.error('> [video-robot] ffmpeg stderr:', stderr);
                        })
                        .on('end', (output) => {
                            console.log('> [video-robot] Video created in:', output);

                            console.log(videoFileName);

                            // fs.writeFileSync(path.join(__dirname, 'video.mp4'), fs.createReadStream(videoFileName));
                            res.send('Video criado');
                        });
                });
        });
    });
};
