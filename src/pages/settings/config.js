import React, { Fragment, useState, useEffect } from "react";
import {
  Badge,
  Card,
  Drawer,
  LoadingOverlay,
  ScrollArea,
  useMantineTheme,
  createStyles,
  Table,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  SimpleGrid,
  Button,
} from "@mantine/core";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { Plus, Search } from "tabler-icons-react";
import Controls from "components/controls/Controls";
import { customLoader } from "components/utilities/loader";
import { API } from "utiles/url";
import AddConfig from "components/Config/addConfig";

const useStyles = createStyles((theme) => ({
  th: {
    padding: "0 !important",
    color: "rgb(20, 61, 89)",
  },

  control: {
    width: "100%",
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  icon: {
    width: 21,
    height: 21,
    borderRadius: 21,
  },
  thh: {
    color: "#666666",
    fontFamily: "'__Inter_aaf875','__Inter_Fallback_aaf875'",
    fontSize: "10px",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
}));

function Th({ children, sortable, sorted, reversed, onSort }) {
  const { classes } = useStyles();
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;

  return (
    <th className={classes.th}>
      <UnstyledButton
        onClick={sortable ? onSort : null}
        className={classes.control}
      >
        <Group position="apart">
          <Text weight={500} size="sm">
            {children}
          </Text>
          {sortable && (
            <Center className={classes.icon}>
              <Icon size={14} stroke={1.5} />
            </Center>
          )}
        </Group>
      </UnstyledButton>
    </th>
  );
}

const Config = () => {
  const { classes } = useStyles();
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [editValue, setEditValue] = useState(null); // For managing the edit state

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API}/configs`, config);
      if (response.data) {
        setConfigs(response.data.configs);
        setSortedData(response.data.configs); // Ensure sorting is applied when data is fetched
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(configs, {
        sortBy,
        reversed: reverseSortDirection,
        search: value,
      })
    );
  };

  const sortData = (data, payload) => {
    if (!payload.sortBy) {
      return filterData(data, payload.search);
    }

    return filterData(
      [...data].sort((a, b) => {
        if (payload.sortBy === "confirmed_at") {
          const dateA = new Date(a[payload.sortBy]);
          const dateB = new Date(b[payload.sortBy]);
          return payload.reversed ? dateB - dateA : dateA - dateB;
        }

        if (payload.reversed) {
          return b[payload.sortBy].localeCompare(a[payload.sortBy]);
        }

        return a[payload.sortBy].localeCompare(b[payload.sortBy]);
      }),
      payload.search
    );
  };

  const handleSort = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(configs, { sortBy: field, reversed, search }));
  };

  const filterData = (data, search) => {
    const query = search.toLowerCase().trim();
    return data.filter((item) =>
      Object.keys(item).some(
        (key) =>
          typeof item[key] === "string" &&
          item[key] &&
          item[key].toLowerCase().includes(query)
      )
    );
  };

  const handleEditClick = (row) => {
    setEditValue(row.value); // Set the value to be edited
    setEditId(row.id); // Set the current row id
  };

  const handleSaveClick = async () => {
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post(
        `${API}/configs/${editId}`,
        { value: editValue },
        config
      );
      fetchData(); // Refresh data after saving
      setEditValue(null); // Clear the edit state
      setEditId(null); // Clear the edit id
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const theme = useMantineTheme();
  const rows = sortedData?.map((row) => (
    <Fragment key={row.id}>
      <tr>
        <td>{row.name}</td>
        <td>
          {editId === row.id ? (
            <TextInput
              value={editValue}
              onChange={(e) => setEditValue(e.currentTarget.value)}
            />
          ) : (
            row.value
          )}
        </td>
        <td>{new Date(row.created_at).toLocaleDateString()}</td>
        <td>
          {editId === row.id ? (
            <Button
              style={{
                backgroundColor: "#FF6A00",
                color: "#FFFFFF",
              }}
              onClick={handleSaveClick}
            >
              Save
            </Button>
          ) : (
            <span style={{ marginLeft: "1px" }}>
              <Controls.ActionButton
                color="primary"
                title="Edit"
                onClick={() => handleEditClick(row)}
              >
                <EditIcon style={{ fontSize: "1rem" }} />
              </Controls.ActionButton>
            </span>
          )}
        </td>
      </tr>
    </Fragment>
  ));

  return loading ? (
    <LoadingOverlay
      visible={loading}
      color="blue"
      overlayBlur={2}
      loader={customLoader}
    />
  ) : (
    <div style={{ width: "98%", margin: "auto" }}>
      
            <Drawer
              opened={opened}
              onClose={() => setOpened(false)}
              title="Adding Config"
              padding="xl"
              size="80%"
              position="bottom"
            >
              <AddConfig
                setOpened={setOpened}
                fetchData={fetchData}
              />
            </Drawer>
      <Card shadow="sm" p="lg">
        <ScrollArea>
          <SimpleGrid cols={3}>
            <div>
              <Button
                onClick={() => setOpened(true)}
                style={{
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                }}
                leftIcon={<Plus size={14} />}
              >
                Add Config
              </Button>
            </div>
            <div> </div>
            <div>
              <TextInput
                placeholder="Search by any field"
                mb="md"
                icon={<Search size={14} />}
                value={search}
                onChange={handleSearchChange}
              />
            </div>
          </SimpleGrid>
          <Table
            highlightOnHover
            horizontalSpacing="md"
            verticalSpacing="xs"
            sx={{ tableLayout: "fixed", minWidth: 700 }}
          >
            <thead>
              <tr style={{ backgroundColor: "#F1F1F1" }}>
                <Th sortable={false} onSort={() => handleSort("name")}>
                  <span className={classes.th}>Name</span>
                </Th>
                <Th sortable onSort={() => handleSort("value")}>
                  <span className={classes.th}>Value</span>
                </Th>
                <Th sortable onSort={() => handleSort("created_at")}>
                  <span className={classes.th}>Date</span>
                </Th>
                <Th sortable={false}>
                  <span className={classes.th}>Actions</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {rows?.length > 0 ? (
                rows
              ) : (
                <tr>
                  <td colSpan={4}>
                    <Text weight={500} align="center">
                      Nothing found
                    </Text>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
};
export default Config;
