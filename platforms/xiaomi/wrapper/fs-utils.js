/****************************************************************************
 Copyright (c) 2017-2019 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
var fs = qg.getFileSystemManager ? qg.getFileSystemManager() : null;

var fsUtils = {

    fs,

    getUserDataPath () {
        return qg.env.USER_DATA_PATH;
    },
    
    checkFsValid () {
        if (!fs) {
            console.warn('can not get the file system!');
            return false;
        }
        return true;
    },
    
    deleteFile (filePath, onComplete) {
        fs.unlink({
            filePath: filePath,
            success: function () {
                onComplete && onComplete(null);
            },
            fail: function (res) {
                console.warn('Delete file failed: ' + res.errMsg);
                onComplete && onComplete(new Error(res.errMsg));
            }
        });
    },
    
    downloadFile (remoteUrl, filePath, header, onProgress, onComplete) {
        var options = {
            url: remoteUrl,
            success: function (res) {
                if (res.statusCode === 200) {
                    onComplete && onComplete(null, res.tempFilePath || res.filePath);
                }
                else {
                    if (res.filePath) {
                        fsUtils.deleteFile(res.filePath);
                    }
                    console.warn('Download file failed: ' + res.statusCode);
                    onComplete && onComplete(new Error(res.statusCode), null);
                }
            },
            fail: function (res) {
                console.warn('Download file failed: ' + res.errMsg);
                onComplete && onComplete(new Error(res.errMsg), null);
            }
        }
        if (filePath) options.filePath = filePath;
        if (header) options.header = header;
        var task = qg.downloadFile(options);
        onProgress && task.onProgressUpdate(onProgress);
    },
    
    saveFile (srcPath, destPath, onComplete) {
        qg.saveFile({
            tempFilePath: srcPath,
            filePath: destPath,
            success: function (res) {
                onComplete && onComplete(null);
            },
            fail: function (res) {
                console.warn('Save file failed: ' + res.errMsg);
                onComplete && onComplete(new Error(res.errMsg));
            }
        });
    },
    
    copyFile (srcPath, destPath, onComplete) {
        fs.copyFile({
            srcPath: srcPath,
            destPath: destPath,
            success: function () {
                onComplete && onComplete(null);
            },
            fail: function (res) {
                console.warn('Copy file failed: ' + res.errMsg);
                onComplete && onComplete(new Error(res.errMsg));
            }
        });
    },
    
    writeFile (path, data, encoding, onComplete) {
        fs.writeFile({
            filePath: path,
            encoding: encoding,
            data: data,
            success: function () {
                onComplete && onComplete(null);
            },
            fail: function (res) {
                console.warn('Write file failed: ' + res.errMsg);
                onComplete && onComplete(new Error(res.errMsg));
            }
        });
    },
    
    writeFileSync (path, data, encoding) {
        try {
            fs.writeFileSync(path, data, encoding);
            return null;
        }
        catch (e) {
            console.warn('Write file failed: ' + e.message);
            return new Error(e.message);
        }
    },
    
    readFile (filePath, encoding, onComplete) {
        fs.readFile({
            filePath: filePath,
            encoding: encoding,
            success: function (res) {
                onComplete && onComplete(null, res.data);
            },
            fail: function (res) {
                console.warn('Read file failed: ' + res.errMsg);
                onComplete && onComplete (new Error(res.errMsg), null);
            }
        });
    },
    
    readDir (filePath, callback) {
        fs.readdir({
            dirPath: filePath,
            success: function (res) {
                onComplete && onComplete(null, res.files);
            },
            fail: function (res) {
                console.warn('Read directory failed: ' + res.errMsg);
                onComplete && onComplete(new Error(res.errMsg), null);
            }
        });
    },
    
    readText (filePath, onComplete) {
        fsUtils.readFile(filePath, 'utf8', onComplete);
    },
    
    readArrayBuffer (filePath, onComplete) {
        fsUtils.readFile(filePath, '', onComplete);
    },

    readJson (filePath, onComplete) {
        fsUtils.readFile(filePath, 'utf8', function (err, text) {
            var out = null;
            if (!err) {
                try {
                    out = JSON.parse(text);
                }
                catch (e) {
                    console.warn('Read json failed: ' + e.message);
                    err = new Error(e.message);
                }
            }
            onComplete && onComplete(err, out);
        });
    },
    
    readJsonSync (path) {
        try {
            var str = fs.readFileSync(path, 'utf8');
            return JSON.parse(str);
        }
        catch (e) {
            console.warn('Read json failed: ' + e.message);
            return new Error(e.message);
        }
    },
    
    makeDirSync (path, recursive) {
        try {
            fs.mkdirSync(path, recursive);
            return null;
        }
        catch (e) {
            console.warn('Make directory failed: ' + e.message);
            return new Error(e.message);
        }
    },

    rmdirSync (dirPath, recursive) {
        try {
            fs.rmdirSync(dirPath, recursive);
        }
        catch (e) {
            console.warn('rm directory failed: ' + e.message);
            return new Error(e.message);
        }
    },
    
    exists (filePath, onComplete) {
        fs.access({
            path: filePath,
            success: function () {
                onComplete && onComplete(true);
            },
            fail: function () {
                onComplete && onComplete(false);
            }
        });
    },

    loadSubpackage (name, onProgress, onComplete) {
        name = 'usr_' + name;  // prevention of name conflicts 
        var task = qg.loadSubpackage({
            name: name,
            success: function () {
                onComplete && onComplete();
            },
            fail: function (res) {
                console.warn('Load Subpackage failed: ' + res.errMsg);
                onComplete && onComplete(new Error(`Failed to load subpackage ${name}: ${res.errMsg}`));
            }
        });
        onProgress && task.onProgressUpdate(onProgress);
        return task;
    },

    unzip (zipFilePath, targetPath, onComplete) {
        fs.unzip({
            zipFilePath,
            targetPath,
            success () {
                onComplete && onComplete(null);
            },
            fail (errMsg) {
                onComplete && onComplete(new Error('unzip failed: ' + errMsg));
            },
        })
    },
};

window.fsUtils = module.exports = fsUtils;
