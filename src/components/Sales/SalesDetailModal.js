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
} from "@mantine/core";
import { useQuery } from "@apollo/client";
import { customLoader } from "components/utilities/loader";
import { GET_REGIONS } from "apollo/queries";
import { useViewportSize } from "@mantine/hooks";
import axios from "axios";
import { API } from "utiles/url";
import { showNotification } from "@mantine/notifications";
import { createStyles } from "@mantine/core";

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

function SalesDetailModal({ Id }) {
  const { classes } = useStyles();
  const [sales, setSales] = useState();
  const [productLoading, setProductLoading] = useState(false);
  const [regionsDropDownData, setRegionsDropDownData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedRegionName, setSelectedRegionName] = useState("");

  useEffect(() => {
    fetchData();
  }, [Id]);

  const fetchData = async () => {
    setProductLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${API}/sales/${Id}`, config);
      if (data) {
        setProductLoading(false);
        setSales(data.data);
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
    console.log("Selected region ID:", val); // Log selected region
    const selectedRegionObj = regionsDropDownData.find(
      (region) => region.value === val
    );
    // Ensure selectedRegionName is set correctly
    setSelectedRegionName(selectedRegionObj ? selectedRegionObj.label : "");
  };

  // Log the filtered retailers
  const filteredRetailers = selectedRegion
    ? sales?.retailers?.filter((item) => {
        console.log("Item region ID:", item.region_id); // Log each item's region_id
        console.log("Comparing with selected region:", selectedRegion); // Log selected region
        return item.region_id === Number(selectedRegion); // Ensure the comparison is consistent
      })
    : sales?.retailers;

  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
      <div style={{ width: "98%", margin: "auto" }}>
        <LoadingOverlay
          visible={productLoading}
          color="blue"
          overlayBlur={2}
          loader={customLoader}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            p: 1,
            m: 1,
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
        >
          <Card style={{ width: "40%" }} shadow="sm" radius="md" withBorder>
            <div style={{ paddingLeft: "20px" }}>
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
        </Box>
        <Card style={{ marginTop: "30px" }} shadow="sm" p="lg">
          <ScrollArea>
            <Text size="md" weight={500} className={classes.diff}>
              <span>Retailers</span>
            </Text>
              <Select
                data={regionsDropDownData}
                searchable
                clearable
                onChange={setRegionDropDownValue}
                label="Region"
                placeholder="Pick a region to filter"
                style={{ width: "240px" }}
              />
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
                {filteredRetailers?.map((item) => (
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
          </ScrollArea>
        </Card>
      </div>
    </ScrollArea>
  );
}

export default SalesDetailModal;
