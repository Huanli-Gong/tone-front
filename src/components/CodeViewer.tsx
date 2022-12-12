import styled from 'styled-components'
import { marked } from "marked"

const Viewer = styled.div`
    background:#fff!important;
    h1, h2, h3, h4, h5, h6 , p { margin : 0 ; }
    h1 { font-size:32px; }
    h2 { font-size:24px; }
    h3 { font-size:18.72px; }
    h4 { font-size:16px; }
    h5 { font-size:13.28px; }
    h6 { font-size:12px; }
    p , code , li , th , tr { color : #333; }
    ul { list-style-type: disc; }
    ol { list-style-type: decimal; }
    ul ul { list-style-type: circle; }
    ul ul ul { list-style-type: square; }
    table th, table tr , table td {
        border: 1px solid #dfe2e5;
        padding: 6px 13px;
    }
    table thead th { background-color: #F8F8F8; }
    table thead tr { background-color: #ffffff; }
    table tr:nth-child(2n) { background-color: #f8f8f8; }
    code, pre { background-color: #f9f9f9; }
    pre { padding : 8px }
`

const CodeViewer = (props: any) => {
    const { code } = props
    if (!code) return <></>
    return (
        <Viewer
            dangerouslySetInnerHTML={{ __html: marked.parse(code) }}
        />
    )
}


export default CodeViewer