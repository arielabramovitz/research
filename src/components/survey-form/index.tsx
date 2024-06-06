

function SurveyForm () {

    function generateSentences() {

        return (
            <div>
                <span>משפט 1.</span>
                &nbsp;
                <span>משפט 2 עם פועל.</span>
                &nbsp;
                <span>משפט 3.</span>
            </div>
        )
    }

    return (
        <div className="bd p-4 w-full h-full overflow-y-auto">
            <div className="p-1 bd mb-2">
                <h1 className="fon">פה יהיה הנחיות</h1>
            </div>
            <div className="flex h-32 p-4 bd">
                {generateSentences()}
            </div>
        </div>
    )
}

export default SurveyForm