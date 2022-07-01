import React, { useEffect } from 'react'
import { history, useModel } from 'umi'
import { person_auth } from '@/services/user';
import { enterWorkspaceHistroy } from '@/services/Workspace'
import { deepObject, jumpWorkspace } from '@/utils/utils';

export default (props: any) => {
    const { children } = props
    const { ws_id } = props.match.params
    const { initialState, setInitialState } = useModel('@@initialState')
    const { authList } = initialState

    const checkAccess = async () => {
        let flag = authList

        const { data } = await person_auth({ ws_id })
        const accessData = deepObject(data)
        setInitialState({ ...initialState, authList: { ...accessData, ws_id } })
        flag = accessData

        if (!data) {
            history.push('/500')
            return
        }

        const { ws_role_title, ws_is_exist, sys_role_title } = flag

        if (ws_role_title){
            enterWorkspaceHistroy({ ws_id }) 
        }

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
    }, [location.pathname])

    return children
}