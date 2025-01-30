import { useEffect, useState } from "react";
import {
  ScrollArea,
  Card,
  LoadingOverlay,
  createStyles,
  Group,
  Text,
  Grid,
  Collapse,
  UnstyledButton,
} from "@mantine/core";
import { customLoader } from "components/utilities/loader";
import { useViewportSize } from "@mantine/hooks";
import axios from "axios";
import { API } from "utiles/url";
import { Box } from "@mui/material";
import { ChevronDown, ChevronUp } from "tabler-icons-react"; // Import icons for expand/collapse

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
  title: {
    fontWeight: 700,
    textTransform: "uppercase",
  },
  groupTitle: {
    marginTop: theme.spacing.md,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  collapseList: {
    marginTop: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
  },
  listItem: {
    textTransform: "capitalize",
  },
  gridCol: {
    paddingBottom: theme.spacing.sm, // Space between rows
  },
}));

function RoleDetailModal({ Id }) {
  const { classes } = useStyles();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState();
  const [openedGroups, setOpenedGroups] = useState({}); // State to manage opened groups

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

  const toggleGroup = (group) => {
    setOpenedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

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

        <Card style={{ marginTop: "30px" }} shadow="sm" p="lg">
          <ScrollArea style={{ overflow: 'hidden' }}>
            <Text size="md" weight={500} className={classes.diff}>
              <span>All Permissions</span>
            </Text>

            {/* Iterate over permissions grouped by category */}
            <Grid>
              {role?.permissions &&
                Object.entries(role.permissions).map(([group, permissions]) => (
                  <Grid.Col span={3} key={group} className={classes.gridCol}>
                    <div>
                      <div
                        className={classes.groupTitle}
                        onClick={() => toggleGroup(group)}
                      >
                        <Text>{group}</Text>
                        {openedGroups[group] ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                      <Collapse in={openedGroups[group]}>
                        <div className={classes.collapseList}>
                          {permissions.map((item) => (
                            <Text key={item.id} className={classes.listItem}>
                              • {item.name}
                            </Text>
                          ))}
                        </div>
                      </Collapse>
                    </div>
                  </Grid.Col>
                ))}
            </Grid>
          </ScrollArea>
        </Card>
      </div>
    </ScrollArea>
  );
}

export default RoleDetailModal;