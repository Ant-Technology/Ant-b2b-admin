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

} from "@mantine/core";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { customLoader } from "components/utilities/loader";
import { Plus, Search } from "tabler-icons-react";

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

  // console.log("data is ", data, search, data, Object.keys(data[0]))
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    Object.keys(item).some(
      (key) => typeof item[key] === "string" && item[key] && item[key].toLowerCase().includes(query)
    )
  );
}

function sortData(data, payload) {
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
}) => {
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  //pagination states

  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(data, { sortBy, reversed: reverseSortDirection, search: value })
    );
  };

  const rows = sortedData.map((row) => (
    <Fragment key={row.id}>
      <tr>
        {header.map((data, index) => (
          <td key={index}>{data?.render(row)}</td>
        ))}
      </tr>
      {row.id === selectedCollapse && collapsible && content(row)}
    </Fragment>
  ));

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  return (
    <ScrollArea>
      <SimpleGrid cols={3}>
        {optionsData ? (
          <div>
            <Button
              onClick={() => optionsData.setAddModal(true)}
              variant="blue"
              color="blue"
              leftIcon={<Plus size={14} />}
            >
              {optionsData.actionLabel}
            </Button>
          </div>
        ) : (
          <div></div>
        )}
        <div> </div>
        <div>
          <TextInput
            placeholder="Search by any field"
            mb="md"
            icon={<Search size={14} />}
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </SimpleGrid>
      <Table
        highlightOnHover
        horizontalSpacing="md"
        verticalSpacing="xs"
        sx={{ tableLayout: "fixed", minWidth: 700 }}
      >
        <LoadingOverlay
          visible={loading}
          color="blue"
          overlayBlur={2}
          loader={customLoader}
        />
        <thead>
          <tr>
            {header.map((th, index) => {
              return th.sortable ? (
                <Th
                  key={th.label}
                  sorted={sortBy === th.key}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting(th.key)}
                >
                  {th.label}
                </Th>
              ) : (
                <th key={th.label}>{th.label}</th>
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
      <Center>
        <div style={{ paddingTop: "12px" }}>
          <Container>
            <Pagination
              color="blue"
              page={activePage}
              onChange={handleChange}
              total={total}
            />
          </Container>
        </div>
      </Center>
    </ScrollArea>
  );
};

export default B2bTable;
