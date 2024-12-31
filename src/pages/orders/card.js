import React, { useEffect, useState } from "react";
import { createStyles, Group, Paper, SimpleGrid, Text } from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";

const useStyles = createStyles((theme) => ({
  root: {
    maxWidth: 660, // Adjust max width if necessary
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#FFFFFF",
    borderRadius: theme.radius.md,
    height: 60,
    width: 105, 
    cursor:"pointer",
    margin: 2, 
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

export default function StatsGrid({ onCardClick }) {
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
        cols={5} // Keep 5 columns to show all papers in one row
        spacing="xs" // Adjust spacing as needed
      >
        <Paper onClick={() => onCardClick("CANCELED")} className={classes.paper} withBorder>
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              CANCELED
            </Text>
          </Group>
          <Group align="flex-end" spacing="xs" mt={10}>
            <Text className={classes.value}>{data?.CANCELED > 0 ? data.CANCELED : 0}</Text>
          </Group>
        </Paper>
        
        <Paper onClick={() => onCardClick("SHIPPED")} className={classes.paper} withBorder>
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              SHIPPED
            </Text>
          </Group>
          <Group align="flex-end" spacing="xs" mt={10}>
            <Text className={classes.value}>{data?.SHIPPED > 0 ? data.SHIPPED : 0}</Text>
          </Group>
        </Paper>
        
        <Paper onClick={() => onCardClick("DELIVERED")} className={classes.paper} withBorder>
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              DELIVERED
            </Text>
          </Group>
          <Group align="flex-end" spacing="xs" mt={10}>
            <Text className={classes.value}>{data?.DELIVERED>0?data.DELIVERED:0}</Text>
          </Group>
        </Paper>
        
        <Paper onClick={() => onCardClick("ORDERED")} className={classes.paper} withBorder>
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              ORDERED
            </Text>
          </Group>
          <Group align="flex-end" spacing="xs" mt={10}>
            <Text className={classes.value}>{data?.ORDERED>0?data.ORDERED:0}</Text>
          </Group>
        </Paper>
        
        <Paper onClick={() => onCardClick("BACKORDERED")} className={classes.paper} withBorder>
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              BACKORDERED
            </Text>
          </Group>
          <Group align="flex-end" spacing="xs" mt={10}>
            <Text className={classes.value}>{data?.BACKORDERED > 0 ? data.BACKORDERED : 0}</Text>
          </Group>
        </Paper>
      </SimpleGrid>
    </div>
  );
}