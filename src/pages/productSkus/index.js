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
import { FiEdit, FiEye } from "react-icons/fi";
import EditIcon from '@mui/icons-material/Edit';

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
import { DEL_PRODUCT_SKU, DEL_STOCK } from "apollo/mutuations";
import StockAddModal from "components/Stock/StockAddModal";
import ManageStock from "components/Stock/ManageStock";
import ProductSkuAddModal from "components/ProductSku/ProductSkuAddModal";
import ProductSkuEditModal from "components/ProductSku/ProductSkuEditModal";
import Controls from "components/controls/Controls";
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
        `${API}/product-skus?page=${page}`,
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
  const [delProductSku, { loading: delLoading }] = useMutation(DEL_PRODUCT_SKU);

  const deleteSku = () => {
    delProductSku({
      variables: { id: deleteID },
      onCompleted(data) {
        fetchData(activePage);
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Product variant Deleted!",
        });
      },
      onError(data) {
        setOpenedDelete(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Product variant Not Deleted!",
        });
      },
    });
  };
  const handleEdit = (id) => {
    setOpenedEdit(true);
    setEditId(id);
  };

  const theme = useMantineTheme();
  const rows = sortedData?.map((row) => (
    <Fragment key={row.id}>
      <tr>
        <td>{row.id}</td>
        <td>{row.sku}</td>
        <td>{row.variants?.length}</td>
        <td>{row.product?.name.en}</td>
        <td>{row.product?.category?.name.en}</td>
        <td>{row.order_items_count}</td>
        <td>{row.price}</td>
        <td>
          {row.is_active === 1 ? (
            <Badge variant="light" color="green">
              Active
            </Badge>
          ) : (
            <Badge variant="light" color="red">
              Not Active
            </Badge>
          )}
        </td>
        <td>
        <Controls.ActionButton
              color="primary"
              title="Update"
              onClick={() => handleEdit(`${row.id}`)}
            >
              <EditIcon style={{ fontSize: '1rem' }}/>
            </Controls.ActionButton>
          
            <Controls.ActionButton
              color="primary"
              title="Delete"
              onClick={() => handleDelete(`${row.id}`)}
            >
              <Trash size={17} />
            </Controls.ActionButton>
          
        </td>
      </tr>
    </Fragment>
  ));

  return loading ? (
    <LoadingOverlay
      visible={loading || delLoading}
      color="blue"
      overlayBlur={2}
      loader={customLoader}
    />
  ) : (
    <div style={{ width: "98%", margin: "auto" }}>
      <Drawer
        opened={openedEdit}
        onClose={() => setOpenedEdit(false)}
        title="Editing Product Variant"
        padding="xl"
        size="60%"
        position="bottom"
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
      >
        <ProductSkuEditModal
          setOpenedEdit={setOpenedEdit}
          editId={editId}
          fetchData={fetchData}
          activePage={activePage}
        />
      </Drawer>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Adding Product Variant"
        padding="xl"
        size="60%"
        position="bottom"
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
      >
        <ProductSkuAddModal
          total={total}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
          fetchData={fetchData}
          totalPages={totalPages}
        />
      </Drawer>

      <Card shadow="sm" p="lg">
        <ScrollArea>
          <SimpleGrid cols={3}>
            <div>
              <Button
                onClick={() => setOpened(true)}
                style={{ backgroundColor: "#FF6A00", color: "#FFFFFF" }}
                leftIcon={<Plus size={14} />}
              >
                Add Product Sku
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
              <tr>
                <Th sortable={false} onSort={() => handleSort("id")}>
                  ID
                </Th>
                <Th sortable={false} onSort={() => handleSort("name")}>
                  SKU
                </Th>
                <Th sortable={false} onSort={() => handleSort("email")}>
                  Variant
                </Th>
                <Th sortable={false} onSort={() => handleSort("phone")}>
                  Product Name
                </Th>
                <Th sortable={false} onSort={() => handleSort("email")}>
                  Category
                </Th>
                <Th sortable={false} onSort={() => handleSort("phone")}>
                  Order Count
                </Th>
                <Th sortable={false} onSort={() => handleSort("email")}>
                  Price
                </Th>
                <Th sortable={false} onSort={() => handleSort("phone")}>
                  Is Active
                </Th>
                <Th sortable={false}>Actions</Th>
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
          <p>Are you sure do you want to delete this Product variant?</p>
          <Group position="right">
            <Button onClick={() => deleteSku()} color="red">
              Delete
            </Button>
          </Group>
        </Modal>
      </Card>
    </div>
  );
};

export default Drivers;
