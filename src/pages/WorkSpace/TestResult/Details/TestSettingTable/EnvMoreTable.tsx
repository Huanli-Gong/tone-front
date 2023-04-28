import { Card, Empty } from 'antd'
import { useEffect, useState } from 'react'
import styles from './index.less'
//环境准备配置 more env
export default (props: any) => {
    const [isEmpty, setIsEmpty] = useState(0)
    const [data, setData] = useState<any>({
        ding: '', email: '', subject: '', cleanup_info: ''
    })

    useEffect(() => {
        if (JSON.stringify(props) !== '{}') {
            const { notice_info = [], cleanup_info = '' } = props
            const obj = { ding: '', email: '', subject: '' }
            let empty = 0;

            notice_info.map(
                (item: any) => {
                    obj[item.type] = item.to
                    obj.subject = item.subject
                }
            )

            if (cleanup_info && cleanup_info !== '') empty++

            if (obj.ding) empty++
            if (obj.email) empty++
            if (obj.subject) empty++

            setIsEmpty(empty)
            setData({
                cleanup_info,
                ...obj
            })
        }
    }, [props])

    return (
        <Card
            title="更多配置"
            bodyStyle={{ paddingTop: 0 }}
            headStyle={{ borderBottom: 'none' }}
        >
            {
                isEmpty === 0 ?
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
                    <table className={styles.setting_info_table}>
                        <tbody>
                            {
                                data.cleanup_info &&
                                <tr>
                                    <td>清理脚本</td>
                                    <td>
                                        {data.cleanup_info}
                                    </td>
                                </tr>
                            }
                            {
                                data.subject &&
                                <tr>
                                    <td>通知主题</td>
                                    <td>
                                        {data.subject}
                                    </td>
                                </tr>
                            }
                            {
                                data.ding &&
                                <tr>
                                    <td>钉钉通知</td>
                                    <td>
                                        {data.ding}
                                    </td>
                                </tr>
                            }
                            {
                                data.email &&
                                <tr>
                                    <td>邮件通知</td>
                                    <td>
                                        {data.email}
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
            }
        </Card>
    )
}