import React, { useState, useEffect, useRef } from 'react'
import { message, Breadcrumb, Row, Input, Space, Button, Spin, Checkbox, Form, Select, Radio, Layout } from 'antd'

import { history, useRequest, request } from 'umi'
import styles from '../index.less'
import { queryHelpDocList, createHelpDoc, updateHelpDoc } from '../services'
import wangEditor from 'wangeditor'
import _ from 'lodash'
import { resizeDocumentHeightHook } from '@/utils/hooks'
import { requestCodeMessage } from '@/utils/utils'

import dropDown from '@/assets/svg/dropDown.svg'

const { TextArea } = Input;
const { Option } = Select;
const close = `url("${dropDown}") center center / 16px 16px`

let editor: any = null
let odiv: any = null
let otitle: any = null
let domText: any = null
let openNextElementSibling: any = null
let allallCatalogArr: any = []


export default (props: any) => {
    const { help_id } = props.match.params
    const operationType = props.match.path === '/help_doc/:help_id/edit' || props.match.path === '/notice/:help_id/edit' ? 'edit' : 'new'
    const typePath = /^\/help_doc/.test(props.match.path) ? 'help_doc' : 'notice'
    const [title, setTitle] = useState('')
    const [isCheck, setIsCheck] = useState(false)
    const [isActive, setIsActive] = useState(true)
    const [paddingBottomVal, setPaddingBottomVal] = useState(0)
    const [key, setKey] = useState(0)
    const layoutHeight = resizeDocumentHeightHook()
    const [form] = Form.useForm()
    const clickTargetTop: any = useRef(null)
    const { loading, data } = useRequest(
        (data: any) => queryHelpDocList(data),
        {
            formatResult: response => _.get(response, 'code') === 200 ? response.data : [],
            initialData: [],
            defaultParams: [{ id: Number(help_id) }]
        }
    )

    useEffect(() => {
        allallCatalogArr.forEach((item: any) => {
            const targetDom: any = document.getElementById(item.id)
            if (targetDom) targetDom.innerHTML = item.text
        })
    }, [key])

    useEffect(() => {
        const fieldValuesCopy = form.getFieldsValue()
        if (operationType === 'new') fieldValuesCopy['active'] = 1
        if (operationType === 'edit' && data && data[0]) {
            fieldValuesCopy['active'] = data[0].active ? 1 : 0
            fieldValuesCopy['is_top'] = data[0].order_id === 1
            fieldValuesCopy['tags'] = data[0].tags

            const oTitle = document.querySelector('#text-container-title #text_title')
            if (odiv && oTitle) {
                let titleHeight = oTitle.clientHeight
                setPaddingBottomVal(titleHeight)
            }
            if (!fieldValuesCopy['active']) {
                setIsCheck(false)
                setIsActive(fieldValuesCopy['active'])
                fieldValuesCopy['is_top'] = false
            } else {
                setIsCheck(data[0].order_id === 1)
            }
        }
        form.setFieldsValue(fieldValuesCopy)
        if (editor && data && data[0]) {
            const re = /^(\<p\>\<br\>\<\/p\>)+|(\<p\>\<br\>\<\/p\>)+$/g;
            let text = data[0].content.replace(re, '')
            editor.txt.html(data[0] && text)
        }
        if (data && data[0]) {
            setTitle(data[0].title)
            if (!data[0].title) {
                otitle.placeholder = '请输入标题(1~30字)'
                otitle.focus()
            }
        }
        if (editor && data && !data[0]) {
            editor.txt.html('')
            editor.txt.text('')
            otitle.placeholder = '请输入标题(1~30字)'
            otitle.focus()
        }

    }, [data])

    const closeFn = (box, arr, currentTagNum, number, that) => {
        number = Number(number)
        const nextLevelTag = arr[number + 1].tag,

            nextTagNum = nextLevelTag.replace("H", "");
        if (Number(currentTagNum) >= Number(nextTagNum)) {
            return
        } else {
            const nextElementSibling = that.parentNode.parentNode.nextElementSibling
            if (!nextElementSibling) {
                return
            }
            box.removeChild(nextElementSibling)
            number = number + 1
            if (number >= arr.length - 1) {
                return
            }
            closeFn(box, arr, currentTagNum, number, that)
        }
    }
    const openFn = (box, arr, currentTagNum, number, that, item) => {
        number = Number(number)
        const nextLevelTag = arr[number + 1].tag,
            nextTagNum = nextLevelTag.replace("H", "");
        if ((Number(currentTagNum) < Number(nextTagNum))) {
            const li = document.createElement("li");
            const a = document.createElement("a");
            const odiv = document.createElement("div");
            const span = document.createElement("span");
            span.className = `${styles.catalogIcon}`
            a.href = "javascript:void(0)";
            a.innerText = arr[number + 1].text;
            odiv.style.paddingLeft = (Number(nextTagNum) - 1) * 0.6 + 'rem'
            span.setAttribute('index', number + 1)
            /*
            span.onclick = function (e) {
                let number = e.target.getAttribute('index')
                const levelTag = arr[number].tag,
                    currentTagNum = +levelTag.replace("H", "")
                    if (String(this.style.background) === String(close)) {
                    this.style.background = open
                    closeFn(box, arr, currentTagNum, number, this)
                } else {
                    this.style.background = close
                    openNextElementSibling = this.parentNode.parentNode.nextElementSibling
                    openFn(box, arr, currentTagNum, number, this, arr[number+1])
                }
            }
            */
            a.onclick = function () {
                editor.scrollToHead(arr[number + 1].id);
            };
            odiv.appendChild(span)
            odiv.appendChild(a);
            li.id = arr[number + 1]['id']
            li.appendChild(odiv);
            let nextElementSibling = openNextElementSibling
            let previousElementSibling = null

            if (nextElementSibling && box.lastChild !== nextElementSibling) {
                previousElementSibling = nextElementSibling.previousElementSibling
            } else {
                previousElementSibling = box.lastChild
                openNextElementSibling = previousElementSibling
            }

            let preLevelTag = ''
            let preTagNum = ''
            if (number <= 0) {
                preLevelTag = arr[number].tag, // 有用
                    preTagNum = preLevelTag.replace("H", ""); // 有用
            } else {
                // preLevelTag = arr[number - 1].tag, 
                preLevelTag = arr[number].tag,
                    preTagNum = preLevelTag.replace("H", "");
            }

            let currentNumberTag = arr[number + 1].tag
            let currentNumber = currentNumberTag.replace("H", ""); // 有用
            // if(Number(preTagNum) < Number(nextTagNum)){
            if (Number(preTagNum) < Number(currentNumber)) {
                const num = arr[number].id
                const ospan = document.querySelector(`#${num} span`)
                // const ospan = document.querySelector(`#${previousElementSibling.id} span`)

                ospan.style.background = close
                nextElementSibling = null
            }

            if (Number(number) === arr.length - 1) {
                span.style.background = ''
            }

            number = number + 1
            if (nextElementSibling) {
                box.insertBefore(li, nextElementSibling)
            } else {
                box.appendChild(li)
            }

            if (number >= arr.length - 1) {
                return
            }
            li.appendChild(odiv);
            openFn(box, arr, currentTagNum, number, that, arr[number + 1])
            // openFn (box,arr,nextTagNum,number,that,arr[number])
        } else {
            return
        }
    }

    useEffect(() => {
        // 注：class写法需要在componentDidMount 创建编辑器
        editor = new wangEditor('#toolbar-container', '#text-container-text') // 传入两个元素

        editor.config.pasteFilterStyle = false
        editor.config.minHeight = 500
        editor.config.placeholder = ''
        editor.config.onCatalogChange = function (arr: any) {
            // 大纲回调
            const box: any = document.getElementById("catalogBox");
            if (!box) return
            box.innerHTML = "";

            const aa = `<div style='font-size: 20px;padding-bottom: 10px; border-bottom:1px solid rgba(0,0,0,0.1);margin-bottom: 15px' >大纲</div>`
            box.innerHTML = aa

            let level = 1,
                levelObj = {
                    1: "",
                    2: "-",
                    3: "--",
                    4: "---",
                    5: "----"
                };

            arr = arr.filter(item => item && item.text.trim())
            let isFlag = false
            if (allallCatalogArr.length !== arr.length) {
                setKey(+new Date())
                allallCatalogArr = _.cloneDeep(arr)
            }
            arr.forEach((item, index) => {
                // item 里有 tag:H1,H2,H3,H4,H5, text:标签内文本, id:唯一id
                if (index > 0) {
                    const prevLevelTag = arr[index - 1].tag,
                        levelTag = arr[index].tag,
                        currentTagNum = +levelTag.replace("H", ""),
                        prevTagNum = prevLevelTag.replace("H", "");
                    if (currentTagNum > prevTagNum) {
                        if (currentTagNum <= 5) level++;
                    }
                    if (currentTagNum < prevTagNum) level = 1;
                }
                item.level = level

                const li = document.createElement("li");
                const a = document.createElement("a");
                const odiv = document.createElement("div");
                const span = document.createElement("span");

                if (index < arr.length - 1) {
                    const nextLevelTag = arr[index + 1].tag,
                        levelTag = arr[index].tag,
                        currentTagNum = +levelTag.replace("H", ""),
                        nextTagNum = nextLevelTag.replace("H", "");
                    if (currentTagNum < nextTagNum) {
                        span.style.background = close
                        isFlag = true
                    }
                }

                span.className = `${styles.catalogIcon}`
                const brr = item.text.split('&nbsp;')
                let text = ''
                brr.forEach(val => {
                    if (val.trim()) text = text + val + ' '
                })
                item.text = text
                a.innerText = item.text;
                const tag = arr[index].tag,
                    num = tag.replace("H", "")
                odiv.style.paddingLeft = (Number(num) - 1) * 0.6 + 'rem'
                span.setAttribute('index', index)
                /*
                span.onclick = function (e) {
                    // let number = index
                    let number = e.target.getAttribute('index')
                    const levelTag = arr[number].tag,
                        currentTagNum = +levelTag.replace("H", "")

                    if (String(this.style.background) === String(close)) {
                        this.style.background = open
                        closeFn(box, arr, currentTagNum, number, this)
                    } else 
                        this.style.background = close
                       openNextElementSibling = this.parentNode.parentNode.nextElementSibling
                        // openFn(box, arr, currentTagNum, number, this,item)
                        openFn(box, arr, currentTagNum, number, this,arr[number+1])
                    }
                }
                */
                a.href = "javascript:void(0)";
                a.onclick = function (e: any) {
                    e.stopPropagation()
                    const oa = document.querySelectorAll('#catalogBox li a')
                    Array.from(oa).forEach((ele: any) => {
                        ele.style.color = 'rgba(0, 0, 0, 0.85)'
                    })
                    e.target.style.color = '#1890FF'
                    editor.scrollToHead(item.id);
                    const targetDom = document.getElementById(item.id)
                    if (targetDom) clickTargetTop.current = targetDom.offsetTop
                    var scroll_top = 0;
                    scroll_top = domText.scrollTop;
                    if (clickTargetTop.current <= scroll_top) domText.scrollTop = clickTargetTop.current - 16 < 0 ? 0 : clickTargetTop.current - 16
                    return scroll_top;
                };

                if (item.level === 5) {
                    span.style.background = ''
                }
                odiv.appendChild(span)
                odiv.appendChild(a);
                li.id = item.id
                li.appendChild(odiv);
                box.appendChild(li);
                // }
            });
            if (!isFlag) {
                const ospan = document.querySelectorAll('#catalogBox span')
                Array.from(ospan).forEach(item => item.style.display = 'none')
            }
        };
        // 挂载highlight插件
        // editor.highlight = hljs
        editor.config.languageType = [
            'Bash',
            'C',
            'C#',
            'C++',
            'CSS',
            'Java',
            'JavaScript',
            'JSON',
            'TypeScript',
            'Plain text',
            'Html',
            'XML',
            'SQL',
            'Go',
            'Kotlin',
            'Lua',
            'Markdown',
            'PHP',
            'Python',
            'Shell Session',
            'Ruby',
        ]
        editor.config.languageTab = '    '
        editor.config.fontNames = [
            '黑体',
            '仿宋',
            '楷体',
            '标楷体',
            '华文仿宋',
            '华文楷体',
            '宋体',
            '微软雅黑',
            'Arial',
            'Tahoma',
            'Verdana',
            'Times New Roman',
            'Courier New',
        ]
        editor.config.menus = [
            'head',
            'bold',
            'fontSize',
            'fontName',
            'italic',
            'underline',
            'strikeThrough',
            'indent',
            'lineHeight',
            'foreColor',
            'backColor',
            'link',
            'list',
            'justify',
            'quote',
            'emoticon',
            'table',
            'code',
            'splitLine',
            // 'image'
        ]
        // 自定义检查插入的链接  待开发
        editor.config.linkCheck = function (text, link) {
            // 以下情况，请三选一

            // 1. 返回 true ，说明检查通过
            return true

            // // 2. 返回一个字符串，说明检查未通过，编辑器会阻止链接插入。会 alert 出错误信息（即返回的字符串）
            // return '链接有 xxx 错误'

            // 3. 返回 undefined（即没有任何返回），说明检查未通过，编辑器会阻止链接插入。
            // 此处，你可以自定义提示错误信息，自由发挥
        }

        /*
        editor.config.uploadImgServer = '/api/sys/upload/'
        editor.config.uploadImgAccept = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
        editor.config.uploadImgMaxLength = 5
        editor.config.uploadImgTimeout = 30 * 1000
        editor.config.uploadImgHooks = {
            // 上传图片之前
            // before: function(xhr:any) {
            //     console.log(xhr)
        
            //     // 可阻止图片上传
            //     return {
            //         prevent: true,
            //         msg: '需要提示给用户的错误信息'
            //     }
            // },
            // 图片上传并返回了结果，图片插入已成功
            success: function(xhr:any) {
                console.log('success', xhr)
            },
            // 图片上传并返回了结果，但图片插入时出错了
            fail: function(xhr:any, editor:any, resData:any) {
                console.log('fail', resData)
            },
            // 上传图片出错，一般为 http 请求的错误
            error: function(xhr:any, editor:any, resData:any) {
                console.log(editor,111111111111111)
                console.log('error', xhr, resData)
            },
            // 上传图片超时
            timeout: function(xhr:any) {
                console.log('timeout')
            },
            // 图片上传并返回了结果，想要自己把图片插入到编辑器中
            // 例如服务器端返回的不是 { errno: 0, data: [...] } 这种格式，可使用 customInsert
            customInsert: function(insertImgFn:any, result:any) {
                // result 即服务端返回的接口
                console.log('customInsert', result)
        
                // insertImgFn 可把图片插入到编辑器，传入图片 src ，执行函数即可
                insertImgFn(result.data[0])
            }
        }
        */

        //可隐藏插入网络图片的功能，即只保留上传本地图片
        editor.config.showLinkImg = false
        // 过滤样式，默认 true
        editor.config.pasteTextHandle = function (content: any) {
            const indexNum = content.trim().indexOf('<img')
            if (indexNum === 0) return
            return content
        }
        editor.txt.eventHooks.pasteEvents.push(async (event: any) => {
            const { files } = event.clipboardData

            if (files && files.length > 0) {
                for (let i = 0, len = files.length; i < len; i++) {
                    const formData = new FormData()
                    formData.append('file', files[i])
                    // 上传图片
                    const data: any = await request(
                        `/api/sys/upload/`,
                        {
                            method: 'post',
                            data: formData
                        }
                    )
                    const img: any = document.createElement('img');
                    img.src = data && data.link;
                    img.alt = " ";
                    insertHtmlAtCaret(img);
                    break;
                }
            }
        })

        // editor.config.uploadImgShowBase64 = true
        /**一定要创建 */
        editor.create()
        odiv = document.querySelector('#text-container-text')
        otitle = document.querySelector('#text_title')
        domText = odiv.querySelector('.w-e-text')
        if (operationType === 'new' && otitle) {
            otitle.focus()
        }
        const contenteditableBox = odiv.querySelector('div[contenteditable = "true"]')

        domText.addEventListener('blur', blurFn, false)

        // contenteditableBox.addEventListener('paste', pasteFn, true)
        contenteditableBox.addEventListener('click', handleClickImage, false)
        window.addEventListener('click', onClickWindow, false)
        window.addEventListener('resize', resizeFn, false)
        return () => {
            // 组件销毁时销毁编辑器  注：class写法需要在componentWillUnmount中调用
            editor.destroy()
            domText.removeEventListener('blur', blurFn, false)
            contenteditableBox.removeEventListener('click', handleClickImage, false)
            // contenteditableBox.removeEventListener('paste', pasteFn, true)
            window.removeEventListener('click', onClickWindow, false)
            window.addEventListener('resize', resizeFn, false)
        }
    }, [])

    const pasteFn = async (event: any) => {
        event.stopPropagation();
        event.preventDefault()
        // const items = (event.clipboardData || window.clipboardData).items;
        // let blob = null;
        // if (items && items.length) {
        //     for (let i = 0; i < items.length; i++) {
        //         if (items[i].kind == 'file' && items[i].type.indexOf('image') !== -1) {
        //             blob = items[i].getAsFile();
        //             if (!blob) return;
        //             const formData = new FormData()
        //             // 添加要上传的文件
        //             formData.append('file', blob)
        //             // 上传图片
        //             const data: any = await request(
        //                 `/api/sys/upload/`,
        //                 {
        //                     method: 'post',
        //                     data: formData
        //                 }
        //             )
        //             const img: any = document.createElement('img');
        //             img.src = data && data.link;
        //             img.alt = " ";
        //             insertHtmlAtCaret(img);
        //             break;
        //         }
        //         //  else if(items[i].kind === "string" && items[i].type.indexOf('text/plain') != -1) {
        //         //     items[i].getAsString(function (str) {
        //         //         insertHtmlAtCaret(document.createTextNode(str));//插入文本到光标处并移动光标到新位置
        //         //     })
        //         //     return;
        //         // }
        //     }
        // }
    }

    const insertHtmlAtCaret = (childElement: any) => {
        let selection, range;
        if (window.getSelection) { // IE11 and non-IE
            selection = window.getSelection();
            if (selection.getRangeAt && selection.rangeCount) {
                range = selection.getRangeAt(0);
                range.deleteContents();
                var el = document.createElement("div");
                el.appendChild(childElement);
                // document.createDocumentFragment() 创建一个新的空白的文档片段
                var frag = document.createDocumentFragment(), node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        } else if (document.selection && document.selection.type != "Control") { // IE < 9
            //document.selection.createRange().pasteHTML(html);
        }
    }
    const onClickWindow = () => {
        const oBox: any = document.getElementById('image_box')
        if (oBox) {
            oBox.style.width = 0
            oBox.style.height = 0
        }
    }
    const resizeFn = () => {
        let oImg: any = document.querySelector('#image_box img')
        if (oImg && innerWidth <= 1280) oImg.style.maxWidth = '80%'
        if (oImg && innerWidth > 1280) oImg.style.maxWidth = '70%'
    }
    const handleClickImage = (e: any) => {
        e.stopPropagation();
        const url = e.target.getAttribute('src')
        if (!url) return
        const oBox: any = document.getElementById('image_box')
        let oImg: any = document.querySelector('#image_box img')
        if (!oImg) {
            oBox.innerHTML = `<div class=${styles.scale_box}><img class=${styles.scale_image} alt="  " /></div>`
            oImg = document.querySelector('#image_box img')
        }
        oBox.style.width = '100%'
        oBox.style.height = '100%'
        if (innerWidth <= 1280) oImg.style.maxWidth = '80%'
        oImg.src = url
    }
    const blurFn = () => {
        const aa = document.createElement('p')
        aa.innerHTML = '<br/>'
        domText.appendChild(aa)
    }


    const handleEnter = (e) => {
        e.target.blur()
    }
    const handleBlur = (e) => {
        setTitle(e.target.value)
    }
    const fetchFinally = (code: number, msg: string, data: any) => {
        if (code === 200) {
            message.success('操作成功!')
            odiv.blur()
            otitle.blur()
            if (operationType === 'edit') {
                history.push(`/${typePath}/${help_id}`)
            }
            if (operationType === 'new') {
                history.push(`/${typePath}/${data.id}`)
            }
            return
        }
        requestCodeMessage(code, msg)
    }

    const handlePublish = async () => {
        // setPadding(true)
        form.validateFields() // 触发表单验证，返回Promise
            .then(async (values) => {
                const param: any = {
                    ...values,
                    title,
                    content: editor.txt.html(),
                    doc_type: typePath
                }
                let fetchFn = createHelpDoc

                if (operationType === 'edit') {
                    fetchFn = updateHelpDoc
                    param.id = Number(help_id)
                }
                const { code, msg, data } = await fetchFn(param)
                fetchFinally(code, msg, data)
            })
            .catch(err => console.log(err))


    }
    const handleCancle = () => {
        if (operationType === 'edit') {
            history.push(`/${typePath}/${help_id}`)
        }
        if (operationType === 'new') {
            history.push(`/${typePath}`)
        }

    }

    const changeFormValues = (value: any, type: string) => {
        const fieldValuesCopy = form.getFieldsValue()
        if (type === 'tags') fieldValuesCopy[type] = value
        if (type === 'active') {
            fieldValuesCopy[type] = value.target.value
            setIsActive(value.target.value)
            if (!value.target.value) {
                setIsCheck(false)
                fieldValuesCopy['is_top'] = false
            }
        }
        if (type === 'is_top') {
            fieldValuesCopy[type] = value.target.checked
            setIsCheck(value.target.checked)
        }
        form.setFieldsValue(fieldValuesCopy)
    }
    const scroll = {
        // 最大高度，内容超出该高度会出现滚动条
        height: layoutHeight - 228,
    }
    const optionData = typePath === 'help_doc' ? [{ id: 'mustRead', name: '必看' }, { id: 'course', name: '教程' }, { id: 'docs', name: '文档' }]
        : [{ id: 'maintain', name: '维护' }, { id: 'notice', name: '通知' }, { id: 'upgrade', name: '升级' }, { id: 'stop', name: '暂停' }]
    return (
        <div className={styles.container}>
            <Spin spinning={loading} >
                <Layout className={styles.layout}>
                    <div>
                        <Breadcrumb style={{ marginBottom: '20px' }}>
                            <Breadcrumb.Item >
                                <span style={{ cursor: 'pointer' }} onClick={() => history.push('/')}>首页</span>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item><span style={{ cursor: 'pointer' }} onClick={() => history.push(`/${typePath}`)}>{typePath === 'help_doc' ? '使用帮助' : '公告'}</span></Breadcrumb.Item>
                            {
                                typePath === 'help_doc' && <Breadcrumb.Item>{operationType === 'new' ? (title || '新建文档') : (title || '编辑文档')}</Breadcrumb.Item>
                            }
                            {
                                typePath !== 'help_doc' && <Breadcrumb.Item>{operationType === 'new' ? (title || '新建公告') : (title || '编辑公告')}</Breadcrumb.Item>
                            }

                        </Breadcrumb>
                    </div>
                    <div className={styles.container_box}>
                        {/*左侧 */}
                        <div
                            style={{ height: 246 }}
                            className={styles.new_script_left}>
                            <Form
                                form={form}
                                layout="vertical" // 表单布局 ，垂直
                            /*hideRequiredMark*/
                            >
                                <Form.Item
                                    label="是否生效"
                                    name="active"
                                    rules={[{ required: true }]}>
                                    <Radio.Group onChange={_.partial(changeFormValues, _, 'active')} >
                                        <Radio value={1}>是</Radio>
                                        <Radio value={0}>否</Radio>
                                    </Radio.Group>
                                </Form.Item>

                                <Form.Item
                                    label="类型"
                                    name="tags"
                                    // validateStatus={(!nameStatus || !queryStatus) && 'error'}
                                    // help={!lableStatus && `类型不能为空`}
                                    rules={[{ required: true }]}>
                                    <Select
                                        showSearch
                                        allowClear
                                        // defaultValue={defaultValue}
                                        placeholder="请选择类型"
                                        optionFilterProp="children"
                                        style={{ width: '100%' }}
                                        onChange={_.partial(changeFormValues, _, 'tags')}
                                        showArrow={true}
                                        filterOption={(input, option: any) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {
                                            optionData.map((item: any) => <Option value={item.id} key={item.id}>{item.name}</Option>)
                                        }
                                    </Select>
                                </Form.Item>
                                <Form.Item label="" name="is_top">
                                    <Checkbox onChange={_.partial(changeFormValues, _, 'is_top')} checked={isCheck} disabled={!isActive}>置顶该文档</Checkbox>
                                </Form.Item>
                            </Form>
                        </div>
                        {/*中间 */}
                        <div className={styles.fixed_part} >
                            {/* <div className={styles.script_top}>
                            <Space>
                                <Button onClick={handleCancle}>取消编辑</Button>
                                <Button type="primary" onClick={handlePublish}>发布</Button>
                            </Space>
                        </div> */}

                            {/*菜单 */}
                            <div id="toolbar-container" className={styles.toolbar} />
                        </div>
                        <div
                            style={{
                                margin: 'auto',
                            }}
                            className={`${styles.script_middle} ${styles.script_eidt_middle}`}>

                            <div className={styles.editor_content} style={{ height: layoutHeight - 230 }}>
                                <div id="text-container-title"
                                    className={styles.text_title}>
                                    <TextArea
                                        id='text_title'
                                        placeholder="请输入标题"
                                        rows={1}
                                        // autoFocus={true}
                                        maxLength={30}
                                        autoSize={true}
                                        onPressEnter={handleEnter}
                                        onChange={handleBlur}
                                        value={title}
                                        style={{
                                            resize: 'none',
                                            width: '100%',
                                            border: 'none',
                                            outline: 'none'
                                        }} />
                                </div>
                                <div id="text-container-text" className={`${styles.showContentBox} ${styles.showContentBox2}`} style={{ height: layoutHeight - 305, paddingBottom: paddingBottomVal }}>

                                    <h1 className={styles.placeholder}>    </h1>
                                </div>
                            </div>
                        </div>
                        <ul id="catalogBox"
                            style={{ height: layoutHeight - 187 }}
                            className={`${styles.catalogBox2} ${styles.catalogBox}`}
                        />
                    </div>
                    <div className={styles.image_box} id="image_box" />
                </Layout>
                <div className={styles.footer_part}>
                    <div className={styles.bottom}>
                        <Space>
                            <Button onClick={handleCancle}>取消</Button>
                            <Button type="primary" onClick={handlePublish}>发布</Button>
                        </Space>
                    </div>
                </div>
            </Spin>
        </div>
    )
}
