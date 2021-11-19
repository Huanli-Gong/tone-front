import React, { useMemo, useEffect } from 'react'
import { history, useModel } from 'umi'
import { person_auth } from '@/services/user';
import { workspaceHistroy } from '@/services/Workspace'
import { deepObject } from '@/utils/utils';

export default (props: any) => {
    const { children } = props
    const { ws_id } = props.match.params
    const { initialState, setInitialState } = useModel('@@initialState')
    const { authList } = initialState

    const checkAccess = async () => {
        let access = authList

        if (ws_id !== authList.ws_id) {
            const { data } = await person_auth({ ws_id })
            const accessData = deepObject(data)
            setInitialState({ ...initialState, authList: { ...accessData, ws_id } })
            access = accessData

            if (!data) {
                history.push('/500')
                return
            }

            if (data.ws_role_title)
                workspaceHistroy({ ws_id })  //
        }

        const { ws_role_title, ws_is_exist } = access

        if (!ws_is_exist) {
            history.push(`/404`)
            return
        }

        if (!ws_role_title) {
            history.push({ pathname: '/401', state: ws_id })
            return
        }
    }

    useEffect(() => {
        checkAccess()
    }, [location.pathname])

    return children
}