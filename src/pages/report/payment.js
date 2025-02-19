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
  Menu,
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
import { API, formatNumber, PAGE_SIZE_OPTIONS } from "utiles/url";
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

const PaymentReport = () => {
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
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
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
        `${API}/reports/payments-orders?page=${activePage}&first=${size}`,
        config
      );
      if (response.data) {
        setLoading(false);
        setDrivers(response.data.transactionsSummary.data);
        setSortedData(response.data.transactionsSummary.data);
        setTotal(response.data.transactionsSummary?.links);
        setTotalPages(response.data.transactionsSummary.last_page);
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
        `${API}/reports/payments-orders?period=${
          timeRange ? timeRange : "custom"
        }&startDate=${startDate}&endDate=${endDate}&paymentMethod=${selectedMethod}&trans_status=${selectedStatus}&page=${activePage}&first=${size}`,
        config
      );

      if (response.data) {
        setLoading(false);
        setDrivers(response.data.transactionsSummary.data);
        setSortedData(response.data.transactionsSummary.data);
        setTotal(response.data.transactionsSummary?.links);
        setTotalPages(response.data.transactionsSummary.last_page);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const handleReset = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setSelectedMethod(null);
    setTimeRange(null);
    setSelectedStatus(null);
    fetchData(size);
  };
  const handleChange = (page) => {
    if (
      timeRange ||
      selectedEndDate ||
      selectedStartDate ||
      selectedStatus ||
      selectedMethod
    ) {
      setActivePage(page);
      handleFilter();
    } else {
      setActivePage(page);
      fetchData(size);
    }
  };
  const exportToPDF = () => {
    console.log("Exporting to PDF...");
  };

  const exportToExcel = () => {
    console.log("Exporting to Excel...");
  };
  const rows = sortedData?.map((row) => (
    <Fragment key={row.id}>
      <tr>
        <td style={{ width: "80px" }}>{row.payment_method}</td>
        <td style={{ width: "120px" }}>{row.payable_type.split("\\").pop()}</td>
        <td style={{ width: "20px" }}>{row.type}</td>
        <td style={{ width: "30px" }}>{formatNumber(row.amount)}</td>
        <td style={{ width: "70px" }}>{row.status}</td>
        <td style={{ width: "100px" }}>{row.payable.name}</td>
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
        <SimpleGrid cols={5}>
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
            <Select
              data={[
                { value: "TELEBIRR", label: "TELEBIRR" },
                { value: "WALLET", label: "WALLET" },
                { value: "INVOICE", label: "INVOICE" },
                { value: "CASH", label: "CASH" },
              ]}
              value={selectedMethod}
              onChange={setSelectedMethod}
              label="Select Payment Method"
              placeholder="Select Method"
              withinPortal
              clearable
            />{" "}
          </div>
          <div>
            <Select
              data={[
                { value: "CONFIRMED", label: "CONFIRMED" },
                { value: "PENDING", label: "PENDING" },
                { value: "FAILED", label: "FAILED" },
                { value: "REJECTED", label: "REJECTED" },
              ]}
              value={selectedStatus}
              onChange={setSelectedStatus}
              label="Select Status"
              placeholder="Select Status"
              withinPortal
              clearable
            />
          </div>
        </SimpleGrid>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "10px",
            gap: "10px", // Add space between buttons
          }}
        >
          {(timeRange ||
            selectedEndDate ||
            selectedStartDate ||
            selectedStatus ||
            selectedMethod) && (
            <>
              <Button
                onClick={handleReset}
                style={{
                  width: "80px",
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
            </>
          )}

          <Menu
            shadow="md"
            trigger="hover" // Change to "hover" to open on hover
            openDelay={100}
            closeDelay={400}
          >
            <Menu.Target>
              <Button
                style={{
                  width: "80px",
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                }}
              >
                Export
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item onClick={exportToPDF}>PDF</Menu.Item>
              <Menu.Item onClick={exportToExcel}>Excel</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
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
                  <span className={classes.thh}> Method </span>
                </Th>
                <Th>
                  <span className={classes.thh}>User Type</span>
                </Th>
                <Th>
                  <span className={classes.thh}>Type</span>
                </Th>
                <Th>
                  <span className={classes.thh}>Amount </span>
                </Th>
                <Th>
                  <span className={classes.thh}>Status </span>
                </Th>
                <Th>
                  <span className={classes.thh}>User</span>
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

export default PaymentReport;
