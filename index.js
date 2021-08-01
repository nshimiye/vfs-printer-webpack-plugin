const { normalize, parse } = require('path');
class VFSPrinter {
    pluginName = 'vfs-printer'
    constructor(options) {this.options = options; }
    vfsFileMap = {};
    vfsFileNames = new Set();
    apply(compiler) {
        const _this = this;

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

                if(fileNameWithExt.endsWith('js')) {
                    const fileName = parse(normalize(path)).name;
                    _this.vfsFileNames.add(fileName);
                    _this.vfsFileMap[Buffer.from(fileName).toString('base64')] = parentFolder+fileName+'.wpm.js';
                }

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

        
        /**
         * print modules that are derived from virtual files 
         */
        compiler.hooks.thisCompilation.tap(this.pluginName, (compilation, compilationParams) => {
            compilation.hooks.finishModules.tapAsync(this.pluginName, (modules, callback) => {
                const files = Array.from(_this.vfsFileNames);
                modules.forEach(m => {
                    if(m.rawRequest) {
                        const fn = files.find(fileName => m.rawRequest.includes(fileName)); 
                        if(fn) {
                            const fp = _this.vfsFileMap[Buffer.from(fn).toString('base64')];
                            require('fs').writeFileSync(fp, m._source._value);
                        }
                    }
                });
                callback();
            });
        });


    }
}

module.exports.VFSPrinter = VFSPrinter;
