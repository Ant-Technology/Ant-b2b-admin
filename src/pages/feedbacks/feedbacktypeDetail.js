import { useEffect, useState } from "react";
import { Table, ScrollArea, Card, createStyles, Text } from "@mantine/core";
import { UserPlus, Discount2, Receipt2, Coin } from "tabler-icons-react";
import { useViewportSize } from "@mantine/hooks";

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

function FeedbackTypeDetailModal({ row }) {
  // state variables
  const { classes } = useStyles();
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(row);
  }, []);
  console.log(row);
  const { height } = useViewportSize();
  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
      <div style={{ width: "98%", margin: "auto" }}>
        <Card shadow="sm" p="lg">
          <ScrollArea>
            <Text size="md" weight={500} className={classes.diff}>
              <span>Feedbacks</span>
            </Text>
            <Table
              style={{ width: "100%", minWidth: "600px" }}
              horizontalSpacing="md"
              verticalSpacing="xs"
            >
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{item.user?.name}</td>
                    <td>{item.user?.email}</td>
                    <td>
                      {item.user?.roles
                        ?.map((role) => role.name || "Unknown Role")
                        .join(", ")}
                    </td>
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

export default FeedbackTypeDetailModal;
