import {
  ScrollArea,
  Button,
  LoadingOverlay,
  useMantineTheme,
  Drawer,
  Modal,
  Group,
  Card,
} from "@mantine/core";
import {  useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { DEL_REGION } from "apollo/mutuations";
import {  GET_REGIONS } from "apollo/queries";
import React, { useState } from "react";
import { Edit, Trash } from "tabler-icons-react";
import { customLoader } from "components/utilities/loader";
import B2bTable from "components/reusable/b2bTable";
import RegionEditModal from "components/Region/regionEditModal";
import RegionsAddModal from "components/Region/regionsAddModal";

const Regions = () => {
  const [size] = useState(10);
  const [opened, setOpened] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);

  //pagination states
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const { data, loading } = useQuery(GET_REGIONS, {
    variables: {
      first: size,
      page: activePage,
    },
  });

  if (!total && data) {
    setTotal(data.regions.paginatorInfo.lastPage);
  }

  const handleChange = (currentPage) => {
    setActivePage(currentPage);
  };

  // const [getWarehouse, { loading: singleWarehouseLoading }] =
  //   useLazyQuery(GET_REGION);

  const [delRegion] = useMutation(DEL_REGION, {
    update(cache, { data: { deleteRegion } }) {
      cache.updateQuery(
        {
          query: GET_REGIONS,
          variables: {
            first: 10,
            page: activePage,
          },
        },
        (data) => {
          if (data.regions.data.length === 1) {
            setTotal(total - 1);
            setActivePage(activePage - 1);
          } else {
            return {
              regions: {
                data: [
                  ...data.regions.data.filter(
                    (region) => region.id !== deleteRegion.id
                  ),
                ],
              },
            };
          }
        }
      );
    },
  });

  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };

  const deleteRegion = () => {
    delRegion({
      variables: { id: deleteID },
      refetchQueries: [
        {
          query: GET_REGIONS,
          variables: {
            first: 10,
            page: 1,
          },
        },
      ],
      onCompleted(data) {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Product Deleted Successfully",
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

  const handleEditRegion = (id) => {
    setOpenedEdit(true);
    setEditId(id);
  };
  const headerData = [
    {
      label: "id",
      key: "id",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.id}</span>;
      },
    },
    {
      label: "Name",
      key: "name",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.name}</span>;
      },
    },
    {
      label: "Retailers",
      key: "retailersCount",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.retailersCount}</span>;
      },
    },
    {
      label: "Drivers",
      key: "driversCount",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.driversCount}</span>;
      },
    },
    {
      label: "Warehouse",
      key: "warehousesCount",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.warehousesCount}</span>;
      },
    },
    {
      label: "Distributor",
      key: "distributorsCount",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.distributorsCount}</span>;
      },
    },
   
    {
      label: "Actions",
      key: "actions",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return (
          <>
            <Trash color="#ed522f" size={24} onClick={() => handleDelete(`${rowData.id}`)} />
            <Edit  size={24} onClick={() => handleEditRegion(`${rowData.id}`)} />
          </>
        );
      },
    },
  ];

  const optionsData = {
    actionLabel: "Add Region",
    setAddModal: setOpened,
  };

  const theme = useMantineTheme();

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
        title="Editing a Region"
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="bottom"
        size="80%"
      >
        <RegionEditModal
          setOpenedEdit={setOpenedEdit}
          editId={editId}
          // openedEdit={openedEdit}
          // loading={singleWarehouseLoading}
          // getWarehouse={getWarehouse}
        />
      </Drawer>

      <Modal
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Warning"
        centered
      >
        <p>Are you sure do you want to delete this region?</p>
        <Group position="right">
          <Button onClick={() => deleteRegion()} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Adding a Region"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <RegionsAddModal
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
        />
      </Drawer>

      <Card shadow="sm" p="lg">
        <ScrollArea>
          <B2bTable
            total={total}
            activePage={activePage}
            handleChange={handleChange}
            header={headerData}
            optionsData={optionsData}
            loading={loading}
            data={data ? data.regions.data : []}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Regions;
