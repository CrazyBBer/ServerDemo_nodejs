/**
 * Created by Administrator on 01/03/2016.
 */

var fs = require('fs');

function Transfer(req, res) {
    this.req = req;
    this.res = res;
}

Transfer.prototype._calStartPosition = function (Range) {
    var startPos = 0;
    if (typeof Range != 'undefined') {
        var startPosMatch = /^bytes=([0-9]+)-$/.exec(Range);
        startPos = Number(startPosMatch[1]);
    }
    return startPos;
};

Transfer.prototype._configHeader = function (Config) {
    var startPos = Config.startPos,
        fileSize = Config.fileSize,
        resp = this.res;
    // 如果startPos为0，表示文件从0开始下载的，否则则表示是断点下载的。
    if (startPos == 0) {
        resp.setHeader('Accept-Range', 'bytes');
        resp.writeHead(200, 'OK',{
            'Content-Type': 'application/octet-stream',
            'Content-Length': fileSize-startPos
        });
    } else {
        resp.setHeader('Content-Range', 'bytes ' + startPos + '-' + (fileSize - 1) + '/' + fileSize);
        resp.writeHead(206, 'Partial Content',{
            'Content-Type': 'application/octet-stream',
            'Content-Length': fileSize-startPos
        });
    }

};

Transfer.prototype._init = function (filePath, down) {
    var config = {};
    var self = this;
    fs.stat(filePath, function (error, state) {
        if (error)
            throw error;

        config.fileSize = state.size;
        var range = self.req.headers.range;
        config.startPos = self._calStartPosition(range);
        self.config = config;
        self._configHeader(config);
        down();
    });
};

Transfer.prototype.Download = function (filePath) {
    var self = this;
    fs.access(filePath, fs.R_OK, function (err) {
        if (err) {
            console.log('文件不存在！');
            throw error;
        }

        self._init(filePath, function () {
            var config = self.config,
                res = self.res,
                fReadStream = fs.createReadStream(filePath, {
                    encoding: 'binary',
                    bufferSize: 1024 * 1024,
                    start: config.startPos,
                    end: config.fileSize
                });
            fReadStream.on('data', function (chunk) {
                res.write(chunk, 'binary');
            });
            fReadStream.on('end', function () {
                res.end();
            });
        });

    });
};


module.exports = Transfer;