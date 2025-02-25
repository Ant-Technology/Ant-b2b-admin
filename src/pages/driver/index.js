import { useQuery } from "@apollo/client";
import { X } from "tabler-icons-react"; // Import a close icon
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
  Container,
  Pagination,
  Button,
  Tooltip,
  Modal,
  Tabs,
  Select,
} from "@mantine/core";
import { Api, Edit, Trash } from "tabler-icons-react";
import { FiEdit, FiEye } from "react-icons/fi";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { customLoader } from "components/utilities/loader";
import React, { Fragment, useEffect, useState } from "react";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { Plus, Search } from "tabler-icons-react";
import { showNotification } from "@mantine/notifications";
import DriverDetailModal from "components/Driver/DriverDetail";
import { DriverEditModal } from "components/Driver/DriverEditModal";
import { DriverAddModal } from "components/Driver/DriverAddModal";
import Controls from "components/controls/Controls";
import { API, formatNumber, PAGE_SIZE_OPTIONS } from "utiles/url";
import MapView from "./mapView";
import { Box } from "@mui/material";
import Demo from "./activeDrivers";
import Pusher from "pusher-js";
import MinmumBalance from "./minumunBalance";
import NewDriver from "./newDriver";

const useStyles = createStyles((theme) => ({
  th: {
    padding: "0 !important",
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
  idColumn: {
    width: "3%",
  },
  cityColumn: {
    width: "4%",
  },

  searchContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  searchInput: {
    flexGrow: 1,
    paddingRight: "50px", // Add padding to avoid text overlap with button
  },
  searchButton: {
    position: "absolute",
    right: 0,
    borderRadius: "0 4px 4px 0",
    height: "70%",
    width: "40px", // Fixed width for the button
    backgroundColor: "#FF6A00",
    color: "#FFFFFF",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "14px",
    cursor: "pointer",
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

const Drivers = () => {
  const { classes } = useStyles();
  const [size, setSize] = useState("10");
  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1);
    fetchData(newSize);
  };
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [activeTab, setActiveTab] = useState("first");

  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [editRow, setEditRow] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState([]);
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);

  useEffect(() => {
    fetchData(size);
  }, []);
  useEffect(() => {
    const pusher = new Pusher("83f49852817c6b52294f", {
      cluster: "mt1",
    });
    const notificationChannel = pusher.subscribe("driver-location");
    notificationChannel.bind("driver-location", function (data) {
      console.log("Pusher event received:", data);
      setActiveDrivers(data.data);
    });
    return () => {
      // Unsubscribe from channels, disconnect, etc.
      pusher.disconnect();
    };
  }, []);

  const fetchData = async (size) => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${API}/drivers?page=${activePage}&first=${size}`,
        config
      );
      if (response.data) {
        setDrivers(response.data.data);
        setSortedData(response.data.data); // Ensure sorting is applied when data is fetched
        setTotal(response.data?.links);
        setTotalPages(response.data.paginatorInfo.lastPage);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const handleSearchChange = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${API}/drivers?search=${search}&page=${activePage}&first=${size}`,
        config
      );
      if (response.data) {
        setDrivers(response.data.data);
        setSortedData(response.data.data);
        setTotal(response.data?.links);
        setTotalPages(response.data.paginatorInfo.lastPage);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const sortData = (data, payload) => {
    if (!payload.sortBy) {
      return filterData(data, payload.search);
    }

    return filterData(
      [...data].sort((a, b) => {
        if (payload.reversed) {
          return b[payload.sortBy].localeCompare(a[payload.sortBy]);
        }

        return a[payload.sortBy].localeCompare(b[payload.sortBy]);
      }),
      payload.search
    );
  };

  const handleChange = (page) => {
    setActivePage(page);
    fetchData(size);
  };

  const handleSort = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(drivers, { sortBy: field, reversed, search }));
  };
  const handleEditDriver = (row) => {
    setOpenedEdit(true);
    console.log(row);
    setEditRow(row);
  };
  const handleManageDriver = (id) => {
    setEditId(id);
    setOpenedDetail(true);
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
  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };

  const deleteDriver = async () => {
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(`${API}/drivers/${deleteID}`, config);
      if (response.data) {
        fetchData(size);
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Driver Deleted Successfully",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setOpenedDelete(false);
      setDeleteID(null);
      showNotification({
        color: "red",
        title: "Error",
        message: `Driver Not Deleted Successfully`,
      });
    }
  };
  const handleTabChange = async (tab) => {
    console.log(tab);
    setActiveTab(tab);
    if (tab === "second") {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.get(`${API}/location`, config);
    }
  };
  const theme = useMantineTheme();
  const rows = sortedData?.map((row) => {
    const rowStyle =
      row.wallet?.balance < 1000 ? { backgroundColor: "#FFCCCB" } : {}; // Warning color for balance < 1000

    return (
      <Fragment key={row.id}>
        <tr style={rowStyle}>
          {" "}
          {/* Apply conditional styling to the entire row */}
          <td className={classes.idColumn}>{row.id}</td>
          <td>{row.name}</td>
          <td>{row.email}</td>
          <td>{row.phone}</td>
          <td className={classes.cityColumn}>{row.region?.name?.en}</td>
          <td>{row.city}</td>
          <td style={{ width: "10%" }}>
            {row.vehicle?.vehicle_type?.title.en}
          </td>
          <td>{row.wallet?.balance?formatNumber(row.wallet?.balance):"No Balance"}</td>
          <td>
            <div style={{ display: "flex" }}>
              <Controls.ActionButton
                color="primary"
                title="Update"
                onClick={() => handleEditDriver(row)}
              >
                <EditIcon style={{ fontSize: "1rem" }} />
              </Controls.ActionButton>
              <span style={{ marginLeft: "1px" }}>
                <Controls.ActionButton
                  color="primary"
                  title="View Detail"
                  onClick={() => handleManageDriver(`${row.id}`)}
                >
                  <FiEye fontSize="medium" />
                </Controls.ActionButton>
              </span>
              <Controls.ActionButton
                color="primary"
                title="Delete"
                onClick={() => handleDelete(`${row.id}`)}
              >
                <Trash size={17} />
              </Controls.ActionButton>
            </div>
          </td>
        </tr>
      </Fragment>
    );
  });
  return loading ? (
    <LoadingOverlay
      visible={loading}
      color="blue"
      overlayBlur={2}
      loader={customLoader}
    />
  ) : (
    <Tabs
      color="#FF6A00"
      value={activeTab}
      styles={{
        tabList: {
          borderBottom: `2px solid #FF6A00`,
        },
        tab: {
          '&[data-active]': {
            borderColor: '#FF6A00',
          },
          '&:hover': {
            borderColor: '#FF6A00',
          },
        },
      }}
      onTabChange={handleTabChange}
    >
      <Tabs.List>
        <Tabs.Tab value="first">
          <span style={{ color: "#666666", fontWeight: "bold" }}>
            All Drivers
          </span>
        </Tabs.Tab>
        <Tabs.Tab value="second">
          <span
            style={{
              color: "#666666",
              fontWeight: "bold",
            }}
          >
            All Active Drivers
          </span>
        </Tabs.Tab>
        <Tabs.Tab value="third">
          <span style={{ color: "#666666", fontWeight: "bold" }}>
            Minmum Balance
          </span>
        </Tabs.Tab>
        <Tabs.Tab value="four">
          <span style={{ color: "#666666", fontWeight: "bold" }}>
            New Driver
          </span>
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="third">
        <MinmumBalance />
      </Tabs.Panel>
      <Tabs.Panel value="four">
        <NewDriver />
      </Tabs.Panel>
      <Tabs.Panel value="second">
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
          <div style={{ width: "96%" }}>
            {activeDrivers.length > 0}
            <Card shadow="sm" p="lg">
              <MapView activeDrivers={activeDrivers} />
            </Card>
          </div>
          <div style={{ marginTop: "10px" }}>
            <Card shadow="sm" p="lg">
              <Demo activeDrivers={activeDrivers} />
            </Card>
          </div>
        </Box>
      </Tabs.Panel>
      <Tabs.Panel value="first">
        <div style={{ width: "98%", margin: "auto" }}>
          <Drawer
            opened={openedEdit}
            overlayColor={
              theme.colorScheme === "dark"
                ? theme.colors.dark[9]
                : theme.colors.gray[2]
            }
            overlayOpacity={0.55}
            overlayBlur={3}
            title="Editing a Driver"
            padding="xl"
            onClose={() => setOpenedEdit(false)}
            position="bottom"
            size="80%"
          >
            <DriverEditModal
              activePage={size}
              fetchData={fetchData}
              editRow={editRow}
              setOpenedEdit={setOpenedEdit}
              editId={editId}
            />
          </Drawer>
          <Drawer
            opened={opened}
            onClose={() => setOpened(false)}
            title="Adding a Driver"
            padding="xl"
            size="80%"
            position="bottom"
          >
            <DriverAddModal
              total={total}
              setTotal={setTotal}
              activePage={size}
              setActivePage={setActivePage}
              setOpened={setOpened}
              fetchData={fetchData}
            />
          </Drawer>
          <Drawer
            opened={openedDetail}
            overlayColor={
              theme.colorScheme === "dark"
                ? theme.colors.dark[9]
                : theme.colors.gray[2]
            }
            overlayOpacity={0.55}
            overlayBlur={3}
            title="Driver Detail"
            padding="xl"
            onClose={() => setOpenedDetail(false)}
            position="bottom"
            size="80%"
          >
            <DriverDetailModal
              total={total}
              setTotal={setTotal}
              activePage={activePage}
              setActivePage={setActivePage}
              setOpenedDetail={setOpenedDetail}
              Id={editId}
            />
          </Drawer>
          <Card shadow="sm" p="lg">
            <ScrollArea>
              <SimpleGrid cols={3}>
                <div>
                  <Button
                    onClick={() => setOpened(true)}
                    variant="blue"
                    style={{ backgroundColor: "#FF6A00", color: "#FFFFFF" }}
                    leftIcon={<Plus size={14} />}
                  >
                    Add Driver
                  </Button>
                </div>
                <div></div>
                <div className={classes.searchContainer}>
                  <TextInput
                    placeholder="Search"
                    mb="md"
                    icon={<Search size={14} />}
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    className={classes.searchInput}
                    rightSection={
                      search && (
                        <UnstyledButton
                          onClick={() => {
                            setSearch("");
                            fetchData(size); // Fetch all drivers again
                          }}
                          style={{ padding: 5 }} // Adjust padding for better click area
                        >
                          <X size={16} color="red" /> {/* Clear icon */}
                        </UnstyledButton>
                      )
                    }
                  />
                  <button
                    className={classes.searchButton}
                    onClick={handleSearchChange}
                  >
                    <Search size={16} />
                  </button>
                </div>
              </SimpleGrid>
              <Table
                highlightOnHover
                horizontalSpacing="md"
                verticalSpacing="xs"
                sx={{ minWidth: 700 }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#F1F1F1" }}>
                    <Th sortable={false} onSort={() => handleSort("id")}>
                      <span className={classes.thh}>ID</span>
                    </Th>
                    <Th sortable={false} onSort={() => handleSort("name")}>
                      <span className={classes.thh}> Name </span>
                    </Th>
                    <Th sortable onSort={() => handleSort("email")}>
                      <span className={classes.thh}> Email</span>
                    </Th>
                    <Th sortable onSort={() => handleSort("phone")}>
                      <span className={classes.thh}> Phone</span>
                    </Th>
                    <Th sortable={false}>
                      {" "}
                      <span className={classes.thh}>Region</span>
                    </Th>
                    <Th sortable onSort={() => handleSort("email")}>
                      <span className={classes.thh}> City</span>
                    </Th>
                    <Th sortable={false}>
                      <span className={classes.thh}>Vehicle Type</span>
                    </Th>
                    <Th sortable={false}>
                      <span className={classes.thh}>Balance</span>
                    </Th>
                    <Th sortable={false}>
                      {" "}
                      <span className={classes.thh}>Actions</span>
                    </Th>
                  </tr>
                </thead>
                <tbody>
                  {rows?.length > 0 ? (
                    rows
                  ) : (
                    <tr>
                      <td colSpan={8}>
                        <Text weight={500} align="center">
                          Nothing found
                        </Text>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              <Center mt="md">
                <Group spacing="xs" position="center">
                  <Group spacing="sm">
                    <Text size="sm" mt="sm">
                      <span style={{ color: "#FF6A00", marginBottom: "10px" }}>
                        Show per page:
                      </span>
                    </Text>
                    <Select
                      value={size}
                      onChange={handlePageSizeChange}
                      data={PAGE_SIZE_OPTIONS}
                      style={{ width: 80, height: 40 }}
                    />
                  </Group>
                  <Pagination
                    color="blue"
                    page={activePage}
                    onChange={handleChange}
                    total={totalPages}
                  />
                </Group>
              </Center>
            </ScrollArea>
            <Modal
              opened={openedDelete}
              onClose={() => setOpenedDelete(false)}
              title="Warning"
              centered
            >
              <p>Are you sure do you want to delete this Driver?</p>
              <Group position="right">
                <Button onClick={() => deleteDriver()} color="red">
                  Delete
                </Button>
              </Group>
            </Modal>
          </Card>
        </div>
      </Tabs.Panel>
    </Tabs>
  );
};

export default Drivers;
