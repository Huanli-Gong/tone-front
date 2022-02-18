// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV, BUILD_APP_ENV } = process.env;

export default defineConfig({
    // outputPath : 'build',
    hash: false,
    antd: {},
    dva: {
        hmr: true,
    },
    layout: {
        name: 'T-One',
        locale: true,
    },
    define: process.env,
    locale: {
        // default zh-CN
        default: 'zh-CN',
        // default true, when it is true, will use `navigator.language` overwrite default
        antd: true,
        baseNavigator: true,
    },
    dynamicImport: BUILD_APP_ENV !== 'openanolis' && {
        loading: '@/components/PageLoading/index',
    },
    targets: {
        ie: 11,
    },
    // umi routes: https://umijs.org/docs/routing
    routes: routes,
    // Theme for antd: https://ant.design/docs/react/customize-theme-cn
    theme: {
        // ...darkTheme,
        'primary-color': defaultSettings.primaryColor,
    },
    // chainWebpack,
    favicon: '/favicon.ico',
    esbuild: {},
    // webpack5: {},
    fastRefresh: {},
    runtimePublicPath: true,
    ignoreMomentLocale: true,
    proxy: proxy[REACT_APP_ENV || 'dev'],
    manifest: {
        basePath: '/',
    },
});
