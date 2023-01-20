// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

if (window.Pomelo) {
    Pomelo.Module = {};
}

var PomeloModule = (function (exports) {
    if (exports.module) {
        return;
    }

    var _cache = {};
    var _alias = {};
    var _singleton = {};

    function _httpGetSync(url) {
        const xhr = new XMLHttpRequest();
        xhr.open('get', url, false);
        xhr.send();
        return xhr.responseText;
    }

    var validModes = ['singleton', 'transient'];

    function getContainingFolder(absolutePath) {
        if (!absolutePath) {
            console.warn('getContainingFolder: absolutePath is invalid');
        }

        var slashIndex = absolutePath.lastIndexOf('/');
        if (slashIndex < 0) {
            return '/';
        }

        return absolutePath.substr(0, slashIndex) + '/';
    }

    function resolveRelativePathPlain(url) {
        if (url.indexOf('./') == -1 && url.indexOf('../') == -1) {
            return url;
        }

        var index = url.lastIndexOf('../');
        if (index == 0) {
            return url;
        }

        url = url.replaceAll('/./', '/');
        if (url.indexOf('./') == 0) {
            url = url.substr(2);
        }

        if (index) {
            var w = url.substr(0, index);
            var f = url.substr(index);
            return resolveRelativePath(f, w);
        }
    }

    function resolveRelativePath(file, workingDirectory) {
        if (file.length && (file[0] == '/') || file.indexOf('http') == 0) {
            return resolveRelativePathPlain(file);
        }

        if (file.length && file[0] != '.') {
            return resolveRelativePathPlain(workingDirectory + file);
        }

        if (file.indexOf('./') == 0) {
            return resolveRelativePath(file.substr(2), workingDirectory);
        }

        if (file.indexOf('../') == 0) {
            file = file.substr(3);
            workingDirectory = getContainingFolder(workingDirectory.substr(0, workingDirectory.length - 1));
            return resolveRelativePath(file, workingDirectory);
        }
    }

    var module = {
        require(script, workingDirectory, mode) {
            mode = mode || 'singleton';
            workingDirectory = workingDirectory || '/';

            if (validModes.indexOf(mode) == -1) {
                throw 'Invalid require mode';
            }

            var url = resolveRelativePath(script, workingDirectory);
            if (url.length < 3 || url.substr(url.length - 3) != '.js') {
                url = url + '.js';
            }
            if (_alias[url]) {
                url = _alias[url];
            }

            if (!_cache[url]) {
                _cache[url] = _httpGetSync(url);
            }

            var js = _cache[url];

            if (mode == 'singleton' && _singleton[url]) {
                return _singleton[url];
            }

            var module = {
                exports: {}
            };

            var self = this;

            with (module) {
                var require = function (script, _workingDirectory, mode) {
                    _workingDirectory = _workingDirectory || getContainingFolder(url);
                    return self.require(script, _workingDirectory, mode);
                };
                js = js.replaceAll('export default', 'exports.default =');
                eval(js + '\r\n//# sourceURL=' + url);
                if (mode == 'singleton') {
                    _singleton[url] = exports;
                }
                return exports;
            }

            return module.exports;
        },
        alias(url, alias) {
            _alias[alias] = url;
        }
    };

    exports.require = module.require;
    exports.alias = module.alias;
    exports.getContainingFolder = getContainingFolder;

    return exports;

})(window);