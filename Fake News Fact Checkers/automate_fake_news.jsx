/**
 * Copyright (C) 2022, Nick Belling for Back Pocket/Lowkii.
 * Feel free to copy and use this code as you see fit.
 * 
 * Automates the game "Fake News Fact Checkers" as shown on Back Pocket's
 * "Pocket Pals".
 * 
 * Assumes the currently open file in Photoshop has the following:
 * - "FACT" text layer
 * - "Triangle" image layer 
 * 
 * Assumes the file "data.json" exists, which is a JSON array with objects of 
 * the following format:
 * - FactNum (Number)
 * - Fact (String)
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
 * The main function. Reads the facts out of the data file, and then renders
 * each fact as an image sequence.
 * 
 * Each review is saved in /Rendered/[FactNum]-[Sequence].png as a sequence of
 * PNG files, where [FactNum]-00.png has no text on screen, up to 
 * [FactNum]-NN.png which has all of the sentences of the fact on screen.
 */
function main() {
    // Read the reviews from the data file into an array.
    var facts = readDataFile();
    
    alert('Getting ready to render ' + facts.length + ' facts. ');

    // Loop through the "facts" array.
    for(var i = 0; i < facts.length; i++) {
        // Get the fact we're currently rendering.
        var fact = facts[i];
        
        // Render out the image sequence for this fact.
        render(fact);
    }

    alert('Done.');
}

/**
 * Renders a sequence of images for Fake News Fact Checkers. Generates a series
 * of images in EXPORT_PATH/ where each image adds a sentence to the fact.
 * 
 * @param {Fact} data The fact to be rendered.
 * Contains:
 * - FactNum (Number)
 * - Fact (String)
 */
function render(data) {
    // Split the tweet into an array of sentences.
    var sentences = getSentenceArray(data.Fact);

    // Get each of the layers we'll be manipulating
    var factLayer = app.activeDocument.layers.getByName('FACT');
    var triangleLayer = app.activeDocument.layers.getByName('Triangle');

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
        factLayer.textItem.contents = combined;

        // Turn on the triange indicator if we're on the last image
        if (i == sentences.length) {
            triangleLayer.visible = true;
        }

        // Save the image (add leading 0 for sorting)
        var factNum = ('0' + data.FactNum).slice(-2);
        var imageNum = ('0' + i).slice(-2);
        var filename = factNum + '-' + imageNum;
        savePNG('', filename);
    }
}

/** 
 * Reads the data from the DATA_PATH, and returns the results as an array.
 * Assumes that the DATA_PATH is a .json file whose contents are an array of
 * objects.
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

main();