import React, { useEffect, useState } from "react";
import { createStyles, Group, Paper, SimpleGrid, Text } from "@mantine/core";
import {
  UserPlus,
  Discount2,
  Receipt2,
  Coin,
  ArrowUpRight,
  ArrowDownRight,
} from "tabler-icons-react";
import { useQuery } from "@apollo/client";
import { GET_ANALYTICS } from "apollo/queries";
import PendingIcon from "@mui/icons-material/Pending";
import axios from "axios";
import { API } from "utiles/url";

const useStyles = createStyles((theme) => ({
  root: {
    padding: theme.spacing.xl * 1.5,
    maxWidth:800
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    padding: theme.spacing.md,
    backgroundColor: "#FF6A00",
    color: "#FFFFFF",
    borderRadius: theme.radius.md,
  },
  value: {
    fontSize: 15,
    fontWeight: 700,
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
    color: "#FFFFFF",
  },

}));

const icons = {
  user: UserPlus,
  discount: Discount2,
  receipt: Receipt2,
  coin: Coin,
};

export default function StatsGrid() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchDeposit();
  }, []);

  const fetchDeposit = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${API}/order/status-counts`, config);
      if (data) {
        setLoading(false);
        setData(data);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };
 

  const { classes } = useStyles();
  
 
  return (
    <div className={classes.root}>
      <SimpleGrid
        cols={5} // Adjust the number of columns to match the number of papers
        breakpoints={[{ maxWidth: "xl", cols: 4 }, { maxWidth: "md", cols: 3 }, { maxWidth: "sm", cols: 2 }, { maxWidth: "xs", cols: 1 }]}
      >
        <Paper className={classes.paper} withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              CANCELED
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>{data?.CANCELED}</Text>
          </Group>
        </Paper>
        <Paper className={classes.paper} withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              SHIPPED
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>{data?.SHIPPED}</Text>
          </Group>
        </Paper>
        <Paper  className={classes.paper} withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              DELIVERED
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>{data?.DELIVERED}</Text>
          </Group>
        </Paper>
        <Paper className={classes.paper} withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              ORDERED
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>{data?.ORDERED}</Text>
          </Group>
        </Paper>
        <Paper className={classes.paper} withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
            BACKORDERED
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>{data?.BACKORDERED}</Text>
          </Group>
        </Paper>
      </SimpleGrid>
    </div>
  );
}
