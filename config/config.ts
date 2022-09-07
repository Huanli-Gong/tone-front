import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';
import zhCN from 'antd/lib/locale/zh_CN';

const { REACT_APP_ENV, BUILD_APP_ENV, logoutUrl, self_agent, self_agent_name, agent_list } = process.env;

export default defineConfig({
    // outputPath : 'build',
    hash: false,
    antd: {
        // config: {
        //   locale: zhCN
        // }
    },
    dva: {
        hmr: true,
    },
    layout: {
        name: 'T-One',
        locale: true,
    },
    define: {
        ...process.env,
        logoutUrl: BUILD_APP_ENV ? "/" : logoutUrl,
        agent_list: BUILD_APP_ENV ? [{ "value": "toneagent", "label": "ToneAgent" }] : JSON.parse(agent_list as any),
        open_agent: "toneagent",
        self_agent: BUILD_APP_ENV ? null : self_agent,
        self_agent_name: BUILD_APP_ENV ? null : self_agent_name
    },
    locale: {
        default: 'zh-CN',
        // default true, when it is true, will use `navigator.language` overwrite default
        antd: true,
        baseNavigator: false,
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