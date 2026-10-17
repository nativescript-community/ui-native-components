export default {
    ios: {
        // Liquid Glass toasts (SwiftUI, iOS 17+, real glass on iOS 26)
        SPMPackages: [
            {
                name: 'liquid-toasts',
                libs: ['LiquidToasts'],
                repositoryURL: 'https://github.com/SimplifyJobs/liquid-toasts.git',
                version: '0.8.1'
            }
        ]
    }
} as any;
