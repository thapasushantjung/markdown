const index = () => {
    return (
        <div className="flex h-screen flex-col">
            <div className="flex h-auto">ToolBar</div>
            <div className="flex h-full">
                <div className="h-full w-1/2">
                    <textarea className="h-full w-full" placeholder="Start writing here"></textarea>
                </div>
                <div className="h-full w-1/2"></div>
            </div>
        </div>
    );
};

export default index;
