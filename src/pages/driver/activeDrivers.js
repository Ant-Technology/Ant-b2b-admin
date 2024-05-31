import { Table } from '@mantine/core';
import { useEffect, useState } from 'react';


export default function Demo({activeDrivers}) {
    const [drivers, setDrivers] = useState([]);
  

  useEffect(() => {
    setDrivers(activeDrivers);
  }, [activeDrivers]);
  const rows = drivers?.map((element) => (
    <tr key={element.name}>
        <td>{element.id}</td>
      <td>{element.name}</td>
      <td>{element.email}</td>
      <td>{element.phone}</td>
    </tr>
  ));

  return (
    <Table>
      <thead>
        <tr style={{ backgroundColor: "#F1F1F1" }}>
            <th>Id</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
}
