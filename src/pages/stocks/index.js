import { useMutation, useQuery } from "@apollo/client";
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
import DriverDetailModal from "components/Driver/DriverDetail";
import { DriverEditModal } from "components/Driver/DriverEditModal";
import { DriverAddModal } from "components/Driver/DriverAddModal";
import { DEL_STOCK } from "apollo/mutuations";
import StockAddModal from "components/Stock/StockAddModal";
import ManageStock from "components/Stock/ManageStock";

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
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `http://157.230.102.54:8081/api/stocks?page=${page}`,
        config
      );
      if (response.data) {
        setLoading(false);
        setDrivers(response.data.data);
        setSortedData(response.data.data); // Ensure sorting is applied when data is fetched
        setTotal(response.data?.links);
        setTotalPages(response.data.last_page);
      }
    } catch (error) {
      setLoading(false);
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
  const handleEditDriver = (id, row) => {
    setOpenedEdit(true);
    setEditId(id);
    setEditRow(row);
  };
  const [isHovered, setIsHovered] = useState(false);
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
  const [delStock] = useMutation(DEL_STOCK);
  const deleteStock = () => {
    delStock({
      variables: { id: deleteID },

      onCompleted(data) {
        fetchData(activePage);
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Stock Deleted Successfully",
        });
      },
      onError(error) {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "red",
          title: "Error",
          message: `${error}`,
        });
      },
    });
  };
  const theme = useMantineTheme();
  const rows = sortedData?.map((row) => (
    <Fragment key={row.id}>
      <tr>
        <td>{row.id}</td>
        <td>{row.warehouse?.name}</td>
        <td>{row.product_sku?.sku}</td>
        <td>{row.quantity}</td>
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
            onClick={() => handleEditDriver(row.id, row)}
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
        title="Editing Stock"
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="bottom"
        size="80%"
      >
        <ManageStock
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpenedEdit={setOpenedEdit}
          editId={editId}
          fetchData={fetchData}
        />
      </Drawer>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Adding Stock"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <StockAddModal
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
          fetchData={fetchData}
          totalPages={totalPages}
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
                style={{
                  backgroundColor: "rgba(244, 151, 3, 0.8)",
                  color: "rgb(20, 61, 89)",
                }}
                leftIcon={<Plus size={14} />}
              >
                Add Stock
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
              <tr style={{ backgroundColor: "#F1F1F1" }}>
                <Th sortable={false} onSort={() => handleSort("id")}>
                  <span className={classes.thh}>ID</span>
                </Th>
                <Th sortable={false} onSort={() => handleSort("name")}>
                  <span className={classes.thh}>Warehouse</span>
                </Th>
                <Th sortable onSort={() => handleSort("email")}>
                  <span className={classes.thh}> Product Sku</span>
                </Th>
                <Th sortable onSort={() => handleSort("quantity")}>
                  <span className={classes.thh}> Quantity </span>
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
          <p>Are you sure do you want to delete this Stock?</p>
          <Group position="right">
            <Button onClick={() => deleteStock()} color="red">
              Delete
            </Button>
          </Group>
        </Modal>
      </Card>
    </div>
  );
};

export default Drivers;
