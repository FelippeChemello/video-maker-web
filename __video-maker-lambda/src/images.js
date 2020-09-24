const fs = require('fs');
const request = require('request');
const tempy = require('tempy');
const gm = require('gm').subClass({ imageMagick: true });

const downloadImages = (url, fileDestination) => new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(fileDestination);

    writeStream.on('finish', () => {
        console.log(`> [Images] Download complete: ${url}`);
        resolve();
    });
    writeStream.on('error', (err) => {
        console.error(`> [Images] Download error: ${err}`);
        reject();
    });

    request(url).pipe(writeStream);
});

exports.downloadAllImages = async (imagesUrl) => {
    const imagesFilesOriginalNames = [];
    const imagesDownloadPromisses = [];

    imagesUrl.forEach((url) => {
        const imageFileName = tempy.file({
            extension: 'png',
        });

        imagesFilesOriginalNames.push(imageFileName);

        console.log(`> [Images] Downloading: ${url} -> ${imageFileName}`);

        imagesDownloadPromisses.push(downloadImages(url, imageFileName));
    });

    return {
        imagesFilesOriginalNames,
        imagesDownloadPromisses,
    };
};

async function createSentenceImage(sentence, fileName) {
    return new Promise((resolve, reject) => {
        const size = '5120x720';
        const gravity = 'west';

        gm()
            .out('-size', size)
            .out('-gravity', gravity)
            .out('-background', 'transparent')
            .out('-fill', 'yellow')
            .out('-stroke', 'gray')
            .out('-strokewidth', '5')
            .out('-kerning', '-1')
            .out(`caption:${sentence}`)
            .write(fileName, (error) => {
                if (error) {
                    console.error(`> [Images] Image subtitle failed: ${error}`);
                    reject(error);
                } else {
                    console.log(`> [Images] Image subtitle "${sentence}" created`);
                    resolve();
                }
            });
    });
}

exports.createAllSentenceImages = async (sentences) => {
    const subtitleImagesNames = [];
    const subtitleImagesPromises = [];

    sentences.forEach((sentence) => {
        const sentenceFileName = tempy.file({
            extension: 'png',
        });

        console.log(`> [Images] Creating image subtitle for ${sentence} -> ${sentenceFileName}`);

        subtitleImagesNames.push(sentenceFileName);

        subtitleImagesPromises.push(createSentenceImage(sentence, sentenceFileName));
    });

    return {
        subtitleImagesNames,
        subtitleImagesPromises,
    };
};

function convertImageToVideoSize(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
        const inputFileFirstFrame = `${inputFile}[0]`;

        const width = 1920;
        const height = 1080;

        gm()
            .in(inputFileFirstFrame)
            .out('(')
            .out('-clone')
            .out('0')
            .out('-background', 'white')
            .out('-blur', '0x9')
            .out('-resize', `${width}x${height}^`)
            .out(')')
            .out('(')
            .out('-clone')
            .out('0')
            .out('-background', 'white')
            .out('-resize', `${width}x${height}`)
            .out(')')
            .out('-delete', '0')
            .out('-gravity', 'center')
            .out('-compose', 'over')
            .out('-composite')
            .out('-extent', `${width}x${height}`)
            .write(outputFile, (error) => {
                if (error) {
                    reject(error);
                } else {
                    console.log(`> [Images] Image conversion ended: ${outputFile}`);
                    resolve();
                }
            });
    });
}

exports.convertAllImages = async (imagesFiles) => {
    const imagesConvertedFilesNames = [];
    const imagesConvertionPromises = [];

    imagesFiles.forEach((originalFileName) => {
        const imageConvertedFileName = tempy.file({
            extension: 'png',
        });

        console.log(`> [Images] Converting ${originalFileName} -> ${imageConvertedFileName}`);

        imagesConvertedFilesNames.push(imageConvertedFileName);

        imagesConvertionPromises.push(
            convertImageToVideoSize(originalFileName, imageConvertedFileName),
        );
    });

    return {
        imagesConvertedFilesNames,
        imagesConvertionPromises,
    };
};

exports.createVideoThumbnail = async (thumbnailFileName, firstFrameFileName) => {
    console.log(`> [Image] Creating video thumbnail -> ${thumbnailFileName}`);

    return new Promise((resolve, reject) => {
        const width = 1920;
        const height = 1080;

        gm()
            .in(firstFrameFileName)
            .out('-resize', `${width}x${height}^`)
            .write(thumbnailFileName, (error) => {
                if (error) {
                    console.log(`> [Image] Video thumbnail creation failed: ${error}`);
                    reject(error);
                } else {
                    console.log('> [Image] Video thumbnail created successfully');
                    resolve();
                }
            });
    });
};

function mergeImages(inputImage1, inputImage2, outputImage) {
    return new Promise((resolve, reject) => {
        const width = 1280;
        const height = 720;

        gm(inputImage1)
            .resize(width, height)
            .composite(inputImage2)
            .gravity('South')
            .write(outputImage, (err) => {
                if (err) {
                    console.error(`> [Images] Image merge failed: ${inputImage1} & ${inputImage2} -> ${err}`);
                    reject();
                } else {
                    console.log(`> [Images] Image merge ended: ${outputImage}`);
                    resolve();
                }
            });
    });
}

exports.insertSubtitleInImages = async (imagesFilesNames, sentencesFilesNames) => {
    const finalFramesFilesNames = [];
    const finalFramesPromises = [];

    for (let i = 0; i < imagesFilesNames.length; i++) {
        const finalFrameFileName = tempy.file({
            extension: 'png',
        });

        console.log(`> [Images] Merging ${imagesFilesNames[i]} and ${sentencesFilesNames[i]} -> ${finalFrameFileName}`);

        finalFramesFilesNames.push(finalFrameFileName);

        finalFramesPromises.push(
            mergeImages(imagesFilesNames[i], sentencesFilesNames[i], finalFrameFileName),
        );
    }

    return {
        finalFramesFilesNames,
        finalFramesPromises,
    };
};
