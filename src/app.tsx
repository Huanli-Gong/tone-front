import type { BasicLayoutProps, Settings as ProSettings } from '@ant-design/pro-layout';

import { notification, ConfigProvider, version } from 'antd';
import { history } from 'umi';
import type { RequestConfig } from 'umi';
import Headers from '@/components/Header';
import { person_auth } from '@/services/user';
import defaultSettings from '../config/defaultSettings';
import { marked } from 'marked';
import {
    getPageWsid,
    redirectErrorPage,
    OPENANOLIS_LOGIN_URL,
    REQUEST_NOTATION_URLS,
} from '@/utils/utils';

import 'animate.css';
import { enterWsAndGetList } from './utils/hooks';
import HelperChatBoot from './components/HelperChatBoot';

const jumpLoginPage = () => {
    if (
        ['opensource', 'openanolis'].includes(BUILD_APP_ENV || '') &&
        ~window.location.pathname.indexOf(`/login`)
    )
        return;

    if (BUILD_APP_ENV === 'opensource') {
        history.push(`/login?redirect_url=${window.location.pathname}`);
        return;
    }

    if (BUILD_APP_ENV === 'openanolis') window.location.href = OPENANOLIS_LOGIN_URL;

    if (!BUILD_APP_ENV) return (window.location.href = logoutUrl + window.location.href);

    return;
};
console.log(version);

marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code, lang) {
        const hljs = require('highlight.js');
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartypants: false,
    xhtml: false,
});

const ignoreRoutePath = ['/500', '/401', '/404', BUILD_APP_ENV === 'opensource' && '/login'].filter(
    Boolean,
);
const wsReg = /^\/ws\/([a-zA-Z0-9]{8})\/.*/;

const AD_WS_ID = '';

export async function getInitialState(): Promise<any> {
    const isShowAd = localStorage[`ad_str_${AD_WS_ID}_display`] ? undefined : AD_WS_ID;
    const initialState = {
        settings: defaultSettings,
        refreshMenu: false,
        jobTypeList: [],
        authList: {},
        hasAdWs: [AD_WS_ID],
        wsAdShow: isShowAd,
    };

    const { pathname } = window.location;
    const isWs = wsReg.test(pathname);
    const ws_id = getPageWsid();

    const { data, code } = await person_auth(
        ws_id && /^[a-zA-Z0-9]{8}$/.test(ws_id) ? { ws_id } : {},
    );

    const baseAppState = {
        ...initialState,
        listFetchLoading: true,
        authList: data,
    };

    if (code !== 200 || Object.prototype.toString.call(data) !== '[object Object]') {
        redirectErrorPage(500);
        return baseAppState;
    }

    if (!ignoreRoutePath.includes(history.location.pathname)) {
        const { ws_is_exist, ws_is_public, user_id, ws_role_title, sys_role_title } = data;

        if (isWs) {
            // 这个ws是否存在
            if (!ws_is_exist) {
                redirectErrorPage(404);
                return baseAppState;
            }

            /** 用户进入ws：case1.首先判断是公开ws还是私密ws；case2.判断进入私密ws时，未登录跳登录。 */
            if (!ws_is_public && !user_id) {
                jumpLoginPage();
                return;
            }

            /** 有无权限：case1.用户已登录，要查看私密ws时(分享的私密ws链接)，判断有无访问权限。  */
            if (sys_role_title !== 'sys_admin' && !ws_role_title) {
                redirectErrorPage(401);
                return baseAppState;
            }
            const ws: any = await enterWsAndGetList(ws_id);
            if (ws?.first_entry) {
                history.push(`/ws/${ws_id}/workspace/initSuccess`);
            }
            return {
                ...initialState,
                authList: { ...data, ws_id },
                ...ws,
                listFetchLoading: false,
            };
        }

        return {
            ...initialState,
            fetchHistory: true,
            authList: data,
        };
    }

    return baseAppState;
}

export const layout = ({
    initialState,
}: {
    initialState: { settings?: ProSettings };
}): BasicLayoutProps => {
    return {
        disableContentMargin: false,
        footerRender: false,
        locale: 'zh-CN',
        menuHeaderRender: false,
        menuRender: false,
        headerRender: (props) => <Headers {...props} />,
        onMenuHeaderClick: () => false,
        /* @ts-ignore */
        childrenRender: (dom: JSX.Element) => (
            <ConfigProvider
                // locale={zhCn}
                input={{ autoComplete: 'off' }}
            >
                {dom}
                <HelperChatBoot />
            </ConfigProvider>
        ),
        disableMobile: true,
        ...initialState?.settings,
    };
};

const codeMessage: any = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response | undefined => {
    const { response } = error;
    notification.config({ top: 88 });
    // 网络状态码500报错优化
    if (response) {
        const { status, statusText, url } = response;
        const errorText = codeMessage[status] || statusText;

        console.log(`${status}: ${url}`);

        if (REQUEST_NOTATION_URLS.filter((i: any) => !!~url.indexOf(i))?.length > 0) {
            notification.error({
                message: `请求错误 ${status}: ${url}`,
                description: errorText,
            });
            return;
        }

        if (status >= 500) {
            redirectErrorPage(500);
        } else if (status === 401) {
            redirectErrorPage(401);
            return;
        } else if (status === 403) {
            jumpLoginPage();
            return;
        } else {
            notification.error({
                message: `请求错误 ${status}: ${url}`,
                description: errorText,
            });
        }
    }
    if (!response) {
        notification.error({
            description: '您的网络发生异常，无法连接服务器',
            message: '网络异常',
        });
    }
    return response;
};

export const request: RequestConfig = {
    errorHandler,
};
