import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { Drawer, Space, Form, Input, Button, message, Row, Badge } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { useIntl, FormattedMessage } from 'umi';
import { isUrl, requestCodeMessage } from '@/utils/utils'
import { editPlanNote } from '../../services';
import styles from './index.less';

const SettingRow: React.FC<any> = ({ name = '', children }) => (
    <div style={{ width: '100%', display: 'flex' }}>
        <div style={{ width: 100, marginRight: 8, textAlign: 'right' }}>
            <b>{name}</b>
        </div>
        <div style={{ width: 'calc(100% - 100px - 8px)' }}>
            {children}
        </div>
    </div>
)

// 基础信息
const DrawerForm = forwardRef((props, ref) => {
    //
    const { formatMessage } = useIntl()
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    //
    const [state, setState] = useState(false)
    const [noteVal, setNoteVal] = useState('')
    const [dataSet, setDataSet] = useState<any>({})
    const { kernel_info = {}, rpm_info = {}, build_pkg_info = {}, test_result }: any = dataSet;

    useImperativeHandle(
        ref,
        () => ({
            show: (title = '', propsData = {}) => {
                // console.log('title', title);
                // console.log('propsData',propsData);
                setVisible(true);
                setDataSet(propsData);
            }
        })
    )

    // 1. 提交数据
    const submitPlanNote = async (query: any) => {
        try {
            setLoading(true)
            const res = await editPlanNote(query) || {};
            if (res.code === 200) {
                setState(false)
                setNoteVal(query.note)
            } else {
                requestCodeMessage( res.code , res.msg )
            }
            setLoading(false)
        } catch (e) {
            setLoading(false)
        }
    }

    // 取消
    const handleClose = () => {
        setVisible(false)
        setDataSet({})
        setState(false)
    }
    // 确认
    // const handleOk = () => {
    //   setVisible(false)
    // }

    const handleSetEdit = () => {
        setState(true)
    }
    const handleCancel = () => {
        setState(false)
    }
    const handleEdit = () => {
        form.validateFields().then(async (values: any) => {
            // console.log('value:', values)
            props.callback({ data: values.note, editFn: submitPlanNote })
        })
    }

    const EditItem: React.FC = () => {
        return (
            <>
                {
                    !state ? (
                        <EditOutlined onClick={handleSetEdit} style={{ marginLeft: 8, color: '#1890ff' }} />
                    ) : (
                        <div style={{ marginTop: -4 }}>
                            <Form
                                form={form}
                                layout={'inline'}
                            >
                                <Form.Item name="note"
                                    rules={[
                                        { required: true, message: formatMessage({id: 'plan.note.message'}) },
                                        { max: 500, message: formatMessage({id: 'plan.note.max'}) }
                                    ]}
                                >
                                    <Input size="small" style={{ width: 200 }} placeholder={formatMessage({id: 'please.enter'}) } />
                                </Form.Item>
                                <Form.Item>
                                    <Space>
                                        <Button onClick={handleCancel} size="small"><FormattedMessage id="operation.cancel"/></Button>
                                        <Button onClick={handleEdit} size="small" type="primary"><FormattedMessage id="operation.ok"/></Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </div>
                    )
                }
            </>
        )
    }

    const ItemRow: React.FC<any> = ({ label, text, type }) => {
        if ( !text ) return <></>
        return (
            <div className={styles.ItemRow}>
                <div className={styles.label}>{label}</div>
                <div className={`${styles.text} ${styles[type]}`}>
                    {(state && type === 'edit') ? null : (
                        isUrl(text) ? (<a target="__blank" href={text}>{text}</a>) : (type === 'edit' ? (noteVal || text) : text))
                    }
                    {type === 'edit' ? (<EditItem />) : null}
                </div>
            </div>
        )
    }
    return (
        <Drawer
            maskStyle={{ opacity: 0, animation: 'unset' }}
            maskClosable={true}
            keyboard={false}
            title={<FormattedMessage id="plan.configuration"/>}
            width={900}
            onClose={!loading ? handleClose : () => { }}
            visible={visible}
            footer={null}
        >
            <div>
                <Row className={styles.form_row}>
                    <div className={styles.page_body_nav}>
                        <span><FormattedMessage id="plan.basic.info"/></span>
                    </div>
                    <div className={styles.content}>
                        <ItemRow label={formatMessage({id: 'plan.name'})} text={dataSet?.name} />
                        <ItemRow label={formatMessage({id: 'plan.creator_name'})} text={dataSet.creator_name} />
                        <ItemRow label={formatMessage({id: 'plan.project_name'})} text={dataSet.project_name} />
                        <ItemRow label={formatMessage({id: 'plan.description'})} text={dataSet?.description || formatMessage({id: 'plan.width.out'}) } />
                        <ItemRow label={formatMessage({id: 'plan.notice_name'})} text={dataSet?.plan_config_info?.notice_name || ((dataSet?.plan_config_info?.email_info || dataSet?.plan_config_info?.ding_talk_info) && '[T-one]你的测试已完成{date}') || formatMessage({id: 'plan.width.out'}) } />
                        <ItemRow label={formatMessage({id: 'plan.email_info'})} text={dataSet?.plan_config_info?.email_info || formatMessage({id: 'plan.width.out'}) } />
                        <ItemRow label={formatMessage({id: 'plan.ding_talk_info'})} text={dataSet?.plan_config_info?.ding_talk_info || formatMessage({id: 'plan.width.out'}) } />
                        <ItemRow
                            label={formatMessage({id: 'plan.generate.reports'})}
                            text={
                                <span style={{ paddingLeft: 4 }}>
                                    {
                                        dataSet?.auto_report ?
                                            <Badge status="processing" text={<FormattedMessage id="operation.yes"/>} /> :
                                            <Badge status="default" text={<FormattedMessage id="operation.no"/>} />
                                    }
                                </span>
                            }
                        />
                        {
                            dataSet?.auto_report &&
                            <>
                                <ItemRow label={formatMessage({id: 'plan.test.report_name'}) } text={dataSet?.plan_config_info?.report_name || '{plan_name}_report-{report_seq_id}'} />
                                <ItemRow label={formatMessage({id: 'plan.report_template_name'}) } text={dataSet?.plan_config_info?.report_template_name || formatMessage({id: 'plan.width.out'}) } />
                                <ItemRow label={formatMessage({id: 'plan.report_description'}) } text={dataSet?.plan_config_info?.report_description || formatMessage({id: 'plan.width.out'}) } />
                            </>
                        }
                        <ItemRow
                            label={formatMessage({id: 'plan.enable'}) }
                            text={
                                <span style={{ paddingLeft: 4 }}>
                                    {
                                        dataSet?.plan_config_info?.enable ?
                                            <Badge status="processing" text={<FormattedMessage id="operation.yes"/>} /> :
                                            <Badge status="default" text={<FormattedMessage id="operation.no"/>} />
                                    }
                                </span>
                            }
                        />
                        <ItemRow label={formatMessage({id: 'plan.start_time'}) } text={dataSet.start_time} />
                        <ItemRow label={formatMessage({id: 'plan.end_time'}) } text={dataSet.end_time} />
                        <ItemRow label={formatMessage({id: 'plan.remarks'}) } text={dataSet.note} type="edit" />
                    </div>
                </Row>
                {(!!Object.keys(build_pkg_info).length || !!Object.keys(kernel_info).length || !!Object.keys(rpm_info).length || dataSet.env_info || dataSet?.plan_config_info?.func_baseline_name || dataSet?.plan_config_info?.perf_baseline_name) ?
                    <Row className={styles.form_row}>
                        <div className={styles.page_body_nav}>
                            <span><FormattedMessage id="plan.public.config"/></span>
                        </div>
                        <div className={styles.content}>
                            <ItemRow label={formatMessage({id: 'plan.func_baseline'}) } text={dataSet?.plan_config_info?.func_baseline_name} />
                            <ItemRow label={formatMessage({id: 'plan.perf_baseline'}) } text={dataSet?.plan_config_info?.perf_baseline_name} />
                            {/** 1.基础配置build内核 */}
                            {!!Object.keys(build_pkg_info).length && (
                                <>
                                    <ItemRow label={formatMessage({id: 'plan.code_repo'}) } text={build_pkg_info.code_repo} />
                                    <ItemRow label={formatMessage({id: 'plan.code_branch'}) } text={build_pkg_info.code_branch} />
                                    <ItemRow label={formatMessage({id: 'plan.compile_branch'}) } text={build_pkg_info.compile_branch} />
                                    <ItemRow label="CpuArch" text={build_pkg_info.cpu_arch} />
                                    <ItemRow label="Commit ID" text={build_pkg_info.commit_id} />
                                    <ItemRow label="Build Config" text={build_pkg_info.build_config} />
                                    <ItemRow label="Build Machine" text={build_pkg_info.build_machine} />
                                </>
                            )
                            }
                            {/** 2.基础配置已发布/未发布 */}
                            {!!Object.keys(kernel_info).length && (
                                <>
                                    <ItemRow label={formatMessage({id: 'plan.kernel_version'}) } text={dataSet.kernel_version} />
                                    <ItemRow label={formatMessage({id: 'plan.kernel.pkg'}) } text={kernel_info.kernel} />
                                    <ItemRow label={formatMessage({id: 'plan.devel'}) } text={kernel_info.devel} />
                                    <ItemRow label={formatMessage({id: 'plan.headers'}) } text={kernel_info.headers} />
                                </>
                            )
                            }
                            {/** 3.基础配置-rpm包 */}
                            {!!Object.keys(rpm_info).length && (
                                <ItemRow label={formatMessage({id: 'plan.rpm.package'}) } text={rpm_info.rpm} />
                            )
                            }
                            {!!dataSet.env_info && (
                                <ItemRow label={formatMessage({id: 'plan.env_info'}) } text={dataSet.env_info} type="end" />
                            )}
                        </div>
                    </Row>
                    : null
                }
                <Row className={styles.form_row}>
                    <div className={styles.page_body_nav}>
                        <span><FormattedMessage id="plan.test.configuration"/></span>
                    </div>
                    <div className={styles.content}>
                        {
                            <SettingRow name={dataSet?.plan_config_info?.env_prep?.name} >
                                {
                                    dataSet?.plan_config_info?.env_prep?.machine_info.map((i: any, index: number) => (
                                        <div key={index}>
                                            <Space>
                                                <span>{i.machine}</span>
                                                <span>{i.script}</span>
                                            </Space>
                                        </div>
                                    ))
                                }
                            </SettingRow>
                        }
                        {
                            (dataSet?.test_result && dataSet?.test_result.length > 0) &&
                            dataSet.test_result.map((i: any, index: number) => (
                                <SettingRow name={i.name} key={index}>
                                    {
                                        i.template_result.map((t: any) => (
                                            <div>{t.tmpl_name}</div>
                                        ))
                                    }
                                </SettingRow>
                            ))
                        }
                    </div>
                </Row>
                <Row className={styles.form_row}>
                    <div className={styles.page_body_nav}>
                        <span><FormattedMessage id="plan.trigger.configuration"/></span>
                    </div>
                    <div className={styles.content}>
                        <ItemRow 
                            label={formatMessage({id: 'plan.trigger.configuration'}) } 
                            text={dataSet.plan_config_info?.cron_info || formatMessage({id: 'plan.width.out'}) } 
                        />
                    </div>
                </Row>
            </div>
        </Drawer>
    )
});

export default DrawerForm;
