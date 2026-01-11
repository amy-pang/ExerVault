import React from "react";
import type { Exercise } from "./types/exercise";

type DummyTableProps = {
  data: Exercise[];
};

const DummyTable = ({ data }: DummyTableProps) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
        </tr>
      </thead>

      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.category}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DummyTable;