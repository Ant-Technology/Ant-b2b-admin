import { Table } from '@mantine/core';
import { useEffect, useState } from 'react';

const elements = [
  { position: 6, mass: 12.011, symbol: 'C', name: 'Carbon' },
  { position: 7, mass: 14.007, symbol: 'N', name: 'Nitrogen' },
  { position: 39, mass: 88.906, symbol: 'Y', name: 'Yttrium' },
  { position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
  { position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
];

export default function Demo({activeDrivers}) {
    const [drivers, setDrivers] = useState([]);
  

  useEffect(() => {
    setDrivers(activeDrivers);
  }, [activeDrivers]);
  const rows = drivers?.map((element) => (
    <tr key={element.name}>
      <td>{element.name}</td>
      <td>{element.email}</td>
      <td>{element.phone}</td>
    </tr>
  ));

  return (
    <Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
      <caption>Scroll page to see sticky thead</caption>
    </Table>
  );
}
