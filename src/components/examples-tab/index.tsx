import { useState } from "react";

function ExamplesTab() {
  const [expend, setExpend] = useState(false);
  const [chosen, setChosen] = useState(-1)
  

  const handleExpend = () => {
    setExpend(!expend);
  };

  const handleChosen = (ind: number) => {
    setChosen(ind)
  }

  return (
    <div className="my-2 flex-col border-collapse rounded">
      <div
        className="group justify-between pl-4 pr-4 flex p-1 border-2 border-opacity-25 rounded border-blue-700 text-right select-none bg-[#bae1ff]"
        onClick={handleExpend}
      >
      <div className="pl-2 ">דוגמאות</div>
      <div className="opacity-40 group-hover:opacity-75 self-end">(לחץ כדי להרחיב)</div>
      
      </div>
      {!expend ? (
        <></>
      ) : (
        <div className="border-2 px-6 h-72 border-opacity-25 border-blue-700 border-t-0 text-right overflow-y-auto rounded">
          <div>

          </div>

        </div>
      )}
    </div>
  );
}

export default ExamplesTab;
