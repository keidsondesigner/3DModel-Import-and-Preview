# Awesome 3D Importer

A powerful Adobe After Effects CEP extension that allows users to import GLB/GLTF 3D models, customize their colors in real-time, and seamlessly add them to After Effects compositions.

## Features

- **3D Model Import**: Support for GLB and GLTF file formats
- **Real-time Preview**: Interactive 3D preview with auto-rotation using Three.js
- **Color Customization**: Live color picker to modify model materials before import
- **Seamless Integration**: Direct import into active After Effects compositions
- **Modern UI**: Clean, dark-themed interface matching After Effects design

## Requirements

- Adobe After Effects CC 2020 or later (version 17.0+)
- Windows or macOS

## Installation

### 1. Locate the CEP Extensions Folder

**Windows:**
```
C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\


> [mesmo nome do xml] criar pasta com.meunome-ou-empresa.nomeextensao
```

**macOS:**
```
/Library/Application Support/Adobe/CEP/extensions/
```

### 2. Copy Extension Files

Copy the entire `awesome` folder (or rename this project folder to `awesome`) into the CEP extensions directory:

```
extensions/
└── awesome/
    ├── .debug
    ├── CSXS/
    ├── client/
    ├── host/
    └── README.md
```

### 3. Enable CEP Debugging (Required)

**Windows:**

1. Navigate to: `C:\Users\[YourUsername]\AppData\Roaming\Adobe\CEP\extensions\`
2. Create a file named `.debug` (if it doesn't exist)
3. Add the content from the `.debug` file in this project

Alternatively, set the registry key:
```
HKEY_CURRENT_USER/Software/Adobe/CSXS.10
PlayerDebugMode = "1"
```

**macOS:**

Open Terminal and run:
```bash
defaults write com.adobe.CSXS.10 PlayerDebugMode 1
```

For CEP 11:
```bash
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
```

### 4. Restart After Effects

Close and reopen After Effects completely.

### 5. Launch the Extension

In After Effects, go to:
```
Window > Extensions > Awesome 3D Importer
```

## Usage

### Importing a 3D Model

1. **Open the Extension Panel**
   - Window > Extensions > Awesome 3D Importer

2. **Select a GLB File**
   - Click the "Browse GLB File" button
   - Choose a `.glb` or `.gltf` file from your computer

3. **Preview the Model**
   - The model will appear in the 3D preview window
   - It will auto-rotate for easy inspection

4. **Customize Color** (Optional)
   - Use the color picker to change the model's color
   - Changes appear in real-time in the preview

5. **Import to After Effects**
   - Click "Import to After Effects"
   - The model will be added to your active composition
   - If no composition is active, a new one will be created

## Debugging

### Chrome DevTools

1. Open Google Chrome
2. Navigate to: `http://localhost:7002`
3. Select your extension from the list
4. Use Chrome DevTools to debug JavaScript and view console logs

### Common Issues

**Extension doesn't appear in After Effects:**
- Verify files are in the correct CEP extensions folder
- Ensure PlayerDebugMode is enabled
- Check that `.debug` file exists in extension root
- Restart After Effects completely

**3D Model doesn't load:**
- Ensure the file is a valid GLB or GLTF format
- Check browser console for errors (via Chrome DevTools)
- Verify the file path is accessible

**Import fails:**
- Ensure After Effects supports GLB files (version 17.0+)
- Check that a project is open in After Effects
- View error messages in the status area

## File Structure

```
awesome/
├── .debug                          # Debug configuration for CEP
├── README.md                       # This file
├── CSXS/
│   └── manifest.xml               # Extension manifest
├── client/                        # Frontend files
│   ├── index.html                # Main HTML interface
│   ├── style.css                 # UI styling
│   ├── main.js                   # Client-side logic
│   └── lib/
│       └── CSInterface.js        # Adobe CEP interface library
└── host/                          # Backend files
    └── import.jsx                # After Effects scripting logic
```

## Technologies Used

- **CEP (Common Extensibility Platform)**: Adobe's framework for extensions
- **Three.js**: 3D graphics library for WebGL
- **GLTFLoader**: Three.js loader for GLB/GLTF files
- **ExtendScript (JSX)**: Adobe's scripting language for After Effects
- **HTML5/CSS3/JavaScript**: Frontend technologies

## API Reference

### Client-Side (main.js)

**Key Functions:**
- `initThreeJS()`: Initializes the 3D scene and renderer
- `loadGLBModel(path)`: Loads a GLB file using GLTFLoader
- `applyColorToModel(hexColor)`: Applies color to model materials
- `handleImport()`: Sends import request to After Effects

### Host-Side (import.jsx)

**Key Functions:**
- `importGLBToComposition(data)`: Main import function
- `createNewComposition()`: Creates a new AE composition
- `applyColorToLayer(layer, hexColor)`: Applies tint effect to layer
- `hexToRgb(hex)`: Converts hex color to RGB values

## Development

### Prerequisites

- Node.js (for any build tools, optional)
- Adobe After Effects CC 2020+
- Google Chrome (for debugging)
- Code editor (VS Code recommended)

### Local Development Setup

1. Clone or download this repository
2. Follow installation instructions above
3. Enable debugging mode
4. Make changes to files
5. Reload extension in After Effects (close and reopen panel)

### Testing

1. Use Chrome DevTools for client-side debugging
2. Use After Effects ExtendScript Toolkit for JSX debugging (legacy)
3. Check After Effects console for JSX errors

## Extension Configuration

### manifest.xml Key Settings

- **Extension ID**: `com.aianimation.awesome`
- **Extension Name**: Awesome 3D Importer
- **CSXS Version**: 10.0
- **Min After Effects Version**: 17.0
- **Window Size**: 400x600 (default), resizable

### Customization

To customize the extension:

1. **Change Extension ID**: Update in `manifest.xml` and `.debug`
2. **Modify UI**: Edit `client/index.html` and `client/style.css`
3. **Change Behavior**: Update `client/main.js` and `host/import.jsx`
4. **Adjust Window Size**: Modify `<Geometry>` section in `manifest.xml`

## Known Limitations

- GLB import requires After Effects 2020 (17.0) or later
- Color modification uses tint effect (may not work perfectly with all model types)
- Panel resizing doesn't work in After Effects (CEP limitation)
- Some 3D model features may not be fully supported by After Effects

## Troubleshooting

### Extension won't load

```bash
# Check CEP version
# After Effects 2020 = CEP 10
# After Effects 2021 = CEP 11
# After Effects 2022+ = CEP 11

# Enable debug mode for your CEP version
# Windows Registry or macOS defaults command
```

### JavaScript errors

1. Open Chrome DevTools (http://localhost:7002)
2. Check Console tab for errors
3. Verify all script files are loading correctly

### JSX errors

1. Check After Effects Info panel for errors
2. Use `$.writeln()` for debugging in JSX
3. Check ExtendScript Toolkit console (if available)

## License

This project is provided as-is for educational and commercial use.

## Credits

**Developer**: AI Animation
**Extension Name**: Awesome 3D Importer
**Version**: 1.0.0

### Third-Party Libraries

- [Three.js](https://threejs.org/) - MIT License
- [Adobe CEP](https://github.com/Adobe-CEP/CEP-Resources) - Adobe License
- [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader) - MIT License

## Support

For issues, questions, or feature requests:
- Check the Debugging section above
- Review Adobe CEP documentation
- Check After Effects scripting guide

## Changelog

### Version 1.0.0 (2025)
- Initial release
- GLB/GLTF file import support
- Real-time 3D preview
- Color customization
- Direct After Effects integration

## Future Enhancements

Potential features for future versions:
- Multiple model import
- Animation preview
- Material property editing
- Batch processing
- Model library/presets
- Advanced lighting controls
- Export settings

---

**Made with ❤️ for the After Effects community**
