import { useEffect } from 'react'
import { history, useModel, useParams, useLocation } from 'umi'
import { person_auth } from '@/services/user';
import { redirectErrorPage } from '@/utils/utils';
import { enterWsAndGetList } from '@/utils/hooks';

export default (props: any) => {
    const { children } = props
    const locationHistory = useLocation()
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
            const ws = await enterWsAndGetList(ws_id)
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

        if (!ws_is_exist) return redirectErrorPage(404)
        if (sys_role_title !== 'sys_admin' && !ws_role_title)
            return redirectErrorPage(401)
    }

    useEffect(() => {
        if (![404, 401, 500].map((i: number) => `/ws/${ws_id}/${i}`).includes(locationHistory.pathname))
            checkAccess()
    }, [locationHistory.pathname, ws_id])

    return children
}