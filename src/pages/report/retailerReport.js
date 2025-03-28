import "jspdf-autotable";
import jsPDF from "jspdf";
import * as XLSX from "xlsx"; // Import the xlsx library
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
  Select,
  Menu,
} from "@mantine/core";
import { FiEdit, FiEye } from "react-icons/fi";
import axios from "axios";
import { customLoader } from "components/utilities/loader";
import React, { Fragment, useEffect, useState } from "react";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { API, PAGE_SIZE_OPTIONS, PAGE_SIZE_OPTIONS_REPORT } from "utiles/url";
import Controls from "components/controls/Controls";
import { DatePicker } from "@mantine/dates";
import OrdersDetailModal from "./orders";

const columns = [
  { header: "Name", dataKey: "name" },
  { header: "Email", dataKey: "contact_email" },
  { header: "Phone", dataKey: "contact_phone" },
  { header: "Address", dataKey: "address" },
  { header: "Region", dataKey: "region.name.en" },
];

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

const RetailerReport = () => {
  const { classes } = useStyles();
  const [size, setSize] = useState("50");
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [timeRange, setTimeRange] = useState(null);
  const [status, setStatus] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [sortedData, setSortedData] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData(size, activePage);
  }, [size, activePage]);

  const fetchData = async (size, page) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${API}/reports/retailers?page=${page}&first=${size}`,
        config
      );
      if (response.data) {
        setLoading(false);
        setSortedData(response.data.retailerActivity.data);
        setTotalPages(response.data.retailerActivity.last_page);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1); // Reset to first page on size change
    fetchData(newSize, 1);
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const formatLocalDate = (date, hours, minutes, seconds, ms) => {
        const d = new Date(date);
        d.setHours(hours, minutes, seconds, ms);
        const year = d.getFullYear();
        const month = `${d.getMonth() + 1}`.padStart(2, '0');
        const day = `${d.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
  
      const startDate = selectedStartDate
        ? formatLocalDate(selectedStartDate, 0, 0, 0, 0)
        : "";
  
      const endDate = selectedEndDate
        ? formatLocalDate(selectedEndDate, 23, 59, 59, 999)
        : "";
  
      const response = await axios.get(
        `${API}/reports/retailers?period=${
          timeRange ? timeRange : "custom"
        }&startDate=${startDate}&endDate=${endDate}&status=${status}page=${activePage}&first=${size}`,
        config
      );
      if (response.data) {
        setLoading(false);
        setSortedData(response.data.retailerActivity.data);
        setTotalPages(response.data.retailerActivity.last_page);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const handleReset = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setStatus(null);
    setTimeRange(null);
    fetchData(size, activePage);
  };

  const handleChange = (page) => {
    setActivePage(page);
    if (timeRange || selectedEndDate || selectedStartDate || status) {
      handleFilter();
    } else {
      fetchData(size, page);
    }
  };

  const theme = useMantineTheme();
  const handleDetail = (item) => {
    setOpenedDetail(true);
    setData(item);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Retailer Report", pageWidth / 2, 20, { align: "center" });

    let subtitle = "Date: ";
    if (selectedStartDate && selectedEndDate) {
      const startDate = selectedStartDate.toISOString().slice(0, 10);
      const endDate = selectedEndDate.toISOString().slice(0, 10);
      subtitle += `${startDate} - ${endDate}`;
    } else {
      subtitle += "All Date";
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(subtitle, pageWidth / 2, 28, { align: "center" });

    const headers = columns.map((col) => col.header);
    const bodyData = sortedData.map((row) => [
      row.name || "N/A",
      row.contact_email || "N/A",
      row.contact_phone || "N/A",
      row.address || "N/A",
      row.region?.name?.en || "N/A",
      Array.isArray(row.orders) ? row.orders.length : 0,
    ]);

    doc.autoTable({
      startY: 35,
      head: [headers],
      body: bodyData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 106, 0], textColor: [255, 255, 255] },
    });

    const exportedDate = `Exported Date: ${new Date().toLocaleString()}`;
    doc.setFontSize(10);
    doc.text(exportedDate, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: "right" });

    doc.save("retailer_report.pdf");
  };

  const exportToExcel = () => {
    const bodyData = sortedData.map((row) => ({
      Name: row.name,
      Email: row.contact_email,
      Phone: row.contact_phone,
      Address: row.address,
      Region: row.region.name.en,
      Orders: row.orders.length,
    }));

    const worksheet = XLSX.utils.json_to_sheet(bodyData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Retailers");
    XLSX.writeFile(workbook, "retailer_report.xlsx");
  };

  const rows = sortedData?.map((row) => (
    <Fragment key={row.id}>
      <tr>
        <td>{row.name}</td>
        <td>{row.contact_email}</td>
        <td>{row.contact_phone}</td>
        <td>{row.address}</td>
        <td>{row.region.name.en}</td>
        <td>{row.orders.length}</td>
        <td>
          <Controls.ActionButton
            color="primary"
            title="View Detail"
            onClick={() => handleDetail(row.orders)}
          >
            <FiEye fontSize="medium" />
          </Controls.ActionButton>
        </td>
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
        <SimpleGrid cols={4}>
          <div>
            <Select
              data={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "annual", label: "Annual" },
              ]}
              value={timeRange}
              onChange={(value) => {
                setTimeRange(value);
                if (value === null) {
                  fetchData(size, activePage);
                }
              }}              label="Select Period"
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
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              value={status}
              onChange={(value) => {
                setStatus(value);
                if (value === null) {
                  fetchData(size, activePage);
                }
              }}
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
          {(timeRange || selectedEndDate || selectedStartDate || status) && (
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
            trigger="hover"
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

      <Drawer
        opened={openedDetail}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Retailer Orders Detail"
        padding="xl"
        onClose={() => setOpenedDetail(false)}
        position="bottom"
        size="80%"
      >
        <OrdersDetailModal data={data} />
      </Drawer>
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
                {columns.map((col) => (
                  <Th key={col.dataKey}>
                    <span className={classes.thh}>{col.header}</span>
                  </Th>
                ))}
                <Th>
                  <span className={classes.thh}>Action</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {rows?.length > 0 ? (
                rows
              ) : (
                <tr>
                  <td colSpan={columns.length + 1}>
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
                  data={PAGE_SIZE_OPTIONS_REPORT}
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

export default RetailerReport;