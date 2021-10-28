import React, { useEffect, useState, useImperativeHandle } from 'react';
import { Button, Drawer, Form, Row, Col, Select, Input, Radio, Spin, Empty, message, Cascader, InputNumber } from 'antd';
import { requestCodeMessage, resetImage } from '@/utils/utils';
import { QusetionIconTootip } from '@/components/Product/index'
import { queryClusterMachine, queryCloudType, addGroupMachine, editGroupMachine, queryMember, queryInstance, 
    querysImage, queryCategories, querysServer, querysAK, querysRegion, queryZone, queryVarName, queryName
 } from '../../service';
import Owner from '@/components/Owner/index';
import styles from './style.less';
import { useParams } from 'umi';

/**
 * 
 * 云上集群 - 添加机器
 * 
 */
const NewMachine: React.FC<any> = ({ onRef, onSuccess }) => {
    const { ws_id } = useParams<any>()
    const [loading, setLoading] = useState<boolean>(true)
    const [visible, setVisible] = useState<boolean>(false)
    const [keyword, setKeyword] = useState<string>()
    const [user, setUser] = useState<any>([])
    const [fetching, setFetching] = useState<boolean>(true)
    const { Option } = Select;
    const [is_instance, setIs_instance] = useState<number | undefined>(0)
    // 
    const [instance, setInstance] = useState<any>([])
    const [image, setImage] = useState<any>([])
    const [sever, setSever] = useState<any>([])
    const [ak, setAK] = useState<any>([])
    const [id, setId] = useState<number>()
    const [region, setRegion] = useState<any>([])
    const [cluster_id, setCluster_id] = useState<number>()
    const [categories, setCategories] = useState<any>([])
    const [cloudType, setCloudType] = useState<number>(0)
    const [disabled, setDisabled] = useState<boolean>(true)
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
    // 编辑的数据
    const [editData, setEditData] = useState<any>({})
    const [validateAK, setValidateAK] = useState<any>({ validate: true, meg: '' }) // 校验AK
    const [options, setOptions] = React.useState(optionLists);
    const [validateRegion, setValidateRegion] = React.useState(true); // 校验Region
    const [validateImage, setValidateImage] = React.useState(false); // 校验镜像
    const [manufacturerType, setChangeManufacturer] = React.useState('aliyun_eci'); // 云厂商 切换 规格
    const [nameStatus, setNameStatus] = React.useState<any>(""); // 校验输入框的状态
    const [firstAddDataFlag, setFirstAddDataFlag] = useState<any>(true) // 是第一次添加数据
    
    // 1.查询云类型
    const getCloudType = async (param: any) => {
        const { data } = await queryCloudType(param);
        // console.log('cloudType:', data);
        setCloudType(0)
        let status = undefined
        switch (data) {
            case 1:
                status = 1
                break;
            case 2:
                status = 0
                break;
            default:
                break;
        }
        setIs_instance(status)
        data && form.setFieldsValue({
            is_instance: status
        })
        setTimeout(function () {
            data && setCloudType(data)
        }, 1)

        // 查询添加的第一条数据
        if (data) {
            const { code, data: dataSource=[] } = await queryClusterMachine({ cluster_id: param }) || {};
            if (code === 200 && dataSource.length) {
                // 回填"云厂商/AK" 和 "地域"两个选框都同步第一次选的数据
                const { test_server = {} } = dataSource[dataSource.length -1]
                const { manufacturer, ak_id, region, zone } = test_server
                if (ak_id && manufacturer && region && zone) {
                    setFirstAddDataFlag(false)
                    setChangeManufacturer(manufacturer)
                    let params = {
                        ak_id,
                        id: manufacturer,
                        region,
                        zone,
                    }
                    if (status) {
                        Promise.all([getShowRegion(params),getSeverList(params), getAK()]).then(() => { setLoading(false), setDisabled(false) })
                    }else{
                        Promise.all([getShowRegion(params), getInstancegList(params), getImageList(params), getCategoriesList(params), getAK()]).then(() => { setLoading(false), setDisabled(false) })
                    }
                    form.setFieldsValue({ manufacturer: [manufacturer, ak_id], region: [region, zone] })
                }
            }
        }
    }
    const getInstancegList = async (param: any) => {
        const { data } = await queryInstance(param)
        setInstance(data || [])
    }
    const getImageList = async (param: any) => {
        const { data = [] } = await querysImage(param) || {}
        setImage(data)
        if (data.length === 0) {
            imageResetStatus()
        }
    }
    const getCategoriesList = async (param: any) => {
        const { data=[] } = await queryCategories(param) || {}
        setCategories(data)
    }
    const getSeverList = async (param: any) => {
        const { data } = await querysServer(param)
        setSever(data || [])
    }
    const handleSearch = async (word: string = '') => {
        const param = word && word.replace(/\s*/g, "")
        if (keyword == param) return
        setKeyword(param)
        setFetching(true)
        let { data } = await queryMember({ keyword: param,/* scope:'aligroup' */ })
        setUser(data || [])
        setFetching(false)
    }

    const loadRegionData = async (selectedOptions: any) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        const { code, data, msg } = await queryZone({ ak_id: targetOption.ak_id, region: targetOption.value })
        targetOption.loading = false;
        if ( code === 200 ) {
            targetOption.children = data && data.map((item: any) => { return { label: item.id, value: item.id } });
        }
        setRegion([...region])
        setValidateImage(false)
    };

    const loadAkData = async( selectedOptions:any) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        try {
            const { code, data, msg } = await querysAK({ ws_id, provider: targetOption.value })
            targetOption.loading = false;
            if ( code === 200) {
                targetOption.children = data && data.map((item: any) => { return { label: item.name, value: item.id } });
                setOptions([...options])
            } else {
                setValidateAK({ validate: false, meg: msg || '没有符合的AK' });
                form.setFieldsValue({ manufacturer: undefined })
            }
        } catch (e) {
            targetOption.loading = false;
        }
    }

    // 重置联动控件
    const AkResetStatus = () => {
       form.setFieldsValue({ 
           region: undefined,
           instance_type: undefined, instance_type1: undefined, instance_type2: undefined,
           image: undefined,
           storage_type: undefined, storage_size: 40, storage_number: 0,
           system_disk_category:undefined,system_disk_size:40,
        })
    }
    // 重置联动控件
    const regionResetStatus = () => {
        form.setFieldsValue({
            instance_type: undefined, instance_type1: undefined, instance_type2: undefined,
            image: undefined,
            storage_type: undefined, storage_size: 40, storage_number: 0,
            system_disk_category:undefined,system_disk_size:40,
         })
    }
    // 重置联动控件
    const imageResetStatus = () => {
        form.setFieldsValue({
            instance_type: undefined, instance_type1: undefined, instance_type2: undefined,
            storage_type: undefined, storage_size: 40, storage_number: 0,
            system_disk_category:undefined,system_disk_size:40,
         })
    }
    const onAkChange = async(value:any, selectedOptions:any) => {
        // console.log('value', value)
        // 再次添加机器时，"云厂商/AK"和"地域"两个选框没有联动关系
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
                    Promise.all([ getSeverList(param)]).then(() => { setLoading(false), setDisabled(false) })
                }else{
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
                const { code, data =[], msg } = await querysRegion({ ak_id: value[1] })
                let list = []
                if (code === 200) {
                    list = data?.map((item: any) => {
                        return {
                            value: item.id,
                            label: item.id,
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
                
                // case2.存储选的"云厂商"类型，决定规格的表现形式
                const frisItem = value[0]
                setChangeManufacturer(frisItem.value)
            } else {
                // 清除
                setValidateAK({ validate: true,  meg: '' })
                setRegion([])
            }

        }
    }

    const getShowRegion = async (param: any) => {
        const { data: akData = [] } = await querysAK({ ws_id, provider: param.id })
        const { data = [] } = await querysRegion({ ak_id: param.ak_id })
        const { data: query = [] } = await queryZone({ ak_id: param.ak_id, region: param.region })
        let list = data.map((item: any) => {
            if (item.id == param.region) {
                return {
                    value: item.id,
                    label: item.id,
                    ak_id: param.ak_id,
                    isLeaf: false,
                    children: query.map((item: any) => { return { label: item.id, value: item.id } })
                }
            }
            return {
                value: item.id,
                label: item.id,
                ak_id: param.ak_id,
                isLeaf: false,
            }
        })
        let lists = optionLists.map((item: any)=> {
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
        // let lists =  [{
        //     value: param.id,
        //     label: param.id,
        //     isLeaf: false,
        //     children: akData.map((item: any) => { return { label: item.name, value: item.id } })
        // }]
        // console.log(":", lists)
        setOptions(lists)
        setRegion(list)
        setValidateImage(false)
    }
    const getAK = async () => {
        const { data = [] } = await querysAK({ ws_id: ws_id }) || {}
        setAK(data)
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
                system_disk_category:undefined,
            })
            if (is_instance) {
                Promise.all([getSeverList(param)]).then(() => { setLoading(false), setDisabled(false) })
            }else{
                Promise.all([getInstancegList(param),getImageList(param), getCategoriesList(param)]).then(() => { setLoading(false), setDisabled(false) })
            }
        } else {
            // case2.清除选项时
            regionResetStatus()
        }
    };

    const newMachine = (id: number) => {
        getCloudType(id)
        setCluster_id(id)
        setLoading(true)
        setId(undefined)
        setVisible(true)
        setSever([])
        setImage([])
        setInstance([])
        // --------------
        setRegion([])
        setValidateImage(false)
        // --------------
        setCategories([])
        form.resetFields()
        Promise.all([handleSearch(), getAK()]).then(() => { setLoading(false) })
        setTimeout(function () {
            form.setFieldsValue({
                release_rule: 1,
                baseline_server: 1,
                kernel_install: 1,
                bandwidth: 10,
            })
        }, 1)
    }

    // 编辑: 表单控件数据回填
    const editMachine = (row: any) => {
        setEditData(row)
        setLoading(true)
        let param = { ...row }
        param.tags = param.tag_list?.map((item: any) => { return item.id })
        param.is_instance = param.is_instance ? 1 : 0
        param.release_rule = param.release_rule ? 1 : 0
        param.baseline_server = param.baseline_server ? 1 : 0
        param.kernel_install = param.kernel_install ? 1 : 0
        param.manufacturer = [param.manufacturer, param.ak_id]
        param.region = [param.region, param.zone]
        // 规格
        const { instance_type } = row
        if (row.manufacturer === "aliyun_ecs") {
            param.instance_type = row.instance_type
        } else if (row.manufacturer === "aliyun_eci" && instance_type) {
            const tempStr = instance_type.substr(0, instance_type.length - 1)
            const tempList = tempStr.split('C');
            if (Array.isArray(tempList) && tempList.length) {
              param.instance_type1 = Number(tempList[0])
              param.instance_type2 = tempList[1]
            }
        }

        setNameStatus('success')
        setCluster_id(row.cluster_id)
        setChangeManufacturer(row.manufacturer)
        setId(row.machineId)
        setVisible(true)
        setIs_instance(param.is_instance)
        setUser([{ id: row.owner, last_name: row.owner_name }])
        let params = {
            ak_id: param.ak_id,
            region: param.region[0],
            zone: param.region[1],
            id: param.manufacturer[0]
        }
        if (param.is_instance) {
            Promise.all([getShowRegion(params),  getSeverList(params),getAK()]).then(() => { setLoading(false), setDisabled(false) })
        }else{
            Promise.all([getShowRegion(params), getInstancegList(params), getImageList(params), getCategoriesList(params), getAK()]).then(() => { setLoading(false) })
        }
        form.resetFields()
        setTimeout(function () {
            // 数据回填
            form.setFieldsValue({...param})
        }, 1)
    }

    useImperativeHandle(onRef, () => ({
        newMachine: (id: number) => { newMachine(id) },
        editMachine: (row: any) => { editMachine(row) }
    }));

    // 编辑时，镜像字段数据回填
    useEffect(()=> {
        if (Object.keys(editData).length && editData.image && image.length) {
            const selectItem = image.filter((item : any) => item.id === editData.image)
            const selectType = selectItem.length ? selectItem[0]['platform'] : ''
            const imageValue = selectType ? [selectType, editData.image] : undefined
            form.setFieldsValue({ image: imageValue })
        }
    }, [image])

    const [form] = Form.useForm();
    const submit = async (params: any) => {
        // setVisible(false)
        let param = { ...params , ws_id }
        if (params.hasOwnProperty('manufacturer')) {
            param.manufacturer = params?.manufacturer[0]
            param.ak_id = params.manufacturer[1]
            param.region = params.region[0]
            param.zone = params.region[1]
        }
        if (params.hasOwnProperty('instance_id')) {
            param.instance_id = params.instance_id.value
            param.name = params.instance_id.label
        }
        if (!id) {
            param.ws_id = ws_id
        }
        // 规格
        if (manufacturerType === 'aliyun_eci') {
            param.instance_type = `${params.instance_type1}C${params.instance_type2}G`
        } else {
            param.instance_type = params.instance_type
        }
        // 镜像
        if (params.hasOwnProperty('image') && params.image.length) {
            param.image = params.image[1]
            // 获取镜像名
            const imageSource = resetImage(image,'owner_alias','platform') || []
            const selectedItem = imageSource.find((item: any)=> item.value == params.image[0]) || {}
            const itemObj = selectedItem.children?.find((item: any)=> item.value == params.image[1]) || {}
            param.image_name = itemObj.label?.props?.children // 注意这里的label不是字符串，是个ReactNode。
        } else {
            param.image = undefined
        }
        param.description = params.description || ''
        param.cluster_id = cluster_id

        const res = id ? await editGroupMachine(id, { ...param }) : await addGroupMachine({ ...param })
        if (res.code === 200) {
            message.success('操作成功');
            // case1.初始化状态&&重置表单
            initialState()
            // case2.回调函数
            onSuccess({ parentId: cluster_id })
        } else {
            requestCodeMessage( res.code , res.msg )
        }
    }
    useEffect(()=>{
        AkResetStatus()
    },[ is_instance ])

    const onSubmit = () => {
        form.validateFields().then(val => submit(val))
    }
    const onClose = ()=> {
        initialState()
    }

    // 初始化状态
    const initialState = () => {
        form.resetFields()
        setValidateRegion(true)
        setValidateImage(false)
        setChangeManufacturer('aliyun_eci')
        setNameStatus('')
        setEditData({})
        setFirstAddDataFlag(true)
        setVisible(false)
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
            const query = id ? { ...q, cluster_server_id: id } : { ...q }
            queryName(query).then(res=>{
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

    /**
     * @function 2.名称校验输入字符串
     */
    function checkVarName(rule: any, value: string, callback: any) {
        const maxNumber = 32
        if (!value) {
            setNameStatus('error');
            callback()
        } else if (value && value.length <= maxNumber) {
                // 校验名称是否重复
                const q = {cluster_id: cluster_id, var_name: value }
                const query = id ? { ...q, cluster_server_id: id } : { ...q }
                queryVarName(query).then(res=>{
                    if (res.code === 200) {
                        setNameStatus('success')
                        callback()
                    } else {
                        setNameStatus('error')
                        callback(res.msg || '校验失败')
                    }
                })
        } else {
            setNameStatus('error');
            callback()
        }
    }

    // Just show the latest item.
    function displayRender(label: any) {
        return label[label.length - 1];
    }

    return (
        <Drawer 
            maskClosable={ false }
            keyboard={ false }
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
                    <Button onClick={() => onSubmit()} type="primary">
                        确定
                        </Button>
                </div>
            }
        >
            <Spin spinning={loading}>
                <Form 
                    layout="vertical" 
                    form={form} 
                    /*hideRequiredMark*/ 
                >
                    <Row gutter={16}>
                        {/** 新增 */}
                        {!id ?
                            <Col span={12}>
                                <Form.Item
                                    name="is_instance"
                                    label="机器选择"
                                    rules={[{ required: true, message: '请选择' }]}
                                    initialValue={0}
                                >
                                    <Select placeholder="请选择" disabled={cloudType != 0} onChange={(value: any) => setIs_instance(value)}>
                                        <Option value={0}>立即购买</Option>
                                        <Option value={1}>选择已有</Option>
                                    </Select>
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
                        {!is_instance ?
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label="名称"
                                    validateTrigger='onBlur'
                                    rules={[
                                        { required: true, 
                                            min:1,
                                            max:32,
                                            pattern: /^[A-Za-z0-9\._-]+$/g,
                                            message: '仅允许包含字母、数字、下划线、中划线、点，最长32个字符'
                                        },
                                        { validator: checkName },
                                    ]}
                                >
                                    <Input autoComplete="off" placeholder="请输入" />
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
                                    help={validateAK.validate ? '' : validateAK.meg}
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Cascader
                                        disabled={options?.length === 0} // 无数据，不可编辑
                                        options={options}
                                        loadData={loadAkData}
                                        onChange={onAkChange}
                                    />
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {!id || !is_instance ?
                            <Col span={12}>
                                <Form.Item label="Region/Zone"
                                    name="region"
                                    validateStatus={validateRegion ? '' : 'error'}
                                    help={validateRegion ? '' : `没有符合的Region/Zone`}
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Cascader
                                        disabled={region?.length === 0 || !!id || !firstAddDataFlag} // 无数据||编辑||已添加过数据时，不可编辑
                                        options={region}
                                        loadData={loadRegionData}
                                        onChange={onRegionChange}
                                    />
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {!id && is_instance ?
                            <Col span={12}>
                                <Form.Item label="已有机器"
                                    name="instance_id"
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Select 
                                       showSearch
                                       optionFilterProp="children"
                                       placeholder="请选择" labelInValue disabled={sever.length == 0} 
                                       filterOption={(input, option: any) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {sever.map((item: any, index: number) => {
                                                return <Option value={item.id} key={index}>{item.ip ? `${item.ip}/${item.name}` : item.name}</Option>
                                            })
                                        }
                                    </Select>
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {!is_instance ? (
                            <> 
                            {manufacturerType === 'aliyun_eci' ?
                                <Col span={12}>
                                    {/** case1: aliyun_eci  */}
                                    <Row>
                                        <Col span={8} style={{ display: 'flex', alignItems: 'flex-start' }}>
                                            <Form.Item label="规格"
                                                name="instance_type1"
                                                rules={[{ required: true, message: '请输入' }]}
                                            >
                                                <InputNumber
                                                    min={1}
                                                     //type="text"
                                                    style={{ width:70 }}
                                                    placeholder="大小"
                                                    disabled={disabled || image.length === 0}
                                                />
                                            </Form.Item>
                                            <span style={{ marginTop: '30px',background:'#fafafa',padding:'4px 10px',border:'1px solid #d9d9d9',borderLeft:'none'}}>C</span>
                                        </Col>
                                        <Col span={16} style={{ display: 'flex', alignItems: 'flex-start', paddingLeft:6 }}>
                                            <Form.Item label=""
                                                name="instance_type2"
                                                rules={[{ required: true, message: '请输入' }]}
                                            >
                                                <InputNumber
                                                    min={1}
                                                    style={{ width:70, marginTop: 30 }}
                                                    //type="text"
                                                    placeholder="大小"
                                                    disabled={disabled || image.length === 0}
                                                />
                                            </Form.Item>
                                            <span style={{ marginTop: '30px',background:'#fafafa',padding:'4px 10px',border:'1px solid #d9d9d9',borderLeft:'none'}}>G</span>
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
                                        <Select placeholder="请选择" 
                                            disabled={disabled || image.length === 0}
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option: any) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                              }
                                            >
                                            {instance.map((item: any, index: number) => 
                                               <Option value={item.Value} key={index}>{item.Value}</Option>
                                            )}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                }
                            </>)
                            :
                            null
                        }

                        {!is_instance ?
                            <Col span={12}>
                                <Form.Item
                                    name="image"
                                    label="镜像"
                                    validateStatus={(validateImage && !image.length) ? 'error' : '' }
                                    help={(validateImage && !image.length) ? '没有符合的镜像' : ''}
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    {/* {
                                        <Select placeholder="请选择" disabled={region?.length === 0 || image.length === 0}>
                                            {image.map((item: any, index: number) => {
                                                    return <Option value={item.id} key={index}>{item.name}</Option>
                                                })
                                            }
                                        </Select>
                                    } */}
                                    <Cascader placeholder="请选择" disabled={region?.length === 0 || image.length === 0}
                                        options={resetImage(image, 'owner_alias','platform')}
                                        expandTrigger="hover"
                                        displayRender={displayRender}
                                    />
                                </Form.Item>
                            </Col> :
                            null
                        }
                        {!is_instance ?
                            <Col span={8}>
                                <Form.Item label="系统盘"
                                    name="system_disk_category"
                                >

                                    {categories.length == 0 ?
                                        // <Input placeholder="请输入"
                                        //     autoComplete="off"
                                        //     disabled={disabled || image.length === 0} />
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
                        {!is_instance ?
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
                                        defaultValue={40}
                                        //onChange={(value)=>setSizeNum(value)}
                                        disabled={disabled || image.length === 0}
                                    />
                                </Form.Item>
                                <span style={{ marginTop: '30px', background: '#fafafa', padding: '4px 10px', border: '1px solid #d9d9d9', borderLeft: 'none' }}>G</span>
                            </Col> :
                            null
                        }
                        {!is_instance ?
                            <Col span={4}>
                                <Form.Item
                                    name="storage_type"
                                    label="数据盘"
                                >
                                    {categories.length == 0 ?
                                        // <Input placeholder="请输入" 
                                        //    autoComplete="off"
                                        //    disabled={disabled || image.length === 0} />
                                        <Select placeholder="资源紧缺" disabled={true} ></Select>
                                        :
                                        <Select placeholder="请选择" disabled={disabled || image.length === 0}>
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
                        {!is_instance ?
                            <Col span={4} style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <Form.Item
                                    name="storage_size"
                                    label=" "
                                    rules={[{ required: false, message: '请输入' }]}
                                >
                                    <InputNumber
                                        placeholder="大小"
                                        min={ 20 }
                                        max={ 500 }
                                        style={{ width:70 }}
                                        defaultValue={40}
                                        disabled={disabled || image.length === 0}
                                    />
                                </Form.Item>
                                <span style={{ marginTop: '30px',background:'#fafafa',padding:'4px 10px',border:'1px solid #d9d9d9',borderLeft:'none'}}>G</span>
                            </Col> :
                            null
                        }
                        {!is_instance ?
                            <Col span={4} style={{ display: 'flex', alignItems:'flex-start' }}>
                                <Form.Item
                                    name="storage_number"
                                    label=" "
                                    rules={[{ required: false, message: '请输入' }]}
                                >
                                    <InputNumber
                                        //type="text"
                                        placeholder="数量"
                                        style={{ width:70 }}
                                        defaultValue={0}
                                        min={ 0 }
                                        max={ 16 }
                                        disabled={disabled || image.length === 0}
                                    />
                                </Form.Item>
                                <span style={{ marginTop: '30px',background:'#fafafa',padding:'4px 10px',border:'1px solid #d9d9d9',borderLeft:'none'}}>个</span>
                            </Col> :
                            null
                        }
                        
                        {!is_instance ?
                            <Col span={12} className={styles.warp} >
                                <Form.Item
                                    name="bandwidth"
                                    label="带宽"
                                    rules={[{ required: true, message: '请输入' }]}
                                >
                                    <Input
                                        type="number"
                                        style={{ width: '100%' }}
                                        addonAfter="Mbit/s"
                                        placeholder="请输入"
                                    />
                                </Form.Item>
                            </Col> :
                            null
                        }
                        <Col span={12}>
                            <Owner/>
                            {/* <Form.Item
                                name="owner"
                                label="Owner"
                                rules={[{ required: true, message: '请选择' }]}
                            >
                                <Select
                                    allowClear
                                    notFoundContent={fetching ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                    filterOption={false}
                                    onSearch={handleSearch}
                                    onFocus={() => { handleSearch() }}
                                    style={{ width: '100%' }}
                                    showArrow={false}
                                    showSearch
                                >
                                    {
                                        user.map((item: any) => {
                                            return <Option value={item.id} key={item.id}>{item.last_name}</Option>
                                        })
                                    }
                                </Select>
                            </Form.Item> */}
                        </Col>
                        {/* <Col span={12}>
                            <Form.Item
                                name="role"
                                label="角色"
                                rules={[{ required: true, message: '请选择' }]}
                            >
                                <Select placeholder="请选择">
                                    <Option value="local">local</Option>
                                    <Option value="remote">remote</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="baseline_server"
                                label="是否基线机器"
                                rules={[{ required: true, message: '请选择' }]}
                            >
                                <Radio.Group>
                                    <Radio value={1}>是</Radio>
                                    <Radio value={0}>否</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col> */}
                        <Col span={12}>
                            <Form.Item
                                name="kernel_install"
                                label="安装内核"
                                rules={[{ required: true, message: '请选择' }]}
                            >
                                <Radio.Group>
                                    <Radio value={1}>是</Radio>
                                    <Radio value={0}>否</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="运行变量名"
                                name="var_name"
                                // hasFeedback
                                // required={true}
                                // validateStatus={nameStatus}
                                // validateTrigger='onBlur'
                                rules={[
                                    { required: true, 
                                        // min: 1,
                                        // max:32,
                                        // pattern: /^[A-Za-z0-9\._-]+$/g,
                                        // message: '仅允许包含字母、数字、下划线、中划线、点，最长32个字符'
                                    },
                                    // { validator: checkVarName },
                                ]}
                            >
                                <Input autoComplete="off" placeholder="请输入" />
                            </Form.Item>
                        </Col>
                        {is_instance ?
                            <Col span={12}>
                                <Form.Item
                                    name="private_ip"
                                    label={<QusetionIconTootip desc="私网IP" title="指定主网卡私网IP，则IP必须在虚拟交换机地址段内且可用" />}
                                    rules={[{ required: true, message: '请选择' }]}
                                >
                                    <Input autoComplete="off" placeholder="请输入" />
                                </Form.Item>
                            </Col> :
                            null
                        }
                        <Col span={12}>
                            <Form.Item label="控制通道" 
                                name="channel_type"
                                initialValue={'toneagent'}
                                rules={[{ required: true , message : '请选择控制通道' }]}>
                                <Select>
                                    {/* <Select.Option value="staragent">StarAgent</Select.Option> */}
                                    <Select.Option value="toneagent" key="toneagent">ToneAgent</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        
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

export default NewMachine