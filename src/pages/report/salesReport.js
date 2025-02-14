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
import { DatePicker } from "@mantine/dates";
import ProductFilter from "./product";
import RetailerFilter from "./retailer";
import WarehouseFilter from "./warehouse";

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
    width: 15,
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
        <Group position="apart" spacing={5}>
          {" "}
          {/* Adjusted spacing here */}
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

const SalesReport = () => {
  const [size, setSize] = useState("10");
  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1);
    fetchData(newSize);
  };
  const { classes } = useStyles();
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [product, setSetProduct] = useState(null);
  const [retailer, setSetRetailer] = useState(null);
  const [warehouse, setSetWarhouse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  const [sortedData, setSortedData] = useState([]);
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
        `${API}/reports/sales?page=${activePage}&first=${size}`,
        config
      );
      if (response.data) {
        setLoading(false);
        setDrivers(response.data.salesTransactions.data);
        setSortedData(response.data.salesTransactions.data);
        setTotal(response.data.salesTransactions.pagination?.links);
        setTotalPages(response.data.salesTransactions.pagination.last_page);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };
  const handleFilter = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const startDate = selectedStartDate
        ? selectedStartDate.toISOString().slice(0, 10)
        : "";
      const endDate = selectedEndDate
        ? selectedEndDate.toISOString().slice(0, 10)
        : "";

      const response = await axios.get(
        `${API}/reports/sales?period=${
          timeRange ? timeRange : "custom"
        }&startDate=${startDate}&endDate=${endDate}&product=${product}&warehouse=${warehouse}&retailer=${retailer}&page=${activePage}&first=${size}`,
        config
      );

      if (response.data) {
        setLoading(false);
        setDrivers(response.data.salesTransactions.data);
        setSortedData(response.data.salesTransactions.data);
        setTotal(response.data.salesTransactions.pagination?.links);
        setTotalPages(response.data.salesTransactions.pagination.last_page);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const handleReset = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setSetProduct(null);
    setTimeRange(null);
    setSetRetailer(null);
    setSetWarhouse(null);
    fetchData(size);
  };
  const handleChange = (page) => {
    if (
      timeRange ||
      selectedEndDate ||
      selectedStartDate ||
      warehouse ||
      product ||
      retailer
    ) {
      setActivePage(page);
      handleFilter();
    } else {
      setActivePage(page);
      fetchData(size);
    }
  };
  const rows = sortedData?.map((row) => (
    <Fragment key={row.id}>
      <tr>
        <td style={{ width: "80px" }}>{row.productSku}</td>
        <td style={{ width: "120px" }}>{row.productName}</td>
        <td style={{ width: "20px" }}>{row.quantity}</td>
        <td style={{ width: "30px" }}>{row.unitPrice}</td>
        <td style={{ width: "70px" }}>{row.subtotal}</td>
        <td style={{ width: "100px" }}>{row.warehouse}</td>
        <td style={{ width: "100px" }}>{row.warehouseRegion}</td>
        <td style={{ width: "100px" }}>{row.date}</td>
        <td style={{ width: "100px" }}>{row.retailer}</td>
      </tr>
    </Fragment>
  ));
  return (
    <div style={{ width: "98%", margin: "auto" }}>
      <LoadingOverlay
        visible={loading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />

      <div>
        <SimpleGrid cols={6}>
          <div>
            <Select
              data={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "annual", label: "Annual" },
              ]}
              value={timeRange}
              onChange={setTimeRange}
              label="Select Period"
              placeholder="Select Range"
              withinPortal
              clearable
            />
          </div>
          <div>
            <DatePicker
              value={selectedStartDate}
              onChange={setSelectedStartDate}
              placeholder="Pick a date"
              label="Select Start Date"
              clearable
            />
          </div>
          <div>
            <DatePicker
              value={selectedEndDate}
              onChange={setSelectedEndDate}
              placeholder="Pick a date"
              label="Select End Date"
              clearable
            />
          </div>
          <div>
            <ProductFilter category={product} onCardClick={setSetProduct} />
          </div>
          <div>
            <RetailerFilter category={retailer} onCardClick={setSetRetailer} />
          </div>
          <div>
            <WarehouseFilter
              category={warehouse}
              onCardClick={setSetWarhouse}
            />
          </div>
        </SimpleGrid>
        {(timeRange ||
          selectedEndDate ||
          selectedStartDate ||
          warehouse ||
          product ||
          retailer) && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "10px",
            }}
          >
            <Button
              onClick={handleReset}
              style={{
                width: "80px",
                marginRight: "10px",
                backgroundColor: "#FF6A00",
                color: "#FFFFFF",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFilter}
              style={{
                width: "80px",
                backgroundColor: "#FF6A00",
                color: "#FFFFFF",
              }}
            >
              Filter
            </Button>
          </div>
        )}
      </div>
      <Card shadow="sm" p="lg">
        <ScrollArea>
          <Table
            highlightOnHover
            horizontalSpacing="md"
            verticalSpacing="xs"
            sx={{ minWidth: 700, marginTop: "10px" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#F1F1F1" }}>
                <Th>
                  <span className={classes.thh}> Sku </span>
                </Th>
                <Th>
                  <span className={classes.thh}> Product Name</span>
                </Th>
                <Th>
                  <span className={classes.thh}>Price</span>
                </Th>
                <Th>
                  <span className={classes.thh}>Quantity</span>
                </Th>
                <Th>
                  <span className={classes.thh}>SubTotal </span>
                </Th>
                <Th>
                  <span className={classes.thh}>Warehouse</span>
                </Th>
                <Th sortable={false}>
                  <span className={classes.thh}>Warehouse Region</span>
                </Th>
                <Th>
                  <span className={classes.thh}>Date</span>
                </Th>
                <Th>
                  <span className={classes.thh}>Retailer</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {rows?.length > 0 ? (
                rows
              ) : (
                <tr>
                  <td colSpan={10}>
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

export default SalesReport;
