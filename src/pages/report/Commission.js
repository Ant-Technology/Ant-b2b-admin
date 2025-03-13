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
  "User",
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

const CommissionPaymentReport = () => {
  const { classes } = useStyles();
  const [size, setSize] = useState("50");
  const [activePage, setActivePage] = useState(1);
  const [driver, setDriver] = useState(null);
  const [total, setTotal] = useState([]);
  const [walletSummary, setWalletSummary] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    if (driver) {
      handleFilter();
    } else {
      fetchData(size, activePage);
    }
  }, [size, activePage, driver]);

  const fetchData = async (size, page) => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${API}/reports/payments-orders?page=${page}&first=${size}&type=Commission`,
        config
      );
      if (response.data) {
        setLoading(false);
        setWalletSummary(response.data.totalAmount);
        setSortedData(response.data.transactionsSummary.data);
        setWalletSummary(response.data.walletSummary.total_net);
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

      const response = await axios.get(
        `${API}/reports/payments-orders?page=${activePage}&first=${size}&type=Commission&driver=${driver}`,
        config
      );

      if (response.data) {
        setLoading(false);
        setWalletSummary(response.data.totalAmount);
        setSortedData(response.data.transactionsSummary.data);
        setTotal(response.data.transactionsSummary?.links);
        setTotalPages(response.data.transactionsSummary.last_page);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (page) => {
    setActivePage(page);
    if (driver) {
      handleFilter();
    } else {
      fetchData(size, page);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Commission Revenue", pageWidth / 2, 20, { align: "center" });

    const bodyData = sortedData.map((row) => [
      row.payment_method || "N/A",
      row.payable_type.split("\\").pop() || "N/A",
      row.type || "N/A",
      formatNumber(row.amount) || 0,
      row.status || "N/A",
      row.payable.name || "N/A",
      new Date(row.created_at).toLocaleString() || "N/A",
    ]);
    doc.autoTable({
      startY: 35,
      head: [headers],
      body: bodyData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 106, 0], textColor: [255, 255, 255] },
    });
    const finalY = doc.lastAutoTable.finalY || 10;
    doc.text(
      `Total Amount: ${formatNumber(walletSummary ? walletSummary : 0)}`,
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

    doc.save("Commission_Revenue.pdf");
  };

  const exportToExcel = () => {
    const bodyData = sortedData.map((row) => ({
      Method: row.payment_method,
      UserType: row.payable_type.split("\\").pop(),
      Type: row.type,
      Amount: formatNumber(row.amount),
      Status: row.status,
      User: row.payable.name,
      Date: new Date(row.created_at).toLocaleString(),
    }));
    bodyData.push({
      Method: "Total Amount",
      UserType: formatNumber(walletSummary ? walletSummary : 0),
      Type: "",
      Amount: "",
      Status: "",
      User: "",
      Date: "",
    });
    const worksheet = XLSX.utils.json_to_sheet(bodyData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "Commission_Revenue.xlsx");
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
        <SimpleGrid cols={3}>
          <DriverFilter
            fetchData={fetchData}
            size={size}
            page={activePage}
            driver={driver}
            onCardClick={setDriver}
          />
          <div>
            <div></div>
            <Menu shadow="md" trigger="hover" openDelay={100} closeDelay={400}>
              <Menu.Target>
                <Button
                  style={{
                    width: "80px",
                    marginTop: "25px",
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
        </SimpleGrid>
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
                  <td colSpan={7}>
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
                  onChange={(newSize) => {
                    setSize(newSize);
                    setActivePage(1); // Reset to first page on page size change
                    fetchData(newSize, 1);
                  }}
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
              Total Amount: {formatNumber(walletSummary ? walletSummary : 0)}
            </div>
          </Box>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default CommissionPaymentReport;
