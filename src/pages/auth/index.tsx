/* eslint-disable react-hooks/exhaustive-deps */
import { useParams } from 'umi'
import { queryWorkspaceHistory } from '@/services/Workspace'
import _ from 'lodash'
import React, { useEffect, useMemo } from 'react';
import { redirectErrorPage } from '@/utils/utils';

const NoFoundPage: React.FC<AnyType> = (props) => {
    const { children } = props
    const { ws_id } = useParams<any>()
    const [dom, setDom] = React.useState<any>()

    const queryWorkspaceList = async () => {
        const { data: workspaces, code } = await queryWorkspaceHistory({ call_page: 'menu', ws_id })
        if (code === 200) {
            const index = _.findIndex(workspaces, function (o: any) { return o.id === ws_id })
            if (~index) {
                setDom(children)
                return
            }
            redirectErrorPage(404)
        }
        else
            redirectErrorPage(500)
    }

    useEffect(() => {
        queryWorkspaceList()
    }, [])

    return useMemo(() => {
        return dom
    }, [dom])
}
export default NoFoundPage;