import React from "react";
import styled from "styled-components"
import HelperContext from "./HelperContext";
import BootIcon from "@/assets/boot/boot_icon.svg"
import { BootContext } from "./Provider";
import moment from "moment"
import { getUsualProblem } from "./HelperContext/services";

const HelperContent = styled.div.attrs((props: any) => ({
    style: {
        transform: `translate(${props.pos.x}px, ${props.pos.y}px)`,
    }
})) <AnyType>`
    position: fixed;
    height: 110px;
    width: 36px;
    right: 16px;
    bottom: 16px;
    cursor: pointer;
    z-index: 1000;
`

const IconWrapperCls = styled.div`
    user-select: none;
    height: 110px;
    width: 36px;
    background-color: #FFFFFF;
    box-shadow: 0 0 6px 0 rgba(0,0,0,0.12), 0 0 12px 5px rgba(0,0,0,0.09);
    border-radius: 18px;
    padding-top: 4px;

    display: flex;
    flex-direction: column;
    align-items: center;

    .sp {
        font-weight: 500;
        font-size: 12px;
        color: rgba(0,0,0,0.85);
        line-height: 16px;
    }

    .con {
        margin-bottom: 4px;
    }
`

type ChartItemProps = {
    page_size?: number;
    page_num?: number;
    total?: number;
    content: any;
    from: 'client' | 'server';
    isTop?: boolean;
}

const getChartItem = ({ content, from, isTop, page_size, page_num, total }: ChartItemProps): any => ({
    page_size, page_num, total,
    from,
    content,
    date: moment().format('YYYY-MM-DD HH:mm:ss'),
    rowkey: new Date().getTime(),
    isTop,
})

const DEFAULT_PARAMS = { page_num: 1, page_size: 5 }

const Helper: React.FC = () => {
    const ref = React.useRef() as any

    const [startPos, setStartPos] = React.useState({ x: 0, y: 0 })
    const [start, setStart] = React.useState(false)
    const [pos, setPos] = React.useState({ x: 0, y: 0 })
    const [offset, setOffset] = React.useState({ x: 0, y: 0 });
    const [charts, setCharts] = React.useState<any>([])
    const [selfHepler, setSelfHelper] = React.useState<any>(undefined)

    const getTopAnswer = async (query: any = DEFAULT_PARAMS, rowkey?: any) => {
        const { data, code, msg, total } = await getUsualProblem(query)
        if (code !== 200) {
            return console.log(msg)
        }

        const default_data = {
            ...(query || DEFAULT_PARAMS),
            content: data,
            total,
        }

        setCharts((p: any) => {
            if (rowkey) {
                return p.map((i: any) => {
                    if (i.rowkey === rowkey) {
                        return {
                            ...i,
                            ...default_data,
                        }
                    }
                    return i
                })
            }
            else
                return p.concat(
                    getChartItem({
                        from: 'server',
                        isTop: true,
                        ...default_data,
                    })
                )
        })
    }

    React.useEffect(() => {
        if (charts.length === 0)
            getTopAnswer()
    }, [charts])

    /* 碰撞检测 */
    React.useEffect(() => {
        if (start) return
        const { x, y } = pos

        const maxLeft = - (innerWidth - 36 - 32)
        const maxTop = - (innerHeight - 110 - 32)

        if (x > 16) {
            setPos({ y, x: 0 })
        }

        if (x < maxLeft) {
            setPos({ y, x: maxLeft })
        }

        if (y > 16) {
            setPos({ x, y: 0 })
        }

        if (y < maxTop) {
            setPos({ x, y: maxTop })
        }
    }, [start, pos])

    const handleMouseMove = (evt: any) => {
        if (start) {
            setPos({
                x: evt.clientX - offset.x,
                y: evt.clientY - offset.y
            })
        }
    }

    const handleMouseUp = (evt: any) => {
        setStart(false)
        if (Math.abs(evt.clientX - startPos.x) > 10 || Math.abs(evt.clientY - startPos.y) > 10) {
            return
        }
        ref.current?.toggle()
    }

    const handleMouseDown = (evt: any) => {
        evt.stopPropagation(); // 阻止事件冒泡
        if (!evt.target?.className || Object.prototype.toString.call(evt.target?.className) !== '[object String]') return
        const arr = evt.target.className?.split(' ').map((i: any) => i.trim())
        let sum = 0
        for (let x = 0, len = arr.length; x < len; x++) {
            if (['sp', 'con', 'helper-content', 'con-img'].includes(arr[x])) sum++
        }
        if (sum === 0) return
        setStart(true)
        setStartPos({
            x: evt.clientX,
            y: evt.clientY
        });
        setOffset({
            x: evt.clientX - pos.x,
            y: evt.clientY - pos.y,
        });
    }

    React.useEffect(() => {
        if (document) {
            document.addEventListener('mousemove', handleMouseMove)
        }
        return () => {
            if (document) {
                document.removeEventListener('mousemove', handleMouseMove)
            }
        }
    }, [start])

    return (
        <BootContext.Provider
            value={{
                charts, setCharts, getChartItem, getTopAnswer,
                selfHepler, setSelfHelper,
            }}
        >
            <HelperContext pos={pos} ref={ref} />
            <HelperContent
                id="helper-container"
                pos={pos}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
            >
                <IconWrapperCls
                    className="helper-content"
                >
                    <div className="con" >
                        <img className="con-img" src={BootIcon} />
                    </div>
                    {
                        '答疑助手'.split('').map((i: any) => (
                            <span key={i} className="sp">{i}</span>
                        ))
                    }
                </IconWrapperCls>
            </HelperContent>
        </BootContext.Provider>
    )
}


export default Helper