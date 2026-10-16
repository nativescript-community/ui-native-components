const webpack = require('@nativescript/webpack');
const fs = require('fs');
const { resolve } = require('path');

let snippetConfig;
if (fs.existsSync('../demo-snippets/webpack.config.svelte.js')) {
    snippetConfig = require('../demo-snippets/webpack.config.svelte.js');
}
module.exports = (env) => {
    if (fs.existsSync('../demo-snippets/assets')) {
        webpack.Utils.addCopyRule({
            from: '../demo-snippets/assets',
            to: '.'
        });
    }
    if (fs.existsSync('../demo-snippets/App_Resources/Android')) {
        webpack.Utils.addCopyRule({
            from: '../demo-snippets/App_Resources/Android',
            to: webpack.Utils.project.getProjectRootPath() + '/App_Resources/Android'
        });
    }

    if (fs.existsSync('../demo-snippets/App_Resources/iOS')) {
        webpack.Utils.addCopyRule({
            from: '../demo-snippets/App_Resources/iOS',
            to: webpack.Utils.project.getProjectRootPath() + '/App_Resources/iOS'
        });
    }
    webpack.init(env);

    const { redirect } = env;

    if (snippetConfig) {
        snippetConfig(env, webpack);
    }

    webpack.chainWebpack((config) => {
        if (env.fork) {
            const coreModulesPackageName = '@akylas/nativescript';
            config.resolve.modules
                .clear()
                .merge([resolve(__dirname, `node_modules/${coreModulesPackageName}`), resolve(__dirname, 'node_modules'), `node_modules/${coreModulesPackageName}`, 'node_modules']);
            config.resolve.alias.merge({
                '@nativescript/core': `${coreModulesPackageName}`,
                'tns-core-modules': `${coreModulesPackageName}`,
                'svelte-native': '@nativescript-community/svelte-native'
            });
        }
        config.resolve.modules.add(resolve(__dirname, '../demo-snippets/node_modules'));
        config.plugin('DefinePlugin').tap((args) => {
            if (redirect) {
                Object.assign(args[0], {
                    demoRedirect: JSON.stringify(redirect)
                });
            } else {
                Object.assign(args[0], {
                    demoRedirect: JSON.stringify('')
                });
            }
            return args;
        });
    });

    const config = webpack.resolveConfig();

    config.externalsPresets = { node: false };
    config.resolve.fallback = config.resolve.fallback || {};
    // config.resolve.fallback.timers = require.resolve('timers/');
    config.resolve.fallback.url = false;
    config.resolve.fallback.stream = false;
    config.resolve.fallback.timers = false;
    config.resolve.fallback.buffer = false;
    config.resolve.fallback.util = false;
    config.resolve.fallback.path = false;
    config.resolve.fallback.crypto = false;
    config.resolve.fallback.fs = false;
    config.resolve.fallback.assert = false;
    config.resolve.fallback.tty = false;
    config.resolve.fallback.os = false;

    return config;
};
