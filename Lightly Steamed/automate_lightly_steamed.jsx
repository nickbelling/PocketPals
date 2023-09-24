/**
 * Copyright (C) 2022, Nick Belling for Back Pocket/Lowkii.
 * Feel free to copy and use this code as you see fit.
 * 
 * Automates the game "Lightly Steamed" as shown on Back Pocket's "Pocket Pals".
 * 
 * Assumes the currently open file in Photoshop has the following:
 * - "USERNAME" text layer
 * - "HOURS" text layer
 * - "REVIEW" text layer, AND its size is a fixed bounding box
 * - "Triangle" image layer 
 * 
 * Assumes the file "data.json" exists, which is a JSON array with objects of 
 * the following format:
 * - GameNum (Number)
 * - ReviewNum (Number)
 * - Username (String)
 * - Hours (Number)
 * - Review (String) - may or may not include newline characters.
 * 
 * The file "data.json" can be generated from an Excel (.xlsx) file using the
 * provided "spreadsheet_to_json.py" Python script. The .xlsx file must have
 * columns as specified in the JSON object format above.
 */

// Constants
var SCRIPT_DIRECTORY = File($.fileName).parent;
var EXPORT_PATH = SCRIPT_DIRECTORY + '/Rendered/';
var DATA_PATH = SCRIPT_DIRECTORY + '/data.json';

/** 
 * The main function. Reads the reviews out of the data file, and then renders
 * each review.
 * 
 * Each review is saved in /Rendered/[GameNum]/[ReviewNum]/ as a sequence of PNG
 * files, where 0.png has no text on screen, up to N.png which has all of the
 * sentences of the review on screen.
 */
function main() {
    // Read the reviews from the data file into an array.
    var reviews = readDataFile();
    
    alert('Getting ready to render ' + reviews.length + ' reviews. ');

    // Loop through the "reviews" array.
    for(var i = 0; i < reviews.length; i++) {
        // Get the review we're currently rendering.
        var review = reviews[i];
        
        // Render out the image sequence for this review.
        render(review);
    }

    alert('Done.');
}

/** 
 * Renders a review for Lightly Steamed. Generates a series of images in
 * EXPORT_PATH/[GameNum]/[ReviewNum]/ where each image adds a sentence to the
 * review.
 * 
 * @param {Review} data The "Review" object as read out of the data.json file.
 * Contains:
 * - GameNum (Number)
 * - ReviewNum (Number)
 * - Username (String)
 * - Hours (Number)
 * - Review (String) - may or may not include newline characters.
 */
function render(data) {
    // Photoshop doesn't support newlines ('\n'), only carriage returns ('\r').
    // Replace the newlines in the document with carriage returns so the text
    // renders correctly.
    data.Review = data.Review.replace(/\n/g,'\r');

    // Split the review into an array of sentences.
    var sentences = getSentenceArray(data.Review);

    // Get each of the layers we'll be manipulating
    var usernameLayer = app.activeDocument.layers.getByName('USERNAME');
    var hoursLayer = app.activeDocument.layers.getByName('HOURS');
    var reviewLayer = app.activeDocument.layers.getByName('REVIEW');
    var triangleLayer = app.activeDocument.layers.getByName('Triangle');

    // Set the review layer back to 40pt
    // (it may have changed from last time we ran this)
    reviewLayer.textItem.size = new UnitValue(40, "pt");

    // Update the username and hours played layers
    usernameLayer.textItem.contents = data.Username;
    hoursLayer.textItem.contents = data.Hours.toLocaleString('en-US') + ' hrs on record';

    // Set the review textbox to the full review
    reviewLayer.textItem.contents = data.Review;

    // Make sure the full review fits into the box
    scaleTextToFitBox(reviewLayer);

    // Hide the triangle indicator
    triangleLayer.visible = false;

    // Create a loop for each sentence in the array. Start with 0 sentences,
    // (so we save a blank image), then do 1 sentence, 2 sentences, etc.
    for (var i = 0; i <= sentences.length; i++) {
        // Take however many sentences we're up to.
        // The first time through this will take 0 sentences (an empty array).
        var partialSentences = sentences.slice(0, i);

        // Combine the sentences together
        var combined = partialSentences.join('');

        // Update the text layer
        reviewLayer.textItem.contents = combined;

        // Turn on the triange indicator if we're on the last image
        if (i == sentences.length) {
            triangleLayer.visible = true;
        }

        // Save the image
        var directory = data.GameNum + '/' + data.ReviewNum;
        var filename = ('0' + i).slice(-2); // add leading 0 for sorting
        savePNG(directory, filename);
    }
}

/**
 * Reads the data from the DATA_PATH, and returns the results as an array.
 * Assumes that the DATA_PATH is a .json file whose contents are an array of
 * objects.
 * 
 * @returns An array of objects read from the data file.
 */
function readDataFile() {
    // Open the data file
    var dataFile = File(DATA_PATH);
    dataFile.encoding = 'UTF8';
    dataFile.open('r');

    if (dataFile.exists) {
        // Read the JSON out of the file as a string
        var content = dataFile.read();
        dataFile.close();
        
        // ExtendScript doesn't have JSON parsing functionality,
        // so we have to basically eval() the JSON file.
        var data = (new Function( 'return ' + content ))();
        return data;
    } else {
        throw dataFile.error;
    }
}


/** 
 * Given a block of text, splits it into an array of sentences.
 */
function getSentenceArray(text) {
    // RegExes are damn near unreadable. Basically, this one splits a block of
    // text into sentences. It also handles when there is a newline or paragraph
    // break (and treats that as a "sentence" as well, e.g. a list of items).
    var sentences = text.match(
        /([^\.!\?(\n\n)(\r\n\r\n)(\r\r)]+[\.!\?(\n\n)(\r\n\r\n)(\r\r)]+)/g);

    if (sentences == null) {
        // Looks like the text wasn't splittable (likely the original text was
        // just a single sentence). Instead, wrap the original text in an array.
        sentences = [text];
    }

    return sentences;
}

/**
 * Saves the current Photoshop document to a PNG file with the given path.
 */
function savePNG(directory, filename) {
    // Set the PNG options
    var opts, pngFile;
    opts = new ExportOptionsSaveForWeb();
    opts.format = SaveDocumentType.PNG;
    opts.PNG8 = false;
    opts.quality = 100;

    // Set the directory we're saving to, and create it if it doesn't exist
    var outDir = new Folder(EXPORT_PATH + directory);
    if (!outDir.exists) {
        outDir.create();
    }

    // Create the PNG file, and save the Photoshop document into it
    pngFile = new File(outDir.path + '/' + outDir.name + '/' + filename + '.png');
    app.activeDocument.exportDocument(pngFile, ExportType.SAVEFORWEB, opts);
    pngFile.close();
};

/** 
 * Accepts a Photoshop text layer with a specified height and width.
 * This function then measures the height of the text inside the layer and
 * determines whether or not it fits within the box. If it doesn't, it keeps
 * reducing the font size until it does.
 */
function scaleTextToFitBox(textLayer) {
    // Get the dimensions of the original textbox. This gives us an object with
    // a .width and .height property.
    var textBoxDimensions = getLayerDimensions(textLayer);

    // Get the dimensions of the text that's in that textbox
    var textActualDimensions = getRealTextLayerDimensions(textLayer);

    // While the text doesn't fit in the textbox, reduce the size of the text,
    // and keep doing that until it fits
    while(textBoxDimensions.height < textActualDimensions.height) {
        // Get the current font size
        var fontSize = parseInt(textLayer.textItem.size);

        // Reduce the font size by 0.5pt
        textLayer.textItem.size = new UnitValue(fontSize - 0.5, "pt");

        // Re-measure the actual dimensions of the text
        textActualDimensions = getRealTextLayerDimensions(textLayer);
    }

    // The text now fits inside the boundaries of the textbox.
}

/**
 * When given a text layer, makes a copy of that text layer,
 * then measures its dimensions and returns it.
 */
function getRealTextLayerDimensions(textLayer) {
    // The original text layer has a specified box, but the text inside doesn't
    // necessarily fit. We're just going to make a copy of that text layer
    // and measure its size.

    // First, duplicate the text layer. We now have a copy called "textLayerCopy"
    var textLayerCopy = textLayer.duplicate(activeDocument, ElementPlacement.INSIDE);

    // We now need to rasterize the textbox so we can measure it. Before we can
    // do that, the copy will have the same bounding box size as the original,
    // so let's make it the full size of the document.
    textLayerCopy.textItem.height = activeDocument.height;
    textLayerCopy.rasterize(RasterizeType.TEXTCONTENTS);

    // Now that we've rasterized, we can measure the dimensions of our copy.
    var dimensions = getLayerDimensions(textLayerCopy);

    // Now that we have the dimensions, we can delete the copy we made.
    textLayerCopy.remove();

    return dimensions;
}

/** 
 * When given a layer, measures its height and width and returns an object with
 * .width and .height properties.
 */
function getLayerDimensions(layer) {
    /** The layer object has an array called "bounds" where:
     * 0 - top left X
     * 1 - top left Y
     * 2 - bottom right X
     * 3 - bottom right Y
     * 
     * Width is therefore bottom right X - top left X,
     * and height is bottom right Y - top left Y */
    return {
        width: layer.bounds[2] - layer.bounds[0],
        height: layer.bounds[3] - layer.bounds[1]
    };
}

main();