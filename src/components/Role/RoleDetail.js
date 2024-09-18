import { useEffect, useState } from "react";
import {
  Table,
  ScrollArea,
  Card,
  LoadingOverlay,
  createStyles,
  Group,
  Text,
  Grid,
} from "@mantine/core";
import { customLoader } from "components/utilities/loader";
import { UserPlus, Discount2, Receipt2, Coin } from "tabler-icons-react";
import { useViewportSize } from "@mantine/hooks";
import axios from "axios";
import { API } from "utiles/url";
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

function RoleDetailModal({ Id }) {
  const { classes } = useStyles();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API}/roles/${Id}`, config);
      if (response.data) {
        setRole(response.data.role);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const { height } = useViewportSize();

  // Helper function to split the permissions array into two equal parts
  const splitPermissions = (permissions) => {
    const middleIndex = Math.ceil(permissions.length / 2);
    const firstHalf = permissions.slice(0, middleIndex);
    const secondHalf = permissions.slice(middleIndex);
    return [firstHalf, secondHalf];
  };

  const [firstColumn, secondColumn] = role?.permissions
    ? splitPermissions(role.permissions)
    : [[], []];

  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
      <div style={{ width: "98%", margin: "auto" }}>
        <LoadingOverlay
          visible={loading}
          color="blue"
          overlayBlur={2}
          loader={customLoader}
        />
          <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            p: 1,
            m: 1,
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
        >
        <Card style={{ width: "40%" }} shadow="sm" radius="md" withBorder>
          <div style={{ paddingLeft: "20px" }}>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Name<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{role?.name}</Text>
            </Group>
            <Group align="flex-end" spacing="xs" mt={25}>
              <Text size="sm" weight={500} className={classes.diff}>
                <span>
                  Guard Name<span style={{ marginLeft: "5px" }}>:</span>
                </span>
              </Text>
              <Text className={classes.value}>{role?.guard_name}</Text>
            </Group>
          </div>
        </Card>
</Box>
        <Card style={{ marginTop: "30px"}} shadow="sm" p="lg">
          <ScrollArea style={{ overflow: 'hidden' }}>
            <Text size="md" weight={500} className={classes.diff}>
              <span>All Permissions</span>
            </Text>

            {/* Grid with two equal columns for permissions */}
            <Grid>
              <Grid.Col span={6}>
                <Table
                  horizontalSpacing="md"
                  verticalSpacing="xs"
                  sx={{ width: "100%", tableLayout: "auto" }} // Adjusted for auto layout
                  >
                  <thead>
                    <tr>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {firstColumn.map((item) => (
                      <tr key={item.id}>
                        <td style={{ textTransform: "capitalize" }}>
                          {item.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Grid.Col>
              <Grid.Col span={6}>
                <Table
                  horizontalSpacing="md"
                  verticalSpacing="xs"
                  sx={{ width: "100%", tableLayout: "auto" }} // Adjusted for auto layout
                >
                  <thead>
                    <tr>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {secondColumn.map((item) => (
                      <tr key={item.id}>
                        <td style={{ textTransform: "capitalize" }}>
                          {item.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Grid.Col>
            </Grid>
          </ScrollArea>
        </Card>
      </div>
    </ScrollArea>
  );
}

export default RoleDetailModal;
