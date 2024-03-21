import { useMutation, useQuery } from "@apollo/client";
import { Button, Image, ScrollArea, Skeleton, Text } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { CONFIRM_DEPOSIT_SLIP } from "apollo/mutuations";
import { DEPOSIT_SLIP, DEPOSIT_SLIPS } from "apollo/queries";
import { showNotification } from "@mantine/notifications";
import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageDepositSlip = ({
  editId,
  setOpenedEdit,
  total,
  setTotal,
  activePage,
  setActivePage,
}) => {
 const[data, setData] = useState()
 const[loading,setLoading]=useState(false)
  useEffect(() => {
    fetchDeposit();
  }, [editId]);

  const fetchDeposit = async () => {
    setLoading(true)
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const {data} = await axios.get(
        `http://157.230.102.54:8081/api/deposit-slips/${editId}`,
        config
      );
      if (data) {
        console.log("data",data)
        setLoading(false)
        setData(data.data);
      }
    } catch (error) {
      setLoading(false)
      console.error("Error fetching data:", error);
    }
  };

  // mutation
  const [confirmDeposit, { loading: confirmLoading }] = useMutation(
    CONFIRM_DEPOSIT_SLIP,
    {
      update(cache, { data: { deposit } }) {
        cache.updateQuery(
          {
            query: DEPOSIT_SLIPS,
            variables: {
              first: 10,
              page: activePage,
            },
          },
          (data) => {
            if (data.depositSlips.data.length === 10) {
              setTotal(total + 1);
              setActivePage(total + 1);
            } else {
              return {
                depositSlips: {
                  data: [deposit, ...data.depositSlips.data],
                },
              };
            }
          }
        );
      },
    }
  );
  const { height } = useViewportSize();
  const submit = (e) => {
    e.preventDefault();
    confirmDeposit({
      variables: {
        amount: data?.depositSlip.amount,
        deposit_id: editId,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Confirmed  Successfully",
        });

        setOpenedEdit(false);
      },
      onError(error) {
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          const errorMessage = error.graphQLErrors[0].extensions.errors.message;
          // Handle the error message here
          setOpenedEdit(false);
          showNotification({
            color: "red",
            title: "Error",
            message: errorMessage || "Deposit Confirmation Error",
          });
        } else {
          // Handle other types of errors
          setOpenedEdit(false);
          showNotification({
            color: "red",
            title: "Error",
            message: "Something went wrong!",
          });
        }
      },
    });
  };

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
        <Skeleton height={8} visible={loading || confirmLoading}></Skeleton>

        <Button
          disabled={data?.depositSlip?.slip ? false : true}
          style={{ marginTop: "20px" }}
          fullWidth
          variant="outline"
          onClick={submit}
        >
          Confirm Deposit
        </Button>
      </ScrollArea>
    </div>
  );
};

export default ManageDepositSlip;
