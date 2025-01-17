import React, { useRef } from 'react'
import { Avatar, Spin, Space } from 'antd'
import styles from './index.less'
import { ReactComponent as PublicIcon } from '@/assets/svg/public.svg'
import { ReactComponent as NPublicIcon } from '@/assets/svg/no_public.svg'
import { useClientSize } from '@/utils/hooks'
import _ from 'lodash'
import EmptyData from './EmptyData'
import EllipsisRect from './EllipsisRect'
import { history, useIntl, FormattedMessage } from 'umi'
import { jumpWorkspace } from '@/utils/utils'
import { queryWorkspace, } from './services'

const ellipsisText = (name: string) => {
    if (!name) return ''
    return name.slice(0, 1)
}

const WorkspaceInfo: React.FC<AnyType> = (wsInfo) => {
    const wsNameEllipsis = useRef<any>(null)
    const logo = wsInfo.logo
    return (
        <>
            <span className={styles.first_colum}>
                {
                    logo ?
                        <Avatar size="small" className={styles.avatar} src={logo} alt="avatar" shape="square" />
                        : <Avatar
                            size="small"
                            shape="square"
                            className={styles.avatar}
                            style={{ backgroundColor: wsInfo.theme_color, fontSize: 14, fontWeight: 'bold' }}
                        >
                            {ellipsisText(wsInfo.show_name)}
                        </Avatar>
                }
            </span>
            <EllipsisRect
                text={wsInfo.show_name || wsInfo.name}
                ellipsis={wsNameEllipsis}
            >
                <span ref={wsNameEllipsis} className={styles.name}>
                    {wsInfo.show_name || wsInfo.name}
                </span>
            </EllipsisRect>
        </>
    )
}

export default () => {
    const { formatMessage } = useIntl()
    const { height: layoutHeight } = useClientSize()
    const desEllipsis = useRef<any>(null)

    const [loading, setLoading] = React.useState(true)
    const [data, setData] = React.useState([])

    const init = async () => {
        setLoading(true)
        const { data, code } = await queryWorkspace()
        setLoading(false)
        if (code !== 200) return
        setData(data?.workspace_list || [])
    }

    React.useEffect(() => {
        init()
    }, [])

    const handleEnterWs = async (id: any) => {
        history.push(jumpWorkspace(id))
    }

    const handleWs_Role = (title_type: any) => {
        const dict: any = {
            ws_member: formatMessage({ id: 'member.type.ws_member' }), //'workspace成员',
            ws_test_admin: formatMessage({ id: 'member.type.ws_test_admin' }), //'测试管理员',
            ws_admin: formatMessage({ id: 'member.type.ws_admin' }), //'管理员',
            ws_tester: formatMessage({ id: 'member.type.ws_tester' }), //'测试人员',
            ws_owner: formatMessage({ id: 'member.type.ws_owner' }), // '所有者'
        }
        return dict[title_type]
    }

    return (
        <Spin spinning={loading}>
            <div className={styles.ws_content} id="content" style={{ minHeight: layoutHeight - 270 - 40 }}>
                {
                    !!data.length ? data.map((item: any) => (
                        <div className={styles.ws_info} key={item.id} onClick={_.partial(handleEnterWs, item.id, item.creator)}>
                            <div className={styles.ws_info_colum}>
                                <WorkspaceInfo {...item} />
                            </div>
                            <div className={styles.ws_info_colum}>
                                <EllipsisRect
                                    text={item.description}
                                    ellipsis={desEllipsis}
                                >
                                    <span className={styles.ws_description} ref={desEllipsis}>
                                        <span className={`${styles.text_label}`} style={{ fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}>
                                            <FormattedMessage id="person.center.introduction" />： </span>{item.description}
                                    </span>
                                </EllipsisRect>
                            </div>
                            <div className={styles.ws_info_colum}>
                                <Space>
                                    <span className={styles.is_public}>{item.is_public ? <PublicIcon /> : <NPublicIcon />}</span>
                                    <span className={styles.second_part}>{item.is_public ? <FormattedMessage id="workspace.public" /> : <FormattedMessage id="workspace.private" />}</span>
                                </Space>
                                <Space>
                                    <span style={{ fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}><FormattedMessage id="person.center.role" />：</span>
                                    <span className={styles.second_part}>{handleWs_Role(item.ws_role)}</span>
                                </Space>
                                <Space>
                                    <span style={{ fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}><FormattedMessage id="person.center.member_count" />：</span>
                                    <span className={styles.second_part}>{`${item.member_count}人`}</span>
                                </Space>
                            </div>
                        </div>
                    )) :
                        <EmptyData layoutHeight={layoutHeight} />
                }
            </div>
        </Spin>
    )
}