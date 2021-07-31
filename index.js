const { normalize, parse } = require('path');
class VFSPrinter {
    pluginName = 'vfs-printer'
    constructor(options) {this.options = options; }
    apply(compiler) {

        compiler.hooks.beforeRun.tapAsync('VfsToRfs', ({ inputFileSystem }, callback) => {
            inputFileSystem._webpackCompilerHost._memoryHost.write = function (path, content) {

                // START get virtual path components
                const rootPath = normalize(process.cwd());
                const rootFolder = parse(rootPath).base;
                const relativePath = path.split(rootFolder)[1];
                
                const fileNameWithExt = parse(normalize(path)).base;
                const relativeParentPath = relativePath.replace(fileNameWithExt, '');
                
                const filePath = `vfs${relativePath}`;
                const parentFolder = `vfs${relativeParentPath}`;
                // END get virtual path components

                // create folder structure if not done already
                require('fs').mkdirSync(
                    parentFolder, { recursive: true }
                );

                const td = new TextDecoder();
                require('fs').writeFileSync(filePath, td.decode(content));
                return this._doSyncCall(this._delegate.write(path, content));
            }
            callback();
        });

    }
}

module.exports.VFSPrinter = VFSPrinter;
