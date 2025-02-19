import {
  Card,
  LoadingOverlay,
  ScrollArea,
  useMantineTheme,
  createStyles,
  Table,
  UnstyledButton,
  Group,
  Text,
  Center,
  Container,
  Pagination,
  Select,
} from "@mantine/core";
import axios from "axios";
import { customLoader } from "components/utilities/loader";
import React, { Fragment, useEffect, useState } from "react";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { API, formatNumber, PAGE_SIZE_OPTIONS } from "utiles/url";

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
  cityColumn: {
    width: "4%",
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

const MinmumBalance = () => {
  const { classes } = useStyles();
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);

  const [sortedData, setSortedData] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [size, setSize] = useState("10");
  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1);
    fetchData(newSize);
  };
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
        `${API}/drivers/list/below_minimum_wallet_balance?page=${activePage}&first=${size}`,
        config
      );
      if (response.data) {
        setDrivers(response.data.data);
        setSortedData(response.data.data);
        setTotal(response.data?.links);
        setTotalPages(response.data.paginatorInfo.lastPage);
        setLoading(false);
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
    fetchData(size);
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
  const rows = sortedData?.map((row) => {
    return (
      <Fragment key={row.id}>
        <tr>
          <td className={classes.idColumn}>{row.id}</td>
          <td>{row.name}</td>
          <td>{row.email}</td>
          <td>{row.phone}</td>
          <td className={classes.cityColumn}>{row.region?.name?.en}</td>
          <td>{row.city}</td>
          <td style={{ width: "10%" }}>
            {row.vehicle?.vehicle_type?.title.en}
          </td>
          <td>{formatNumber(row.wallet?.balance)}</td>
        </tr>
      </Fragment>
    );
  });
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
            sx={{ minWidth: 700 }}
          >
            <thead>
              <tr style={{ backgroundColor: "#F1F1F1" }}>
                <Th sortable={false} onSort={() => handleSort("id")}>
                  <span className={classes.thh}>ID</span>
                </Th>
                <Th sortable={false} onSort={() => handleSort("name")}>
                  <span className={classes.thh}> Name </span>
                </Th>
                <Th sortable onSort={() => handleSort("email")}>
                  <span className={classes.thh}> Email</span>
                </Th>
                <Th sortable onSort={() => handleSort("phone")}>
                  <span className={classes.thh}> Phone</span>
                </Th>
                <Th sortable={false}>
                  {" "}
                  <span className={classes.thh}>Region</span>
                </Th>
                <Th sortable onSort={() => handleSort("email")}>
                  <span className={classes.thh}> City</span>
                </Th>
                <Th sortable={false}>
                  <span className={classes.thh}>Vehicle Type</span>
                </Th>
                <Th sortable={false}>
                  <span className={classes.thh}>Balance</span>
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

export default MinmumBalance;
