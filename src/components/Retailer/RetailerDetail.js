import { useState } from "react";
import {
  Table,
  ScrollArea,
  Card,
  Button,
  Modal,
  LoadingOverlay,
  Grid,
  Stack,
  Select,
} from "@mantine/core";
import { ManualGearbox } from "tabler-icons-react";
import { useForm } from "@mantine/form";
import { useQuery, useMutation } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { customLoader } from "components/utilities/loader";
import {
  GET_ORDER,
  GET_PRODUCT,
  GET_RETAILER,
  GET_SHIPMENTS,
} from "apollo/queries";
import { SHIP_ITEM } from "apollo/mutuations";

function RetailerDetailModal({ Id }) {
  // state variables
  const [retailer, setRetailer] = useState();

  const { loading: retailerLoading } = useQuery(GET_RETAILER, {
    variables: { id: Id },
    onCompleted(data) {
      let retailer = data.retailer;
      setRetailer(retailer);
    },
  });

  return (
    <div style={{ width: "98%", margin: "auto" }}>
      <LoadingOverlay
        visible={retailerLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <Card shadow="sm" p="lg">
        <ScrollArea>
          <Table
            horizontalSpacing="md"
            verticalSpacing="xs"
            sx={{ tableLayout: "fixed", minWidth: 700 }}
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              <td>{retailer?.name}</td>
              <td>{retailer?.contact_email}</td>
              <td>{retailer?.contact_phone}</td>
              <td>{retailer?.address}</td>
              <td>{retailer?.city}</td>
            </tbody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}

export default RetailerDetailModal;
