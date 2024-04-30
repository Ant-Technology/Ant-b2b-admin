import React from "react";
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

const useStyles = createStyles((theme) => ({
  root: {
    padding: theme.spacing.xl * 1.5,
  },

  value: {
    fontSize: 24,
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
    color: "#666666",
  },
}));

const icons = {
  user: UserPlus,
  discount: Discount2,
  receipt: Receipt2,
  coin: Coin,
};

export default function StatsGrid() {
  const { data, loading } = useQuery(GET_ANALYTICS);

  const { classes } = useStyles();
  const fieldMap = {
    Orders: "orders",
    Shipments: "shipments",
    "Total Sales": "totalSales",
    "Total Active Products": "totalActiveProducts",
  };
  const stats = () => {
    return (
      <Paper withBorder p="md" radius="md">
        <Group position="apart">
          <Text size="xs" color="dimmed" className={classes.title}>
            DropOff
          </Text>
        </Group>

        <Group align="flex-end" spacing="xs" mt={25}>
          <Text className={classes.value}>2</Text>
        </Group>
      </Paper>
    );
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
        <Paper withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              CANCELED
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>2</Text>
          </Group>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              SHIPPED
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>2</Text>
          </Group>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              DELIVERED
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>2</Text>
          </Group>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group position="apart">
            <Text size="xs" color="dimmed" className={classes.title}>
              ORDERED
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" mt={25}>
            <Text className={classes.value}>2</Text>
          </Group>
        </Paper>
      </SimpleGrid>
    </div>
  );
}
