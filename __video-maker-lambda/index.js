require('dotenv').config();
const fs = require('fs');
const tempy = require('tempy');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

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
const {
    getFramesData,
    renderVideo,
} = require('./src/video');
const {
    youtubeUpload,
} = require('./src/upload');

exports.handler = async (req, res) => {
    const {
        imagesUrl,
        sentences,
        youtubeToken,
        title,
        description,
        tags,
    } = req.body;

    const videoFileName = tempy.file({ extension: 'mp4' });
    const voiceFileName = tempy.file({ extension: 'mp3' });
    const thumbnailFileName = tempy.file({ extension: 'png' });

    const { imagesFilesOriginalNames, imagesDownloadPromisses } = await downloadAllImages(imagesUrl);
    const { voicesFilesNames, voicesDownloadPromisses } = await downloadAllTextToSpeech(sentences);
    await Promise.all(voicesDownloadPromisses);

    const voicesDurationPromisses = [];
    let finalAudioPromise;
    Promise.all(voicesDownloadPromisses).then(async () => {
        voicesDurationPromisses.push(...await getDurationFromAudios(voicesFilesNames));
        finalAudioPromise = concatAllVoicesAndInsertTimeToIntro(voicesFilesNames, voiceFileName);
    });

    let sentecesImagesObject;
    let imagesConvertionObject;
    let thumbnailPromise;
    let finalFramesObject;
    Promise.all(imagesDownloadPromisses).then(async () => {
        sentecesImagesObject = await createAllSentenceImages(sentences);
        imagesConvertionObject = await convertAllImages(imagesFilesOriginalNames);

        Promise.all(sentecesImagesObject.subtitleImagesPromises, imagesConvertionObject.imagesConvertionPromises).then(async () => {
            thumbnailPromise = await createVideoThumbnail(thumbnailFileName, imagesConvertionObject.imagesConvertedFilesNames[0]);
            finalFramesObject = await insertSubtitleInImages(imagesConvertionObject.imagesConvertedFilesNames, sentecesImagesObject.subtitleImagesNames);

            Promise.all([...voicesDurationPromisses, finalAudioPromise, ...finalFramesObject.finalFramesPromises, thumbnailPromise])
                .then(async () => {
                    const framesData = await Promise.all([getFramesData(finalFramesObject.finalFramesFilesNames, voicesDurationPromisses)]);

                    const rederVideoPromise = renderVideo(...framesData, voiceFileName, videoFileName);

                    await rederVideoPromise;

                    await youtubeUpload(youtubeToken, videoFileName, title, description, tags, thumbnailFileName);

                    [
                        videoFileName,
                        voiceFileName,
                        thumbnailFileName,
                        ...imagesFilesOriginalNames,
                        ...voicesFilesNames,
                        ...finalFramesObject.finalFramesFilesNames,
                        ...imagesConvertionObject.imagesConvertedFilesNames,
                        ...sentecesImagesObject.subtitleImagesNames,
                    ].forEach((file) => fs.unlink(file, (error) => {
                        if (error) {
                            console.error(`> [Clean] Error at removing file ${file}: ${error}`);
                        } else {
                            console.log(`> [Clean] File ${file} removed successfully`);
                        }
                    }));
                    res.send('Video enviado');
                });
        });
    });
};
