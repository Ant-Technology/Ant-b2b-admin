import { useEffect, useState } from "react";
import {
  Table,
  ScrollArea,
  Card,
  LoadingOverlay,
  Group,
  Text,
  Select,
  Box,
  Menu,
  Button,
  Pagination,
  Center,
} from "@mantine/core";
import "jspdf-autotable";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { useQuery } from "@apollo/client";
import { customLoader } from "components/utilities/loader";
import { GET_REGIONS } from "apollo/queries";
import { useViewportSize } from "@mantine/hooks";
import axios from "axios";
import { API, PAGE_SIZE_OPTIONS_REPORT } from "utiles/url";
import { showNotification } from "@mantine/notifications";
import { createStyles } from "@mantine/core";
const columns = [
  { header: "Name", dataKey: "name" },
  { header: "Email", dataKey: "contact_email" },
  { header: "Phone", dataKey: "contact_phone" },
  { header: "City", dataKey: "city" },
  { header: "Region", dataKey: "region.name.en" },
];
const useStyles = createStyles((theme) => ({
  root: {
    padding: theme.spacing.xl * 1.5,
  },
  value: {
    fontSize: 17,
    fontWeight: 500,
    lineHeight: 1,
  },
  diff: {
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },
}));

function SalesDetailModal({ sales }) {
  const { classes } = useStyles();
  const [retailers, setSetRetailers] = useState();
  const [productLoading, setProductLoading] = useState(false);
  const [regionsDropDownData, setRegionsDropDownData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const [size, setSize] = useState("50");
  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1);
    fetchData(newSize);
  };
  const [activePage, setActivePage] = useState(1);
  useEffect(() => {
    fetchData(size, selectedRegion);
  }, [size, selectedRegion]);

  const fetchData = async (size, regionId = null) => {
    setProductLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const url =
        `${API}/salesperson/${sales.id}/retailers?page=${activePage}&first=${size}` +
        (regionId ? `&region_id=${regionId}` : "");
      const { data } = await axios.get(url, config);

      if (data) {
        setProductLoading(false);
        setSetRetailers(data.data);
        setTotalPages(data.paginatorInfo.lastPage);
      }
    } catch (error) {
      setProductLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const { loading: regionsLoading } = useQuery(GET_REGIONS, {
    variables: {
      first: 100000,
      page: 1,
    },
    onCompleted(data) {
      let regions = data.regions;
      let regionsArray = [];
      regions.data.forEach((region) => {
        regionsArray.push({
          label: region?.name,
          value: region?.id,
        });
      });
      setRegionsDropDownData([...regionsArray]);
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${err}`,
      });
    },
  });

  const { height } = useViewportSize();

  const setRegionDropDownValue = (val) => {
    setSelectedRegion(val);
    fetchData(size, val);
  };

  const handleChange = (page) => {
    setActivePage(page);
    fetchData(size, selectedRegion);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth(); // Get PDF width

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(" Sales Person Report", pageWidth / 2, 20, { align: "center" });

    const headers = columns.map((col) => col.header);
    const bodyData = retailers.map((row) => [
      row.name || "N/A",
      row.contact_email || "N/A",
      row.contact_phone || "N/A",
      row.city || "N/A",
      row.region?.name?.en || "N/A",
    ]);

    doc.autoTable({
      startY: 35,
      head: [headers],
      body: bodyData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 106, 0], textColor: [255, 255, 255] }, // Updated header color
    });
    const pageHeight = doc.internal.pageSize.getHeight();

    const exportedDate = `Exported Date: ${new Date().toLocaleString()}`;

    doc.setFontSize(10);
    doc.text(exportedDate, pageWidth - 14, pageHeight - 10, { align: "right" });

    doc.save("sales_person_report.pdf");
  };

  const exportToExcel = () => {
    const bodyData = retailers.map((row) => ({
      Name: row.name,
      Email: row.contact_email,
      Phone: row.contact_phone,
      City: row.city,
      Region: row.region.name.en,
    }));

    const worksheet = XLSX.utils.json_to_sheet(bodyData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales_retailers");
    XLSX.writeFile(workbook, "Sales_retailers.xlsx");
  };
  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
      <div style={{ width: "98%", margin: "auto" }}>
        <LoadingOverlay
          visible={productLoading || regionsLoading}
          color="blue"
          overlayBlur={2}
          loader={customLoader}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: "20px",
            padding: "10px",
            margin: "10px",
            justifyContent: "space-between", // Space between card and dropdown
            flexWrap: "wrap",
          }}
        >
          <Card style={{ width: "25%" }} shadow="sm" radius="md" withBorder>
            <div>
              <Group align="flex-end" spacing="xs" mt={25}>
                <Text size="sm" weight={500} className={classes.diff}>
                  <span>
                    Name<span style={{ marginLeft: "5px" }}>:</span>
                  </span>
                </Text>
                <Text className={classes.value}>{sales?.name}</Text>
              </Group>
              <Group align="flex-end" spacing="xs" mt={25}>
                <Text size="sm" weight={500} className={classes.diff}>
                  <span>
                    Email<span style={{ marginLeft: "5px" }}>:</span>
                  </span>
                </Text>
                <Text className={classes.value}>{sales?.email}</Text>
              </Group>
              <Group align="flex-end" spacing="xs" mt={25}>
                <Text size="sm" weight={500} className={classes.diff}>
                  <span>
                    Phone<span style={{ marginLeft: "5px" }}>:</span>
                  </span>
                </Text>
                <Text className={classes.value}>{sales?.phone}</Text>
              </Group>
              <Group align="flex-end" spacing="xs" mt={25}>
                <Text size="sm" weight={500} className={classes.diff}>
                  <span>
                    City<span style={{ marginLeft: "5px" }}>:</span>
                  </span>
                </Text>
                <Text className={classes.value}>{sales?.city}</Text>
              </Group>
              <Group align="flex-end" spacing="xs" mt={25}>
                <Text size="sm" weight={500} className={classes.diff}>
                  <span>
                    SubCity <span style={{ marginLeft: "5px" }}>:</span>
                  </span>
                </Text>
                <Text className={classes.value}>{sales?.subcity}</Text>
              </Group>
            </div>
          </Card>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Select
              data={regionsDropDownData}
              searchable
              clearable
              onChange={setRegionDropDownValue}
              label="Region"
              placeholder="Pick a region to filter"
              style={{ width: "240px" }}
            />
            <Menu shadow="md" trigger="hover" openDelay={100} closeDelay={400}>
              <Menu.Target>
                <Button
                  style={{
                    width: "80px",
                    backgroundColor: "#FF6A00",
                    color: "#FFFFFF",
                    marginTop: "25px",
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
          </Box>
        </Box>
        <Card style={{ marginTop: "5px" }} shadow="sm" p="lg">
          <ScrollArea>
            <Table
              horizontalSpacing="md"
              verticalSpacing="xs"
              sx={{ tableLayout: "fixed", minWidth: 600 }}
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>Contact Phone</th>
                  <th>Contact Email</th>
                  <th>Region</th>
                </tr>
              </thead>
              <tbody>
                {retailers?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.address}</td>
                    <td>{item.city}</td>
                    <td>{item.contact_phone}</td>
                    <td>{item.contact_email}</td>
                    <td>{item.region.name.en}</td>
                  </tr>
                ))}
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
    </ScrollArea>
  );
}

export default SalesDetailModal;
