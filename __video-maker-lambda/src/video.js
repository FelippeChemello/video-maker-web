exports.getFramesData = async (imagesPaths, durationPromises) => new Promise((resolve, reject) => {
    const framesData = [];
    Promise.all(durationPromises).then((audiosDuration) => {
        audiosDuration.forEach((time, index) => framesData.push({
            path: imagesPaths[index],
            loop: time,
        }));
    });

    resolve(framesData);
});
