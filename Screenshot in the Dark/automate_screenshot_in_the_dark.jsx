/**
 * Copyright (C) 2022, Nick Belling for Back Pocket/Lowkii.
 * Feel free to copy and use this code as you see fit.
 * 
 * Automates the game "Screenshot in the Dark" as shown on Back Pocket's
 * "Pocket Pals".
 * 
 * Assumes the currently open file in After Effects has the following footage
 * items, and that each directory in /Source/ is numbered and also contains
 * each of the following items:
 * - "1.jpg"
 * - "2.jpg"
 * - "3.jpg"
 * - "4.jpg"
 * - "5.jpg"
 * - "6.jpg"
 * - "logo.png" 
 * 
 * Also assumes the project file has a Render Item Template called "SSITD" and
 * an Output Module Template called "SSITD Output" defined.
 */

// Constants
var SCRIPT_DIRECTORY = File($.fileName).parent;
var SOURCE_PATH = SCRIPT_DIRECTORY.absoluteURI + '/Source/';
var EXPORT_PATH = SCRIPT_DIRECTORY.absoluteURI + '/Rendered/';
var PROJECT_ITEMS_TO_REPLACE = [
    "1.jpg",
    "2.jpg",
    "3.jpg",
    "4.jpg",
    "5.jpg",
    "6.jpg",
    "logo.png"
];

/**
 * The main function. Asks the user which number to start with and how many
 * items to render, then for each number, it:
 * 
 * 1. finds the Source folder for that number
 * 2. swaps out the images in the project with the images in the folder, and
 * 3. renders out the ScreenshotInTheDark composition to /Rendered/[num].mp4.
 */
function main() {
    // Ask the user what number to start with, and how many to render
    var start = Number(prompt('Start number?', '1'));
    var amount = Number(prompt('How many to render?', '1'));

    // Work out which will be the last item we render (non-inclusive).
    // E.g. If we start at 1 and render 2 items, the "end" will be 3, so we'll
    // stop at (but not render) 3.
    var end = start + amount;

    if (start > 0) {
        var number = start;

        // Empty out the render queue if it has items in it.
        clearRenderQueue();

        // Loop until we hit the end item
        while (number < end) {

            // For this number, swap out all the images in the project with the
            // images in the /Source/[number] folder, and render it out to
            // /Rendered/[number].mp4.
            var folder = getSourceFolder(number);
            
            if (folder.exists) {
                loadFilesIntoComposition(folder);
                renderComposition(number);
                number++;
            } else {
                throw 'Failed to render source directory number ' + number + '.';
            }
        }

        alert('Done.');
    } else {
        throw 'Invalid start number.';
    }
}

/**
 * Clears all items from the After Effects render queue.
 */
function clearRenderQueue() {
    var queue = app.project.renderQueue;
    while(queue.numItems > 0) {
        queue.item(1).remove();
    }
}

/**
 * From the given folder, gets the images we're interested in and replaces them
 * in the project.
 * @param {Folder} folder 
 */
function loadFilesIntoComposition(folder) {
    // We've defined all of the images we want to replace in the
    // PROJECT_ITEMS_TO_REPLACE constant at the top of this file. For each one
    // of those, swap out the version currently in the AE project
    for(var i = 0; i < PROJECT_ITEMS_TO_REPLACE.length; i++) {
        var sourceItemName = PROJECT_ITEMS_TO_REPLACE[i];
        // Get the footage item
        var item = getItemByName(sourceItemName);

        // Get the file on disk we're going to swap it with
        var file = folder.getFiles(sourceItemName)[0];

        if (file.exists) {
            // Swap it!
            item.replace(file);
        } else {
            throw 'The file ' + sourceItemName + ' does not exist in ' + 
                folder.path + '.';
        }
    }
}

/**
 * Given a number, renders the 'ScreenshotInTheDark' composition in the project
 * file to /Rendered/[number].mp4.
 * @param {number} number 
 */
function renderComposition(number) {
    // Get the 'ScreenshotInTheDark' Composition
    var composition = getItemByName('ScreenshotInTheDark');

    // Add the composition to the render queue. This gives us back a RenderQueueItem
    var renderItem = app.project.renderQueue.items.add(composition);
    
    // Apply the 'SSITD' Render Settings Template to the render queue item
    renderItem.applyTemplate('SSITD');

    // Get the output module for the render queue item, apply the 'SSITD Output'
    // template to it, and then set its file output to /Rendered/[number].mp4.
    var outputModule = renderItem.outputModule(1);
    outputModule.applyTemplate('SSITD Output');
    outputModule.file = File(EXPORT_PATH + number.toString() + '.mp4');

    // Finally, start rendering!
    app.project.renderQueue.render();
}

/**
 * Given a number, gets a Folder object that represents the "/Source/[number]"
 * folder.
 * @param {number} number 
 * @returns A "Folder" object representing the source folder.
 */
function getSourceFolder(number) {
    var folder = new Folder(SOURCE_PATH + number.toString());

    if (folder.exists) {
        return folder;
    } else {
        throw 'The folder ' + folder.absoluteURI + 'does not exist.';
    }
}

/**
 * Given a name, finds the item in the Project Panel with that name.
 * @param {string} name The name of the item in the Project Panel. 
 * @returns The "Item" object that represents the item with that name from the
 * Project Panel.
 */
function getItemByName(name) {
    var item;
    for (var i = 1; i < app.project.numItems; i++) {
        if (app.project.item(i).name == name) {
            item = app.project.item(i);
            break;
        }
    }

    if (item) {
        return item;
    } else {
        throw "Couldn't find an item in the Project Panel with the name '" +
            name + "'.";
    }
}

try {
    main();
} catch (e) {
    var error;
    if (e.description) {
        // Exception is an After Effects exception
        error = e.description;
    } else {
        // Exception is just a string we threw ourselves
        error = e;
    }
    alert('Failed to perform the render. Error: ' + error);
}
