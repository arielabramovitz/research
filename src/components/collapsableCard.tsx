import React, {useState} from 'react';
import { Card, Collapse, Container } from 'react-bootstrap';

interface CollapsableCardProps {
    defExpand?: boolean,
    header: string,
    children?: React.ReactNode,
    bgColor?: string,
}

export function CollapsableCard({defExpand ,header, children, bgColor}: CollapsableCardProps) {
    const [expend, setExpend] = useState(defExpand||false);

    bgColor = bgColor || "main";
    const handleExpend = () => {
        setExpend(!expend);
    };

    return (
        <Container fluid className="card-cont tw-mb-2 tw-border-collapse tw-h-full tw-select-none">
            <Card
                
                style={{backgroundColor: bgColor+"40"}}
                className={
                    !expend
                        ? "tw-transition-all tw-duration-300 hover:tw-scale-[101%] hover:tw-drop-shadow-lg"
                        : "" + "tw-select-none"
                }
            >
                <Card.Header
                    onClick={handleExpend}
                    className={"tw-flex tw-justify-between tw-align-middle"}
                >
                    <div className="h6">{header}</div>
                    <div className="h6">(לחץ כדי להרחיב)</div>
                </Card.Header>
                <Collapse in={expend} className=''>
                    <div className="">
                        <Card.Body  className={"tw-px-0"}>
                            {children}
                        </Card.Body>
                    </div>

                </Collapse>
            </Card>
        </Container>  )
    }