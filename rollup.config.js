import babel from 'rollup-plugin-babel';

export default {
    input: './src/index.js',
    output: {
        format: 'cjs',
        name: 'wpauto',
        file: 'wpauto.js',
    },
    plugins: [
        babel({
            plugins: ['external-helpers'],
            presets: [
                [
                    'env',
                    {
                      'modules': false,
                    },
                ],
                'stage-2',
            ],
            exclude: 'node_modules/**',
            babelrc: false,
        }),
    ],
};
