import { useQuery } from "@apollo/client";
import { Button, Image, ScrollArea, Skeleton, Text } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { DEPOSIT_SLIP } from "apollo/queries";
import React from "react";

const ManageDepositSlip = ({
  editId,
  setOpenedEdit,
  total,
  setTotal,
  activePage,
  setActivePage,
}) => {
  //TODO: fetch deposit info and image
  const { data, loading } = useQuery(DEPOSIT_SLIP, {
    variables: {
      id: editId,
    },
    onCompleted(data) {
      console.log("log from success", data);
    },
    onError(data) {
      console.log("log from errrrrrrrr", data);
    },
  });
  //TODO: add button and confirm
  //TODO: close and cache update
  const { height } = useViewportSize();
console.log(data?.depositSlip?.slip)
  return (
    <div>
      <ScrollArea style={{ height: height / 1.1 }}>
        <Image
          height={height / 1.4}
          src={data?.depositSlip.slip ? data?.depositSlip?.slip : ""}
          alt="With default placeholder"
          withPlaceholder
          placeholder={<Text align="center">No slip Found!</Text>}
        />
        <Skeleton height={8} visible={loading}></Skeleton>

        <Button
          disabled={data?.depositSlip?.slip ? false : true}
          style={{ marginTop: "20px" }}
          fullWidth
          variant="outline"
        >
          Confirm Deposit
        </Button>
      </ScrollArea>
    </div>
  );
};

export default ManageDepositSlip;
