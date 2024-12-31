import React, { useEffect, useState } from "react";
import { createStyles, Group, Paper, SimpleGrid, Text } from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";

const useStyles = createStyles((theme) => ({
  root: {
    maxWidth: 470,
    marginBottom: 5,
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#FFFFFF",
    borderRadius: theme.radius.md,
    height: 60,
    cursor:"pointer",
    width: 100,
    marginRight: 4,
  },
  value: {
    lineHeight: 1,
    color: "#F36825",
    fontSize: theme.fontSizes.md,
    fontWeight: 700,
    marginTop: 4,
  },
  title: {
    textTransform: "uppercase",
    fontSize: theme.fontSizes.sm,
    fontWeight: 700,
    color: "#101F0C",
  },
}));

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
      const { data } = await axios.get(`${API}/shipment/status-counts`, config);
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
        cols={4}
        spacing="xs"
        breakpoints={[
          { maxWidth: "md", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
      >
        <Paper className={classes.paper} withBorder>
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              CANCELED
            </Text>
          </Group>
          <Group align="flex-end" spacing="xs" mt={10}>
            <Text className={classes.value}>{data?.cancelled > 0 ? data.cancelled : 0}</Text>
          </Group>
        </Paper>
        
        <Paper className={classes.paper} withBorder>
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              SHIPPED
            </Text>
          </Group>
          <Group align="flex-end" spacing="xs" mt={10}>
            <Text className={classes.value}>{data?.shipped > 0 ? data.shipped : 0}</Text>
          </Group>
        </Paper>
        
        <Paper className={classes.paper} withBorder>
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              DELIVERED
            </Text>
          </Group>
          <Group align="flex-end" spacing="xs" mt={10}>
            <Text className={classes.value}>{data?.delivered > 0 ? data.delivered : 0}</Text>
          </Group>
        </Paper>
        
        <Paper className={classes.paper} withBorder>
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              PENDING
            </Text>
          </Group>
          <Group align="flex-end" spacing="xs" mt={10}>
            <Text className={classes.value}>{data?.pending > 0 ? data.pending : 0}</Text>
          </Group>
        </Paper>
      </SimpleGrid>
    </div>
  );
}