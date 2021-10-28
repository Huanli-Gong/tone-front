import { Redirect, useParams } from 'umi'
import { queryWorkspaceHistory } from '@/services/Workspace'
import _ from 'lodash'
import React, { useState } from 'react'
import { useEffect, useMemo } from 'react';

const NoFoundPage: React.FC<{}> = (props: any) => {
    const { children } = props
    const { ws_id } = useParams<any>()
    const [dom, setDom] = useState<any>()

    const queryWorkspaceList = async () => {
        const { data: workspaces, code } = await queryWorkspaceHistory({ call_page: 'menu', ws_id })
        if (code === 200) {
            const index = _.findIndex(workspaces, function (o: any) { return o.id === ws_id })
            setDom(~index ? children : <Redirect to="/404" />)
            return
        }
        setDom(<Redirect to="/500" />)
        return
    }

    useEffect(() => {
        queryWorkspaceList()
    }, [])

    return useMemo(() => {
        return dom
    }, [dom])
}
export default NoFoundPage;