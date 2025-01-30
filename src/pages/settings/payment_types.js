import React, { Fragment, useState, useEffect } from "react";
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
  Button,
  Modal,
  Avatar,
} from "@mantine/core";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { Plus, Search } from "tabler-icons-react";
import { ManualGearbox, Trash } from "tabler-icons-react";

import Controls from "components/controls/Controls";
import { customLoader } from "components/utilities/loader";
import { useMutation, useQuery } from "@apollo/client";
import { PAYMENT_TYPES } from "apollo/queries";
import PaymentTypeAddModal from "components/PaymentType/addPaymentType";
import PaymentTypeUpdateModal from "components/PaymentType/updatePaymentType";
import { showNotification } from "@mantine/notifications";
import { DEL_PAYMENT_TYPE } from "apollo/mutuations";
const useStyles = createStyles((theme) => ({
  th: {
    padding: "0 !important",
    color: "rgb(20, 61, 89)",
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

const PaymentTypes = () => {
  const { classes } = useStyles();
  const [loadingd, setLoading] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [opened, setOpened] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const { data, loading, refetch } = useQuery(PAYMENT_TYPES, {});
  const [deleteID, setDeleteID] = useState(false);

  useEffect(() => {
    if (data) {
      setSortedData(data.paymentTypesNonPaginated);
      setConfigs(data.paymentTypesNonPaginated);
    }
  }, [data]);

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(configs, {
        sortBy,
        reversed: reverseSortDirection,
        search: value,
      })
    );
  };

  const sortData = (data, payload) => {
    if (!payload.sortBy) {
      return filterData(data, payload.search);
    }

    return filterData(
      [...data].sort((a, b) => {
        if (payload.sortBy === "confirmed_at") {
          const dateA = new Date(a[payload.sortBy]);
          const dateB = new Date(b[payload.sortBy]);
          return payload.reversed ? dateB - dateA : dateA - dateB;
        }

        if (payload.reversed) {
          return b[payload.sortBy].localeCompare(a[payload.sortBy]);
        }

        return a[payload.sortBy].localeCompare(b[payload.sortBy]);
      }),
      payload.search
    );
  };

  const handleSort = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(configs, { sortBy: field, reversed, search }));
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

  const handleEditPayment = (row) => {
    setOpenedEdit(true);
    setEditData(row);
  };
  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };

  const [delPaymentType] = useMutation(DEL_PAYMENT_TYPE, {});
  const deletePaymentType = () => {
    console.log(deleteID);
    delPaymentType({
      variables: { id: deleteID },

      onCompleted(data) {
        setOpenedDelete(false);
        setDeleteID(null);
        refetch();
        showNotification({
          color: "green",
          title: "Success",
          message: "Payment Type Deleted Successfully",
        });
      },
      onError(error) {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "red",
          title: "Error",
          message: `${error}`,
        });
      },
    });
  };

  const theme = useMantineTheme();
  const rows = sortedData?.map((row) => (
    <Fragment key={row.id}>
      <tr>
        <td>{row.name}</td>
        <td>{row.status}</td>
        <td>
          <Avatar src={row.logo} size={70} />
        </td>
        <td>
          {" "}
          <Controls.ActionButton
            color="primary"
            title="Edit"
            onClick={() => handleEditPayment(row)}
          >
            <EditIcon style={{ fontSize: "1rem" }} />
          </Controls.ActionButton>
          <Controls.ActionButton
            color="primary"
            title="Delete"
            onClick={() => handleDelete(row.id)}
          >
            <Trash size={17} />
          </Controls.ActionButton>
        </td>
      </tr>
    </Fragment>
  ));

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
          <Button
            onClick={() => setOpened(true)}
            style={{ backgroundColor: "#FF6A00", color: "#FFFFFF" }}
            leftIcon={<Plus size={14} />}
          >
            Add Payment Type
          </Button>
          <SimpleGrid cols={3}>
            <div></div>
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
          <Drawer
            style={{ marginTop: "10px" }}
            opened={opened}
            onClose={() => setOpened(false)}
            padding="xl"
            size="40%"
            styles={{
              closeButton: {
                color: "black",
                marginTop: "50px",
              }}}
            position="bottom"
          >
            <PaymentTypeAddModal fetchDta={refetch} setOpened={setOpened} />
          </Drawer>
          <Drawer
            style={{ marginTop: "10px" }}
            opened={openedEdit}
            onClose={() => setOpenedEdit(false)}
            padding="xl"
            size="40%"
            position="right"
            styles={{
              closeButton: {
                color: "black",
                marginTop: "50px",
              }}}
          >
            <PaymentTypeUpdateModal
              data={editData}
              fetchDta={refetch}
              setOpened={setOpenedEdit}
            />
          </Drawer>
          <Modal
            opened={openedDelete}
            onClose={() => setOpenedDelete(false)}
            title="Warning"
            centered
          >
            <p>Are you sure do you want to delete?</p>
            <Group position="right">
              <Button onClick={() => deletePaymentType()} color="red">
                Delete
              </Button>
            </Group>
          </Modal>
          <Table
            highlightOnHover
            horizontalSpacing="md"
            verticalSpacing="xs"
            sx={{ tableLayout: "fixed", minWidth: 700 }}
          >
            <thead>
              <tr style={{ backgroundColor: "#F1F1F1" }}>
                <Th sortable onSort={() => handleSort("name")}>
                  <span className={classes.th}>Name</span>
                </Th>
                <Th sortable onSort={() => handleSort("status")}>
                  <span className={classes.th}>Status</span>
                </Th>
                <Th sortable={false}>
                  <span className={classes.th}>Logo</span>
                </Th>
                <Th sortable={false}>
                  <span className={classes.th}>Actions</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {rows?.length > 0 ? (
                rows
              ) : (
                <tr>
                  <td colSpan={4}>
                    <Text weight={500} align="center">
                      Nothing found
                    </Text>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
};
export default PaymentTypes;
