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
import { customLoader } from "components/utilities/loader";
import EditIcon from "@mui/icons-material/Edit";
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
import Controls from "components/controls/Controls";
import { API } from "utiles/url";
import StockDetailModal from "components/Stock/StockDetail";
import { FiEdit, FiEye } from "react-icons/fi";
import { X } from "tabler-icons-react"; // Import a close icon

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

const MinmumStock = () => {
  const { classes } = useStyles();
  const [size] = useState(10);
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);

  const [sortedData, setSortedData] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

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
      const response = await axios.get(
        `${API}/stocks?page=${activePage}`,
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
    setSortedData(sortData(drivers, { sortBy: field, reversed }));
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

  const theme = useMantineTheme();
  const rows = sortedData?.map((row) => (
    <Fragment key={row.id}>
      <tr>
        <td className={classes.idColumn}>{row.id}</td>
        <td>{row.warehouse?.name}</td>
        <td>{row.product_sku?.sku}</td>
        <td>{row.quantity}</td>
        <td>{row.minimum_stock_level}</td>
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
      <Card shadow="sm" p="lg">
        <ScrollArea>
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

                <Th sortable onSort={() => handleSort("minimum_stock_level")}>
                  <span className={classes.thh}>Stock Level </span>
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
      </Card>
    </div>
  );
};

export default MinmumStock;
