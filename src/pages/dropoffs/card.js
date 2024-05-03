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
import StartIcon from "@mui/icons-material/Start";
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
  const { classes } = useStyles();
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
      const { data } = await axios.get(`${API}/dropoff/status-counts`, config);
      if (data) {
        setLoading(false);
        setData(data);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };
  return (
    <div className={classes.root}>
      <SimpleGrid
        cols={4}
        breakpoints={[
          { maxWidth: "md", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
      >
        <Paper className={classes.paper} withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              Pending
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>{data?.PENDING}</Text>
          </Group>
        </Paper>
        <Paper className={classes.paper} withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              STARTED
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>{data?.STARTED}</Text>
          </Group>
        </Paper>
        <Paper className={classes.paper}  withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              DRIVER_ACCEPTED
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>{data?.DRIVER_ACCEPTED}</Text>
          </Group>
        </Paper>
        <Paper className={classes.paper}  withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              FINISHED
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>{data?.FINISHED}</Text>
          </Group>
        </Paper>
      </SimpleGrid>
    </div>
  );
}
