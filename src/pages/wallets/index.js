import { useQuery } from "@apollo/client";
import {
  Badge,
  Card,
  Drawer,
  LoadingOverlay,
  ScrollArea,
  useMantineTheme,
} from "@mantine/core";
import { DEPOSIT_SLIPS } from "apollo/queries";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import ManageDepositSlip from "components/Wallet/ManageDepositSlip";
import React, { useState } from "react";
import {  ManualGearbox } from "tabler-icons-react";

const Wallets = () => {
  const [size] = useState(10);
  const [opened, setOpened] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);

  const theme = useMantineTheme();

  //pagination states
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const { data, loading, fetchMore } = useQuery(DEPOSIT_SLIPS, {
    variables: {
      first: size,
      page: activePage,
    },
  });

  if (!total && data) {
    setTotal(data.depositSlips.paginatorInfo.lastPage);
  }

  const handleChange = (currentPage) => {
    fetchMore({
      variables: {
        first: size,
        page: currentPage,
      },
    });
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
      label: "Name",
      key: "name",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.retailer.name}</span>;
      },
    },
    {
      label: "Amount",
      key: "amount",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.amount}</span>;
      },
    },
    {
      label: "Ref Number",
      key: "reference_number",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.reference_number}</span>;
      },
    },
    {
      label: "Confirmed at",
      key: "confirmed_at_human",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return rowData.confirmed_at_human ? (
          <span>{rowData.confirmed_at_human} </span>
        ) : (
          <Badge color="yellow">Not Confirmed</Badge>
        );
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
            <ManualGearbox  color="yellow"
              size={24}
              onClick={() => handleManageDepositSlip(`${rowData.id}`)}
            />
          </>
        );
      },
    },
  ];

  const handleManageDepositSlip = (id) => {
    setEditId(id);
    setOpenedEdit(true);
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
        opened={openedEdit}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Managing Wallet"
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="right"
        size="40%"
      >
        <ManageDepositSlip
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpenedEdit={setOpenedEdit}
          editId={editId}
        />
      </Drawer>
      <Card shadow="sm" p="lg">
        <ScrollArea>
          <B2bTable
            total={total}
            activePage={activePage}
            handleChange={handleChange}
            header={headerData}
            loading={loading}
            data={data ? data.depositSlips.data : []}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Wallets;
