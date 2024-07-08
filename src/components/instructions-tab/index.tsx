import React, { useState } from "react";
import { Collapse, Container, Card } from "react-bootstrap";

function InstructionsTab() {
  const [expend, setExpend] = useState(false);

  const handleClick = () => {
    setExpend(!expend);
  };

  return (
    <Container className="h6 tw-my-2 tw-flex-col tw-border-collapse tw-select-none">
      <Card
        className={
          !expend
            ? "tw-transition-all tw-duration-300 hover:tw-scale-[101%] hover:tw-drop-shadow-lg "
            : "" + "tw-select-none"
        }
      >
        <Card.Header
          onClick={handleClick}
          className="tw-flex tw-justify-between"
        >
          <div className="h6">הוראות</div>
          <div className="h6">(לחץ כדי להרחיב)</div>
        </Card.Header>
        <Collapse in={expend}>
          <div>
            <Card.Body className="tw-h-fit">
              משפט <br></br>
              משפט <br></br>
              משפט <br></br>
              משפט <br></br>
              משפט <br></br>
            </Card.Body>
          </div>
        </Collapse>
      </Card>
    </Container>
  );
}

export default InstructionsTab;
