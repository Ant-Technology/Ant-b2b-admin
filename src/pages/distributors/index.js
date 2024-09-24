import { useEffect, useState } from "react";
import {
  ScrollArea,
  Group,
  Card,
  Drawer,
  Button,
  Modal,
  LoadingOverlay,
} from "@mantine/core";
import { Trash, Edit } from "tabler-icons-react";
import {  useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import DistributorAddModal from "components/Distributor/DistributorAddModal";
import DistributorEditModal from "components/Distributor/DistributorEditModal";
import {  GET_DISTRIBUTORS } from "apollo/queries";
import { DEL_DISTRIBUTOR } from "apollo/mutuations";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import Controls from "components/controls/Controls";
import EditIcon from "@mui/icons-material/Edit";

const Distributors = () => {
  //states
  const [isTrashHovered, setIsTrashHovered] = useState(false);
  const [isEditHovered, setIsEditHovered] = useState(false);
  const [size,setSize] = useState("10");
  const [opened, setOpened] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
//pagination states 
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const handleChange = (currentPage) => {
    setActivePage(currentPage);
  };
  const { data, loading } = useQuery(GET_DISTRIBUTORS, {
    // fetchPolicy: "network-only",
    variables: {
      first: parseInt(size), // Pass size dynamically
      page: activePage,
    },
  });
  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1);
  };
  useEffect(() => {
    if (data) {
      setTotal(data.distributors.paginatorInfo.lastPage);
    }
  }, [data, size]); 



  // delete mutation
  const [delDistributor] =
    useMutation(DEL_DISTRIBUTOR, {
      update(cache, { data: { deleteDistributor } }) {

        cache.updateQuery(
          {
            query: GET_DISTRIBUTORS,
            variables: {
              first: 10,
              page: activePage,
            },
          },
          (data) => {
            if (data.distributors.data.length === 1) {
              setTotal(total - 1);
              setActivePage(activePage - 1);
            } else {
              return {
                distributors: {
                  data: [
                    ...data.distributors.data.filter(
                      (distributor) => distributor.id !== deleteDistributor.id
                    ),
                  ],
                },
              };
            }
          }
        );
      }
    });

  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };

  const deleteDistributor = () => {
    delDistributor({
      variables: { id: deleteID },

      onCompleted(data) {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Distributor Deleted Successfully",
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

  const handleEditDistributor = (id) => {
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
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.name}</span>;
      },
    },
    {
      label: "City",
      key: "city",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.city}</span>;
      },
    },
    {
      label: "Contact Name",
      key: "contact_name",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.contact_name}</span>;
      },
    },
    {
      label: "Contact Phone",
      key: "contact_phone",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.contact_phone}</span>;
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
                     <Controls.ActionButton
              color="primary"
              title="Update"
              onClick={() => handleEditDistributor(`${rowData.id}`)}
            >
              <EditIcon style={{ fontSize: "1rem" }} />
            </Controls.ActionButton>

            <Controls.ActionButton
              color="primary"
              title="Delete"
              onClick={() => handleDelete(`${rowData.id}`)}
            >
              <Trash size={17} />
            </Controls.ActionButton>

         
          </>
        );
      },
    },
  ];

  const optionsData = {
    actionLabel: "Add Distributor",
    setAddModal: setOpened,
  };

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
        opened={opened}
        onClose={() => setOpened(false)}
        title="Adding distributors"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <DistributorAddModal
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
        />
      </Drawer>
      <Drawer
        opened={openedEdit}
        onClose={() => setOpenedEdit(false)}
        title="Editing Distributor"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <DistributorEditModal
          setOpenedEdit={setOpenedEdit}
          editId={editId}
        />
      </Drawer>

      {/* delete modal */}
      <Modal
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Warning"
        centered
      >
        <p>Are you sure do you want to delete this Distributor?</p>
        <Group position="right">
          <Button onClick={() => deleteDistributor()} color="red">
            Delete
          </Button>
        </Group>
      </Modal>

      <Card shadow="sm" p="lg">
        <ScrollArea>
          <B2bTable
            total={total}
            activePage={activePage}
            handleChange={handleChange}
            header={headerData}
            optionsData={optionsData}
            loading={loading}
            data={data ? data.distributors.data : []}
            size={size}
            handlePageSizeChange={handlePageSizeChange}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Distributors;
