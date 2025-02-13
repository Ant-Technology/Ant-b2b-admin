import { useState } from "react";
import {
  Table,
  ScrollArea,
  Card,
  Button,
  LoadingOverlay,
  Grid,
  Stack,
  Select,
  TextInput,
  createStyles,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Image,
} from "@mantine/core";
import { useMutation } from "@apollo/client";
import { customLoader } from "components/utilities/loader";
import { UserPlus, Discount2, Receipt2, Coin } from "tabler-icons-react";
import { useViewportSize } from "@mantine/hooks";
import { useEffect } from "react";
import axios from "axios";
import { API } from "utiles/url";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { UPDATE_MINIMUM_STOCK_LEVEL } from "apollo/mutuations";

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

function StockDetailModal({ Id,updateData,setOpenedDetail }) {
  const form = useForm({
    initialValues: {
      minimum_stock_level: 0,
    },
  });
  const { classes } = useStyles();
  const [stock, setStock] = useState();
  const [loading, setLoading] = useState(false);
  const [editStockLevel] = useMutation(UPDATE_MINIMUM_STOCK_LEVEL);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API}/stocks/${Id}`, config);
      if (response.data) {
        setLoading(false);
        setStock(response.data);
        form.setValues({
          minimum_stock_level: response.data.minimum_stock_level,
        });
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const submit = () => {
    const variables = {
      id: Id,
      input: {
        minimum_stock_level: parseInt(form.values.minimum_stock_level),
      },
    };
    editStockLevel({
      variables,
      onCompleted() {
        showNotification({
          color: "green",
          title: "Success",
          message: "Stock Level Updated Successfully",
        });
        updateData()
        setOpenedDetail()
      },
      onError() {
        showNotification({
          color: "red",
          title: "Error",
          message: "Stock Level Not Updated!",
        });
      },
    });
  };

  const { height } = useViewportSize();
  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
      <div style={{ width: "98%", margin: "auto" }}>
        <LoadingOverlay
          visible={loading}
          color="blue"
          overlayBlur={2}
          loader={customLoader}
        />
        <Card style={{ width: "40%" }} shadow="sm" radius="md" withBorder>
          <div style={{ paddingLeft: "20px" }}>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Quantity<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{stock?.quantity}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Sku<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{stock?.product_sku?.sku}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Warehouse<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{stock?.warehouse.name}</Text>
            </Group>
            <Group align="center" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Minimum Stock Level
                  <span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <TextInput
                {...form.getInputProps("minimum_stock_level")}
                type="number"
                style={{ width: 100 }}
              />
              <Button onClick={submit} size="sm" style={{ marginLeft: 10 }}>
                Update
              </Button>
            </Group>
          </div>
        </Card>
        <Card style={{ marginTop: "30px" }} shadow="sm" p="lg">
          <ScrollArea>
            <Text size="md" weight={500} className={classes.diff}>
              <span>Transactions</span>
            </Text>
            <Table
              horizontalSpacing="md"
              verticalSpacing="xs"
              sx={{ tableLayout: "fixed", minWidth: 600 }}
            >
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Before quantity</th>
                  <th>After quantity</th>
                  <th>Quantity</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stock?.transactions?.length > 0 ? (
                  stock.transactions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.transactionable?.type}</td>
                      <td>{item.transactionable?.reason}</td>
                      <td>{item.before_quantity}</td>
                      <td>{item.after_quantity}</td>
                      <td>{item.quantity}</td>
                      <td>{new Date(item.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <Text weight={500} align="center">
                        No Transactions Found
                      </Text>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </ScrollArea>
        </Card>
      </div>
    </ScrollArea>
  );
}

export default StockDetailModal;
