# VFS Printer Webpack Plugin

Save webpack virtual files to the real file system.

## Description

This plugin will save intermediary files that webpack generates during it build process and discards after the build is complete.

## use cases
- Angular cli
- ts-loader

## Usage

```js
// inside webpack config file
const { VFSPrinter } = require('vfs-printer-webpack-plugin');

module.exports {
    // ...

    plugins: [
        new VFSPrinter({  }),

        // ...
    ],
    
    // ...
}
```