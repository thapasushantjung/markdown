import useSyncScroll from '@/hooks/use-scroll';
import { marked } from 'marked';
import React, { useRef, useState } from 'react';
const index = () => {
    const [value, setValue] = useState('');
    const [markedHtml, setMarkedHtml] = useState('');
    const handleChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(event.target.value);
        const html = await marked(event.target.value);
        setMarkedHtml(html);
    };
    const div2Ref = useRef<HTMLDivElement>(null);
    const div1Ref = useRef<HTMLTextAreaElement>(null);
    useSyncScroll([div1Ref, div2Ref], { proportional: true, vertical: true, horizontal: true });
    return (
        <div className="flex h-screen flex-col">
            <div className="flex h-auto">ToolBar</div>
            <div className="flex h-full w-full">
                <div className="h-full w-1/2 p-8">
                    <textarea
                        ref={div1Ref}
                        value={value}
                        onChange={handleChange}
                        className="h-full w-full outline-none"
                        placeholder="Start writing here"
                    ></textarea>
                </div>
                <div className="p-y-8 h-full w-1/2">
                    <div
                        ref={div2Ref}
                        className="prose prose-xl h-full max-w-none overflow-y-auto scroll-auto"
                        dangerouslySetInnerHTML={{ __html: markedHtml }}
                    />
                </div>
            </div>
        </div>
    );
};

export default index;
