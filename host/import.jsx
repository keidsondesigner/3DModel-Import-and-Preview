/**
 * Awesome 3D Importer - JSX Script for After Effects
 * Handles importing GLB files into After Effects compositions
 */

/**
 * Main function to import GLB file to the current composition
 * @param {Object} data - Import data containing filePath, color, and fileName
 * @returns {String} JSON string with success status and message
 */
function importGLBToComposition(data) {
    try {
        // Parse the data if it's a string
        var importData = typeof data === 'string' ? JSON.parse(data) : data;

        // Validate required data
        if (!importData.filePath) {
            return JSON.stringify({
                success: false,
                message: 'No file path provided'
            });
        }

        // Check if After Effects project is open
        if (!app.project) {
            return JSON.stringify({
                success: false,
                message: 'No After Effects project is open'
            });
        }

        // Get or create composition
        var comp = app.project.activeItem;

        if (!comp || !(comp instanceof CompItem)) {
            // No active composition, create a new one
            comp = createNewComposition();
            if (!comp) {
                return JSON.stringify({
                    success: false,
                    message: 'Failed to create composition'
                });
            }
        }

        // Convert file path to File object
        var glbFile = new File(importData.filePath);

        // Verify file exists
        if (!glbFile.exists) {
            return JSON.stringify({
                success: false,
                message: 'File not found: ' + importData.filePath
            });
        }

        // Begin undo group
        app.beginUndoGroup('Import GLB Model');

        try {
            // Import the GLB file into the project
            var importOptions = new ImportOptions(glbFile);

            // Check if import is valid
            if (!importOptions.canImportAs(ImportAsType.FOOTAGE)) {
                return JSON.stringify({
                    success: false,
                    message: 'Cannot import this file type. Ensure After Effects supports GLB/GLTF.'
                });
            }

            // Import as footage
            importOptions.importAs = ImportAsType.FOOTAGE;
            var importedItem = app.project.importFile(importOptions);

            if (!importedItem) {
                throw new Error('Failed to import file');
            }

            // Add imported item to composition
            var layer = comp.layers.add(importedItem);

            // Center the layer in composition
            layer.position.setValue([comp.width / 2, comp.height / 2]);

            // Apply color effect if supported
            // Note: Color modification for 3D models in AE might require specific effects
            // This is a basic implementation - you may need to adjust based on AE version
            try {
                applyColorToLayer(layer, importData.color);
            } catch (colorError) {
                // Color application failed, but import succeeded
                $.writeln('Warning: Could not apply color - ' + colorError.toString());
            }

            // Select the new layer
            layer.selected = true;

            // End undo group
            app.endUndoGroup();

            return JSON.stringify({
                success: true,
                message: 'GLB model imported successfully',
                layerName: layer.name,
                compName: comp.name
            });

        } catch (importError) {
            // Cancel undo group on error
            app.endUndoGroup();

            throw importError;
        }

    } catch (error) {
        // Log error to console
        $.writeln('Import Error: ' + error.toString());

        return JSON.stringify({
            success: false,
            message: error.toString()
        });
    }
}

/**
 * Create a new composition with default settings
 * @returns {CompItem} The newly created composition
 */
function createNewComposition() {
    try {
        var compName = 'GLB Import ' + new Date().getTime();
        var width = 1920;
        var height = 1080;
        var pixelAspect = 1.0;
        var duration = 10; // 10 seconds
        var frameRate = 30;

        var comp = app.project.items.addComp(
            compName,
            width,
            height,
            pixelAspect,
            duration,
            frameRate
        );

        // Open the composition
        comp.openInViewer();

        return comp;

    } catch (error) {
        $.writeln('Error creating composition: ' + error.toString());
        return null;
    }
}

/**
 * Apply color tint to a layer
 * @param {Layer} layer - The layer to apply color to
 * @param {String} hexColor - Hex color string (e.g., '#ff0000')
 */
function applyColorToLayer(layer, hexColor) {
    try {
        // Convert hex color to RGB values (0-1 range)
        var rgb = hexToRgb(hexColor);

        if (!rgb) {
            throw new Error('Invalid color format');
        }

        // Try to add a tint effect
        // Note: This may not work perfectly with 3D models
        // You might need to use different effects depending on the model type
        var tintEffect = layer.property('ADBE Effect Parade').addProperty('ADBE Tint');

        if (tintEffect) {
            // Set the color to white for "Map White To"
            tintEffect.property('ADBE Tint-0002').setValue([rgb.r, rgb.g, rgb.b, 1.0]);

            // Set amount to 100%
            tintEffect.property('ADBE Tint-0003').setValue(100);
        }

    } catch (error) {
        // If tint doesn't work, try color correction
        try {
            var colorBalance = layer.property('ADBE Effect Parade').addProperty('ADBE Color Balance 2');
            // This is a basic fallback - adjust as needed
        } catch (fallbackError) {
            throw new Error('Could not apply color effect: ' + error.toString());
        }
    }
}

/**
 * Convert hex color to RGB object
 * @param {String} hex - Hex color string (e.g., '#ff0000')
 * @returns {Object} RGB object with r, g, b values (0-1 range)
 */
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex values
    var bigint = parseInt(hex, 16);

    var r = ((bigint >> 16) & 255) / 255;
    var g = ((bigint >> 8) & 255) / 255;
    var b = (bigint & 255) / 255;

    return { r: r, g: g, b: b };
}

/**
 * Get the current active composition or the first composition in the project
 * @returns {CompItem} The active composition or null
 */
function getActiveComposition() {
    var comp = app.project.activeItem;

    if (comp && comp instanceof CompItem) {
        return comp;
    }

    // If no active comp, try to find the first comp in project
    for (var i = 1; i <= app.project.items.length; i++) {
        if (app.project.item(i) instanceof CompItem) {
            return app.project.item(i);
        }
    }

    return null;
}

/**
 * Utility function to log messages
 * @param {String} message - Message to log
 */
function logMessage(message) {
    $.writeln('[Awesome 3D Importer] ' + message);
}

// Export the main function for testing
// In production, this will be called via csInterface.evalScript()
