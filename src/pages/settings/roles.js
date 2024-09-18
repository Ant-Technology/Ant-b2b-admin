import { useQuery } from "@apollo/client";
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
  Tooltip,
  Modal,
  Tabs,
} from "@mantine/core";
import { Api, Edit, Trash } from "tabler-icons-react";
import { FiEdit, FiEye } from "react-icons/fi";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import ManageDepositSlip from "components/Wallet/ManageDepositSlip";
import React, { Fragment, useEffect, useState } from "react";
import { ManualGearbox } from "tabler-icons-react";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { Plus, Search } from "tabler-icons-react";
import { showNotification } from "@mantine/notifications";
import RoleDetailModal from "components/Role/RoleDetail";
import { DriverEditModal } from "components/Driver/DriverEditModal";
import { RoleAddModal } from "components/Role/AddRole";
import Controls from "components/controls/Controls";
import { API } from "utiles/url";

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
    width: "10%",
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

const Roles = () => {
  const { classes } = useStyles();
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [editRow, setEditRow] = useState();
  const [deleteID, setDeleteID] = useState("");
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API}/roles`, config);
      if (response.data) {
        setRoles(response.data.roles);
        setSortedData(response.data.roles); // Ensure sorting is applied when data is fetched
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(roles, {
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
    setSortedData(sortData(roles, { sortBy: field, reversed, search }));
  };
  const handleEditDriver = (row) => {
    setOpenedEdit(true);
    setEditRow(row);
  };
  const handleManageDriver = (id) => {
    setEditId(id);
    setOpenedDetail(true);
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
  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };

  const deleteRole = async () => {
    console.log(deleteID);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(`${API}/roles/${deleteID}`, config);
      if (response.data) {
        fetchData();
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Role Deleted Successfully",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setOpenedDelete(false);
      setDeleteID(null);
      showNotification({
        color: "red",
        title: "Error",
        message: `Role Not Deleted Successfully`,
      });
    }
  };
  const theme = useMantineTheme();
  const rows = sortedData?.map((row) => (
    <Fragment key={row.id}>
      <tr>
        <td>{row.name}</td>
        <td>{row.guard_name}</td>
        <td>{row.users_count}</td>
        <td>
          {new Date(row?.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </td>
        <td>
          <div style={{ display: "flex" }}>
            <span style={{ marginLeft: "1px" }}>
              <Controls.ActionButton
                color="primary"
                title="View Detail"
                onClick={() => handleManageDriver(`${row.id}`)}
              >
                <FiEye fontSize="medium" />
              </Controls.ActionButton>
            </span>
            <Controls.ActionButton
              color="primary"
              title="Delete"
              onClick={() => handleDelete(`${row.id}`)}
            >
              <Trash size={17} />
            </Controls.ActionButton>
          </div>
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
      <Drawer
        opened={openedEdit}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Editing a Driver"
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="bottom"
        size="80%"
      >
        <DriverEditModal
          fetchData={fetchData}
          editRow={editRow}
          setOpenedEdit={setOpenedEdit}
          editId={editId}
        />
      </Drawer>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Adding a Role"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <RoleAddModal setOpened={setOpened} fetchData={fetchData} />
      </Drawer>
      <Drawer
        opened={openedDetail}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Role Detail"
        padding="xl"
        onClose={() => setOpenedDetail(false)}
        position="bottom"
        size="80%"
      >
        <RoleDetailModal setOpenedDetail={setOpenedDetail} Id={editId} />
      </Drawer>
      <Card shadow="sm" p="lg">
        <ScrollArea>
          <SimpleGrid cols={3}>
            <div>
              <Button
                onClick={() => setOpened(true)}
                variant="blue"
                style={{ backgroundColor: "#FF6A00", color: "#FFFFFF" }}
                leftIcon={<Plus size={14} />}
              >
                Add Role
              </Button>
            </div>
            <div></div>
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
            sx={{ minWidth: 700 }}
          >
            <thead>
              <tr style={{ backgroundColor: "#F1F1F1" }}>
                <Th sortable onSort={() => handleSort("name")}>
                  <span className={classes.thh}> Name </span>
                </Th>
                <Th sortable onSort={() => handleSort("guard_name")}>
                  <span className={classes.thh}> Guard Name</span>
                </Th>
                <Th sortable={false} onSort={() => handleSort("users_count")}>
                  <span className={classes.thh}> Users</span>
                </Th>
                <Th sortable onSort={() => handleSort("created_at")}>
                  {" "}
                  <span className={classes.thh}>Date</span>
                </Th>
                <Th sortable={false}>
                  {" "}
                  <span className={classes.thh}>Actions</span>
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
        </ScrollArea>
        <Modal
          opened={openedDelete}
          onClose={() => setOpenedDelete(false)}
          title="Warning"
          centered
        >
          <p>Are you sure do you want to delete this Role?</p>
          <Group position="right">
            <Button onClick={() => deleteRole()} color="red">
              Delete
            </Button>
          </Group>
        </Modal>
      </Card>
    </div>
  );
};

export default Roles;
