import { Table } from "@mantine/core";
import { useEffect, useState } from "react";
import OnlinePredictionIcon from "@mui/icons-material/OnlinePrediction";

export default function Demo({ activeDrivers }) {
  const [drivers, setDrivers] = useState([]);
  const [isActive, setIsActive] = useState(true); // Set to true to show active state

  useEffect(() => {
    setDrivers(activeDrivers);
  }, [activeDrivers]);
  const rows = drivers?.map((element) => (
    <tr key={element.name}>
      <td>
        <div style={{display:"flex"}}>
        <span style={{marginRight:"5px"}}>{element.id}</span>
        <span>
          {" "}
          <OnlinePredictionIcon className={isActive ? "pumping" : ""} />
        </span>
        </div>
      </td>
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
