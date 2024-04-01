import { useState } from "react";
import {
  Table,
  ScrollArea,
  Card,
  Button,
  Modal,
  LoadingOverlay,
  Grid,
  createStyles,
  Text,
  Stack,
  Select,
  Group,
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

const useStyles = createStyles((theme) => ({
  root: {
    padding: theme.spacing.xl * 1.5,
  },

  value: {
    fontSize: 17,
    fontWeight: 500,
    lineHeight: 1,
  },

  diff: {
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },

  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },

  title: {
    fontWeight: 700,
    textTransform: "uppercase",
  },
}));
function RetailerDetailModal({ Id }) {
  // state variables
  const [retailer, setRetailer] = useState();
  const { classes } = useStyles();

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

        <Card style={{ width: "40%" }} shadow="sm" radius="md" withBorder>
          <div style={{ paddingLeft: "20px" }}>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Name<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{retailer?.name}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Email<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{retailer?.contact_email}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Phone<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{retailer?.contact_phone}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Address<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{retailer?.address}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  City <span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{retailer?.city}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Region <span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{retailer?.region?.name}</Text>
            </Group>
          </div>
        </Card>
        <Card style={{ marginTop: "30px" }} shadow="sm" p="lg">
          <ScrollArea>
            <div style={{ display: "flex" }}>
              <div style={{ width: "60%", marginRight: "15px" }}>
                <Text size="md" weight={500} className={classes.diff}>
                  <span style={{ fontSize: 17, fontWeight: 500 }}>Orders</span>
                </Text>
                <Table
                  horizontalSpacing="md"
                  verticalSpacing="xs"
                  sx={{ tableLayout: "fixed", minWidth: 600 }}
                >
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retailer?.orders.length > 0 ? (
                      <>
                        {retailer?.orders?.map((item) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.state}</td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      <tr>
                        <td colSpan={3}>
                          <Text weight={500} align="center">
                            Nothing Found Orders
                          </Text>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              <div style={{ width: "40%" }}>
                <ScrollArea style={{ height: "auto" }}>
                  <Map location={retailer?._geo} />
                </ScrollArea>
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </ScrollArea>
  );
}

export default RetailerDetailModal;
