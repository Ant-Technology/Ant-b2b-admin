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
import Map from "components/utilities/Map";
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
import { useViewportSize } from "@mantine/hooks";

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
  
  const { height } = useViewportSize();

  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
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
        <div style={{ marginTop: "60px" }}>
        <Grid style={{ marginTop: "30px" }}>
              <Grid.Col span={12}>
                <ScrollArea style={{ height: "auto" }}>
                  <Map location={retailer?._geo} />
                </ScrollArea>
              </Grid.Col>
            </Grid>
       </div>
      </Card>
    </div>
    </ScrollArea>
  );
}

export default RetailerDetailModal;
