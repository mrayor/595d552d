import path from 'path';
import moduleAlias from 'module-alias';

const baseDir = path.resolve(__dirname, '..', '..');
export const registerAliases = () => {
    if (process.env.NODE_ENV === 'production') {
        moduleAlias.addAliases({
            '@configs': path.join(baseDir, 'build/configs'),
            '@controllers': path.join(baseDir, 'build/controllers'),
            '@utils': path.join(baseDir, 'build/utils'),
            '@middlewares': path.join(baseDir, 'build/middlewares'),
            '@models': path.join(baseDir, 'build/models'),
            '@routes': path.join(baseDir, 'build/routes'),
            '@schemas': path.join(baseDir, 'build/schemas'),
            '@services': path.join(baseDir, 'build/services'),
            '@types': path.join(baseDir, 'build/types')
        });
    }
}; 