import { useEffect, useState } from "react";
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
  createStyles,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Image,
} from "@mantine/core";
import { useQuery } from "@apollo/client";
import { customLoader } from "components/utilities/loader";
import { GET_PRODUCT, GET_SHIPMENTS } from "apollo/queries";
import { UserPlus, Discount2, Receipt2, Coin } from "tabler-icons-react";
import { useViewportSize } from "@mantine/hooks";
import axios from "axios";
import { API, formatNumber } from "utiles/url";
import { Box } from "@mui/material";

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

const icons = {
  user: UserPlus,
  discount: Discount2,
  receipt: Receipt2,
  coin: Coin,
};

function OrdersDetailModal({ data }) {
  const { classes } = useStyles();
  const [sales, setSales] = useState([]);
  useEffect(() => {
    setSales(data);
  }, [data]);
console.log(sales)
  const { height } = useViewportSize();
  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
      <div style={{ width: "98%", margin: "auto" }}>
        <Card style={{ marginTop: "10px" }} shadow="sm" p="lg">
          <ScrollArea>
            <Table
              horizontalSpacing="md"
              verticalSpacing="xs"
              sx={{ tableLayout: "fixed", minWidth: 600 }}
            >
              <thead>
                <tr>
                  <th>Quantity</th>
                  <th>Warehouse</th>
                  <th>Vehicle Type</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {sales?.map((data) => (
                  <>
                    {data.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.quantity}</td>
                        <td>{data.warehouse?.name}</td>
                        <td>{data.vehicle_type?.title.en}</td>
                        <td>{item.product_sku?.product?.name.en}</td>
                        <td>{item.state}</td>

                        <td>{new Date(item.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              flexDirection: "column",
              p: 1,
              gap: 1,
              m: 1,
              bgcolor: "background.paper",
              borderRadius: 1,
            }}
          >
            <div
              style={{
                marginRight: "35px",
                fontWeight: "bold",
                fontSize: "15px",
              }}
            >
              Total Price:{" "}
              {formatNumber(
                sales.reduce((sum, item) => {
                  return sum + item.total_price;
                }, 0)
              )}
            </div>
          </Box>
        </Card>
      </div>
    </ScrollArea>
  );
}

export default OrdersDetailModal;
