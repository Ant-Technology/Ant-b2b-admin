import { useQuery } from "@apollo/client";
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
  Select,
} from "@mantine/core";
import { Edit, Trash } from "tabler-icons-react";
import { FiEdit, FiEye } from "react-icons/fi";
import axios from "axios";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import ManageDepositSlip from "components/Wallet/ManageDepositSlip";
import React, { Fragment, useEffect, useState } from "react";
import { ManualGearbox } from "tabler-icons-react";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { Plus, Search } from "tabler-icons-react";
import Controls from "components/controls/Controls";
import { API, PAGE_SIZE_OPTIONS } from "utiles/url";
import { X } from "tabler-icons-react"; // Import a close icon

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

const Wallets = () => {
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
  const [loading, setLoading] = useState(false);
  const [Wallets, setWallets] = useState([]);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  useEffect(() => {
    fetchData(size);
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
        `${API}/deposit-slips?page=${activePage}&first=${size}`,
        config
      );
      if (response.data) {
        setWallets(response.data.data);
        setSortedData(response.data.data); // Ensure sorting is applied when data is fetched
        setTotal(response.data?.links);
        setTotalPages(response.data.paginatorInfo.lastPage);
        setLoading(false);
      }
    } catch (error) {
      setLoading(true);
      console.error("Error fetching data:", error);
    }
  };

  const handleSearchChange = async (event) => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${API}/deposit-slips?search=${search}& page=${activePage}&first=${size}`,
        config
      );
      if (response.data) {
        setWallets(response.data.data);
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

  const handleChange = (page) => {
    setActivePage(page);
    fetchData(size);
  };

  const handleSort = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(Wallets, { sortBy: field, reversed, search }));
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
  const handleManageDepositSlip = (id) => {
    setEditId(id);
    setOpenedEdit(true);
  };
  const theme = useMantineTheme();
  const rows = sortedData?.map((row) => (
    <Fragment key={row.id}>
      <tr>
        <td>{row.reference_number}</td>
        <td>
          {row.amount} <span style={{ marginLeft: "7px" }}>ETB</span>
        </td>
        <td>
          {row.confirmed_at
            ? new Date(row.confirmed_at).toLocaleDateString()
            : "Not Confirmed"}
        </td>
        <td>{row.user_type}</td>
        <td>{row.depositable?.name}</td>
        <td>
          {row.confirmed_at ? (
            <Badge variant="light" color="green">
              Approved
            </Badge>
          ) : (
            <Badge variant="light" color="red">
              Not Approved
            </Badge>
          )}
        </td>
        <td>
          <span style={{ marginLeft: "1px" }}>
            <Controls.ActionButton
              color="primary"
              title="View Detail"
              onClick={() => handleManageDepositSlip(`${row.id}`)}
            >
              <FiEye fontSize="medium" />
            </Controls.ActionButton>
          </span>
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
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="right"
        size="40%"
        styles={{
          closeButton: {
            color: "black",
            marginTop: "50px",
          },
        }}
      >
        <ManageDepositSlip
          total={total}
          fetchData={fetchData}
          setTotal={setTotal}
          activePage={size}
          setActivePage={setActivePage}
          setOpenedEdit={setOpenedEdit}
          editId={editId}
        />
      </Drawer>
      <Card shadow="sm" p="lg">
        <ScrollArea>
          <SimpleGrid cols={3}>
            <div></div>
            <div> </div>
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
                <Th
                  sortable={false}
                  onSort={() => handleSort("reference_number")}
                >
                  <span className={classes.th}>Reference Number</span>
                </Th>
                <Th sortable onSort={() => handleSort("amount")}>
                  <span className={classes.th}>Amount</span>
                </Th>
                <Th sortable onSort={() => handleSort("confirmed_at")}>
                  <span className={classes.th}>Date</span>
                </Th>
                <Th sortable onSort={() => handleSort("user_type")}>
                  <span className={classes.th}>User Type</span>
                </Th>
                <Th sortable={false}>
                  <span className={classes.th}>User</span>
                </Th>
                <Th sortable={false}>
                  <span className={classes.th}>Status</span>
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
      </Card>
    </div>
  );
};

export default Wallets;
