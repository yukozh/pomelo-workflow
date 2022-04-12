(function (exports) {
    if (!exports.PomeloWF) {
        exports.PomeloWF = {};
    }

    exports = exports.PomeloWF;

    var _cache = {};

    function _httpCached(url) {
        return !!_cache[url];
    }

    function _httpGet(url) {
        if (_cache[url]) {
            return Promise.resolve(_cache[url]);
        }

        return fetch(url).then(function (result) {
            if (result.status > 300 || result.status < 200) {
                return Promise.reject(result);
            }

            var txt = result.text();
            _cache[url] = txt;
            return Promise.resolve(txt);
        }).catch(function (err) {
            Promise.reject(err);
        });
    };

    function LoadScript(url) {
        if (_httpCached(url)) {
            with (window) {
                eval(_cache[url]);
            }
            return Promise.resolve();
        }

        return _httpGet(url).then(function (js) {
            with (window) {
                eval(js);
            }
            _cache[url] = js;
            return Promise.resolve();
        }).catch(err => {
            console.error('Load module ' + url + ' failed.');
            console.error(err);
        });
    }


    function _combineObject(src, dest) {
        if (!src) {
            return;
        }

        var fields = Object.getOwnPropertyNames(src);
        for (var i = 0; i < fields.length; ++i) {
            dest[fields[i]] = src[fields[i]];
        }
    };

    function _parseQueryString(dest) {
        if (!window.location.search) {
            return;
        }

        var str = window.location.search;
        if (str[0] == '?') {
            str = str.substr(1);
        }

        var splited = str.split('&');
        for (var i = 0; i < splited.length; ++i) {
            var splited2 = splited[i].split('=');
            var key = decodeURIComponent(splited2[0]);
            var val = decodeURIComponent(splited2[1]);
            _fillObjectField(key, val, dest);
        }
    }

    function _resolveModules(modules) {
        if (!modules) {
            return Promise.resolve();
        }

        if (_options.resolveModulesParallelly) {
            var promises = [];
            for (var i = 0; i < modules.length; ++i) {
                promises.push(LoadScript(modules[i]));
            }

            return Promise.all(promises);
        } else {
            var promise = Promise.resolve(null);
            var makeFunc = function (module) {
                return function (result) {
                    return LoadScript(module);
                };
            };
            for (var i = 0; i < modules.length; ++i) {
                var m = modules[i];
                promise = promise.then(makeFunc(m));
            }
            return promise;
        }
    }

    function _loadComponents(components) {
        var ret = [];
        return Promise.all(components.map(function (c) {
            var _html;
            var _options;
            var _name;
            return _httpGet(c + ".html").then(function (comHtml) {
                _html = comHtml;
                return _httpGet(c + ".js");
            }).then(function (comJs) {
                var Component = function (name, options) {
                    _options = options;
                    _name = name;
                };
                eval(comJs);
                _options.template = _html;
                var p = _resolveModules(_options.modules);
                return p;
            }).then(function () {
                ret.push({ name: _name, options: _options });
                return Promise.resolve();
            })
        })).then(function () {
            return ret;
        });
    }

    function _replace(source, find, replace) {
        var idx = source.indexOf(find);
        if (idx < 0) {
            return source;
        }

        var ret = source.substr(0, idx) + replace + source.substr(idx + find.length);
        return ret;
    }

    function _buildApp(url, params) {
        var componentObject;
        return _httpGet(url + '.js')
            .then(function (js) {
                var WorkflowNode = function (options) {
                    componentObject = options;
                };
                eval(js);
                return _resolveModules(componentObject.modules).then(function () {
                    return Promise.resolve(componentObject)
                });
            })
            .then(function (component) {
                var promise = null;
                promise = _httpGet(url + '.html');

                return promise.then(function (template) {
                    component.template = template;
                    return Promise.resolve(component);
                });
            })
            .then(function (component) {
                // Hook setup()
                var setup = component.setup;
                component.setup = function (props, context) {
                    if (typeof setup == 'function') {
                        setup(props, context);
                    }
                    var instance = Vue.getCurrentInstance();
                    _attachContainer(instance);
                }

                // Hook data()
                var originalDataFunc = component.data || function () {
                    return {};
                };
                component.data = function () {
                    var data = originalDataFunc();
                    _combineObject(params, data);
                    _parseQueryString(data);
                    return data;
                };

                // Create instance
                return _resolveModules(component.modules).then(function () {
                    var components = component.components || [];
                    return _loadComponents(components).then(function (components) {
                        var ret = Vue.createApp(component);

                        for (var i = 0; i < components.length; ++i) {
                            var com = components[i];
                            ret.component(com.name, com.options);
                        }

                        var originalMountFunc = ret.mount || function () { };
                        ret.mount = function (el) {
                            ret.proxy = originalMountFunc(el);
                            return ret.proxy;
                        }

                        return Promise.resolve(ret);
                    });
                });
            });
    };

    exports.createNode = _buildApp;
})(window || this);