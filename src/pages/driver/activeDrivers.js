import { Table } from "@mantine/core";
import { useEffect, useState } from "react";
import OnlinePredictionIcon from "@mui/icons-material/OnlinePrediction";
import { Box } from "@mui/material";

export default function Demo({ activeDrivers }) {
  const [drivers, setDrivers] = useState([]);
  const [isActive, setIsActive] = useState(true); // Set to true to show active state

  useEffect(() => {
    if (activeDrivers) {
      const validDrivers = activeDrivers.filter(
        (driver) => driver._geo !== null
      );
      setDrivers(validDrivers);
    }
  }, [activeDrivers]);

  const rows = drivers?.map((element) => (
    <tr key={element.name}>
      <td>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: "5px" }}>
            <OnlinePredictionIcon className={isActive ? "pumping" : ""} />
          </span>
          <span>{element.id}</span>
        </div>
      </td>
      <td>{element.name}</td>
      <td>{element.email}</td>
      <td>{element.phone}</td>
    </tr>
  ));
console.log(drivers)
  return (
  
    <Table style={{ width: "100%", minWidth: "600px" }}>
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
