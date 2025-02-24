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
  Select,
} from "@mantine/core";
import { FiEdit, FiEye } from "react-icons/fi";
import EditIcon from "@mui/icons-material/Edit";

import { Edit, ManualGearbox, Trash } from "tabler-icons-react";
import axios from "axios";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import ManageDepositSlip from "components/Wallet/ManageDepositSlip";
import React, { Fragment, useEffect, useState } from "react";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { Plus, Search } from "tabler-icons-react";
import { showNotification } from "@mantine/notifications";
import SalesDetailModal from "components/Sales/SalesDetailModal";
import { SalesEditModal } from "components/Sales/SalesUpdateModal";
import { SalesAddModal } from "components/Sales/SalesAddModal";
import { API, PAGE_SIZE_OPTIONS } from "utiles/url";
import Controls from "components/controls/Controls";

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
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);

  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [editRow, setEditRow] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [size, setSize] = useState("10");
  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1);
    fetchData(newSize);
  };
  useEffect(() => {
    fetchData(size);
  }, []);

  const fetchData = async (size) => {
    setLoading(true)
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API}/sales?page=${activePage}&first=${size}`, config);
      if (response.data) {
        setLoading(false)
        setDrivers(response.data.data);
        setSortedData(response.data.data); // Ensure sorting is applied when data is fetched
        setTotal(response.data?.links);
        setTotalPages(response.data.paginatorInfo.lastPage);
      }
    } catch (error) {
      setLoading(false)
      console.error("Error fetching data:", error);
    }
  };

  const handleSearchChange = async(event) => {
    setLoading(true)
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API}/sales?search=${search}&page=${activePage}&first=${size}`, config);
      if (response.data) {
        setLoading(false)
        setDrivers(response.data.data);
        setSortedData(response.data.data); // Ensure sorting is applied when data is fetched
        setTotal(response.data?.links);
        setTotalPages(response.data.paginatorInfo.lastPage);
      }
    } catch (error) {
      setLoading(false)
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
    fetchData(size)
  };

  const handleSort = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(drivers, { sortBy: field, reversed, search }));
  };
  const handleEditSales = (row) => {
    setOpenedEdit(true);
    setEditRow(row);
  };
  const [isHovered, setIsHovered] = useState(false);
  const handleManageSales = (id) => {
    setEditRow(id);
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

  const deleteSales = async () => {
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(`${API}/sales/${deleteID}`, config);
      if (response.data) {
        fetchData(size);
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Sales Deleted Successfully",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setOpenedDelete(false);
      setDeleteID(null);
      showNotification({
        color: "red",
        title: "Error",
        message: `Sales Not Deleted Successfully`,
      });
    }
  };

  const theme = useMantineTheme();
  const rows = sortedData?.map((row) => (
    <Fragment key={row.id}>
      <tr>
        <td>{row.name}</td>
        <td>{row.email}</td>
        <td>{row.phone}</td>
        <td>{row.retailers_count}</td>
        <td>
          <>
            <Controls.ActionButton
              color="primary"
              title="Update"
              onClick={() => handleEditSales(row)}
            >
              <EditIcon style={{ fontSize: "1rem" }} />
            </Controls.ActionButton>
            <span style={{ marginLeft: "1px" }}>
              <Controls.ActionButton
                color="primary"
                title="View Detail"
                onClick={() => handleManageSales(row)}
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
          </>
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
        opened={openedEdit}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Editing a Sales"
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="bottom"
        size="80%"
      >
        <SalesEditModal
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
        title="Adding a Sales"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <SalesAddModal
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
        title="Sales Detail"
        padding="xl"
        onClose={() => setOpenedDetail(false)}
        position="bottom"
        size="80%"
      >
        <SalesDetailModal sales={editRow} />
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
                Add Sales
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
                  search && ( // Show clear icon only if there's text in the input
                    <UnstyledButton
                      onClick={() => {
                        setSearch(""); // Clear the search input
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
            sx={{ tableLayout: "fixed", minWidth: 700 }}
          >
            <thead>
              <tr style={{ backgroundColor: "#F1F1F1" }}>
                <Th sortable onSort={() => handleSort("name")}>
                  <span className={classes.thh}> Name </span>
                </Th>
                <Th sortable onSort={() => handleSort("email")}>
                  <span className={classes.thh}> Email</span>
                </Th>
                <Th sortable onSort={() => handleSort("phone")}>
                  <span className={classes.thh}> Phone</span>
                </Th>
                <Th sortable onSort={() => handleSort("retailers_count")}>
                  <span className={classes.thh}> Retailers Count</span>
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
          <p>Are you sure do you want to delete this Sales?</p>
          <Group position="right">
            <Button onClick={() => deleteSales()} color="red">
              Delete
            </Button>
          </Group>
        </Modal>
      </Card>
    </div>
  );
};

export default Drivers;
