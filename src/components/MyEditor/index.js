import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, AutoLink, Autosave, Bold, Essentials, Italic, Link, Paragraph } from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

import './style.scss';

const LICENSE_KEY =
    'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NDAyNjg3OTksImp0aSI6IjA3MmI4NDU1LTgxNDUtNDE1OS1iOGFlLTBjMzc0Mjg2MmYzNSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6Ijk1OGMyYThkIn0.Q1B5yVpzZDp3yuRsi_eDef0kHxjS4jIBwFKUukwhHveZuvw7n5MotwxDSTcBd9TzCBTPgs-ppNU8st148yu5XA';

export default function MyEditor() {
    const editorContainerRef = useRef(null);
    const editorRef = useRef(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);

    useEffect(() => {
        setIsLayoutReady(true);

        return () => setIsLayoutReady(false);
    }, []);

    const { editorConfig } = useMemo(() => {
        if (!isLayoutReady) {
            return {};
        }

        return {
            editorConfig: {
                toolbar: {
                    items: ['bold', 'italic', '|', 'link'],
                    shouldNotGroupWhenFull: false,
                },
                plugins: [AutoLink, Autosave, Bold, Essentials, Italic, Link, Paragraph],
                initialData: '',
                licenseKey: LICENSE_KEY,
                link: {
                    addTargetToExternalLinks: true,
                    defaultProtocol: 'https://',
                    decorators: {
                        toggleDownloadable: {
                            mode: 'manual',
                            label: 'Downloadable',
                            attributes: {
                                download: 'file',
                            },
                        },
                    },
                },
                placeholder: 'Type or paste your content here!',
            },
        };
    }, [isLayoutReady]);

    return (
        <div className="main-container">
            <div className="editor-container editor-container_classic-editor" ref={editorContainerRef}>
                <div className="editor-container__editor">
                    <div ref={editorRef}>
                        {editorConfig && <CKEditor editor={ClassicEditor} config={editorConfig} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
