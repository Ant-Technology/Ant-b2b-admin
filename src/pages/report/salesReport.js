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
  Menu,
  Select,
} from "@mantine/core";

import axios from "axios";
import { customLoader } from "components/utilities/loader";
import React, { Fragment, useEffect, useState } from "react";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { API, formatNumber, PAGE_SIZE_OPTIONS } from "utiles/url";
import { DatePicker } from "@mantine/dates";
import ProductFilter from "./product";
import RetailerFilter from "./retailer";
import WarehouseFilter from "./warehouse";
import { Box } from "@mui/material";
const headers = [
  "SKU",
  "Product Name",
  "Quantity",
  "Unit Price",
  "Subtotal",
  "Warehouse",
  "Warehouse Region",
  "Date",
  "Retailer",
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
  const [opened, setOpened] = useState(false);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Sales Report", pageWidth / 2, 20, { align: "center" });

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
      row.productSku || "N/A",
      row.productName || "N/A",
      row.quantity || 0,
      row.unitPrice || 0,
      row.subtotal || 0,
      row.warehouse || "N/A",
      row.warehouseRegion || "N/A",
      row.date || "N/A",
      row.retailer || "N/A",
    ]);

    doc.autoTable({
      startY: 35,
      head: [headers],
      body: bodyData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 106, 0], textColor: [255, 255, 255] }, // Updated header color
    });
    const finalY = doc.lastAutoTable.finalY || 10;
    doc.text(
      `Total Price: ${formatNumber(
        sortedData.reduce((sum, item) => {
          return sum + item.subtotal;
        }, 0)
      )}`,
      doc.internal.pageSize.getWidth() - 20,
      finalY + 10,
      { align: "right" }
    );

    const exportedDate = `Exported Date: ${new Date().toLocaleString()}`;
    doc.setFontSize(10);
    doc.text(exportedDate, pageWidth - 14, pageHeight - 10, { align: "right" });

    doc.save("sales_report.pdf");
  };

  const exportToExcel = () => {
    const bodyData = sortedData.map((row) => ({
      SKU: row.productSku,
      ProductName: row.productName,
      Quantity: row.quantity,
      UnitPrice: row.unitPrice,
      Subtotal: row.subtotal,
      Warehouse: row.warehouse,
      WarehouseRegion: row.warehouseRegion,
      Date: row.date,
      Retailer: row.retailer,
    }));
    bodyData.push({
      SKU: "Total Price",
      ProductName: formatNumber(
        sortedData.reduce((sum, item) => {
          return sum + item.subtotal;
        }, 0)
      ),
      Quantity: "",
      UnitPrice: "",
      Subtotal: "",
      Warehouse: "",
      WarehouseRegion: "",
      Date: "",
      Retailer: "",
    });
    const worksheet = XLSX.utils.json_to_sheet(bodyData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    XLSX.writeFile(workbook, "sales_report.xlsx");
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
            warehouse ||
            product ||
            retailer) && (
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
                  <td colSpan={9}>
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
              Total Price:{" "}
              {formatNumber(
                sortedData.reduce((sum, item) => {
                  return sum + item.subtotal;
                }, 0)
              )}
            </div>
          </Box>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default SalesReport;
