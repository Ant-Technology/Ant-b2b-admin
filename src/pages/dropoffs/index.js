import { useQuery } from "@apollo/client";
import {
  Card,
  Drawer,
  LoadingOverlay,
  ScrollArea,
} from "@mantine/core";
import { GET_DROPOFFS } from "apollo/queries";
import { DropOffAddModal } from "components/Dropoff/DropOffAddModal";
import ManageDropOffModal from "components/Dropoff/ManageDropOffModal";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import React, { useState } from "react";
import {  ManualGearbox, Trash } from "tabler-icons-react";

const DropOffs = () => {
  const [size] = useState(10);
  const [opened, setOpened] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  // const [openedDelete, setOpenedDelete] = useState(false);
  // const [deleteID, setDeleteID] = useState(false);

  //pagination states
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const { data, loading } = useQuery(GET_DROPOFFS, {
    variables: {
      first: size,
      page: activePage,
    },
  });

  if (!total && data) {
    setTotal(data.dropoffs.paginatorInfo.lastPage);
  }

  // const theme = useMantineTheme();

  const handleChange = (currentPage) => {
    setActivePage(currentPage);
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
      label: "Status",
      key: "status",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.status}</span>;
      },
    },
    {
      label: "Driver",
      key: "driver",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return (
          <span>
            {rowData.driver !== null ? rowData.driver?.name : "Unknown"}
          </span>
        );
      },
    },
    {
      label: "Date Created",
      key: "created_at",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.created_at}</span>;
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
            <Trash color="#ed522f" size={24}   style={{cursor:"pointer"}} />
            <ManualGearbox color="#1971C2"
            style={{marginLeft:"10px",cursor:"pointer"}}
              size={24}
              onClick={() => handleManageDropOff(`${rowData.id}`)}
            />
          </>
        );
      },
    },
  ];
  const handleManageDropOff = (id) => {
    setOpenedEdit(true);
    setEditId(id);
  };

  const optionsData = {
    actionLabel: "Add DropOff",
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
    <div style={{ width: "98%", margin: "auto" }}>{" "}
      <Drawer
        opened={openedEdit}
        onClose={() => setOpenedEdit(false)}
        title="Managing Dropoff"
        padding="xl"
        size="50%"
        position="right"
      >
        <ManageDropOffModal setOpenedEdit={setOpenedEdit} editId={editId} />
      </Drawer>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Adding a DropOffs"
        padding="xl"
        size="80%"
        position="bottom"
      >
     <DropOffAddModal
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
            data={data ? data.dropoffs.data : []}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default DropOffs;
