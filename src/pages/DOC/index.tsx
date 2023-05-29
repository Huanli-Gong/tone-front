/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useMemo } from 'react'
import { Row } from 'antd';
import styled from 'styled-components'
import DocList from './components/Docs';
import Editer from './components/Editer';
import { useClientSize } from '@/utils/hooks'
import { useParams, Helmet } from 'umi';
import { DocProvider } from './Provider';

const Container = styled(Row) <{ height: number }>`
    width: 100%;
    height: ${({ height }) => height ? height + 'px' : '100%'};
    padding:0 20px;
    display: flex;
    flex-direction: column;
`

const Content = styled(Row)`
    width: 100%;
    height: 100%;
    padding-top: 20px;
    display: flex;
    flex-direction: row;
    gap: 24px;
`

const EditerWrapper = styled(Row)`
    width: calc(100% - 334px - 24px);
    height: 100%;
    background-color: #ffffff;
`

const DOC: React.FC = () => {
    const { height } = useClientSize()
    const { doc_type } = useParams() as any

    const [doc, setDoc] = useState<any>({})
    const [initLoading, setInitLoading] = useState(true)

    const title = useMemo(() => {
        if (JSON.stringify(doc) === '{}')
            return `${doc_type === 'notice' ? '公告' : '帮助文档'} — T-One`
        return `${doc.title} — T-One`
    }, [doc])

    const initalState = {
        initLoading, setInitLoading
    }

    return (
        <Container height={height - 70}>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            <DocProvider.Provider value={initalState as any}>
                <Content>
                    <DocList onChange={setDoc} />
                    <EditerWrapper >
                        <Editer {...doc} />
                    </EditerWrapper>
                </Content>
            </DocProvider.Provider>
        </Container>
    )
}

export default DOC