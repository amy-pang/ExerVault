import React from "react";

type Exercise = {
  id: number;
  name: string;
  type: string; // matches your DummyExercises shape
};

const DummyTable: React.FC<{ data: Exercise[] }> = ({ data }) => {
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
            <td>{item.type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DummyTable;
