import { useEffect } from 'react'
import { history, useModel, useParams, useLocation, useRouteMatch } from 'umi'
import { person_auth } from '@/services/user';
import { redirectErrorPage, envIgnoreIds } from '@/utils/utils';
import { enterWsAndGetList } from '@/utils/hooks';

export default (props: any) => {
    const { children } = props
    const { pathname } = useLocation()
    const { url, path } = useRouteMatch()
    const { ws_id } = useParams() as any
    const { initialState, setInitialState } = useModel('@@initialState')

    const { authList } = initialState

    const checkAccess = async () => {
        let flag = authList
        const { ws_id: old_ws_id } = authList

        if (!old_ws_id || old_ws_id !== ws_id) {
            setInitialState((p: any) => ({
                ...p,
                listFetchLoading: true,
                wsList: undefined,
            }))
            const { data } = await person_auth({ ws_id })
            setInitialState({ ...initialState, authList: { ...data, ws_id }, listFetchLoading: true })
            flag = data

            /* 切换ws请求记录历史接口 */
            /* getHistoryFetcher() */
            const ws = await enterWsAndGetList(ws_id) || {}
            setInitialState((p: any) => ({
                ...p,
                ...ws,
                listFetchLoading: false
            }))

            if (ws?.first_entry && data?.ws_role_title === "ws_owner") {
                history.push(`/ws/${ws_id}/workspace/initSuccess`)
                return
            }
            /* 历史记录接口调取 */
            if (!data) {
                redirectErrorPage(500)
                return
            }
        }

        const { ws_role_title, ws_is_exist, sys_role_title } = flag

        try {
            if (!!~pathname?.replace(url, path)?.indexOf(`/ws/:ws_id/device`) && envIgnoreIds().includes(ws_id)) {
                const isMember = ['ws_member', 'ws_tourist'].includes(ws_role_title)
                const isSys = ['sys_admin'].includes(sys_role_title)
                if (!isSys && isMember) return redirectErrorPage(401)
            }
        }
        catch (err) {

        }

        if (!ws_is_exist) return redirectErrorPage(404)
        if (sys_role_title !== 'sys_admin' && !ws_role_title)
            return redirectErrorPage(401)
    }

    useEffect(() => {
        if (![404, 401, 500].map((i: number) => `/ws/${ws_id}/${i}`).includes(pathname))
            checkAccess()
    }, [pathname, ws_id])

    return children
}