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
import Map from "components/utilities/Map";

import { customLoader } from "components/utilities/loader";
import { GET_PRODUCT, GET_SHIPMENTS } from "apollo/queries";
import { UserPlus, Discount2, Receipt2, Coin } from "tabler-icons-react";
import { useViewportSize } from "@mantine/hooks";
import axios from "axios";

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

function ProductDetailModal({ Id }) {
  // state variables
  const { classes } = useStyles();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchDeposit();
  }, [Id]);

  const fetchDeposit = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(
        `http://157.230.102.54:8081/api/drivers/${Id}`,
        config
      );
      if (data) {
        console.log(data);
        setLoading(false);
        setData(data);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
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
                  Name<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{data?.name}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Address<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{data?.address}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Phone<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{data?.phone}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Email<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{data?.email}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  City <span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{data?.city}</Text>
            </Group>
          </div>
        </Card>
        <Card style={{ marginTop: "30px" }} shadow="sm" p="lg">
          <ScrollArea>
            <div style={{ display: "flex" }}>
              <div style={{ width: "60%", marginRight: "15px" }}>
                <Text size="md" weight={500} className={classes.diff}>
                  <span style={{ fontSize: 17, fontWeight: 500 }}>
                    Driver Dropoffs
                  </span>
                </Text>
                <Table
                  horizontalSpacing="md"
                  verticalSpacing="xs"
                  sx={{ tableLayout: "fixed", minWidth: 600 }}
                >
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Cost</th>
                      <th>All Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.dropoffs?.length > 0 ? (
                      <>
                        {data.dropoffs.map((item) => (
                          <tr key={item.id}>
                            <td>{item.from?.name}</td>
                            <td>{item.from?.contact_phone}</td>
                            <td>{item.status}</td>
                            <td>{item.cost}</td>
                            <td>{item.all_received ? "True" : "False"}</td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      <tr>
                        <td colSpan={4}>
                          <Text weight={500} align="center">
                            Nothing Found dropoffs
                          </Text>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                <div style={{ marginTop: "60px" }}>
                  <Text size="md" weight={500} className={classes.diff}>
                    <span style={{ fontSize: 17, fontWeight: 500 }}>
                      Driver Shipments
                    </span>
                  </Text>
                  <Table
                    horizontalSpacing="md"
                    verticalSpacing="xs"
                    sx={{ tableLayout: "fixed", minWidth: 600 }}
                  >
                    <thead>
                      <tr>
                        <th>Departure Time</th>
                        <th>Arrival Time</th>
                        <th>Status</th>
                        <th>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.shipments?.length > 0 ? (
                        <>
                          {data.shipments.map((item) => (
                            <tr key={item.id}>
                              <td>{item.departure_time}</td>
                              <td>{item.arrival_time}</td>
                              <td>{item.status}</td>
                              <td>{item.cost}</td>
                            </tr>
                          ))}
                        </>
                      ) : (
                        <tr>
                          <td colSpan={4}>
                            <Text weight={500} align="center">
                              Nothing Found Shipments
                            </Text>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
              <div style={{ width: "40%" }}>
                <ScrollArea style={{ height: "auto" }}>
                  <Map location={data?._geo} />
                </ScrollArea>
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </ScrollArea>
  );
}

export default ProductDetailModal;
