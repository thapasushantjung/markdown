import React, { useState } from 'react';
const index = () => {
    const [value, setValue] = useState('');
    const handleChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(event.target.value);
    };
    return (
        <div className="flex h-screen flex-col">
            <div className="flex h-auto">ToolBar</div>
            <div className="flex h-full">
                <div className="h-full w-1/2">
                    <textarea value={value} onChange={handleChange} className="h-full w-full" placeholder="Start writing here"></textarea>
                </div>
                <div className="prose h-full w-1/2">
                    <h1>Hello</h1>
                </div>
            </div>
        </div>
    );
};

export default index;
