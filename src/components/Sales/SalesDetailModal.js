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
import { API } from "utiles/url";

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

function SalesDetailModal({ Id }) {
  // state variables
  const { classes } = useStyles();
  const [sales, setSales] = useState();
  const [productLoading, setProductLoading] = useState(false);
  useEffect(() => {
    fetchData();
  }, [Id]);

  const fetchData = async () => {
    setProductLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${API}/sales/${Id}`, config);
      if (data) {
        setProductLoading(false);
        setSales(data.data);
      }
    } catch (error) {
      setProductLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const { height } = useViewportSize();
  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
      <div style={{ width: "98%", margin: "auto" }}>
        <LoadingOverlay
          visible={productLoading}
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
              <Text className={classes.value}>{sales?.name}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Email<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{sales?.email}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Phone<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{sales?.phone}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  City<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{sales?.city}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  SubCity <span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{sales?.subcity}</Text>
            </Group>
          </div>
        </Card>
        <Card style={{ marginTop: "30px" }} shadow="sm" p="lg">
          <ScrollArea>
            <Text size="md" weight={500} className={classes.diff}>
              <span>Retailers</span>
            </Text>
            <Table
              horizontalSpacing="md"
              verticalSpacing="xs"
              sx={{ tableLayout: "fixed", minWidth: 600 }}
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>Contact Phone</th>
                  <th>Contact Email</th>
                  <th>Region</th>
                </tr>
              </thead>
              <tbody>
                {sales?.retailers?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.address}</td>
                    <td>{item.city}</td>
                    <td>{item.contact_phone}</td>
                    <td>{item.contact_email}</td>
                    <td>{item.region.name.en}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
        </Card>
      </div>
    </ScrollArea>
  );
}

export default SalesDetailModal;
