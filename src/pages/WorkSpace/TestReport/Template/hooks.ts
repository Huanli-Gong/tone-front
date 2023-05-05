/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'

export const useRefWidth = (ref: any) => {
    const [title, setTitle] = useState(0)

    // const hanldePageResize = () => setTitle(ref.current.offsetWidth)

    useEffect(() => {
        setTitle(ref.current?.offsetWidth)
    }, [ref.current])

    // useEffect(() => {
    //     const observer = new MutationObserver(hanldePageResize);
    //     if (ref.current) {
    //         const node = ref.current
    //         const config = { attributes: true };
    //         observer.observe(document.getElementById(node.id), config);
    //     }
    //     return () => {
    //         observer.disconnect();
    //     }
    // }, [])
    // console.log(title)
    return title
}