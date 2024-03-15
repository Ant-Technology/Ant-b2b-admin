import { useState } from "react";
import {
  Table,
  ScrollArea,
  Card,
  LoadingOverlay,
} from "@mantine/core";
import { useQuery } from "@apollo/client";
import { customLoader } from "components/utilities/loader";
import { GET_DRIVER } from "apollo/queries";

function DriverDetailModal({ Id }) {
  // state variables
  const [dirver, setDriver] = useState();

  const { loading: driverLoading } = useQuery(GET_DRIVER, {
    variables: { id: Id },
    onCompleted(data) {
      let driver = data.driver;
      setDriver(driver);
    },
  });

  return (
    <div style={{ width: "100%", margin: "auto" }}>
      <LoadingOverlay
        visible={driverLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <Card shadow="sm" p="lg">
        <ScrollArea>
          <Table
            horizontalSpacing="md"
            verticalSpacing="xs"
            sx={{ tableLayout: "fixed", minWidth: 800 }}
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>City</th>
                <th>Email</th>
                <th>Address</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              <td>{dirver?.name}</td>
              <td>{dirver?.phone}</td>
              <td>{dirver?.city}</td>
              <td>{dirver?.address}</td>
              <td>{dirver?.email}</td>
            </tbody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}

export default DriverDetailModal;
