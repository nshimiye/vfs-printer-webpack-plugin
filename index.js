class VFSPrinter {
    pluginName = 'vfs-printer'
    constructor(options) {this.options = options; }
    apply(compiler) {

        compiler.hooks.beforeRun.tapAsync('VfsToRfs', ({ inputFileSystem }, callback) => {
            inputFileSystem._webpackCompilerHost._memoryHost.write = function (path, content) {
            const filePath = `vfs/${path.replace(process.cwd(), '')}`;
            const [parentFolder, /* fileName */] = filePath.split(/([^\/]+)$/);
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
