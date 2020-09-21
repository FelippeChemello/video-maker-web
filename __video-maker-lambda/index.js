const fs = require('fs');
const path = require('path');
const request = require('request');
const tempy = require('tempy');

const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(path.resolve(__dirname, 'exodus', 'bin', 'ffmpeg'));
ffmpeg.setFfprobePath(path.resolve(__dirname, 'exodus', 'bin', 'ffprobe'));

const videoshow = require('videoshow');

function downloadImages(url, fileDestination) {
    return new Promise((resolve, revoke) => {
        const writeStream = fs.createWriteStream(fileDestination);
        writeStream.on('finish', resolve);
        writeStream.on('error', revoke);
        request(url).pipe(writeStream);
    });
}

exports.handler = (event, context, callback) => {
    // We're going to do the transcoding asynchronously, so we callback immediately.
    callback();

    // Extract the event parameters.
    const {
        videoName,
        imagesUrl,
        s3Bucket,
    } = JSON.parse(event.body) || event;
    const filename = path.basename(videoName);

    // Create temporary input/output filenames that we can clean up afterwards.
    const imagesFiles = [];
    const videoFileName = tempy.file({
        extension: 'mp4',
    });

    // Download the source file.
    const downloadPromisses = [];
    imagesUrl.forEach((url) => {
        const imageFileName = tempy.file({ extension: 'png' });

        imagesFiles.push(imageFileName);

        console.log(`Downloading: ${url} -> ${imageFileName}`);

        downloadPromisses.push(downloadImages(url, imageFileName));
    });

    Promise.all(downloadPromisses).then(() => {
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

        videoshow(imagesFiles, videoOptions)
            // .audio('./content/output[final].mp3')
            .save(videoFileName)
            .on('start', (command) => {
                console.log('> [video-robot] ffmpeg process started:', command);
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

                // Upload the generated MP4 to S3.
                try {
                    console.log('Salvando video no S3');

                    s3.putObject({
                        Body: fs.createReadStream(videoFileName),
                        Bucket: s3Bucket,
                        Key: videoName,
                        ContentDisposition: `attachment; filename="${filename.replace('"', '\'')}"`,
                        ContentType: 'video/mp4',
                    }, (error) => {
                        if (error) throw new Error(error);
                    });
                } catch (exception) {
                    [...imagesFiles, videoFileName].forEach((fileNameEach) => {
                        if (fs.existsSync(fileNameEach)) {
                            fs.unlinkSync(fileNameEach);
                        }
                    });

                    console.error(exception);
                }
            });
    });
};
