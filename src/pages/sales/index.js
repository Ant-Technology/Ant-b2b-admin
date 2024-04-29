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
  Modal,
} from "@mantine/core";
import { Edit, Trash } from "tabler-icons-react";
import axios from "axios";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import ManageDepositSlip from "components/Wallet/ManageDepositSlip";
import React, { Fragment, useEffect, useState } from "react";
import { ManualGearbox } from "tabler-icons-react";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { Plus, Search } from "tabler-icons-react";
import { showNotification } from "@mantine/notifications";
import SalesDetailModal from "components/Sales/SalesDetailModal";
import { SalesEditModal } from "components/Sales/SalesUpdateModal";
import { SalesAddModal } from "components/Sales/SalesAddModal";
import { API } from "utiles/url";

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
    color: "rgb(20, 61, 89)",
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
  const [size] = useState(10);
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

  useEffect(() => {
    fetchData(activePage);
  }, [activePage]);

  const fetchData = async (page) => {
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${API}/sales?page=${page}`,
        config
      );
      if (response.data) {
        setDrivers(response.data.data);
        setSortedData(response.data.data); // Ensure sorting is applied when data is fetched
        setTotal(response.data?.links);
        setTotalPages(response.data.last_page);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(drivers, {
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
  };

  const handleSort = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(drivers, { sortBy: field, reversed, search }));
  };
  const handleEditSales = (id, row) => {
    setOpenedEdit(true);
    setEditId(id);
    setEditRow(row);
  };
  const [isHovered, setIsHovered] = useState(false);
  const handleManageSales = (id) => {
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

  const deleteSales = async () => {
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(
        `${API}/sales/${deleteID}`,
        config
      );
      if (response.data) {
        fetchData(activePage);
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
          <Trash
            color="#ed522f"
            style={{
              cursor: "pointer",
            }}
            size={24}
            onClick={() => handleDelete(`${row.id}`)}
          />
          <Edit
            style={{
              cursor: "pointer",
              marginLeft: "10px",
            }}
            size={24}
            onClick={() => handleEditSales(row.id, row)}
          />
          <ManualGearbox
            style={{
              cursor: "pointer",
              marginLeft: "10px",
            }}
            color="#1971C2"
            size={24}
            onClick={() => handleManageSales(`${row.id}`)}
          />
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
          activePage={activePage}
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
          activePage={activePage}
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
        <SalesDetailModal
       
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
                style={{
                  backgroundColor: "rgba(244, 151, 3, 0.8)",
                  color: "rgb(20, 61, 89)",
                }}
                leftIcon={<Plus size={14} />}
              >
                Add Sales
              </Button>
            </div>
            <div></div>
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
              <tr
                style={{
                  backgroundColor: "rgba(244, 151, 3, 0.8)",
                }}
              >
                
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
                <Th sortable={false}> <span className={classes.thh}>Actions</span></Th>
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
          <Center>
            <div style={{ paddingTop: "12px" }}>
              <Container>
                <Pagination
                  color="blue"
                  page={activePage}
                  onChange={handleChange}
                  total={totalPages}
                />
              </Container>
            </div>
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
