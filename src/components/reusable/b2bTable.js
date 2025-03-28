import { useState, useEffect, Fragment } from "react";
import {
  createStyles,
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  LoadingOverlay,
  SimpleGrid,
  Container,
  Pagination,
  Button,
  Tooltip,
  Select,
} from "@mantine/core";
import { X } from "tabler-icons-react";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { customLoader } from "components/utilities/loader";
import { Plus, Search } from "tabler-icons-react";
import { PAGE_SIZE_OPTIONS } from "utiles/url";

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

function Th({ children, reversed, sorted, onSort }) {
  const { classes } = useStyles();
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;
  return (
    <th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group position="apart">
          <Text weight={500} size="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={14} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </th>
  );
}
function filterData(data, search) {
  const query = search.toLowerCase().trim();

  return data.filter((item) => {
    return Object.keys(item).some((key) => {
      const value = item[key];

      if (typeof value === "string") {
        return value.toLowerCase().includes(query);
      }

      if (key === "causer" && value && typeof value === "object") {
        // Specifically check for causer.name
        return value.name?.toLowerCase().includes(query);
      }

      if (typeof value === "object" && value !== null) {
        return Object.values(value).some(
          (val) => typeof val === "string" && val.toLowerCase().includes(query)
        );
      }

      return false;
    });
  });
}

function sortData(data, payload) {
  if (!payload.sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      let aValue = a[payload.sortBy];
      let bValue = b[payload.sortBy];

      // Special case for causer.name
      if (payload.sortBy === "causer") {
        aValue = a.causer?.name || ""; // Get causer.name or empty string
        bValue = b.causer?.name || "";
      }

      const aStr =
        aValue !== null && aValue !== undefined ? String(aValue) : "";
      const bStr =
        bValue !== null && bValue !== undefined ? String(bValue) : "";

      if (payload.sortBy === "cost" || payload.sortBy === "total_price") {
        const aNum = parseFloat(aStr);
        const bNum = parseFloat(bStr);
        return payload.reversed ? bNum - aNum : aNum - bNum;
      } else {
        return payload.reversed
          ? bStr.localeCompare(aStr)
          : aStr.localeCompare(bStr);
      }
    }),
    payload.search
  );
}

const B2bTable = ({
  data,
  header,
  loading,
  optionsData,
  total,
  content,
  activePage,
  handleChange,
  collapsible,
  selectedCollapse,
  setSelectedCollapse,
  size,
  handlePageSizeChange,
  filterData,
  clearFilter,
  dropoffStatus,
  handelSearch,
  clearInput,
  searchValue, // Receive search value from parent
  onSearchChange,
  layout,
}) => {
  const { classes } = useStyles();
  const [localSearch, setLocalSearch] = useState("");

  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState(null);

  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const handleClearSearch = () => {
    setLocalSearch("");
    clearInput();
  };
  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(
      sortData(data, { sortBy: field, reversed, search: searchValue })
    );
  };

  const handleSearchChange = () => {
    handelSearch(searchValue);
  };

  const rows = sortedData.map((row) => (
    <Fragment key={row.id}>
      <tr>
        {header.map((data, index) => (
          <td key={index} style={{ width: "20%" }}>
            {data?.render(row)}
          </td>
        ))}
      </tr>
      {row.id === selectedCollapse && collapsible && content(row)}
    </Fragment>
  ));

  useEffect(() => {
    setSortedData(data);
  }, [data]);
  const handleCategoryFilterClick = (categoryId) => {};
  return (
    <ScrollArea>
      <SimpleGrid cols={3}>
        {optionsData ? (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Button
              onClick={() => optionsData.setAddModal(true)}
              style={{ backgroundColor: "#FF6A00", color: "#FFFFFF" }}
              leftIcon={<Plus size={14} />}
            >
              {optionsData.actionLabel}
            </Button>
            {filterData && (
              <div style={{ flex: 1 }}>
                {filterData({ onCardClick: handleCategoryFilterClick })}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {filterData && (
              <div>
                {filterData({ onCardClick: handleCategoryFilterClick })}
              </div>
            )}
            {clearFilter && dropoffStatus && (
              <Button
                onClick={clearFilter}
                style={{
                  flex: 1,
                  width: "10px",
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                }}
                type="submit"
                color="blue"
              >
                Cancel
              </Button>
            )}
          </div>
        )}
        <div> </div>
        <div className={classes.searchContainer}>
          <TextInput
            className={classes.searchInput}
            placeholder="Search"
            mb="md"
            value={searchValue} // Use prop value
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            rightSection={
              searchValue && (
                <UnstyledButton onClick={handleClearSearch}>
                  {" "}
                  {/* Clear the input */}
                  <X size={16} color="red" />
                </UnstyledButton>
              )
            }
          />
          <button
            className={classes.searchButton}
            onClick={handleSearchChange} // This will not clear the input
          >
            <Search size={16} />
          </button>
        </div>
      </SimpleGrid>
      <Table
        highlightOnHover
        horizontalSpacing="md"
        verticalSpacing="xs"
        sx={{
          ...(layout ? { tableLayout: layout } : { tableLayout: "fixed" }),
          minWidth: 700,
        }}
      >
        <LoadingOverlay
          visible={loading}
          color="blue"
          overlayBlur={2}
          loader={customLoader}
        />
        <thead style={{ backgroundColor: "#F1F1F1" }}>
          <tr>
            {header.map((th, index) => {
              return th.sortable ? (
                <Th
                  key={th.label}
                  sorted={sortBy === th.key}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting(th.key)}
                >
                  <span
                    style={{
                      color: "#666666",
                      fontFamily: "'__Inter_aaf875','__Inter_Fallback_aaf875'",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  >
                    {th.label}
                  </span>
                </Th>
              ) : (
                <th
                  style={{
                    color: "#666666",
                    fontFamily: "'__Inter_aaf875','__Inter_Fallback_aaf875'",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                  }}
                  key={th.label}
                >
                  {th.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td colSpan={header.length}>
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
              onChange={handlePageSizeChange} // Call parent handler for page size change
              data={PAGE_SIZE_OPTIONS}
              style={{ width: 80, height: 40 }}
            />
          </Group>
          <Pagination
            color="blue"
            page={activePage}
            onChange={handleChange}
            total={total}
          />
        </Group>
      </Center>
    </ScrollArea>
  );
};

export default B2bTable;
