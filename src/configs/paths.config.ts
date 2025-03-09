import path from 'path';
import moduleAlias from 'module-alias';

const baseDir = path.resolve(__dirname, '..', '..');
export const registerAliases = () => {
    if (process.env.NODE_ENV === 'production') {
        moduleAlias.addAliases({
            '@configs': path.join(baseDir, 'build/src/configs'),
            '@controllers': path.join(baseDir, 'build/src/controllers'),
            '@utils': path.join(baseDir, 'build/src/utils'),
            '@middlewares': path.join(baseDir, 'build/src/middlewares'),
            '@models': path.join(baseDir, 'build/src/models'),
            '@routes': path.join(baseDir, 'build/src/routes'),
            '@schemas': path.join(baseDir, 'build/src/schemas'),
            '@services': path.join(baseDir, 'build/src/services'),
            '@types': path.join(baseDir, 'build/src/types')
        });
    }
}; 