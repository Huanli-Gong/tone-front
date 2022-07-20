import React, { useEffect, useState, useImperativeHandle, useMemo } from 'react';
import { Button, Drawer, Form, Row, Col, Select, Input, Radio, Tag, Spin, Empty, message, Cascader, InputNumber, Badge, Space } from 'antd';
import {
    addCloud, editCloud, queryTag, queryInstance, querysImage, queryCategories, querysServer, querysAK,
    querysRegion, queryZone, queryName
} from '../../service';
import Owner from '@/components/Owner/index';
import { textRender } from '@/utils/hooks';
import { requestCodeMessage, resetImage, resetECI, enumerEnglish } from '@/utils/utils';
import { PlusCircleTwoTone, MinusCircleTwoTone } from '@ant-design/icons'
import styles from './style.less';
import { useParams } from 'umi';
import _ from 'lodash';
import { AgentSelect } from '@/components/utils'

/**
 * 
 * 云上单机 - 机器配置/机器实例 - 添加机器
 */
const Index: React.FC<any> = ({ onRef, type, onSuccess }) => {
    const { ws_id }: any = useParams()
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
    const [options, setOptions] = React.useState(optionLists);
    const [loading, setLoading] = useState<boolean>(false)
    const [visible, setVisible] = useState<boolean>(false)
    const [tagsPagination, setTagsPagination] = useState({ total: 0, page_num: 1, page_size: 10 });
    const [tagList, setTagList] = useState<any>([])
    const [fetching, setFetching] = useState<boolean>(true)
    const { Option } = Select;
    const [is_instance, setIs_instance] = useState<number>(0) // 默认"机器配置"
    const [instance, setInstance] = useState<any>([])
    const [image, setImage] = useState<any>([])
    const [sever, setSever] = useState<any>([])
    const [id, setId] = useState<number>()
    const [showZone, setShowZone] = useState<number>(0)
    const [region, setRegion] = useState<any>([])
    const [tagWord, setTagWord] = useState<string>()
    const [categories, setCategories] = useState<any>([])
    const [disabled, setDisabled] = useState<boolean>(true)
    // 编辑的数据
    const [editData, setEditData] = useState<any>({})
    const [validateAK, setValidateAK] = useState<any>({ validate: true, meg: '' }) // 校验AK
    const [validateRegion, setValidateRegion] = React.useState(true); // 校验Region
    const [validateImage, setValidateImage] = React.useState(false); // 校验镜像
    const [manufacturerType, setChangeManufacturer] = React.useState(''); // 切换规格
    const [btnLoading, setBtnLoading] = useState<boolean>(false)
    const getServerTagList = async (word?: string) => {
        const param = word && word.replace(/\s*/g, "")
        if (tagWord && tagWord == param) return
        setTagWord(param)
        requestData({ ws_id, page_num: 1, page_size: 10, name: param }, 'reset')
    }
    const handlePopupScroll = (e: any) => {
        const { page_num, page_size, total, } = tagsPagination
        const { clientHeight, scrollHeight, scrollTop } = e.target
        if (clientHeight + scrollTop + 1 >= scrollHeight && !isNaN(page_num) && Math.ceil(total / page_size) > page_num) {
            requestData({ ws_id, page_num: page_num + 1, page_size, name: tagWord }, 'concat')
        }
    }
    const requestData = async (query: any, option = "concat") => {
        setFetching(true)
        try {
            let res = await queryTag(query)
            if (res.code === 200) {
                // 分页数据合并。
                if (option === 'concat') {
                    const data = tagList.concat(res.data || [])
                    setTagList(data || [])
                    setTagsPagination(res);
                } else if (option === 'reset') {
                    // 新的数据。
                    setTagList(res.data || [])
                    setTagsPagination(res);
                }
            } else {
                message.error(res.msg || '请求数据失败');
            }
            setFetching(false)
        } catch (err) {
            setFetching(false)
        }
    }

    const getInstancegList = async (param: any) => {
        const { data } = await queryInstance(param)
        setInstance(data || [])
        if (!data || data.length === 0) {
            imageResetStatus()
        }

    }
    const getImageList = async (param: any) => {
        const { data = [] } = await querysImage(param)
        setImage(data)
    }
    const getCategoriesList = async (param: any) => {
        const { data } = await queryCategories(param)
        setCategories(data || [])
    }
    const getSeverList = async (param: any) => {
        const { data } = await querysServer(param)
        setSever(data || [])
    }

    const loadData = async (selectedOptions: any) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        const { data } = await queryZone({ ak_id: targetOption.ak_id, region: targetOption.value })
        targetOption.loading = false;
        targetOption.children = data && data.map((item: any) => { return { label: textRender(item.id), value: item.id } });
        setRegion([...region])
    };
    const loadAkData = async (selectedOptions: any) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        try {
            const { code, data, msg } = await querysAK({ ws_id, provider: targetOption.value })
            targetOption.loading = false;
            if (code === 200) {
                targetOption.children = data && data.map((item: any) => { return { label: item.name, value: item.id } });
                setOptions([...options])
            } else {
                setValidateAK({ validate: false, meg: msg || '没有符合的AK' })
                form.setFieldsValue({ manufacturer: undefined })
            }
        } catch (e) {
            targetOption.loading = false;
        }
    }

    const DEFAULT_FORM_VALUE = {
        instance_type: undefined, instance_type_one: undefined, instance_type_two: undefined,
        storage_type: undefined, storage_size: 40, storage_number: 0,
        system_disk_category: undefined, system_disk_size: 40,
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
        setDisabled(true)
        AkResetStatus()
        if (value && value.length) {
            // case1.根据AK查询 Region数据
            const { code, data = [], msg } = await querysRegion({ ak_id: value[1] }) || {}
            let list = []
            if (code === 200) {
                list = data.map((item: any) => {
                    return {
                        value: item.id,
                        label: textRender(item.id),
                        ak_id: value[1],
                        isLeaf: false,
                    }
                })
                setValidateAK({ validate: true, meg: '' })
            } else {
                setValidateAK({ validate: false, meg: msg || '没有符合的AK' })
            }
            setRegion(list)
            setValidateRegion(!!list.length)
            setValidateImage(false)

            // case2.存储选的AK类型，决定规格的表现形式。
            if (selectedOptions && selectedOptions.length) {
                const frisItem = selectedOptions[0]
                setChangeManufacturer(frisItem.value)
            }
        } else {
            // step2. 清除时。
            setValidateAK({ validate: true, meg: '' })
            setRegion([])
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
            setValidateImage(true)
            form.setFieldsValue({
                image: undefined,
                instance_id: undefined,
                instance_type: undefined,
                storage_type: undefined,
                system_disk_category: undefined,
            })
            setShowZone(1)
            type == 1 ? Promise.all([getSeverList(param)]).then(() => { setLoading(false), setDisabled(false) })
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
    const newMachine = () => {
        setId(undefined)
        setVisible(true)
        setIs_instance(type - 0)
        setShowZone(0)
        setSever([])
        setImage([])
        setInstance([])
        setRegion([])
        setValidateImage(false)
        setCategories([])
        form.resetFields()
        getServerTagList()
        setTimeout(function () {
            form.setFieldsValue({
                is_instance: type - 0,
                release_rule: 1,
                bandwidth: 10,
                extra_param: [{ param_key: '', param_value: '' }]
            })
        }, 1)
    }
    useImperativeHandle(onRef, () => ({
        newMachine: newMachine,
        editMachine: (row: any) => { editMachine(row) }
    }));
    const editMachine = (row: any) => {
        setEditData(row)
        setShowZone(1)
        setLoading(true)
        setVisible(true)
        let param = { ...row }
        param.extra_param = JSON.stringify(param.extra_param) === '{}' ? [{ param_key: '', param_value: '' }] : param.extra_param
        param.tags = param.tag_list?.map((item: any) => { return item.id }) || []
        param.is_instance = param.is_instance ? 1 : 0
        param.release_rule = param.release_rule ? 1 : 0
        param.manufacturer = [param.manufacturer, param.ak_id]
        param.region = [param.region, param.zone]

        setChangeManufacturer(row.manufacturer)
        setId(row.id)
        setIs_instance(Number(type))
        setTagList(row.tag_list) // 因为标签字段数据源是分页的，某些已选标签匹配不上数据源，所以要拿已选标签做数据源。
        let params = {
            ak_id: param.ak_id,
            region: param.region[0],
            instance_type: param.instance_type,
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
        // 机器配置
        if (param.is_instance === 0) {
            Promise.all([
                getShowRegion(params),
                getInstancegList(params),
                getImageList(params),
                getCategoriesList(params),
            ]).then(() => { setLoading(false), setDisabled(false) })
        } else {
            Promise.all([
                getShowRegion(params),
                getSeverList(params),
            ]).then(() => { setLoading(false), setDisabled(false) })
        }
        // form.resetFields()
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
                    const imageValue = selectType ? [enumerEnglish(selectType), selectSec, selectOs, editData.image] : undefined
                    form.setFieldsValue({ image: imageValue })
                }
            }
        }
    }, [image])

    const [form] = Form.useForm();
    const submit = async (params: any) => {
        setBtnLoading(true)
        let param = { ...params, ws_id }
        param.is_instance = Number(type)
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
        if (!id) {
            param.ws_id = ws_id
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
                } else if(params.image.indexOf(':latest') > 0){
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
        const res = id ? await editCloud(id, { ...param }) : await addCloud({ ...param })
        if (res.code === 200) {
            message.success('操作成功');
            onSuccess(param.is_instance || type, id)
            setBtnLoading(false)
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
    }

    const onSubmit = () => {
        form.validateFields().then(val => submit(val))
    }
    const onClose = () => {
        // 初始化状态
        setValidateRegion(true)
        setValidateImage(false)
        setChangeManufacturer('')
        setEditData({})
        setVisible(false)
    }
    const tagRender = (props: any) => {
        const { label, closable, onClose } = props;
        return (
            <Tag color={label?.props?.color} closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
                {label?.props?.children}
            </Tag>
        )
    }
    /**
     * @function 1.校验名称输入字符串
     */
    function checkName(rule: any, value: string, callback: any) {
        if (!value) {
            callback()
        } else if (value && value.length <= 32) {
            // 校验名称是否重复
            const q = { is_instance: 0, name: value, ws_id }
            const query = id ? { ...q, cloud_server_id: id } : { ...q }
            queryName(query).then(res => {
                if (res.code === 200) {
                    callback()
                } else {
                    callback(res.msg || '校验失败')
                }
            })
        } else {
            callback()
        }
    }

    // Just show the latest item.
    function displayRender(label: any) {
        return label[label.length - 1];
    }

    const disabledState = useMemo(() => {
        return editData && editData.state === 'Occupied'
    }, [editData])

    return (
        <Drawer
            maskClosable={false}
            keyboard={false}
            title={id ? "编辑机器" : "添加机器"}
            width={724}
            onClose={onClose}
            visible={visible}
            bodyStyle={{ paddingBottom: 80 }}
            destroyOnClose
            footer={
                <div
                    style={{
                        textAlign: 'right',
                    }}
                >
                    <Button onClick={onClose} style={{ marginRight: 8 }}>
                        取消
                    </Button>
                    <Button onClick={() => onSubmit()} type="primary" loading={btnLoading}>
                        确定
                    </Button>
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
                        storage_number: 1
                    }}
                >
                    <Row gutter={16}>
                        {/* {!id ?
                            <Col span={12}>
                                <Form.Item
                                    name="is_instance"
                                    label="机器选择"
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Select placeholder="请选择" onChange={(value: any) => setIs_instance(value)} disabled={true}>
                                        <Option value={0}>立即购买</Option>
                                        <Option value={1}>选择已有</Option>
                                    </Select>
                                </Form.Item>
                            </Col> :
                            null
                        } */}
                        {!is_instance ?
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label="名称"
                                    validateTrigger='onBlur'
                                    rules={[
                                        {
                                            required: true,
                                            min: 1,
                                            max: 32,
                                            pattern: /^[A-Za-z][A-Za-z0-9\._-]*$/g,
                                            message: '仅允许包含字母、数字、下划线、中划线、点，且只能以字母开头，最长32个字符'
                                        },
                                        { validator: checkName },
                                    ]}
                                >
                                    <Input autoComplete="off" placeholder="请输入" />
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {/** 机器配置 */}
                        {!is_instance && !id ?
                            <Col span={12}>
                                <Form.Item
                                    name="release_rule"
                                    label="用完释放"
                                    rules={[{ required: true, message: '请选择' }]}
                                    initialValue={0}
                                >
                                    <Radio.Group>
                                        <Radio value={1}>是</Radio>
                                        <Radio value={0}>否</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {!is_instance && id ?
                            <Col span={12}>
                                <Form.Item
                                    name="release_rule"
                                    label="用完释放"
                                    rules={[{ required: true, message: '请选择' }]}
                                    initialValue={0}
                                >
                                    <Radio.Group>
                                        <Radio value={1}>是</Radio>
                                        <Radio value={0}>否</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {!id || !is_instance ?
                            <Col span={12}>
                                <Form.Item
                                    name="manufacturer"
                                    label="云厂商/AK"
                                    validateStatus={validateAK.validate ? '' : 'error'}
                                    help={validateAK.validate ? undefined : validateAK.meg}
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Cascader
                                        options={options}
                                        loadData={loadAkData}
                                        onChange={onAkChange}
                                        dropdownMatchSelectWidth={true}
                                        dropdownClassName={styles.selectCascader}
                                    />
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {manufacturerType === '' ?
                            null
                            : !id || !is_instance ?
                                <Col span={12}>
                                    <Form.Item label="Region/Zone"
                                        name="region"
                                        validateStatus={validateRegion ? '' : 'error'}
                                        help={validateRegion ? undefined : `没有符合的Region/Zone`}
                                        rules={[{ required: true, message: '请选择' }]}
                                    >
                                        <Cascader
                                            disabled={region?.length === 0}
                                            options={region}
                                            loadData={loadData}
                                            onChange={onRegionChange}
                                            dropdownMatchSelectWidth={true}
                                            dropdownClassName={styles.selectCascader}
                                        />
                                    </Form.Item>
                                </Col> :
                                null
                        }
                        {!showZone ? null : !id && is_instance ?
                            <Col span={12}>
                                <Form.Item label="已有机器"
                                    name="instance_id"
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Select showSearch
                                        optionFilterProp="children"
                                        placeholder="请选择"
                                        labelInValue disabled={sever.length == 0}
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
                                                <Form.Item label="规格"
                                                    name="instance_type_one"
                                                    rules={[{ required: true, message: '请输入' }]}
                                                >
                                                    <InputNumber
                                                        min={1}
                                                        style={{ width: 70 }}
                                                        placeholder="大小"
                                                        disabled={disabled || image.length === 0}
                                                    />
                                                </Form.Item>
                                                <span style={{ marginTop: '30px', background: '#fafafa', padding: '4px 10px', border: '1px solid #d9d9d9', borderLeft: 'none' }}>C</span>
                                            </Col>
                                            <Col span={16} style={{ display: 'flex', alignItems: 'flex-start', paddingLeft: 6 }}>
                                                <Form.Item label=""
                                                    name="instance_type_two"
                                                    rules={[{ required: true, message: '请输入' }]}
                                                >
                                                    <InputNumber
                                                        min={1}
                                                        style={{ width: 70, marginTop: 30 }}
                                                        placeholder="大小"
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
                                        <Form.Item label="规格"
                                            name="instance_type"
                                            rules={[{ required: true, message: '请选择' }]}
                                        >
                                            <Select disabled={disabled || image.length === 0}
                                                showSearch
                                                placeholder="请选择"
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
                        )
                            :
                            null
                        }
                        {!showZone ? null : !is_instance ?
                            manufacturerType === 'aliyun_eci' ?
                                <Col span={12}>
                                    <Form.Item label="镜像"
                                        name="image"
                                        // validateStatus={(validateImage && image.length === 0) ? 'error' : '' }
                                        // help={(validateImage && image.length === 0) ? '没有符合的镜像' : '请选择'}
                                        rules={[{ required: true, message: '请选择' }]}
                                    >
                                        <Cascader placeholder="请选择" disabled={region?.length === 0 || image.length === 0}
                                            options={resetECI(image, 'platform')}
                                            // expandTrigger="hover"
                                            displayRender={displayRender}
                                            dropdownMatchSelectWidth={true}
                                            dropdownClassName={styles.selectCascader}
                                        />
                                    </Form.Item>
                                </Col>
                                :
                                <Col span={12}>
                                    <Form.Item label="镜像"
                                        name="image"
                                        // validateStatus={(validateImage && image.length === 0) ? 'error' : '' }
                                        // help={(validateImage && image.length === 0) ? '没有符合的镜像' : '请选择'}
                                        rules={[{ required: true, message: '请选择' }]}
                                    >
                                        <Cascader placeholder="请选择" disabled={region?.length === 0 || image.length === 0}
                                            options={resetImage(image, 'owner_alias', 'platform', 'os_name')}
                                            displayRender={displayRender}
                                            dropdownMenuColumnStyle={{ width: 170 }}
                                            dropdownClassName={styles.selectCascader}
                                        />
                                    </Form.Item>
                                </Col> :
                            null
                        }
                        {!showZone ? null : manufacturerType !== 'aliyun_eci' && !is_instance ?
                            <Col span={8}>
                                <Form.Item label="系统盘"
                                    name="system_disk_category"
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    {categories.length == 0 ?
                                        <Select placeholder="资源紧缺" disabled={true} ></Select>
                                        :
                                        <Select placeholder="请选择" disabled={disabled} >
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
                                    rules={[{ required: false, message: '请输入' }]}
                                >
                                    <InputNumber
                                        //type="text"
                                        placeholder="大小"
                                        style={{ width: 70 }}
                                        min={20}
                                        max={500}
                                        //onChange={(value)=>setSizeNum(value)}
                                        disabled={disabled || image.length === 0}
                                    />
                                </Form.Item>
                                <span style={{ marginTop: '30px', background: '#fafafa', padding: '4px 10px', border: '1px solid #d9d9d9', borderLeft: 'none' }}>G</span>
                            </Col> :
                            null
                        }
                        {!showZone ? null : manufacturerType !== 'aliyun_eci' && !is_instance ?
                            <Col span={4}>
                                <Form.Item label="数据盘"
                                    name="storage_type"
                                >
                                    {categories.length == 0 ?
                                        <Select placeholder="资源紧缺" disabled={true} ></Select>
                                        :
                                        <Select placeholder="请选择" disabled={disabled} >
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
                                    rules={[{ required: false, message: '请输入' }]}
                                >
                                    <InputNumber
                                        //type="text"
                                        placeholder="大小"
                                        style={{ width: 70 }}
                                        min={20}
                                        max={500}
                                        //onChange={(value)=>setSizeNum(value)}
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
                                    rules={[{ required: false, message: '请输入' }]}
                                >
                                    <InputNumber
                                        //type="text"
                                        placeholder="数量"
                                        style={{ width: 70 }}
                                        min={0}
                                        max={16}
                                        disabled={disabled || image.length === 0}
                                    />
                                </Form.Item>
                                <span style={{ marginTop: '30px', background: '#fafafa', padding: '4px 10px', border: '1px solid #d9d9d9', borderLeft: 'none' }}>个</span>
                            </Col> :
                            null
                        }

                        {!is_instance ?
                            <Col span={12} className={styles.warp}>
                                <Form.Item
                                    name="bandwidth"
                                    label="带宽"
                                    rules={[{ required: true, message: '请输入' }]}
                                >
                                    <Input
                                        type="number"
                                        min={10}
                                        style={{ width: '100%' }}
                                        addonAfter="Mbit/s"
                                        placeholder="请输入"
                                    />
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {!is_instance ?
                            <Col span={24} className={styles.warp}>
                                <Form.Item label="扩展字段" labelAlign="left" style={{ marginBottom: 0 }}>
                                    {
                                        <Form.List name="extra_param" >
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
                        <Col span={12}>
                            <Form.Item
                                name="tags"
                                label="标签"
                            >
                                <Select
                                    mode="multiple"
                                    allowClear
                                    notFoundContent={fetching ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                    filterOption={false}
                                    showSearch
                                    placeholder="请选择"
                                    onSearch={getServerTagList}
                                    onPopupScroll={fetching ? () => { } : handlePopupScroll} // 防抖
                                    style={{ width: '100%' }}
                                    showArrow={false}
                                    onFocus={() => { getServerTagList() }}
                                    getPopupContainer={node => node.parentNode}
                                    tagRender={tagRender}
                                >
                                    {tagList.map(
                                        (item: any) => (
                                            <Option key={item.id} value={item.id}>
                                                <Tag color={item.tag_color} >{item.name}</Tag>
                                            </Option>
                                        )
                                    )
                                    }
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="控制通道"
                                name="channel_type"
                                initialValue={'toneagent'}
                                rules={[{ required: true, message: '请选择控制通道' }]}>
                                <AgentSelect disabled={BUILD_APP_ENV} />
                            </Form.Item>
                        </Col>
                        {!is_instance ? null : (
                            <Col span={12}>
                                <Form.Item
                                    label="使用状态"
                                    name="state"
                                    hasFeedback
                                    rules={[{ required: true, message: '请选择机器状态!' }]}
                                    initialValue={'Available'}
                                >
                                    <Select placeholder="请选择机器状态" disabled={disabledState}>
                                        <Select.Option value="Available"><Badge status="success" />Available</Select.Option>
                                        <Select.Option value="Reserved"><Badge status="default" />Reserved</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>)
                        }
                        <Col span={12}>
                            <Form.Item label="备注"
                                name="description"
                            >
                                <Input.TextArea rows={3} placeholder="请输入" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Drawer>
    )
}

export default Index

