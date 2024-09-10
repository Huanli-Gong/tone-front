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

export default ({ test_case_id, suite_id, confLogInfo }: any) => {
    const { formatMessage } = useIntl()
    const { initialState } = useModel('@@initialState')
    const { id: job_id, share_id } = useParams() as any

    const handlePathClick = async (ctx: any, state: string) => {
        let params: any = {
            path: ctx.path,
            job_id, share_id
        }
        
        if (state === 'download') {
            params.download = '1'
        }

        if (BUILD_APP_ENV !== 'opensource') {
            const username = initialState?.authList?.username;
            const token = `${username}|${initialState?.token}|${new Date().getTime()}`;
            const signature = encode(token);

            params.username = username;
            params.signature = signature
        }

        if (state === 'download_folder') {
            params.download = '1';
            params.is_folder = '1'
            const downloadUrl = location.origin + `/api/get/oss/url/?` + Object.keys(params).filter((item)=> params[item]).map((key)=> `${key}=${params[key]}`).join('&')
            window.open(downloadUrl)
        } else {
            const data = await request(`/api/get/oss/url/`, { params })
            if (data) {
                if (data.code === 200 && data.msg === 'ok') window.open(data.data)
                else message.warn(`${['download', 'download_folder'].includes(state) ? formatMessage({ id: 'ws.result.details.failed.download.file' }): formatMessage({ id: 'ws.result.details.failed.get.file' })}`)
            }
        }
    }

    const RenderItem = (ctx: any) => {
        const renderData = (ctx.items.length ?
            <>
                <span>{ctx.name}</span>
                {BUILD_APP_ENV !== 'opensource' && <DownloadOutlined onClick={() => handlePathClick(ctx, 'download_folder')} />}
            </>
            :
            <>
                <span onClick={() => handlePathClick(ctx, 'look')}>{ctx.name}</span>
                <DownloadOutlined onClick={() => handlePathClick(ctx, 'download')} />
            </>
        )
        return (
            <Space>
                {share_id? <span>{ctx.name}</span>: renderData}
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

    // 默认展开的文件
    // let defaultExpandedKeys = []
    // if (test_case_id === confLogInfo.test_case_id) {
    //     const str = confLogInfo.conf_log_path || ''
    //     const folder = str.indexOf('/') > -1 ? str.substring(0, str.lastIndexOf('/')): str
    //     defaultExpandedKeys = folder.split('/')
    // }

    return (
        <div style={{ minHeight: 50 }}>
            <Spin spinning={loading}>
                {
                    data.length > 0 ?
                        <Tree
                            // defaultExpandedKeys={defaultExpandedKeys}
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