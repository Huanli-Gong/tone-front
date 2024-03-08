import React from "react";
import styled from "styled-components"
import HelperContext from "./HelperContext";
import BootIcon from "@/assets/boot/boot_icon.svg"

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

const Helper: React.FC = () => {
    const ref = React.useRef() as any

    const [start, setStart] = React.useState(false)
    const [pos, setPos] = React.useState({ x: 0, y: 0 })
    const [offset, setOffset] = React.useState({ x: 0, y: 0 });

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
        evt.preventDefault(); // 阻止默认行为
        if (start) {
            setPos({
                x: evt.clientX - offset.x,
                y: evt.clientY - offset.y
            })
        }
    }

    const handleMouseUp = (evt: any) => {
        evt.preventDefault(); // 阻止默认行为
        setStart(false)
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
        setOffset({
            x: evt.clientX - pos.x,
            y: evt.clientY - pos.y,
        });
    }

    React.useEffect(() => {
        if (document) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }
        return () => {
            if (document) {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [start])

    return (
        <HelperContent
            id="helper-container"
            pos={pos}
            onMouseDown={handleMouseDown}
        >
            <HelperContext ref={ref} />
            <IconWrapperCls
                className="helper-content"
                onClick={(evt: React.MouseEvent<HTMLDivElement>) => {
                    evt.preventDefault(); // 阻止默认行为
                    evt.stopPropagation(); // 阻止事件冒泡
                    if (start) return
                    ref.current?.toggle()
                }}
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
    )
}


export default Helper