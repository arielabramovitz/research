import { useState, React } from "react";
import { Collapse, Container, Card } from "react-bootstrap";

function InstructionsTab() {
  const [expend, setExpend] = useState(false);

  const handleClick = () => {
    setExpend(!expend);
  };

  return (
    <Container className="tw-my-2 tw-flex-col tw-border-collapse tw-select-none">
      <Card className="tw-select-none">
        <Card.Header
          onClick={handleClick}
          className="d-flex tw-justify-between hover:tw-bg-c1"
        >
          <div className="">הוראות</div>
          <div className="">(לחץ כדי להרחיב)</div>
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
