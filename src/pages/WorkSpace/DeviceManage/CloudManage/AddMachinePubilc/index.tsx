import React, { useEffect, useState, useImperativeHandle, useMemo } from 'react';
import { Button, Drawer, Form, Row, Col, Select, Input, Radio, Spin, message, Cascader, InputNumber, Badge, Space } from 'antd';
import {
    addCloud, editCloud, queryInstance, querysImage, queryCategories, querysServer, querysAK,
    querysRegion, queryZone, queryName, addGroupMachine, editGroupMachine, queryClusterMachine
} from '../service';
import Owner from '@/components/Owner/index';
import { textRender } from '@/utils/hooks';
import { requestCodeMessage, resetImage, resetECI, enumerEnglish } from '@/utils/utils';
import { PlusCircleTwoTone, MinusCircleTwoTone } from '@ant-design/icons'
import styles from './style.less';
import { useParams, useIntl, FormattedMessage } from 'umi';
import _ from 'lodash';
import { AgentSelect } from '@/components/utils'
import MachineTags from '@/components/MachineTags';
import { QusetionIconTootip } from '@/components/Product/index'
import { displayRender } from '../DataSetPulic';
const { Option } = Select;
const optionLists = [
    {
        value: 'aliyun_eci',
        label: 'aliyun_eci',
        isLeaf: false,
    },
    {
        value: 'aliyun_ecs',
        label: 'aliyun_ecs',
        isLeaf: false,
    },
];
/**
 * 
 * 云上单机 - 机器配置/机器实例 - 添加机器
 */
const NewMachine: React.FC<any> = ({ onRef, is_instance, onSuccess, type }) => {
    const { formatMessage } = useIntl();
    const { ws_id }: any = useParams();
    const [form] = Form.useForm();
    const [tagFlag, setTagFlag] = useState({ list: [], isQuery: '' })
    const [options, setOptions] = useState(optionLists);
    const [loading, setLoading] = useState<boolean>(false)
    const [visible, setVisible] = useState<boolean>(false)
    const [instance, setInstance] = useState<any>([])
    const [image, setImage] = useState<any>([])
    const [sever, setSever] = useState<any>([])
    const [ak, setAK] = useState<any>([])
    const [showZone, setShowZone] = useState<boolean>(false)
    const [region, setRegion] = useState<any>([])
    const [categories, setCategories] = useState<any>([])
    const [disabled, setDisabled] = useState<boolean>(true)
    const [editData, setEditData] = useState<any>({})
    const [validateAK, setValidateAK] = useState<any>({ validate: true, meg: '' }) // 校验AK
    const [validateRegion, setValidateRegion] = useState(true); // 校验Region
    const [manufacturerType, setChangeManufacturer] = useState(''); // 切换规格
    const [btnLoading, setBtnLoading] = useState<boolean>(false)
    const [firstAddDataFlag, setFirstAddDataFlag] = useState<any>(true) // 是第一次添加数据
    const [clusterId, setClusterId] = useState<any>()
    // 1.查询云类型
    const getCloudType = async (id: number) => {
        // 查询添加的第一条数据
        const { code, data: dataSource = [] } = await queryClusterMachine({ cluster_id: id }) || {};
        if (code === 200 && !!dataSource.length) {
            // 回填"云厂商/AK" 和 "地域"两个选框都同步第一次选的数据
            const { test_server = {} } = dataSource[dataSource.length - 1]
            const { manufacturer, ak_id, region, zone } = test_server
            if (ak_id && manufacturer && region && zone) {
                setFirstAddDataFlag(false)
                setChangeManufacturer(manufacturer)
                setShowZone(true)
                let params = {
                    ak_id,
                    id: manufacturer,
                    region,
                    zone,
                }
                if (!!is_instance) {
                    Promise.all([getShowRegion(params), getSeverList(params), getAK()]).then(() => { setLoading(false), setDisabled(false) })
                } else {
                    Promise.all([getShowRegion(params), getInstancegList(params), getImageList(params), getCategoriesList(params), getAK()]).then(() => { setLoading(false), setDisabled(false) })
                }
                form.setFieldsValue({ manufacturer: [manufacturer, ak_id], region: [region, zone] })
            }
        } else {
            setFirstAddDataFlag(true)
        }
    }

    const getInstancegList = async (param: any) => {
        const { data } = await queryInstance(param)
        setInstance(data || [])
        if (!data || data.length === 0) {
            imageResetStatus()
        }
    }
    // 查询image
    const getImageList = async (param: any) => {
        const { data = [] } = await querysImage(param)
        setImage(data)
    }

    const getCategoriesList = async (param: any) => {
        const { data } = await queryCategories(param)
        /**  重组数据适配数据盘的默认值 */
        let newData = data.slice(0)
        let result = newData.some((v: any) => {
            return v.value === 'cloud_efficiency'
        })
        const params = [{ title: '高效云盘', value: 'cloud_efficiency' }]
        if (!result) newData = newData.concat(params)
        setCategories(newData || [])
    }
    const getSeverList = async (param: any) => {
        const { data } = await querysServer(param)
        setSever(data || [])
    }

    const getAK = async () => {
        const { data = [] } = await querysAK({ ws_id: ws_id }) || {}
        setAK(data)
    }

    const loadRegionData = async (selectedOptions: any) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        const { data, code } = await queryZone({ ak_id: targetOption.ak_id, region: targetOption.value })
        if (code === 200) {
            targetOption.children = data && data.map((item: any) => { return { label: textRender(item.id), value: item.id } });
            setRegion([...region])
        } else {
            setTimeout(() => {
                targetOption.children = []
                setRegion([...region])
            }, 500);
        }
    };

    const loadAkData = async (selectedOptions: any) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        const { code, data, msg } = await querysAK({ ws_id, provider: targetOption.value })
        if (code === 200) {
            targetOption.children = data && data.map((item: any) => { return { label: item.name, value: item.id } });
            setOptions([...options])
        } else {
            setTimeout(() => {
                targetOption.children = []
                setOptions([...options])
            }, 500);
            setValidateAK({ validate: false, meg: msg || formatMessage({ id: 'device.no.compliant.AK' }) })
            form.setFieldsValue({ manufacturer: undefined })
        }
    }

    const DEFAULT_FORM_VALUE = {
        instance_type: undefined,
        instance_type_one: undefined,
        instance_type_two: undefined,
        storage_type: undefined,
        storage_size: 40,
        storage_number: 0,
        system_disk_category: undefined,
        system_disk_size: 40,
    }

    // 重置联动控件
    const AkResetStatus = () => {
        form.setFieldsValue({
            ...DEFAULT_FORM_VALUE,
            region: undefined,
            image: undefined,
        })
    }
    // 重置联动控件
    const regionResetStatus = () => {
        form.setFieldsValue({
            ...DEFAULT_FORM_VALUE,
            image: undefined,
        })
    }
    // 重置联动控件
    const imageResetStatus = () => {
        form.setFieldsValue({
            ...DEFAULT_FORM_VALUE
        })
    }

    const onAkChange = async (value: any, selectedOptions: any) => {
        if (!firstAddDataFlag) {
            setDisabled(true)
            regionResetStatus()
            if (value && value.length) {
                // case1.存储选的"云厂商"类型，决定规格的表现形式。
                const frisItem = value[0]
                setChangeManufacturer(frisItem)
                // case2.查询各选框数据源。
                setLoading(true)
                const regionZone = form.getFieldValue('region')
                let param = {
                    ak_id: value[1],
                    region: regionZone[0],
                    zone: regionZone[1],
                }
                if (is_instance) {
                    Promise.all([getSeverList(param)]).then(() => { setLoading(false), setDisabled(false) })
                } else {
                    Promise.all([getInstancegList(param), getImageList(param), getCategoriesList(param)]).then(() => { setLoading(false), setDisabled(false) })
                }
            } else {
                // 清除各选框数据源;
                setInstance([])
                setSever([])
                setImage([])
                setCategories([])
            }
        } else {
            // 第一次添加机器时，"云厂商/AK"和"地域"两个选框有联动关系
            setDisabled(true)
            AkResetStatus()
            if (value && value.length) {
                // case1.根据 ak_id 查询Region数据
                const { code, data = [], msg } = await querysRegion({ ak_id: value[1] })
                let list = []
                if (code === 200) {
                    list = data?.map((item: any) => {
                        return {
                            value: item.id,
                            label: textRender(item.id),
                            ak_id: value[1],
                            isLeaf: false,
                        }
                    })
                    setValidateAK({ validate: true, meg: '' })
                } else {
                    setValidateAK({ validate: false, meg: msg || formatMessage({ id: 'device.no.compliant.AK' }) })
                }
                setRegion(list)
                setValidateRegion(!!list.length)
                // case2.存储选的"云厂商"类型，决定规格的表现形式
                const frisItem = value[0]
                setChangeManufacturer(frisItem.value)
            } else {
                // 清除
                setValidateAK({ validate: true, meg: '' })
                setRegion([])
            }
        }
    }

    const getShowRegion = async (param: any) => {
        setLoading(true)
        const { data: akData = [] } = await querysAK({ ws_id, provider: param.id })
        const { data = [] } = await querysRegion({ ak_id: param.ak_id })
        const { data: query = [] } = await queryZone({ ak_id: param.ak_id, region: param.region })

        let list = data.map((item: any) => {
            if (item.id == param.region) {
                return {
                    value: item.id,
                    label: textRender(item.id),
                    ak_id: param.ak_id,
                    isLeaf: false,
                    children: query.map((item: any) => { return { label: item.id, value: item.id } })
                }
            }
            return {
                value: item.id,
                label: textRender(item.id),
                ak_id: param.ak_id,
                isLeaf: false,
            }
        })

        let lists = optionLists.map((item: any) => {
            if (item.value === param.id) {
                return {
                    value: param.id,
                    label: param.id,
                    isLeaf: false,
                    children: akData.map((item: any) => { return { label: item.name, value: item.id } })
                }
            }
            return item
        })
        setOptions(lists)
        setRegion(list)
        setLoading(false)
    }

    const onRegionChange = (value: any, selectedOptions: any) => {
        if (Array.isArray(selectedOptions) && selectedOptions.length) {
            let param = {
                ak_id: selectedOptions[0].ak_id,
                region: value[0],
                zone: value[1]
            }
            setLoading(true)
            setSever([])
            setImage([])
            setInstance([])
            setCategories([])
            form.setFieldsValue({
                image: undefined,
                instance_id: undefined,
                instance_type: undefined,
                storage_type: undefined,
                system_disk_category: undefined,
            })
            setShowZone(true)
            is_instance ? Promise.all([getSeverList(param)]).then(() => { setLoading(false), setDisabled(false) })
                : Promise.all([getInstancegList(param), getImageList(param), getCategoriesList(param)]).then(() => { setLoading(false), setDisabled(false) })
        } else {
            // case2.清除选项时
            regionResetStatus()
        }
    };

    const handleTypeChange = (val: any) => {
        let region = form.getFieldValue('region')
        let manufacturer = form.getFieldValue('manufacturer')
        let param = {
            ak_id: manufacturer[1],
            region: region[0],
            zone: region[1],
            instance_type: val
        }
        getImageList(param)
    }

    const newMachine = (id: any) => {
        setClusterId(id)
        setEditData({})
        if (type === 'cluster') getCloudType(id)
        setVisible(true)
        setShowZone(false)
        setSever([])
        setImage([])
        setInstance([])
        setRegion([])
        setCategories([])
        setTagFlag({ ...tagFlag, isQuery: 'add', list: [] })
        form.resetFields()
    }

    useImperativeHandle(onRef, () => ({
        newMachine: (row: any) => { newMachine(row) },
        editMachine: (row: any) => { editMachine(row) }
    }));

    const editMachine = (row: any) => {
        setFirstAddDataFlag(true)
        setClusterId(row.cluster_id)
        setEditData(row)
        setShowZone(true)
        setVisible(true)
        const list = row.tag_list.map((item: any) => item.id)
        setTagFlag({ ...tagFlag, isQuery: 'edit', list })
        let param = { ...row }
        param.extra_param = JSON.stringify(param.extra_param) === '{}' ? [{ param_key: '', param_value: '' }] : param.extra_param
        param.tags = param.tag_list?.map((item: any) => { return item.id }) || []
        param.is_instance = param.is_instance ? 1 : 0
        param.manufacturer = [param.manufacturer, param.ak_id]
        param.region = [param.region, param.zone]
        param.kernel_install = param.kernel_install ? 1 : 0
        setChangeManufacturer(row.manufacturer)
        let params = {
            ak_id: param.ak_id,
            region: param.region[0],
            zone: param.region[1],
            id: param.manufacturer[0]
        }
        if (param.ak_name == 'aliyun_eci') {
            let t = param.instance_type
            let type1 = t.indexOf('C')
            let type2 = t.indexOf('G')
            param.instance_type_one = Number(t.substring(0, type1))
            param.instance_type_two = Number(t.substring(type1 + 1, type2))
        }
        if (!!is_instance) {
            Promise.all([getShowRegion(params), getSeverList(params), getAK()]).then(() => { setLoading(false), setDisabled(false) })
        } else {
            Promise.all([getShowRegion(params), getInstancegList(params), getImageList(params), getCategoriesList(params), getAK()]).then(() => { setLoading(false), setDisabled(false) })
        }
        form.setFieldsValue(param)
    }

    // 编辑时，镜像字段数据回填
    useEffect(() => {
        if (Object.keys(editData).length && editData.image && image.length) {
            const selectItem = image.filter((item: any) => item.id === editData.image)
            if (manufacturerType === 'aliyun_eci') {
                const selectType = selectItem.length ? selectItem[0]['platform'] : ''
                const imageValue = selectType ? [selectType, editData.image] : undefined
                form.setFieldsValue({ image: imageValue })
            } else {
                if (!!selectItem.length) {
                    const selectType = selectItem[0]['owner_alias']
                    const selectSec = selectItem[0]['platform']
                    const selectOs = selectItem[0]['os_name']
                    const imageValue = selectType ? [enumerEnglish(selectType, formatMessage), selectSec, selectOs, editData.image] : undefined
                    form.setFieldsValue({ image: imageValue })
                }
            }
        }
    }, [image])

    const submit = async (params: any) => {
        setBtnLoading(true)
        let param = { ...params, ws_id, is_instance }
        if (params.hasOwnProperty('manufacturer')) {
            param.manufacturer = params?.manufacturer[0]
            param.ak_id = params.manufacturer[1]
            param.region = params.region[0]
            param.zone = params.region[1]
        }
        if (params.hasOwnProperty('instance_id')) {
            const selectName = params.instance_id.label // 分割字符串
            param.instance_id = params.instance_id.value
            param.name = selectName.indexOf(' / ') > -1 ? selectName.split(' / ')[1] : selectName
        }

        // 规格
        if (manufacturerType === 'aliyun_eci') {
            param.instance_type = `${params.instance_type_one}C${params.instance_type_two}G`
        } else {
            param.instance_type = params.instance_type
        }
        // 镜像
        if (params.hasOwnProperty('image') && params.image.length) {
            if (manufacturerType === 'aliyun_eci') {
                param.image = params.image[1]
                // 获取镜像名
                const imageSource = resetECI(image, 'platform') || []
                const selectedItem = imageSource.find((item: any) => item.value == params.image[0]) || {}
                const itemObj = selectedItem.children?.find((item: any) => item.value == params.image[1])
                param.image_name = itemObj.label?.props?.children // 注意这里的label不是字符串，是个ReactNode。
            } else {
                if (params.image[3] === 'latest') {
                    let str = `${params.image[1]}:${params.image[2]}:${params.image[3]}`
                    param.image = str
                    param.image_name = str
                } else if (params.image.indexOf(':latest') > 0) {
                    param.image = params.image
                    param.image_name = params.image
                } else {
                    param.image = params.image[3]
                    // 获取镜像名
                    const imageSource = resetImage(image, 'owner_alias', 'platform', 'os_name') || []
                    const LevelOne = imageSource?.find((item: any) => item.value == params.image[0]) || {}
                    const LevelTwo = LevelOne.children?.find((item: any) => item.value == params.image[1]) || {}
                    const LevelThree = LevelTwo.children?.find((item: any) => item.value == params.image[2]) || {}
                    const itemObj = LevelThree.children?.find((item: any) => item.value == params.image[3])
                    param.image_name = itemObj?.label?.props?.children // 注意这里的label不是字符串，是个ReactNode。
                }
            }
        } else {
            param.image = undefined
        }
        param.description = params.description || ''
        param.cluster_id = clusterId
        const { id, machineId } = editData
        let res: any;
        if (type === 'cluster') {
            res = id ? await editGroupMachine(machineId, { ...param }) : await addGroupMachine({ ...param })
        } else {
            res = id ? await editCloud(id, { ...param }) : await addCloud({ ...param })
        }
        if (res.code === 200) {
            message.success(formatMessage({ id: 'operation.success' }));
            if (type === 'cluster') {
                onSuccess({ parentId: clusterId })
            } else {
                onSuccess(param.is_instance || is_instance, id)
            }
            setVisible(false)
        } else if (res.code === 201) {
            let msg = res.msg
            let link_msg = res.link_msg
            let endMsg = <span dangerouslySetInnerHTML=
                {{
                    __html: msg.replace(link_msg, `<a href="/system/user" target="_blank">$&</a>`)
                }}
            />
            message.warning(endMsg)
        } else {
            requestCodeMessage(res.code, res.msg)
        }
        setBtnLoading(false)
    }

    const onSubmit = () => {
        form.validateFields().then(val => {
            let arr = val.extra_param || []
            if (!!arr.length) {
                let names = arr.map((item: any) => item["param_key"]);
                let nameSet = new Set(names);
                if (nameSet.size == names.length) {
                    submit(val)
                } else {
                    message.warn('扩展字段重名，请修改后提交!!!')
                    form.scrollToField('extra_param')
                }
            } else {
                submit(val)
            }
        })
    }
    const onClose = () => {
        // 初始化状态
        setValidateRegion(true)
        setChangeManufacturer('')
        setEditData({})
        setVisible(false)
        setBtnLoading(false)
    }

    const disabledState = useMemo(() => {
        return editData && editData.state === 'Occupied'
    }, [editData])

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            title={<FormattedMessage id=
                {
                    editData.id
                        ? !is_instance ? 'device.config.edit' : 'device.device.edit'
                        : !is_instance ? 'device.config.btn' : 'device.add.btn'
                }
            />
            }
            width={724}
            onClose={onClose}
            visible={visible}
            bodyStyle={{ paddingBottom: 80 }}
            destroyOnClose
            footer={
                <div style={{ textAlign: 'right' }}>
                    <Space>
                        <Button onClick={onClose}>
                            <FormattedMessage id="operation.cancel" />
                        </Button>
                        <Button onClick={() => onSubmit()} type="primary" loading={btnLoading}>
                            <FormattedMessage id="operation.ok" />
                        </Button>
                    </Space>
                </div>
            }
        >
            <Spin spinning={loading}>
                <Form
                    layout="vertical"
                    form={form}
                    initialValues={{
                        instance_type_one: 1,
                        instance_type_two: 1,
                        system_disk_size: 40,
                        storage_size: 40,
                        storage_number: 1,
                        release_rule: 1,
                        kernel_install: 1,
                        bandwidth: 10,
                        storage_type: 'cloud_efficiency',
                        extra_param: [{ param_key: '', param_value: '' }]
                    }}
                >
                    <Row gutter={16}>
                        {/* {!id ?
                            <Col span={12}>
                                <Form.Item
                                    name="is_instance"
                                    label={<FormattedMessage id="device.server.select"/>}
                                    rules={[{ required: true, message: formatMessage({id:'please.select'}) }]}
                                    initialValue={0}
                                >
                                    <Select placeholder={<FormattedMessage id="please.select"/>}
                                        disabled={cloudType != 0} 
                                        onChange={(value: any) => setIs_instance(value)}>
                                        <Option value={0}><FormattedMessage id="device.buy.now"/></Option>
                                        <Option value={1}><FormattedMessage id="device.select.exist"/></Option>
                                    </Select>
                                </Form.Item>
                            </Col> :
                            null
                        } */}
                        {!is_instance ?
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label={<FormattedMessage id="device.name" />}
                                    validateTrigger='onBlur'
                                    rules={[
                                        {
                                            required: true,
                                            validator: async (rule, value) => {
                                                if (!value)
                                                    return Promise.reject(formatMessage({ id: 'device.name.message' }))

                                                if (!/^[A-Za-z][A-Za-z0-9\._-]{1,32}$/.test(value))
                                                    return Promise.reject(formatMessage({ id: 'device.name.message' }))

                                                const q = { is_instance: 0, name: value, ws_id }
                                                const query = editData.id ? { ...q, cloud_server_id: editData.id } : { ...q }
                                                queryName(query).then(res => {
                                                    if (res.code !== 200) {
                                                        return Promise.reject(formatMessage({ id: 'validator.failed' }))
                                                    }
                                                    return
                                                })
                                                return Promise.resolve()
                                            }
                                        },
                                    ]}
                                >
                                    <Input autoComplete="off" placeholder={formatMessage({ id: 'please.enter' })} />
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {/** 机器配置 */}
                        {!is_instance ?
                            <Col span={12}>
                                <Form.Item
                                    name="release_rule"
                                    label={<FormattedMessage id="device.release_rule" />}
                                    rules={[{ required: true, message: formatMessage({ id: 'please.select' }) }]}
                                >
                                    <Radio.Group>
                                        <Radio value={0}><FormattedMessage id="operation.not.release" /></Radio>
                                        <Radio value={1}><FormattedMessage id="operation.release" /></Radio>
                                        <Radio value={2}><QusetionIconTootip title={formatMessage({ id: 'device.failed.save' })} desc={formatMessage({ id: 'device.failed.save.24h' })} /></Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col> :
                            null
                        }

                        {!editData.id || !is_instance ?
                            <Col span={12}>
                                <Form.Item
                                    name="manufacturer"
                                    label={<FormattedMessage id="device.manufacturer/ak" />}
                                    validateStatus={validateAK.validate ? '' : 'error'}
                                    help={validateAK.validate ? undefined : validateAK.meg}
                                    rules={[{ required: true, message: formatMessage({ id: 'please.select' }) }]}
                                >
                                    <Cascader
                                        disabled={(type === 'cluster' && !firstAddDataFlag)}
                                        options={options}
                                        loadData={loadAkData}
                                        onChange={onAkChange}
                                        dropdownMenuColumnStyle={{ width: 165 }}
                                        dropdownClassName={styles.selectCascader}
                                    />
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {manufacturerType === '' ?
                            null
                            : !editData.id || !is_instance ?
                                <Col span={12}>
                                    <Form.Item label="Region/Zone"
                                        name="region"
                                        validateStatus={validateRegion ? '' : 'error'}
                                        help={validateRegion ? undefined : formatMessage({ id: 'device.region/zone' })}
                                        rules={[{ required: true, message: formatMessage({ id: 'please.select' }) }]}
                                    >
                                        <Cascader
                                            disabled={region?.length === 0 || (type === 'cluster' && !firstAddDataFlag)}
                                            options={region}
                                            loadData={loadRegionData}
                                            onChange={onRegionChange}
                                            dropdownMenuColumnStyle={{ width: 165 }}
                                            dropdownClassName={styles.selectCascader}
                                        />
                                    </Form.Item>
                                </Col> :
                                null
                        }
                        {!showZone ? null : !editData.id && is_instance ?
                            <Col span={12}>
                                <Form.Item label={<FormattedMessage id="device.own.server" />}
                                    name="instance_id"
                                    rules={[{ required: true, message: formatMessage({ id: 'please.select' }) }]}
                                >
                                    <Select showSearch
                                        optionFilterProp="children"
                                        placeholder={formatMessage({ id: 'please.select' })}
                                        labelInValue
                                        disabled={sever.length == 0}
                                        filterOption={(input, option: any) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {sever.map((item: any, index: number) => {
                                            return <Option value={item.id} key={index}>{item.ip ? `${item.ip} / ${item.name}` : item.name}</Option>
                                        })
                                        }
                                    </Select>
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {!showZone ? null : !is_instance ? (
                            <>
                                {manufacturerType === 'aliyun_eci' ?
                                    <Col span={12}>
                                        {/** case1: aliyun_eci  */}
                                        <Row>
                                            <Col span={8} style={{ display: 'flex', alignItems: 'flex-start' }}>
                                                <Form.Item label={<FormattedMessage id="device.instance_type" />}
                                                    name="instance_type_one"
                                                    rules={[{ required: true, message: formatMessage({ id: 'please.enter' }) }]}
                                                >
                                                    <InputNumber
                                                        min={1}
                                                        style={{ width: 70 }}
                                                        placeholder={formatMessage({ id: 'device.spec.size' })}
                                                        disabled={disabled || image.length === 0}
                                                    />
                                                </Form.Item>
                                                <span style={{ marginTop: '30px', background: '#fafafa', padding: '4px 10px', border: '1px solid #d9d9d9', borderLeft: 'none' }}>C</span>
                                            </Col>
                                            <Col span={16} style={{ display: 'flex', alignItems: 'flex-start', paddingLeft: 6 }}>
                                                <Form.Item label=""
                                                    name="instance_type_two"
                                                    rules={[{ required: true, message: formatMessage({ id: 'please.enter' }) }]}
                                                >
                                                    <InputNumber
                                                        min={1}
                                                        style={{ width: 70, marginTop: 30 }}
                                                        placeholder={formatMessage({ id: 'device.spec.size' })}
                                                        disabled={disabled || image.length === 0}
                                                    />
                                                </Form.Item>
                                                <span style={{ marginTop: '30px', background: '#fafafa', padding: '4px 10px', border: '1px solid #d9d9d9', borderLeft: 'none' }}>G</span>
                                            </Col>
                                        </Row>
                                    </Col>
                                    :
                                    <Col span={12}>
                                        {/** case2: aliyun_ecs  */}
                                        <Form.Item label={<FormattedMessage id="device.instance_type" />}
                                            name="instance_type"
                                            rules={[{ required: true, message: formatMessage({ id: 'please.select' }) }]}
                                        >
                                            <Select disabled={disabled || image.length === 0}
                                                showSearch
                                                placeholder={formatMessage({ id: 'please.select' })}
                                                optionFilterProp="children"
                                                filterOption={(input, option: any) =>
                                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                                onSelect={handleTypeChange}
                                            >
                                                {instance?.map((item: any, index: number) =>
                                                    <Option value={item.Value} key={index}>{item.Value}</Option>
                                                )}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                }
                            </>
                        ) : null
                        }
                        {!showZone ? null : !is_instance ?
                            manufacturerType === 'aliyun_eci' ?
                                <Col span={12}>
                                    <Form.Item label={<FormattedMessage id="device.image" />}
                                        name="image"
                                        rules={[{ required: true, message: formatMessage({ id: 'please.select' }) }]}
                                    >
                                        <Cascader placeholder={formatMessage({ id: 'please.select' })}
                                            disabled={image.length === 0}
                                            options={resetECI(image, 'platform')}
                                            displayRender={displayRender}
                                            dropdownMatchSelectWidth={true}
                                            dropdownClassName={styles.selectCascader}
                                        />
                                    </Form.Item>
                                </Col>
                                :
                                <Col span={12}>
                                    <Form.Item label={<FormattedMessage id="device.image" />}
                                        name="image"
                                        rules={[{ required: true, message: formatMessage({ id: 'please.select' }) }]}
                                    >
                                        <Cascader placeholder={formatMessage({ id: 'please.select' })}
                                            disabled={image.length === 0}
                                            options={resetImage(image, 'owner_alias', 'platform', 'os_name')}
                                            displayRender={displayRender}
                                            dropdownMenuColumnStyle={{ width: (724 - 48) / 4 }}
                                            dropdownClassName={styles.selectCascader}
                                        />
                                    </Form.Item>
                                </Col> :
                            null
                        }
                        {!showZone ? null : manufacturerType !== 'aliyun_eci' && !is_instance ?
                            <Col span={8}>
                                <Form.Item label={<FormattedMessage id="device.system.disk" />}
                                    name="system_disk_category"
                                    rules={[{ required: true, message: formatMessage({ id: 'please.select' }) }]}
                                >
                                    {categories.length == 0 ?
                                        <Select placeholder={formatMessage({ id: 'device.resource.shortage' })} disabled={true} ></Select>
                                        :
                                        <Select placeholder={formatMessage({ id: 'please.select' })} disabled={disabled} >
                                            {categories.map((item: any, index: number) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })
                                            }
                                        </Select>
                                    }
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {!showZone ? null : manufacturerType !== 'aliyun_eci' && !is_instance ?
                            <Col span={4} style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <Form.Item
                                    name="system_disk_size"
                                    label=" "
                                    rules={[{ required: false, message: formatMessage({ id: 'please.select' }) }]}
                                >
                                    <InputNumber
                                        //type="text"
                                        placeholder={formatMessage({ id: 'device.spec.size' })}
                                        style={{ width: 70 }}
                                        min={20}
                                        max={500}
                                        disabled={disabled || image.length === 0}
                                    />
                                </Form.Item>
                                <span style={{ marginTop: '30px', background: '#fafafa', padding: '4px 10px', border: '1px solid #d9d9d9', borderLeft: 'none' }}>G</span>
                            </Col> :
                            null
                        }
                        {!showZone ? null : manufacturerType !== 'aliyun_eci' && !is_instance ?
                            <Col span={4}>
                                <Form.Item label={<FormattedMessage id="device.storage_type" />}
                                    name="storage_type"
                                >
                                    {categories.length == 0 ?
                                        <Select placeholder={formatMessage({ id: 'device.resource.shortage' })} disabled={true} ></Select>
                                        :
                                        <Select placeholder={formatMessage({ id: 'please.select' })} disabled={disabled} >
                                            {categories.map((item: any, index: number) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })
                                            }
                                        </Select>
                                    }
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {!showZone ? null : manufacturerType !== 'aliyun_eci' && !is_instance ?
                            <Col span={4} style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <Form.Item
                                    name="storage_size"
                                    label=" "
                                    rules={[{ required: false, message: formatMessage({ id: 'please.enter' }) }]}
                                >
                                    <InputNumber
                                        placeholder={formatMessage({ id: 'device.spec.size' })}
                                        style={{ width: 70 }}
                                        min={20}
                                        max={500}
                                        disabled={disabled || image.length === 0}
                                    />
                                </Form.Item>
                                <span style={{ marginTop: '30px', background: '#fafafa', padding: '4px 10px', border: '1px solid #d9d9d9', borderLeft: 'none' }}>G</span>
                            </Col> :
                            null
                        }
                        {!showZone ? null : manufacturerType !== 'aliyun_eci' && !is_instance ?
                            <Col span={4} style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <Form.Item
                                    name="storage_number"
                                    label=" "
                                    rules={[{ required: false, message: formatMessage({ id: 'please.enter' }) }]}
                                >
                                    <InputNumber
                                        placeholder={formatMessage({ id: 'device.quantity' })}
                                        style={{ width: 70 }}
                                        min={0}
                                        max={16}
                                        disabled={disabled || image.length === 0}
                                    />
                                </Form.Item>
                                <span style={{ marginTop: '30px', background: '#fafafa', padding: '4px 10px', border: '1px solid #d9d9d9', borderLeft: 'none' }}>
                                    <FormattedMessage id="device.one" />
                                </span>
                            </Col> :
                            null
                        }

                        {!is_instance ?
                            <Col span={12} className={styles.warp}>
                                <Form.Item
                                    name="bandwidth"
                                    label={<FormattedMessage id="device.bandwidth" />}
                                    rules={[{ required: true, message: formatMessage({ id: 'please.enter' }) }]}
                                >
                                    <Input
                                        type="number"
                                        min={10}
                                        style={{ width: '100%' }}
                                        addonAfter="Mbit/s"
                                        placeholder={formatMessage({ id: 'please.enter' })}
                                    />
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {!is_instance ?
                            <Col span={24} className={styles.warp}>
                                <Form.Item
                                    label={<QusetionIconTootip title={formatMessage({ id: 'device.extended.fields' })} desc={formatMessage({ id: 'device.aliyun.params' })} />}
                                    labelAlign="left"
                                    style={{ marginBottom: 0 }}
                                >
                                    {
                                        <Form.List name="extra_param">
                                            {
                                                (fields, { add, remove }) => {
                                                    return fields.map(
                                                        (field: any, index: number) => (
                                                            <Row gutter={20} style={{ marginBottom: 8 }} key={field.key}>
                                                                {/*左边 */}
                                                                <Col span={11}>
                                                                    <Row>
                                                                        <Col span={4} style={{ paddingTop: 4 }}>
                                                                            <span >Key:</span>
                                                                        </Col>
                                                                        <Col span={20}>
                                                                            <Form.Item name={[field.name, 'param_key']} >
                                                                                <Input />
                                                                            </Form.Item>
                                                                        </Col>
                                                                    </Row>
                                                                </Col>
                                                                {/*右边 */}
                                                                <Col span={11}>
                                                                    <Row>
                                                                        <Col span={4} style={{ paddingTop: 4 }}>
                                                                            <span >Value:</span>
                                                                        </Col>
                                                                        <Col span={20}>
                                                                            <Form.Item name={[field.name, 'param_value']} >
                                                                                <Input />
                                                                            </Form.Item>
                                                                        </Col>
                                                                    </Row>
                                                                </Col>
                                                                <Col span={2} style={{ paddingTop: 5 }}>
                                                                    <Space>
                                                                        {
                                                                            index === fields.length - 1 &&
                                                                            // 添加按钮
                                                                            <PlusCircleTwoTone
                                                                                onClick={() => {
                                                                                    add()
                                                                                }}
                                                                                style={{ cursor: 'pointer' }}
                                                                            />
                                                                        }
                                                                        {
                                                                            fields.length > 1 &&
                                                                            // 删除按钮
                                                                            <MinusCircleTwoTone
                                                                                style={{ cursor: 'pointer' }}
                                                                                twoToneColor="#E02020"
                                                                                onClick={() => remove(field.name)}
                                                                            />
                                                                        }
                                                                    </Space>
                                                                </Col>
                                                            </Row>
                                                        )
                                                    )
                                                }
                                            }
                                        </Form.List>
                                    }
                                </Form.Item>
                            </Col> :
                            null
                        }
                        <Col span={12}>
                            <Owner />
                        </Col>
                        {
                            type === 'cluster' ?
                                <Col span={12}>
                                    <Form.Item
                                        name="kernel_install"
                                        label={<FormattedMessage id="device.kernel_install" />}
                                        rules={[{ required: true, message: formatMessage({ id: 'please.select' }) }]}
                                    >
                                        <Radio.Group>
                                            <Radio value={1}><FormattedMessage id="operation.yes" /></Radio>
                                            <Radio value={0}><FormattedMessage id="operation.no" /></Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                                : null
                        }
                        {
                            type === 'cluster' ? <Col span={12}>
                                <Form.Item
                                    label={<FormattedMessage id="device.var_name" />}
                                    name="var_name"
                                    rules={[
                                        {
                                            required: true,
                                        },
                                    ]}
                                >
                                    <Input autoComplete="off" placeholder={formatMessage({ id: 'please.enter' })} />
                                </Form.Item>
                            </Col> : null
                        }
                        {type === 'cluster' && !!is_instance ?
                            <Col span={12}>
                                <Form.Item
                                    name="private_ip"
                                    label={
                                        <QusetionIconTootip
                                            title={formatMessage({ id: 'device.private_ip' })}
                                            desc={formatMessage({ id: 'device.private_ip.desc' })} />
                                    }
                                >
                                    <Input autoComplete="off" placeholder={formatMessage({ id: 'please.enter' })} />
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {
                            type === 'standalone' ?
                                <Col span={12}>
                                    <MachineTags {...tagFlag} />
                                </Col>
                                : null
                        }
                        <Col span={12}>
                            <Form.Item label={<FormattedMessage id="device.channel_type" />}
                                name="channel_type"
                                initialValue={'toneagent'}
                                rules={[{ required: true, message: formatMessage({ id: 'device.channel_type.message' }) }]}>
                                <AgentSelect disabled={BUILD_APP_ENV} />
                            </Form.Item>
                        </Col>
                        {!is_instance ? null : (
                            <Col span={12}>
                                <Form.Item
                                    label={<FormattedMessage id="device.usage.state" />}
                                    name="state"
                                    hasFeedback
                                    rules={[{ required: true, message: formatMessage({ id: 'device.usage.state.message' }) }]}
                                    initialValue={'Available'}
                                >
                                    <Select placeholder={formatMessage({ id: 'device.usage.state.message' })}
                                        disabled={disabledState}>
                                        <Select.Option value="Available"><Badge status="success" text={"Available"} /></Select.Option>
                                        <Select.Option value="Reserved"><Badge status="default" text={"Reserved"} /></Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>)
                        }
                        <Col span={12}>
                            <Form.Item label={<FormattedMessage id="device.description" />}
                                name="description"
                            >
                                <Input.TextArea rows={3} placeholder={formatMessage({ id: 'please.enter' })} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Drawer>
    )
}

export default NewMachine;

