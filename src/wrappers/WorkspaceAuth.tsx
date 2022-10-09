import { useEffect } from 'react'
import { history, useModel, useParams, useLocation } from 'umi'
import { person_auth } from '@/services/user';
import { deepObject } from '@/utils/utils';
import { enterWorkspaceHistroy } from '@/services/Workspace';

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
            const { data } = await person_auth({ ws_id })
            const accessData = deepObject(data)
            setInitialState({ ...initialState, authList: { ...accessData, ws_id } })
            flag = accessData

            if (!data) {
                history.push('/500')
                return
            }
        }

        const { state } = locationHistory as any
        /* 没有history state && fetchWorkspaceHistoryRecord 未请求记录history接口*/
        if (state?.fetchWorkspaceHistoryRecord) {
            history.replace(locationHistory.pathname, undefined)
        } else {
            enterWorkspaceHistroy({ ws_id })
        }

        const { ws_role_title, ws_is_exist, sys_role_title } = flag

        if (!ws_is_exist) {
            history.push(`/404`)
            return
        }

        if (sys_role_title !== 'sys_admin' && !ws_role_title) {
            history.push({ pathname: '/401', state: ws_id })
            return
        }
    }

    useEffect(() => {
        checkAccess()
    }, [locationHistory.pathname])

    return children
}