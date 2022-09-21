import React, { useState, useEffect } from 'react'
import { Breadcrumb, Row, Spin, Space, Layout } from 'antd'

import { history, useRequest, useModel, useAccess, Access } from 'umi'
import styles from './index.less'
import { EditOutlined } from '@ant-design/icons'
import { queryHelpDocList } from './services'
import wangEditor from 'wangeditor'
import _ from 'lodash'
import Editor from './Editor'
import dropDown from '@/assets/svg/dropDown.svg'
import { ReactComponent as AddDoc } from '@/assets/svg/addDoc.svg'
import { requestCodeMessage } from '@/utils/utils'
import { useClientSize } from '@/utils/hooks'

let editor2: any = null
const close = `url("${dropDown}") center center / 16px 16px`

let odiv2: any = null
let openNextElementSibling: any = null
let timeout: any = null;
let odivContenteditable: any = null
export default (props: any) => {
    const { help_id } = props.match.params
    const [helps, setHelps] = useState<Array<any>>([])
    const [helpId, setHelpId] = useState(help_id)
    const [currentDoc, setCurrentDoc] = useState<any>({})
    const [rightLoading, setRightLoading] = useState(false)
    const [paddingBottomVal, setPaddingBottomVal] = useState(166)
    const typePath = /^\/help_doc/.test(props.match.path) ? 'help_doc' : 'notice'
    const access = useAccess();

    const { loading, data: helpData } = useRequest(
        (data: any) => queryHelpDocList(data),
        {
            formatResult: response => {
                if (response.code === 200) {
                    return response.data
                } else {
                    return []
                }
            },
            initialData: [],
            defaultParams: [{ doc_type: typePath }]
        }
    )

    useEffect(() => {
        let id = help_id
        const flag = helpData.some((item: any) => Number(item.id) === Number(help_id))
        if (!flag) {
            id = (helpData.length && helpData[0]['id']) || ''
        }
        debounced(id)
        setHelpId(id)
        setHelps(helpData || [])
    }, [helpData,help_id])

    useEffect(() => {
        odivContenteditable = document.querySelector('div[contenteditable = "false"]')
        odivContenteditable && odivContenteditable.addEventListener('click', handleClickImage, true)
        return () => {
            odivContenteditable && odivContenteditable.removeEventListener('click', handleClickImage, true)
        }
    }, [currentDoc])

    const { height: layoutHeight } = useClientSize()

    const wsHelpDoc = async (title: any, index: any) => {
        const { data = [], code, msg } = await queryHelpDocList({ doc_type: typePath })
        if (code === 200) {
            if (title === 'del') {
                let id = ''
                if (data.length - 1 >= index) {
                    id = _.isArray(data) && data[index] && data[index]['id']
                } else {
                    id = _.isArray(data) && data[0] && data[0]['id']

                }

                editor2.txt.html('')
                setHelpId(id)
                handleGetDoc2(id)
            }

            setHelps(data || [])
        } else {
            requestCodeMessage(code, msg)
        }
    }

    const handleGetDoc2 = async (id = helpId) => {
        if (_.isNaN(Number(id))) {
            return;
        }
        setRightLoading(true)
        const { data, code } = await queryHelpDocList({ id: Number(id) })
        // console.log(data, odiv2)
        timeout = null
        if (code === 200) {
            setRightLoading(false)
            const odiv = odiv2?.querySelector('div[contenteditable = "true"]')
            if (data[0] && data[0].content) {
                const re = /^(\<p\>\<br\>\<\/p\>)+|(\<p\>\<br\>\<\/p\>)+$/g;
                let text = data[0].content.replace(re, '')
                editor2.txt.html(text)
            }

            // 让编辑器失去焦点
            if (odiv) {
                odiv.setAttribute('contenteditable', false)
                odiv.blur()
            }
            setCurrentDoc(data[0])
        }
    }
    useEffect(() => {
        const oTitle = document.querySelector('#edit_doc_title')
        if (odiv2 && oTitle) {
            const titleHeight = oTitle.clientHeight
            odiv2.style.paddingBottom = 120 + titleHeight
            setPaddingBottomVal(84 + titleHeight)
        }

    }, [currentDoc])
    const closeFn = (box: any, arr: any[], currentTagNum: any, number: any, that: any) => {
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
    const openFn = (box: any, arr: any[], currentTagNum: any, number: any, that: any, item: any) => {
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
            
            a.onclick = function () {
                editor2.scrollToHead(arr[number + 1].id);
            };
            odiv.appendChild(span)
            odiv.appendChild(a);
            li.id = arr[number + 1]['id']
            li.appendChild(odiv);


            let nextElementSibling = openNextElementSibling
            let previousElementSibling = null

            if (nextElementSibling && box.lastChild !== nextElementSibling) {
                previousElementSibling = nextElementSibling.previousElementSibling

                // openNextElementSibling = previousElementSibling
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
                const ospan:any = document.querySelector(`#${num} span`)
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
    const debounced = (id: any = help_id, wait: any = 200) => {
        if (!String(id)) return;
        if (timeout !== null) clearTimeout(timeout);  //清除这个定时器			
        timeout = setTimeout(_.partial(handleGetDoc2, id), wait);
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
    useEffect(() => {
        if (odiv2 && (helpId === '' || helpId === undefined)) {
            const odiv = odiv2.querySelector('div[contenteditable = "true"]')
            // 让编辑器失去焦点
            if (odiv) {
                odiv.setAttribute('contenteditable', false)
                odiv.blur()
            }
            return;
        }
    }, [helpId])

    useEffect(() => {
        editor2 = new wangEditor('#showContentBox') // 传入两个元素
        editor2.config.minHeight = 500
        editor2.config.placeholder = ''
        editor2.config.onCatalogChange = function (arr:any) {
            // 大纲回调
            const box: any = document.getElementById("catalogBox2");
            if (!box) return
            box.innerHTML = "";
            let level = 1,
                levelObj = {
                    1: "",
                    2: "-",
                    3: "--",
                    4: "---",
                    5: "----"
                };
            arr = arr.filter((item: any) => item && item.text.trim())
            box.style.paddingBottom = 0
            if (arr.length) box.style.paddingBottom = '20px'
            let isFlag = false
            arr.forEach((item: any, index: any) => {
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

                a.href = "javascript:void(0)";
                if (index < arr.length - 1) {
                    const nextLevelTag = arr[index + 1].tag,
                        levelTag = arr[index].tag,
                        currentTagNum = +levelTag.replace("H", ""),
                        nextTagNum = nextLevelTag.replace("H", "");
                    if (Number(currentTagNum) < Number(nextTagNum)) {
                        span.style.background = close
                        isFlag = true
                    }
                }

                span.className = `${styles.catalogIcon}`
                const brr = item.text.split('&nbsp;')
                let text = ''
                brr.forEach((val:any) => {
                    if (val.trim()) text = text + val + ' '
                })
                item.text = text.trim()
                a.innerText = item.text;

                const tag = arr[index].tag,
                    num = tag.replace("H", "")
                odiv.style.paddingLeft = (Number(num) - 1) * 0.6 + 'rem'
                span.setAttribute('index', index)
                
                a.onclick = function (e: any) {
                    const ali: any = document.querySelectorAll('#catalogBox2 li')
                    const oa = document.querySelectorAll('#catalogBox2 li a')
                    Array.from(oa).forEach((ele: any, num: number) => {
                        ali[num].style.borderLeft = '1px solid rgba(0,0,0,0.1)'
                        ali[index].style.borderLeft = '1px solid #1890FF'
                        ele.style.color = 'rgba(0, 0, 0, 0.85)'
                    })
                    e.target.style.color = '#1890FF'
                    editor2.scrollToHead(item.id);
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
                const ospan = document.querySelectorAll('#catalogBox2 span')
                Array.from(ospan).forEach((item: any) => item.style.display = 'none')
            }
            const editDoc: any = document.querySelector('#edit_doc')
            const content: any = document.querySelector('#center_content')

            if (!arr.length && editDoc && content) {
                editDoc.style.width = 'calc(100% - 0px)'
                content.style.width = 'calc(100% - 0px)'
                box.style.opacity = 0
                box.style.right = '-240px'
            }
            if (arr.length && editDoc && content) {
                editDoc.style.width = 'calc(100% - 238px)'
                content.style.width = 'calc(100% - 238px)'
                box.style.opacity = 1
                box.style.right = 0
            }
        };
        // editor2.config.uploadImgShowBase64 = true
        /**一定要创建 */
        editor2.create()
        editor2.disable()
        /**一定要创建 */
        odiv2 = document.querySelector('#showContentBox')

        return () => {
            // 组件销毁时销毁编辑器  注：class写法需要在componentWillUnmount中调用
            editor2.destroy()
            clearTimeout(timeout)
        }
    }, [])

    const handleClick = (type: string = 'new') => {

        history.push(`/${typePath}/new`)
    }

    const handleEdit = () => {
        history.push(`/${typePath}/${helpId}/edit`)
    }
    const scroll = {
        // 最大高度，内容超出该高度会出现滚动条
        height: layoutHeight - 112,
    }
    return (
        <div className={styles.container}>
            <Layout className={styles.layout}>
                <Spin spinning={loading}>
                    <div>
                        <Breadcrumb style={{ marginBottom: '19px' }}>
                            <Breadcrumb.Item >
                                <span style={{ cursor: 'pointer' }} onClick={() => history.push('/')}>首页</span>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>{typePath === 'help_doc' ? '使用帮助' : '公告'}</Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    <div >
                        <Row >
                            {/*左侧 */}
                            <div
                                style={{ height: layoutHeight - 112 }}
                                className={styles.script_left}>
                                <div className={styles.use_help}>
                                    {typePath === 'help_doc' ? '使用帮助' : '公告'}
                                    <Access accessible={access.IsAdmin()}>
                                        <AddDoc className={styles.add_help} onClick={_.partial(handleClick, 'new')} />
                                    </Access>
                                </div>
                                <div
                                    id='dataTable'
                                    style={{
                                        overflow: 'auto'
                                    }}>
                                    <Editor
                                        setHelpId={setHelpId}
                                        getHelpDocs={wsHelpDoc}
                                        allHelpsData={helps}
                                        setRightLoading={setRightLoading}
                                        typePath={typePath}
                                        isPermier={access.IsAdmin()}
                                        handleGetDocDetailFn={debounced}
                                        helpId={helpId} />
                                </div>
                            </div>
                            {/*右侧 */}
                            <div
                                style={{
                                    background: '#fff',
                                    // height: layoutHeight - 112
                                }}
                                className={`${styles.script_middle} ${styles.show_script_middle}`}>
                                <Spin spinning={rightLoading}>

                                    <div className={styles.edit_doc} id="edit_doc">
                                        <div className={styles.edit_doc_title} style={{ opacity: helps.length ? 1 : 0 }} id='edit_doc_title'>
                                            {currentDoc && currentDoc.title}
                                            <div className={styles.create_time}>{`创建时间：${currentDoc && currentDoc.gmt_created}`}</div>
                                        </div>
                                        <div className={styles.edit_doc_botton} style={{ opacity: helps.length ? 1 : 0 }} >
                                            <Access accessible={access.IsAdmin()}>
                                                <Space>
                                                    <EditOutlined />
                                                    <span className={styles.edit_doc_span} onClick={handleEdit}>编辑文档</span>
                                                </Space>
                                            </Access>
                                        </div>
                                    </div>

                                    <div className={styles.center_content} id="center_content">
                                        <div id="showContentBox" className={styles.showContentBox} style={{ height: layoutHeight - 84, paddingBottom: paddingBottomVal }}>
                                        </div>
                                    </div>
                                </Spin>
                            </div>
                            <ul id="catalogBox2"
                                style={{
                                    maxHeight: layoutHeight - 159
                                }}
                                className={`${styles.catalogBox2} ${styles.catalogBox3}`}
                            />
                        </Row>
                    </div>
                    <div className={styles.image_box} id="image_box" />
                </Spin>
            </Layout>
        </div>
    )
}
