import React,{ useEffect, useState } from 'react';

export default function ContentContainer(props : any) {
    const [layoutHeight, setLayoutHeight] = useState(innerHeight)
    const windowHeight = () => setLayoutHeight(innerHeight)

    useEffect(() => {
      window.addEventListener('resize', windowHeight)
      return () => {
        window.removeEventListener('resize', windowHeight)
      }
    }, [])

    return (
      <div style={{ height: layoutHeight - 50, overflow: 'auto' }}>
        {props.children}
      </div>
    )
}