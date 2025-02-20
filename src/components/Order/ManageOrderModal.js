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
  Group,
  Text,
} from "@mantine/core";
import {
  ManualGearbox,
  DotsCircleHorizontal,
  CircleX,
  Category,
  Receipt,
  CurrencyDollar,
  CreditCard,
} from "tabler-icons-react";
import { useForm } from "@mantine/form";
import { useQuery, useMutation } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { customLoader } from "components/utilities/loader";
import { GET_ORDER, GET_SHIPMENTS } from "apollo/queries";
import { SHIP_ITEM } from "apollo/mutuations";
import axios from "axios";
import { API, formatNumber } from "utiles/url";
import { Box } from "@mui/material";

function ManageOrderModal({ editId }) {
  // state variables
  const [order, setOrder] = useState();
  const [openedCancel, setOpenedCancel] = useState(false);
  const [itemId, setItemId] = useState();
  const [loading, setLoading] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [shipmentsDropDownData, setShipmentsDropDownData] = useState([]);

  // graphql queries
  const { loading: shipmentLoading } = useQuery(GET_SHIPMENTS, {
    variables: {
      first: 100000,
      page: 1,
    },
    onCompleted(data) {
      let shipments = data.shipments;
      let shipmentsArray = [];

      // loop over shipments data to structure the data for the use of drop down
      shipments.data.forEach((shipment, index) => {
        shipmentsArray.push({
          label: "Departure on " + shipment?.departure_time,
          value: shipment.id,
        });
      });

      setShipmentsDropDownData([...shipmentsArray]);
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${err}`,
      });
    },
  });

  // mutation
  const [shipItem, { loading: shipItemLoading }] = useMutation(SHIP_ITEM);

  const { loading: orderLoading, refetch } = useQuery(GET_ORDER, {
    variables: { id: editId },
    onCompleted(data) {
      console.log(data);
      let order = data.order;
      setOrder(order);
    },
  });

  const form = useForm({
    initialValues: {
      shipment: {
        connect: "",
      },
      shipment_itemable: [],
    },
  });

  const manageItem = (id) => {
    setSelectedOrderItem(id);
    setOpenModal(true);
  };

  // set the selected item
  const setShipmentDropDownValue = (val) => {
    form.setFieldValue("shipment.connect", val);
  };

  const cancelItem = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.patch(
        `${API}/my-orders/${itemId}/cancel`,
        {},
        config
      );
      if (data) {
        setLoading(false);
        refetch();
        setOpenedCancel(false);
        showNotification({
          color: "green",
          title: "Success",
          message: "Order item has been canceled successfully",
        });
      }
    } catch (error) {
      setLoading(false);
      setOpenedCancel(false);
      showNotification({
        color: "red",
        title: "Error",
        message: error.response?.data?.message
          ? error.response.data.message
          : "Error Cancel Item ",
      });
    }
  };

  const submit = () => {
    shipItem({
      variables: {
        shipment: form.values.shipment,
        shipment_itemable: [
          {
            connect: {
              type: "ORDER_ITEM",
              id: selectedOrderItem,
            },
          },
        ],
      },
      onCompleted(data) {
        setOpenModal(false);
        setSelectedOrderItem(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Item Shipped Successfully",
        });
      },
      onError(error) {
        // setOpened(false);
        setOpenModal(false);
        setSelectedOrderItem(null);
        showNotification({
          color: "red",
          title: "Error",
          message: "Item Shipped Not Created Successfully",
        });
      },
    });
    // e.preventDefault();
  };
  const handleCancel = (id) => {
    setItemId(id);
    setOpenedCancel(true);
  };

  return (
    <div style={{ width: "98%", margin: "auto" }}>
      <Modal
        opened={openModal}
        onClose={() => setOpenModal(false)}
        title="Ship Item"
      >
        <form onSubmit={form.onSubmit(() => submit())}>
          <Stack>
            <Grid>
              <Grid.Col span={12}>
                <Select
                  data={shipmentsDropDownData}
                  label="Shipment"
                  placeholder="Pick departure time"
                  searchable
                  value={form.getInputProps("shipment.connect").value}
                  onChange={setShipmentDropDownValue}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={12}>
                <Button type="submit" color="blue" variant="outline" fullWidth>
                  Submit
                </Button>
              </Grid.Col>
            </Grid>
          </Stack>
        </form>
      </Modal>
      <LoadingOverlay
        visible={shipmentLoading || shipItemLoading || orderLoading}
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
                <th>ID</th>
                <th>Quantity</th>
                <th>Each Price</th>
                <th>Total Price</th>
                <th>Product Name</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {order?.items?.length > 0 ? (
                order?.items?.map((row, index) => {
                  return (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td>{row.quantity}</td>
                      <td>
                        {row.product_sku
                          ? row.product_sku.price / row.quantity
                          : "-"}
                      </td>
                      <td>{row.product_sku?.price}</td>
                      <td>{row.product_sku?.product?.name}</td>
                      <td>{row.state}</td>
                      <td>{row.created_at}</td>

                      <td>
                        <ManualGearbox
                          color="#1971C2"
                          size={24}
                          onClick={() => manageItem(`${row.id}`)}
                        />
                        <CircleX
                          style={{ marginLeft: "10px", cursor: "pointer" }}
                          color="#1971C2"
                          size={24}
                          onClick={() => handleCancel(`${row.id}`)}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  {/* <td colSpan={Object.keys(order?.items[0]).length}>
                    <Text weight={500} align="center">
                      Nothing found
                    </Text>
                  </td> */}
                </tr>
              )}
            </tbody>
          </Table>
          <Stack spacing="sm">
            <Group>
              <Group spacing="xs">
                <CurrencyDollar size={20} color="#4dabf7" />
                <Text size="sm" color="dimmed">
                  Total Amount:
                </Text>
              </Group>
              <Text weight={400} size="md" style={{ marginLeft: "5px" }}>
                {" "}
                {/* Adjusted margin */}
                {formatNumber(order?.order_transaction?.transaction?.amount) ||
                  "N/A"}
              </Text>
            </Group>

            <Group>
              <Group spacing="xs">
                <CreditCard size={20} color="#4dabf7" />
                <Text size="sm" color="dimmed">
                  Payment Method:
                </Text>
              </Group>
              <Text weight={400} size="md" style={{ marginLeft: "5px" }}>
                {" "}
                {/* Adjusted margin */}
                {order?.order_transaction?.transaction?.payment_method || "N/A"}
              </Text>
            </Group>

            <Group>
              <Group spacing="xs">
                <Receipt size={20} color="#4dabf7" />
                <Text size="sm" color="dimmed">
                  Transaction Reference:
                </Text>
              </Group>
              <Text
                weight={400}
                size="md"
                sx={{
                  maxWidth: 200,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginLeft: "5px", // Adjusted margin
                }}
              >
                {order?.order_transaction?.transaction?.txn_ref || "N/A"}
              </Text>
            </Group>

            <Group>
              <Group spacing="sm">
                <Category size={20} color="#4dabf7" />
                <Text size="sm" color="dimmed">
                  Transaction Type:
                </Text>
              </Group>
              <Text weight={400} size="md">
                {" "}
                {/* Adjusted margin */}
                {order?.order_transaction?.transaction?.type || "N/A"}
              </Text>
            </Group>
          </Stack>
          <Modal
            opened={openedCancel}
            onClose={() => setOpenedCancel(false)}
            title="Warning"
            centered
          >
            <p>Are you sure do you want to Cancel this Item?</p>
            <Group position="right">
              <Button
                onClick={() => cancelItem()}
                color="blue"
                variant="outline"
              >
                Yes
              </Button>
            </Group>
          </Modal>
        </ScrollArea>
      </Card>
    </div>
  );
}

export default ManageOrderModal;
