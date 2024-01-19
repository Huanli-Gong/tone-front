import React from 'react'
import { queryCaseResultFile } from '../service'
import { useRequest, request, useParams, useIntl, useModel } from 'umi'
import { Tree, Spin, Empty, message, Space } from 'antd'
import { DownloadOutlined } from '@ant-design/icons';

import styles from './index.less'
import { encode } from 'js-base64'

const TreeFileIcon: React.FC<any> = (props: any) => (
    props.items.length > 0 ?
        <span className={styles.dir_icon} /> :
        <span className={styles.file_icon} />
)

export default ({ test_case_id, suite_id }: any) => {
    const { formatMessage } = useIntl()
    const { initialState } = useModel('@@initialState')
    const { id: job_id, share_id } = useParams() as any

    const handlePathClick = async (ctx: any, state: string) => {
        const params: any = {
            path: ctx.path,
            job_id, share_id
        }

        if (state == 'download') {
            params.download = '1'
        }

        if (BUILD_APP_ENV !== 'opensource') {
            const username = initialState?.authList?.username;
            const token = `${username}|${initialState?.token}|${new Date().getTime()}`;
            const signature = encode(token);

            params.username = username;
            params.signature = signature
        }

        if (state == 'download') params.download = '1';

        const data = await request(`/api/get/oss/url/`, { params })

        if (data) {
            if (data.code === 200 && data.msg === 'ok') window.open(data.data)
            else message.warn(`${state === 'download' ? formatMessage({ id: 'ws.result.details.failed.download.file' }) : formatMessage({ id: 'ws.result.details.failed.get.file' })}`)
        }
    }

    const RenderItem = (ctx: any) => {
        return (
            <Space>
                {
                    share_id ?
                        <span>{ctx.name}</span> :
                        <span onClick={() => handlePathClick(ctx, 'look')}>{ctx.name}</span>
                }
                {
                    (!share_id && !ctx.items.length) &&
                    <DownloadOutlined onClick={() => handlePathClick(ctx, 'download')} />
                }
            </Space>
        )
    }

    const treeDataMap = (item: any, index: string | number): any => (
        item.map((ctx: any, idx: number) => (
            {
                ...ctx,
                title: RenderItem(ctx),
                key: `${index}-${idx}`,
                icon: (p: any) => <TreeFileIcon {...p} />,
                children: ctx.items && ctx.items.length > 0 ? treeDataMap(ctx.items, `${index}-${idx}`) : [],
            }
        ))
    )

    const { data, loading }: any = useRequest(
        () => queryCaseResultFile({ job_id, case_id: test_case_id, suite_id, share_id }),
        {
            initialData: [],
            formatResult: res => {
                if (res.code === 200) {
                    return treeDataMap(res.data, 0)
                }
                return []
            },
        }
    )

    return (
        <div style={{ minHeight: 50 }}>
            <Spin spinning={loading}>
                {
                    data.length > 0 ?
                        <Tree
                            style={{ padding: 20 }}
                            treeData={data}
                            showIcon={true}
                        /> :
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
            </Spin>
        </div>
    )
}