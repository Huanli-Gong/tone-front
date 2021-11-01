import React , { useState , useEffect } from 'react'
import { PageContainer } from '@ant-design/pro-layout'

import './index.less'

import marked from 'marked'

import 'highlight.js/styles/default.css'
import 'highlight.js/styles/monokai-sublime.css'
import hljs from 'highlight.js'

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/keymap/sublime'
import 'codemirror/mode/markdown/markdown'
import { Controlled as CodeMirror } from 'react-codemirror2'

marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function(code, language) {
        return hljs.highlightAuto(code).value;
    },
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
});

export default () : React.ReactNode => {
    const [ code , setCode ] = useState( '' )
    const [ context , setContext ] = useState( '' )

    useEffect(() => {
        setCode( marked( context ) )
    }, [ context ])

    return (
        <PageContainer>
            <CodeMirror 
                value={ context }
                options={{
                    theme: 'monokai',
                    keyMap: 'sublime',
                    mode : 'markdown',
                    lineNumbers : true,
                }}
                onBeforeChange={( editor , data , value ) => setContext( value )}
            />
            <div id="content" dangerouslySetInnerHTML={{ __html : code }} />
        </PageContainer>
    )
}