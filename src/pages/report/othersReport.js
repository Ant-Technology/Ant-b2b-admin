import "jspdf-autotable";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import {
  Card,
  LoadingOverlay,
  ScrollArea,
  createStyles,
  Table,
  UnstyledButton,
  Group,
  Text,
  Center,
  SimpleGrid,
  Pagination,
  Button,
  Select,
  Menu,
  Modal,
} from "@mantine/core";
import axios from "axios";
import { customLoader } from "components/utilities/loader";
import React, { Fragment, useEffect, useState } from "react";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import {
  API,
  formatNumber,
  PAGE_SIZE_OPTIONS,
  PAGE_SIZE_OPTIONS_REPORT,
} from "utiles/url";
import { DatePicker } from "@mantine/dates";
import { Box } from "@mui/material";
import RetailerFilter from "./retailer";
import DriverFilter from "./driver";

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
const headers = [
  "Method",
  "User Type",
  "Type",
  "Amount",
  "Status",
  "From",
  "To",
  "Date",
];
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

const OthersPaymentReport = () => {
  const [size, setSize] = useState("50");
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
  const [retailer, setSetRetailer] = useState(null);

  const [timeRange, setTimeRange] = useState(null);
  const [driver, setSetDriver] = useState(null);
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
        `${API}/reports/payments-orders?page=${activePage}&first=${size}&type=Others`,
        config
      );
      if (response.data) {
        setLoading(false);
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
    setModalOpened(false);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const formatLocalDate = (date, hours, minutes, seconds, ms) => {
        const d = new Date(date);
        d.setHours(hours, minutes, seconds, ms);
        const year = d.getFullYear();
        const month = `${d.getMonth() + 1}`.padStart(2, "0");
        const day = `${d.getDate()}`.padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const startDate = selectedStartDate
        ? formatLocalDate(selectedStartDate, 0, 0, 0, 0)
        : "";

      const endDate = selectedEndDate
        ? formatLocalDate(selectedEndDate, 23, 59, 59, 999)
        : "";

      const response = await axios.get(
        `${API}/reports/payments-orders?period=${
          timeRange ? timeRange : "custom"
        }&dateFrom=${startDate}&dateTo=${endDate}&paymentMethod=${selectedMethod}&trans_status=${selectedStatus}&page=${activePage}&first=${size}&type=Others&retailer=${retailer}&driver=${driver}`,
        config
      );

      if (response.data) {
        setLoading(false);
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
    setSetRetailer(null);
    setSetDriver(null);
    fetchData(size);
  };
  const handleChange = (page) => {
    if (
      timeRange ||
      selectedEndDate ||
      selectedStartDate ||
      selectedStatus ||
      retailer ||
      selectedMethod ||
      driver
    ) {
      setActivePage(page);
      handleFilter();
    } else {
      setActivePage(page);
      fetchData(size);
    }
  };
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Payment Report", pageWidth / 2, 20, { align: "center" });

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

    const bodyData = sortedData.map((row) => [
      row.payment_method || "N/A",
      row.payable_type.split("\\").pop() || "N/A",
      row.type || "N/A",
      formatNumber(row.amount) || 0,
      row.status || "N/A",
      row.payable.name || "N/A",
      row.transaction_transfer?.to?.name || "N/A",
      new Date(row.created_at).toLocaleString() || "N/A",
    ]);
    doc.autoTable({
      startY: 35,
      head: [headers],
      body: bodyData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 106, 0], textColor: [255, 255, 255] }, // Updated header color
    });

    const finalY = doc.lastAutoTable.finalY || 10;
    const totalAmount = sortedData.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );
    doc.text(
      `Total Amount: ${formatNumber(totalAmount)}`,
      pageWidth - 20,
      finalY + 10,
      { align: "right" }
    );

    const exportedDate = `Exported Date: ${new Date().toLocaleString()}`;
    doc.setFontSize(10);
    doc.text(
      exportedDate,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );

    doc.save("payment_report.pdf");
  };

  const exportToExcel = () => {
    const bodyData = sortedData.map((row) => ({
      Method: row.payment_method,
      UserType: row.payable_type.split("\\").pop(),
      Type: row.type,
      Amount: formatNumber(row.amount),
      Status: row.status,
      From: row.payable.name,
      To: row.transaction_transfer?.to?.name,
      Date: new Date(row.created_at).toLocaleString(),
    }));

    const totalAmount = sortedData.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );
    bodyData.push({
      Method: "Total Amount",
      UserType: totalAmount.toFixed(2),
      Type: "",
      Amount: "",
      Status: "",
      From: "",
      To: "",
      Date: "",
    });

    const worksheet = XLSX.utils.json_to_sheet(bodyData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "payment_report.xlsx");
  };
  const [modalOpened, setModalOpened] = useState(false);

  const rows = sortedData?.map((row) => (
    <Fragment key={row.id}>
      <tr>
        <td style={{ width: "80px" }}>{row.payment_method}</td>
        <td style={{ width: "120px" }}>{row.payable_type.split("\\").pop()}</td>
        <td style={{ width: "20px" }}>{row.type}</td>
        <td style={{ width: "30px" }}>{formatNumber(row.amount)}</td>
        <td style={{ width: "70px" }}>{row.status}</td>
        <td style={{ width: "100px" }}>{row.payable.name}</td>
        <td style={{ width: "100px" }}>{row.transaction_transfer?.to?.name}</td>
        <td style={{ width: "100px" }}>
          {new Date(row.created_at).toLocaleString()}
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

      <div style={{ width: "98%", margin: "auto" }}>
        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title="Filter Options"
          size="lg"
          styles={{
            modal: {
              marginTop: "50px",
              marginLeft: "auto", // Align to the right
              marginRight: "0", // Remove right margin
            },
          }}
        >
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
              clearable
            />
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
              clearable
            />
          </div>
          <div>
            <RetailerFilter fetchData={fetchData} size={size} retailer={retailer} onCardClick={setSetRetailer} />
          </div>
          <div>
            <DriverFilter fetchData={fetchData} size={size} driver={driver} onCardClick={setSetDriver} />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginTop: "10px",
              gap: "10px", // Add space between buttons
            }}
          >
            {(timeRange ||
              selectedEndDate ||
              selectedStartDate ||
              selectedStatus ||
              retailer ||
              selectedMethod ||
              driver) && (
              <>
                <Button
                  onClick={handleFilter}
                  style={{
                    width: "20%",
                    backgroundColor: "#FF6A00",
                    color: "#FFFFFF",
                  }}
                >
                  Apply Filters
                </Button>
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
              </>
            )}
          </div>
        </Modal>
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
            retailer ||
            selectedMethod ||
            driver) && (
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
          )}
          <Button
            style={{
              backgroundColor: "#FF6A00",
              color: "#FFFFFF",
              marginBottom: "10px",
            }}
            onClick={() => setModalOpened(true)}
          >
            Open Filters
          </Button>

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
                {headers.map((header) => (
                  <Th key={header}>
                    <span className={classes.thh}>{header}</span>
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows?.length > 0 ? (
                rows
              ) : (
                <tr>
                  <td colSpan={6}>
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

          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              flexDirection: "column",
              p: 1,
              gap: 1,
              m: 1,
              bgcolor: "background.paper",
              borderRadius: 1,
            }}
          >
            <div
              style={{
                marginRight: "35px",
                fontWeight: "bold",
                fontSize: "15px",
              }}
            >
              Total Amount:{" "}
              {formatNumber(
                sortedData.reduce((sum, item) => sum + Number(item.amount), 0)
              )}
            </div>
          </Box>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default OthersPaymentReport;
