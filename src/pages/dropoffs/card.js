import React, { useEffect, useState } from "react";
import { createStyles, Group, Paper, SimpleGrid, Text } from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";

const useStyles = createStyles((theme) => ({
  root: {
    maxWidth: 470,
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#FFFFFF",
    borderRadius: theme.radius.md,
    height: 60,
    width: 100,
    cursor:"pointer",
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
        spacing="xs"
        breakpoints={[
          { maxWidth: "md", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
      >
        {data && (
          <>
            <Paper className={classes.paper} withBorder>
              <Group position="apart">
                <Text size="xs" color="dimmed" className={classes.title}>
                  Pending
                </Text>
              </Group>
              <Group align="flex-end" spacing="xs" mt={10}>
                <Text className={classes.value}>{data.PENDING > 0 ? data.PENDING : 0}</Text>
              </Group>
            </Paper>
            <Paper className={classes.paper} withBorder>
              <Group position="apart">
                <Text size="xs" color="dimmed" className={classes.title}>
                  STARTED
                </Text>
              </Group>
              <Group align="flex-end" spacing="xs" mt={10}>
                <Text className={classes.value}>{data.STARTED > 0 ? data.STARTED : 0}</Text>
              </Group>
            </Paper>
            <Paper className={classes.paper} withBorder>
              <Group position="apart">
                <Text size="xs" color="dimmed" className={classes.title}>
                   ACCEPTED
                </Text>
              </Group>
              <Group align="flex-end" spacing="xs" mt={10}>
                <Text className={classes.value}>{data.DRIVER_ACCEPTED > 0 ? data.DRIVER_ACCEPTED : 0}</Text>
              </Group>
            </Paper>
            <Paper className={classes.paper} withBorder>
              <Group position="apart">
                <Text size="xs" color="dimmed" className={classes.title}>
                  FINISHED
                </Text>
              </Group>
              <Group align="flex-end" spacing="xs" mt={10}>
                <Text className={classes.value}>{data.FINISHED > 0 ? data.FINISHED : 0}</Text>
              </Group>
            </Paper>
          </>
        )}
      </SimpleGrid>
    </div>
  );
}