import React from "react";
import {Button, Table} from "react-bootstrap";
import {Pencil, Trash} from "react-bootstrap-icons";
import {TableRow} from "./index";

export interface TableProps {
    tableRows: TableRow[];
    handleEditClick: (i: number) => void;
    handleDeleteClick: (i: number) => void;
}

export default function QuestionTable(props:TableProps) {
    const {tableRows, handleEditClick, handleDeleteClick} = props;
    const fillRows = () => {
        return tableRows.map((row: TableRow, i: number) => (
            <tr className="" key={i}>
                <td className="tw-w-4 tw-align-middle">
                    <Button
                        className="tw-fill-[#0000003b] hover:tw-fill-[#000]"
                        variant="outline"
                        onClick={() => handleEditClick(i)}
                    >
                        <Pencil/>
                    </Button>
                </td>
                <td className="tw-w-4 tw-align-middle">
                    <Button
                        className="tw-fill-[#0000003b] hover:tw-fill-[#000]"
                        variant="outline"
                        onClick={() => handleDeleteClick(i)}
                    >
                        <Trash/>
                    </Button>
                </td>
                <td className="tw-w-[25%] tw-align-middle ">{`${row.questionHead} ${row.questionTail}`}</td>
                <td className="tw-w-[25%] tw-align-middle">{row.answer}</td>
                <td className="tw-w-[25%] tw-align-middle">{row.followupQuestion}</td>
                <td className="tw-w-[25%] tw-align-middle">{row.followupAnswer}</td>
            </tr>
        ));
    };

    return (
        <Table
            className="tw-mt-4"
            size="sm"
            bordered
            responsive
            hover
        >
            <tbody className="">{fillRows()}</tbody>
        </Table>
    );
}
