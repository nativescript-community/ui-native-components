const sveltePreprocess = require('svelte-preprocess');

// this can be called either through svelte-loader where we want either __ANDROID__ or __IOS__ to be defined but not both
// or through svelte-check where we want both so everything is checked
const webpack_env = process.env['NATIVESCRIPT_WEBPACK_ENV']
    ? JSON.parse(process.env['NATIVESCRIPT_WEBPACK_ENV'])
    : {
          production: false,
          android: true,
          ios: true
      };

module.exports = {
    compilerOptions: {
        namespace: 'foreign'
    },
    preprocess: [
        sveltePreprocess({
            replace: [
                [/PRODUCTION/g, !!webpack_env.production],
                [/__ANDROID__/g, !!webpack_env.android],
                [/__IOS__/g, !!webpack_env.ios]
            ].concat([]),
            typescript: {
                compilerOptions: {
                    verbatimModuleSyntax: true,
                    target: 'es2020'
                }
            }
        })
        // svelteNativePreprocessor()
    ]
};
