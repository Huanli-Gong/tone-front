import React from 'react'
import { Form, Row, Typography, Button, Upload, message } from 'antd'
import AvatarCover from '@/components/AvatarCover'
import { Access, useAccess, useParams } from 'umi'
import { saveWorkspaceConfig } from '@/services/Workspace'
import { requestCodeMessage } from '@/utils/utils'
import styles from '../index.less'
import CropperImage from '@/components/CropperImage'

type IProps = {
    refresh: () => void;
    intro: any
}

const Cover: React.FC<IProps> = (props) => {
    const { refresh, intro } = props

    const access = useAccess()
    const { ws_id } = useParams() as any

    const cropperRef = React.useRef<any>(null)

    const uploadProps = {
        name: 'file',
        action: '/api/sys/upload/',
        beforeUpload: (file: any) => {
            const fileReader = new FileReader()
            fileReader.onload = (e: any) => {
                cropperRef.current?.show(e.target.result)
            }
            fileReader.readAsDataURL(file)

            return false
        },
        onChange: async (info: any) => {
            if (info.file.status === 'done') {
                const { code, msg } = await saveWorkspaceConfig({ id: ws_id, logo: info.file.response.path })
                if (code === 200) {
                    refresh()
                    message.success('更新成功！')
                }
                else requestCodeMessage(code, msg)
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    }

    return (
        <>
            <Form.Item label="">
                <Row style={{ width: '100%', marginBottom: 0 }}>
                    <AvatarCover size="large" {...intro} />
                    <div style={{ width: 'calc(100% - 96px - 20px)', marginLeft: 16 }} className={styles.first_part}>
                        <Row style={{ marginBottom: 8 }}>
                            <Access
                                accessible={access.WsBtnPermission()}
                                // fallback={<Button disabled={true}>更新封面</Button>}
                            >
                                <Upload {...uploadProps}>
                                    <Button>更新封面</Button>
                                </Upload>
                            </Access>
                        </Row>
                        <Row style={{ marginBottom: 4 }}>
                            <Typography.Text>支持图片类型：jpg、png，封面大小：96*96。</Typography.Text>
                        </Row>
                        <Row>
                            <Typography.Text></Typography.Text>
                        </Row>
                    </div>
                </Row>
            </Form.Item>

            <CropperImage
                ref={cropperRef}
                onOk={
                    async (info: any) => {
                        const { code, msg } = await saveWorkspaceConfig({ id: ws_id, logo: info.path })
                        if (code === 200) {
                            refresh()
                            message.success('更新成功！')
                        }
                        else
                            requestCodeMessage(code, msg)
                    }
                }
            />
        </>
    )
}

export default Cover