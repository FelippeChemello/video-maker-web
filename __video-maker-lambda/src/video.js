const videoshow = require('videoshow');

exports.getFramesData = async (imagesPaths, durationPromises) => new Promise((resolve, reject) => {
    Promise.all(durationPromises).then((audiosDuration) => {
        const framesData = [];

        audiosDuration.forEach((time, index) => framesData.push({
            path: imagesPaths[index],
            loop: time,
        }));

        resolve(framesData);
    });
});

exports.renderVideo = async (framesData, audioFileName, outputFileName) => {
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

    return new Promise((resolve, reject) => {
        videoshow(framesData, videoOptions)
            .audio(audioFileName)
            .save(outputFileName)
            .on('start', (command) => {
                console.log(`> [Video] ffmpeg process started: ${command}`);
            })
            .on('progress', (progress) => {
                if (typeof progress.targetSize !== 'undefined' && typeof progress.percent !== 'undefined') {
                    console.log(`> [Video] Processing: ${progress.targetSize / 1000}MB`);
                }
            })
            .on('error', (err, stdout, stderr) => {
                console.error('> [Video] Error:', err);
                console.error('> [Video] ffmpeg stderr:', stderr);

                reject();
            })
            .on('end', (output) => {
                console.log('> [Video] Video created in:', output);

                resolve();
            });
    });
};
