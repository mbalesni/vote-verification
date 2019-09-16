/**
 * @param {array} storageArr array for storing the images
 * @param {array} urlArr array of urls
 */
function preloadImages(storageArr, urlArr) {
    urlArr.forEach((url, i) => {
        storageArr[i] = new Image();
        storageArr[i].src = url;
    })
}

export {
    preloadImages
}