// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

function create() {
    var currentLocale = null;
    return {
        locales: {},
        texts: {},
        getCurrentLocale() {
            return currentLocale;
        },
        addLocale(path, locales, isFallback) {
            if (!locales) {
                var index = path.lastIndexOf('/');
                if (index < 0) {
                    locales = path;
                } else {
                    locales = path.substr(path, index + 1);
                }
                locales = locales.split('.')[0];
            }

            if (typeof locales == 'string') {
                this.locales[locales] = path;
            } else if (locales instanceof Array) {
                for (var i = 0; i < locales.length; ++i) {
                    this.locales[locales[i]] = path;
                }
            }

            if (isFallback) {
                this.locales['fallback'] = path;
            }
        },
        setLocale(locale) {
            if (!locale) {
                locale = !window.localStorage.locale
                    ? window.navigator.language
                    : window.localStorage.locale;
            }

            if (!this.locales[locale]) {
                locale = 'fallback';
            }

            if (!this.locales[locale]) {
                throw 'No available translations for the locale';
            }

            currentLocale = locale;
            this.texts = require(this.locales[locale]).texts;

            if (this.locales['fallback']) {
                if (this.locales[locale] != this.locales['fallback']) {
                    var texts = require(this.locales['fallback']).texts;
                    var keys = Object.getOwnPropertyNames(texts);
                    var self = this;
                    keys.forEach(function (key) {
                        if (!self.texts[key]) {
                            self.texts[key] = texts[key];
                        }
                    });
                }
            }
        },
        sr() {
            if (arguments.length == 0) {
                return null;
            }
            var key = arguments[0];
            var val = key;
            if (this.texts[key]) {
                val = this.texts[key];
            }
            for (var i = 1; i < arguments.length; ++i) {
                val = val.replaceAll(`{${i - 1}}`, arguments[i]);
            }
            return val;
        }
    };
}

exports.create = create;